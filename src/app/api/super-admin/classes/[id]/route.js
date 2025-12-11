import { NextResponse } from 'next/server';
import dbConnect from '@/lib/database';
import Class from '@/backend/models/Class';
import Student from '@/backend/models/Student';
import { withAuth } from '@/backend/middleware/auth';

// GET - Get single class
async function getClass(request) {
  try {
    await dbConnect();

    // Extract ID from URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 1];

    const classDoc = await Class.findById(id)
      .populate('branchId', 'name code city')
      .populate('subjects', 'name code')
      .populate('sections.classTeacherId', 'name email')
      .populate('feeTemplates');

    if (!classDoc) {
      return NextResponse.json(
        { success: false, message: 'Class not found' },
        { status: 404 }
      );
    }

    // Get student count
    const studentCount = await Student.countDocuments({
      classId: classDoc._id,
      status: 'active',
    });

    return NextResponse.json({
      success: true,
      data: {
        ...classDoc.toObject(),
        studentCount,
      },
    });
  } catch (error) {
    console.error('Error fetching class:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch class', error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update class
async function updateClass(request, authenticatedUser, userDoc) {
  try {
    await dbConnect();

    // Extract ID from URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 1];

    const body = await request.json();

    // Find class
    const classDoc = await Class.findById(id);
    if (!classDoc) {
      return NextResponse.json(
        { success: false, message: 'Class not found' },
        { status: 404 }
      );
    }

    // Update class
    const updatedClass = await Class.findByIdAndUpdate(
      id,
      { ...body, updatedBy: userDoc._id },
      { new: true, runValidators: true }
    )
      .populate('branchId', 'name code city')
      .populate('subjects', 'name code')
      .populate('sections.classTeacherId', 'name email');

    return NextResponse.json({
      success: true,
      message: 'Class updated successfully',
      data: updatedClass,
    });
  } catch (error) {
    console.error('Error updating class:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update class', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete class
async function deleteClass(request) {
  try {
    await dbConnect();

    // Extract ID from URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 1];

    const classDoc = await Class.findById(id);
    if (!classDoc) {
      return NextResponse.json(
        { success: false, message: 'Class not found' },
        { status: 404 }
      );
    }

    // Check if class has students
    const studentCount = await Student.countDocuments({ classId: id, status: 'active' });
    if (studentCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Cannot delete class. It has ${studentCount} active students.`,
        },
        { status: 400 }
      );
    }

    // Archive instead of delete
    await Class.findByIdAndUpdate(id, { status: 'archived' });

    return NextResponse.json({
      success: true,
      message: 'Class archived successfully',
    });
  } catch (error) {
    console.error('Error deleting class:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete class', error: error.message },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getClass);
export const PUT = withAuth(updateClass);
export const DELETE = withAuth(deleteClass);
