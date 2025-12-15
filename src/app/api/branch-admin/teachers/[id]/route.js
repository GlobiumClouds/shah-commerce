import { NextResponse } from 'next/server';
import { withAuth } from '@/backend/middleware/auth';
import connectDB from '@/lib/database';
import Teacher from '@/backend/models/Teacher';
import { sendEmail } from '@/backend/utils/emailService';
import { getTeacherEmailTemplate } from '@/backend/templates/teacherEmail';

// GET - Get single teacher
async function getTeacher(request, authenticatedUser, userDoc, { params }) {
  try {
    if (authenticatedUser.role !== 'branch_admin') {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    await connectDB();

    const { id } = params;

    const teacher = await Teacher.findOne({
      _id: id,
      branchId: authenticatedUser.branchId, // Only get teacher from admin's branch
    })
      .populate('departmentId', 'name code')
      .populate('subjects', 'name code')
      .populate('userId', 'email isActive lastLogin')
      .lean();

    if (!teacher) {
      return NextResponse.json(
        { success: false, message: 'Teacher not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: teacher,
    });
  } catch (error) {
    console.error('Get teacher error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch teacher' },
      { status: 500 }
    );
  }
}

// PUT - Update teacher
async function updateTeacher(request, authenticatedUser, userDoc, { params }) {
  try {
    if (authenticatedUser.role !== 'branch_admin') {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    await connectDB();

    const { id } = params;
    const updates = await request.json();

    // Find teacher and verify it belongs to admin's branch
    const teacher = await Teacher.findOne({
      _id: id,
      branchId: authenticatedUser.branchId,
    });

    if (!teacher) {
      return NextResponse.json(
        { success: false, message: 'Teacher not found' },
        { status: 404 }
      );
    }

    // Prevent changing branchId
    delete updates.branchId;

    // Update teacher
    Object.keys(updates).forEach((key) => {
      if (updates[key] !== undefined) {
        teacher[key] = updates[key];
      }
    });

    teacher.updatedBy = authenticatedUser.userId;
    await teacher.save();

    // Send update or status-change email
    try {
      const recipient = teacher.email;
      if (recipient) {
        if (updates.status && (updates.status === 'inactive' || updates.status === 'terminated')) {
          const html = getTeacherEmailTemplate('TEACHER_STATUS_CHANGED', teacher);
          sendEmail(recipient, 'Account Status Changed', html);
        } else {
          const html = getTeacherEmailTemplate('TEACHER_UPDATED', teacher);
          sendEmail(recipient, 'Teacher Record Updated', html);
        }
      }
    } catch (err) {
      console.error('Failed to send teacher update email:', err);
    }

    return NextResponse.json({
      success: true,
      data: teacher,
      message: 'Teacher updated successfully',
    });
  } catch (error) {
    console.error('Update teacher error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update teacher' },
      { status: 500 }
    );
  }
}

// DELETE - Delete teacher
async function deleteTeacher(request, authenticatedUser, userDoc, { params }) {
  try {
    if (authenticatedUser.role !== 'branch_admin') {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    await connectDB();

    const { id } = params;

    // Find teacher first (verify branch) then delete
    const teacher = await Teacher.findOne({ _id: id, branchId: authenticatedUser.branchId });

    if (!teacher) {
      return NextResponse.json(
        { success: false, message: 'Teacher not found' },
        { status: 404 }
      );
    }

    // Send deletion/deactivation email before removal
    try {
      if (teacher.email) {
        const html = getTeacherEmailTemplate('TEACHER_STATUS_CHANGED', teacher);
        sendEmail(teacher.email, 'Account Deleted', html);
      }
    } catch (err) {
      console.error('Failed to send teacher deletion email:', err);
    }

    await Teacher.findOneAndDelete({ _id: id, branchId: authenticatedUser.branchId });

    return NextResponse.json({
      success: true,
      message: 'Teacher deleted successfully',
    });
  } catch (error) {
    console.error('Delete teacher error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to delete teacher' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getTeacher);
export const PUT = withAuth(updateTeacher);
export const DELETE = withAuth(deleteTeacher);
