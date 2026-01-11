import { NextResponse } from 'next/server';
import { withAuth } from '@/backend/middleware/auth';
import connectDB from '@/lib/database';
import Library from '@/backend/models/Library';
import Branch from '@/backend/models/Branch';

// GET /api/super-admin/library/books/[id] - Get single book
const handleGET = withAuth(async (request, user, userDoc, context) => {
    try {
        await connectDB();

        // Only super admins can access
        if (userDoc.role !== 'super_admin') {
            return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
        }

        const { id } = await context.params;
        if (!id) {
            return NextResponse.json({ success: false, message: 'Book ID is required' }, { status: 400 });
        }

        const book = await Library.findById(id)
            .populate('branchId', 'name code')
            .populate('classId', 'name')
            .populate('addedBy', 'firstName lastName')
            .populate('lastUpdatedBy', 'firstName lastName')
            .lean();

        if (!book) {
            return NextResponse.json({ success: false, message: 'Book not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: book
        });

    } catch (error) {
        console.error('Error fetching book:', error);
        return NextResponse.json({ success: false, message: 'Failed to fetch book' }, { status: 500 });
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

        const { id } = await context.params;
        if (!id) {
            return NextResponse.json({ success: false, message: 'Book ID is required' }, { status: 400 });
        }

        const updateData = await request.json();

        // Find the book
        const book = await Library.findById(id);
        if (!book) {
            return NextResponse.json({ success: false, message: 'Book not found' }, { status: 404 });
        }

        // If branchId is being updated, verify the new branch exists
        if (updateData.branchId && updateData.branchId !== book.branchId?.toString()) {
            const branch = await Branch.findById(updateData.branchId);
            if (!branch) {
                return NextResponse.json({ success: false, message: 'Invalid branch ID' }, { status: 400 });
            }
        }

        // Update fields
        const allowedFields = [
            'title', 'author', 'isbn', 'description', 'category', 'subCategory',
            'publisher', 'publicationYear', 'edition', 'totalCopies', 'availableCopies',
            'damagedCopies', 'lostCopies', 'purchasePrice', 'bookValue', 'purchaseDate',
            'supplier', 'shelfLocation', 'callNumber', 'language', 'pages', 'keywords',
            'notes', 'branchId', 'classId', 'status'
        ];

        allowedFields.forEach(field => {
            if (updateData[field] !== undefined) {
                book[field] = updateData[field];
            }
        });

        book.lastUpdatedBy = userDoc._id;
        await book.save();

        // Populate for response
        await book.populate('branchId', 'name code');
        await book.populate('classId', 'name');
        await book.populate('lastUpdatedBy', 'firstName lastName');

        return NextResponse.json({
            success: true,
            message: 'Book updated successfully',
            data: book
        });

    } catch (error) {
        console.error('Error updating book:', error);
        if (error.code === 11000) {
            return NextResponse.json({ success: false, message: 'A book with this ISBN already exists' }, { status: 400 });
        }
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

        const { id } = await context.params;
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

export async function PUT(request, context) {
    return handlePUT(request, context);
}

export async function DELETE(request, context) {
    return handleDELETE(request, context);
}
