import { NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Teacher from '@/backend/models/Teacher';
import { withAuth } from '@/backend/middleware/auth';

// GET - Get single teacher
export const GET = withAuth(async (request, authenticatedUser, userDoc) => {
  try {
    await connectDB();

    const id = request.url.split('/').pop();
    
    const teacher = await Teacher.findById(id)
      .populate('branchId', 'name code city address')
      .populate('subjects', 'name code')
      .populate('classes.classId', 'name code grade')
      .populate('classes.subjectId', 'name code')
      .populate('createdBy', 'fullName email')
      .populate('updatedBy', 'fullName email')
      .lean();

    if (!teacher) {
      return NextResponse.json(
        {
          success: false,
          message: 'Teacher not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: teacher,
    });
  } catch (error) {
    console.error('Error fetching teacher:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch teacher',
        error: error.message,
      },
      { status: 500 }
    );
  }
});

// PUT - Update teacher
export const PUT = withAuth(async (request, authenticatedUser, userDoc) => {
  try {
    await connectDB();

    const id = request.url.split('/').pop();
    const body = await request.json();
    
    // Check if teacher exists
    const teacher = await Teacher.findById(id);
    
    if (!teacher) {
      return NextResponse.json(
        {
          success: false,
          message: 'Teacher not found',
        },
        { status: 404 }
      );
    }
    
    // Check if email/CNIC is being changed and already exists
    if (body.email && body.email !== teacher.email) {
      const existingEmail = await Teacher.findOne({ email: body.email });
      if (existingEmail) {
        return NextResponse.json(
          {
            success: false,
            message: 'Email already exists',
          },
          { status: 400 }
        );
      }
    }
    
    if (body.cnic && body.cnic !== teacher.cnic) {
      const existingCnic = await Teacher.findOne({ cnic: body.cnic });
      if (existingCnic) {
        return NextResponse.json(
          {
            success: false,
            message: 'CNIC already exists',
          },
          { status: 400 }
        );
      }
    }
    
    // Update teacher
    Object.assign(teacher, body);
    teacher.updatedBy = userDoc._id;
    
    await teacher.save();
    
    // Populate fields before returning
    await teacher.populate([
      { path: 'branchId', select: 'name code city' },
      { path: 'subjects', select: 'name code' },
      { path: 'classes.classId', select: 'name code grade' },
      { path: 'classes.subjectId', select: 'name code' },
      { path: 'updatedBy', select: 'fullName email' },
    ]);

    return NextResponse.json({
      success: true,
      message: 'Teacher updated successfully',
      data: teacher,
    });
  } catch (error) {
    console.error('Error updating teacher:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update teacher',
        error: error.message,
      },
      { status: 500 }
    );
  }
});

// DELETE - Delete/Deactivate teacher
export const DELETE = withAuth(async (request, authenticatedUser, userDoc) => {
  try {
    await connectDB();

    const id = request.url.split('/').pop();
    
    // Check if teacher exists
    const teacher = await Teacher.findById(id);
    
    if (!teacher) {
      return NextResponse.json(
        {
          success: false,
          message: 'Teacher not found',
        },
        { status: 404 }
      );
    }
    
    // Soft delete - change status to inactive
    teacher.status = 'inactive';
    teacher.updatedBy = userDoc._id;
    await teacher.save();

    return NextResponse.json({
      success: true,
      message: 'Teacher deactivated successfully',
    });
  } catch (error) {
    console.error('Error deleting teacher:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete teacher',
        error: error.message,
      },
      { status: 500 }
    );
  }
});
