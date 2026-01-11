import { NextResponse } from 'next/server';
import { withAuth } from '@/backend/middleware/auth';
import connectDB from '@/lib/database';
import Library from '@/backend/models/Library';
import Branch from '@/backend/models/Branch';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';

// Ensure Node runtime so Buffer is available for binary handling
export const runtime = 'nodejs';

// GET /api/super-admin/library/books - List all books across all branches
const handleGET = withAuth(async (request, user, userDoc, context) => {
  try {
    await connectDB();

    // Only super admins can access
    if (userDoc.role !== 'super_admin') {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const branch = searchParams.get('branch') || '';
    const status = searchParams.get('status') || '';

    // Build filter
    const filter = {};

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [
        { title: regex },
        { author: regex },
        { isbn: regex },
        { category: regex }
      ];
    }

    if (category) {
      filter.category = category;
    }

    if (branch) {
      filter.branchId = branch;
    }

    if (status) {
      filter.status = status;
    }

    // Get total count
    const total = await Library.countDocuments(filter);

    // Get books with pagination and populate branch info
    const books = await Library.find(filter)
      .populate('branchId', 'name code')
      .populate('addedBy', 'firstName lastName')
      .populate('lastUpdatedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        books,
        pagination: {
          page,
          limit,
          total,
          pages: totalPages
        }
      }
    });

  } catch (error) {
    console.error('Error fetching books:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch books' }, { status: 500 });
  }
});

// POST /api/super-admin/library/books - Add new book
const handlePOST = withAuth(async (request, user, userDoc, context) => {
  try {
    await connectDB();

    // Only super admins can access
    if (userDoc.role !== 'super_admin') {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
    }

    const bookData = await request.json();

    // Validate required fields
    const requiredFields = ['title', 'author', 'category', 'branchId'];
    const missingFields = requiredFields.filter(field => !bookData[field]);

    if (missingFields.length > 0) {
      return NextResponse.json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      }, { status: 400 });
    }

    // Verify branch exists
    const branch = await Branch.findById(bookData.branchId);
    if (!branch) {
      return NextResponse.json({ success: false, message: 'Invalid branch ID' }, { status: 400 });
    }

    // Create new book
    const newBook = new Library({
      ...bookData,
      addedBy: userDoc._id,
      lastUpdatedBy: userDoc._id,
      status: bookData.availableCopies > 0 ? 'available' : 'unavailable'
    });

    await newBook.save();

    // Populate for response
    await newBook.populate('branchId', 'name code');
    await newBook.populate('addedBy', 'firstName lastName');

    return NextResponse.json({
      success: true,
      message: 'Book added successfully',
      data: newBook
    }, { status: 201 });

  } catch (error) {
    console.error('Error adding book:', error);
    if (error.code === 11000) {
      return NextResponse.json({ success: false, message: 'A book with this ISBN already exists' }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: 'Failed to add book' }, { status: 500 });
  }
});

// PUT /api/super-admin/library/books/[id] - Update book
const handlePUT = withAuth(async (request, user, userDoc, context) => {
  try {
    await connectDB();

    // Only super admins can access
    if (userDoc.role !== 'super_admin') {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
    }

    const { id } = context.params || {};
    if (!id) {
      return NextResponse.json({ success: false, message: 'Book ID is required' }, { status: 400 });
    }

    let updateData, newAttachments = [];

    // Check if request is multipart/form-data
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();

      // Parse JSON data
      const jsonData = formData.get('data');
      if (!jsonData) {
        return NextResponse.json({
          success: false,
          message: 'Book data is required'
        }, { status: 400 });
      }
      updateData = JSON.parse(jsonData);

      // Handle file uploads
      const files = formData.getAll('attachments');
      for (const file of files) {
        if (file && file.size > 0) {
          // Validate file type
          const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain',
            'image/jpeg',
            'image/png',
            'image/gif'
          ];

          if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({
              success: false,
              message: `File type ${file.type} is not allowed. Allowed types: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT, JPG, PNG, GIF`
            }, { status: 400 });
          }

          // Convert file to buffer and upload to Cloudinary
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const base64File = `data:${file.type};base64,${buffer.toString('base64')}`;

          const uploadResult = await uploadToCloudinary(base64File, {
            folder: `ease-academy/library/${updateData.branchId || 'general'}`,
            resourceType: 'auto'
          });

          // Get file extension for fileType
          const fileName = file.name;
          const fileExtension = fileName.split('.').pop().toLowerCase();

          newAttachments.push({
            url: uploadResult.url,
            publicId: uploadResult.publicId,
            filename: fileName,
            fileType: fileExtension,
            mimeType: file.type,
            size: file.size,
            uploadedBy: userDoc._id
          });
        }
      }
    } else {
      updateData = await request.json();
    }

    // Find and update book
    const book = await Library.findById(id);
    if (!book) {
      return NextResponse.json({ success: false, message: 'Book not found' }, { status: 404 });
    }

    // Update fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        book[key] = updateData[key];
      }
    });

    // Handle attachments - append new ones if any
    if (newAttachments.length > 0) {
      book.attachments = [...(book.attachments || []), ...newAttachments];
    }

    book.lastUpdatedBy = userDoc._id;
    await book.save();

    // Populate for response
    await book.populate('branchId', 'name code');
    await book.populate('lastUpdatedBy', 'firstName lastName');

    return NextResponse.json({
      success: true,
      message: 'Book updated successfully',
      data: book
    });

  } catch (error) {
    console.error('Error updating book:', error);
    return NextResponse.json({ success: false, message: 'Failed to update book' }, { status: 500 });
  }
});

// DELETE /api/super-admin/library/books/[id] - Delete book
const handleDELETE = withAuth(async (request, user, userDoc, context) => {
  try {
    await connectDB();

    // Only super admins can access
    if (userDoc.role !== 'super_admin') {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
    }

    const { id } = context.params || {};
    if (!id) {
      return NextResponse.json({ success: false, message: 'Book ID is required' }, { status: 400 });
    }

    // Find and delete book
    const book = await Library.findByIdAndDelete(id);

    if (!book) {
      return NextResponse.json({ success: false, message: 'Book not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Book deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting book:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete book' }, { status: 500 });
  }
});

export async function GET(request, context) {
  return handleGET(request, context);
}

export async function POST(request, context) {
  return handlePOST(request, context);
}

export async function PUT(request, context) {
  return handlePUT(request, context);
}

export async function DELETE(request, context) {
  return handleDELETE(request, context);
}
