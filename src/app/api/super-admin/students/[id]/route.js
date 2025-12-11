import { NextResponse } from 'next/server';
import dbConnect from '@/lib/database';
import Student from '@/backend/models/Student';
import { withAuth } from '@/backend/middleware/auth';

// GET - Get single student
async function getStudent(request) {
  try {
    await dbConnect();

    // Extract ID from URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 1];

    const student = await Student.findById(id)
      .populate('branchId', 'name code city')
      .populate('classId', 'name grade sections')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!student) {
      return NextResponse.json(
        { success: false, message: 'Student not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: student,
    });
  } catch (error) {
    console.error('Error fetching student:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch student', error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update student
async function updateStudent(request, authenticatedUser, userDoc) {
  try {
    await dbConnect();

    // Extract ID from URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 1];

    const body = await request.json();

    // Find student
    const student = await Student.findById(id);
    if (!student) {
      return NextResponse.json(
        { success: false, message: 'Student not found' },
        { status: 404 }
      );
    }

    // Update student
    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      { ...body, updatedBy: userDoc._id },
      { new: true, runValidators: true }
    )
      .populate('branchId', 'name code city')
      .populate('classId', 'name grade')
      .populate('updatedBy', 'name email');

    return NextResponse.json({
      success: true,
      message: 'Student updated successfully',
      data: updatedStudent,
    });
  } catch (error) {
    console.error('Error updating student:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update student', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete student
async function deleteStudent(request) {
  try {
    await dbConnect();

    // Extract ID from URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 1];

    const student = await Student.findById(id);
    if (!student) {
      return NextResponse.json(
        { success: false, message: 'Student not found' },
        { status: 404 }
      );
    }

    // Soft delete - change status to inactive
    await Student.findByIdAndUpdate(id, { status: 'inactive' });

    return NextResponse.json({
      success: true,
      message: 'Student deactivated successfully',
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete student', error: error.message },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getStudent);
export const PUT = withAuth(updateStudent);
export const DELETE = withAuth(deleteStudent);
