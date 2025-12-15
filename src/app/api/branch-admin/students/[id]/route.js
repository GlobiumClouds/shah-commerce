import { NextResponse } from 'next/server';
import { withAuth } from '@/backend/middleware/auth';
import connectDB from '@/lib/database';
import Student from '@/backend/models/Student';
import { sendEmail } from '@/backend/utils/emailService';
import { getStudentEmailTemplate } from '@/backend/templates/studentEmail';

// GET - Get single student
async function getStudent(request, authenticatedUser, userDoc, { params }) {
  try {
    if (authenticatedUser.role !== 'branch_admin') {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    await connectDB();

    const { id } = params;

    const student = await Student.findOne({
      _id: id,
      branchId: authenticatedUser.branchId, // Only get student from admin's branch
    })
      .populate('classId', 'name code grade')
      .populate('parentId', 'fullName email phone')
      .populate('userId', 'email isActive lastLogin')
      .lean();

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
    console.error('Get student error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch student' },
      { status: 500 }
    );
  }
}

// PUT - Update student
async function updateStudent(request, authenticatedUser, userDoc, { params }) {
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

    // Normalize profilePhoto if provided as object
    if (updates.profilePhoto && typeof updates.profilePhoto === 'object') {
      updates.profilePhoto = {
        url: updates.profilePhoto.url || '',
        publicId: updates.profilePhoto.publicId || '',
        uploadedAt: updates.profilePhoto.uploadedAt || new Date(),
      };
    }

    // Map academicInfo.academicYear to root academicYear if supplied
    if (updates.academicInfo && updates.academicInfo.academicYear) {
      updates.academicYear = updates.academicInfo.academicYear;
      delete updates.academicInfo;
    }

    // Map guardianType if sent
    if (updates.guardianType) {
      updates.guardianType = updates.guardianType;
    }

    // Find student and verify it belongs to admin's branch
    const student = await Student.findOne({
      _id: id,
      branchId: authenticatedUser.branchId,
    });

    if (!student) {
      return NextResponse.json(
        { success: false, message: 'Student not found' },
        { status: 404 }
      );
    }

    // Prevent changing branchId
    delete updates.branchId;

    // Update student
    Object.keys(updates).forEach((key) => {
      if (updates[key] !== undefined) {
        student[key] = updates[key];
      }
    });

    student.updatedBy = authenticatedUser.userId;
    await student.save();

    // Send update or status-change email
    try {
      const recipient = student.email;
      if (recipient) {
        if (updates.status && updates.status === 'inactive') {
          const html = getStudentEmailTemplate('STUDENT_DEACTIVATED', student);
          sendEmail(recipient, 'Account Deactivated', html);
        } else {
          const html = getStudentEmailTemplate('STUDENT_UPDATED', student);
          sendEmail(recipient, 'Student Record Updated', html);
        }
      }
    } catch (err) {
      console.error('Failed to send student update email:', err);
    }

    return NextResponse.json({
      success: true,
      data: student,
      message: 'Student updated successfully',
    });
  } catch (error) {
    console.error('Update student error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update student' },
      { status: 500 }
    );
  }
}

// DELETE - Delete student
async function deleteStudent(request, authenticatedUser, userDoc, { params }) {
  try {
    if (authenticatedUser.role !== 'branch_admin') {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    await connectDB();

    const { id } = params;

    // Find student first (verify branch) then delete
    const student = await Student.findOne({ _id: id, branchId: authenticatedUser.branchId });

    if (!student) {
      return NextResponse.json(
        { success: false, message: 'Student not found' },
        { status: 404 }
      );
    }

    // Send deletion/deactivation email before removal
    try {
      if (student.email) {
        const html = getStudentEmailTemplate('STUDENT_DEACTIVATED', student);
        sendEmail(student.email, 'Account Deleted', html);
      }
    } catch (err) {
      console.error('Failed to send student deletion email:', err);
    }

    await Student.findOneAndDelete({ _id: id, branchId: authenticatedUser.branchId });

    return NextResponse.json({
      success: true,
      message: 'Student deleted successfully',
    });
  } catch (error) {
    console.error('Delete student error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to delete student' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getStudent);
export const PUT = withAuth(updateStudent);
export const DELETE = withAuth(deleteStudent);
