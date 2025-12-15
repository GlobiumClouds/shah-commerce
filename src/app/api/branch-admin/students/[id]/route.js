import { NextResponse } from 'next/server';
import { withAuth } from '@/backend/middleware/auth';
import connectDB from '@/lib/database';
import User from '@/backend/models/User';
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

    const student = await User.findOne({
      _id: id,
      role: 'student',
      branchId: authenticatedUser.branchId,
    })
      .populate('studentProfile.classId', 'name code grade')
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

    // Find student and verify it belongs to admin's branch
    const student = await User.findOne({
      _id: id,
      role: 'student',
      branchId: authenticatedUser.branchId,
    });

    if (!student) {
      return NextResponse.json(
        { success: false, message: 'Student not found' },
        { status: 404 }
      );
    }

    // Prevent changing branchId and role
    delete updates.branchId;
    delete updates.role;

    // Handle profile photo updates
    if (updates.profilePhoto && typeof updates.profilePhoto === 'object') {
      student.profilePhoto = {
        url: updates.profilePhoto.url || '',
        publicId: updates.profilePhoto.publicId || '',
        uploadedAt: updates.profilePhoto.uploadedAt || new Date(),
      };
      delete updates.profilePhoto;
    }

    // Handle studentProfile updates
    if (updates.classId || updates.academicInfo || updates.guardianType || updates.parentInfo || updates.guardianInfo || updates.documents) {
      student.studentProfile = student.studentProfile || {};
      
      if (updates.classId) {
        student.studentProfile.classId = updates.classId;
        delete updates.classId;
      }
      if (updates.guardianType) {
        student.studentProfile.guardianType = updates.guardianType;
        delete updates.guardianType;
      }
      if (updates.academicInfo) {
        if (updates.academicInfo.academicYear) {
          student.studentProfile.academicYear = updates.academicInfo.academicYear;
        }
        if (updates.academicInfo.previousSchool) {
          student.studentProfile.previousSchool = student.studentProfile.previousSchool || {};
          student.studentProfile.previousSchool.name = updates.academicInfo.previousSchool;
        }
        delete updates.academicInfo;
      }
      if (updates.parentInfo) {
        student.studentProfile.father = student.studentProfile.father || {};
        student.studentProfile.mother = student.studentProfile.mother || {};
        Object.assign(student.studentProfile.father, {
          name: updates.parentInfo.fatherName,
          occupation: updates.parentInfo.fatherOccupation,
          phone: updates.parentInfo.fatherPhone,
          email: updates.parentInfo.fatherEmail,
          cnic: updates.parentInfo.fatherCnic,
        });
        Object.assign(student.studentProfile.mother, {
          name: updates.parentInfo.motherName,
          occupation: updates.parentInfo.motherOccupation,
          phone: updates.parentInfo.motherPhone,
          email: updates.parentInfo.motherEmail,
          cnic: updates.parentInfo.motherCnic,
        });
        delete updates.parentInfo;
      }
      if (updates.guardianInfo) {
        student.studentProfile.guardian = student.studentProfile.guardian || {};
        Object.assign(student.studentProfile.guardian, {
          name: updates.guardianInfo.name,
          relation: updates.guardianInfo.relationship,
          phone: updates.guardianInfo.phone,
          email: updates.guardianInfo.email,
          cnic: updates.guardianInfo.cnic,
        });
        delete updates.guardianInfo;
      }
      if (updates.documents) {
        student.studentProfile.documents = updates.documents;
        delete updates.documents;
      }
    }

    // Update other fields
    Object.keys(updates).forEach((key) => {
      if (updates[key] !== undefined) {
        student[key] = updates[key];
      }
    });

    student.updatedBy = authenticatedUser.userId;
    await student.save();

    // Send update or status-change email
    try {
      if (student.email) {
        if (updates.status && updates.status === 'inactive') {
          const html = getStudentEmailTemplate('STUDENT_DEACTIVATED', student);
          await sendEmail(student.email, 'Account Deactivated', html);
        } else {
          const html = getStudentEmailTemplate('STUDENT_UPDATED', student);
          await sendEmail(student.email, 'Student Record Updated', html);
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
    const student = await User.findOne({ 
      _id: id, 
      role: 'student',
      branchId: authenticatedUser.branchId 
    });

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
        await sendEmail(student.email, 'Account Deleted', html);
      }
    } catch (err) {
      console.error('Failed to send student deletion email:', err);
    }

    await User.findOneAndDelete({ 
      _id: id, 
      role: 'student',
      branchId: authenticatedUser.branchId 
    });

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
