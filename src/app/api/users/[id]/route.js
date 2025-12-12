import { NextResponse } from 'next/server';
import { withAuth } from '@/backend/middleware/auth';
import User from '@/backend/models/User';
import dbConnect from '@/lib/database';
import { sendEmail } from '@/backend/utils/emailService';
import { getStudentEmailTemplate } from '@/backend/templates/studentEmail';

/**
 * GET - Get single user by ID
 */
export const GET = withAuth(async (request, authenticatedUser, userDoc) => {
  try {
    await dbConnect();

    // Extract id from request URL (works with withAuth wrapper)
    const url = new URL(request.url);
    const parts = url.pathname.split('/').filter(Boolean);
    const id = parts[parts.length - 1];

    const user = await User.findById(id)
      .populate('branchId', 'name code city address')
      .populate('studentProfile.classId', 'name grade sections')
      .populate('studentProfile.departmentId', 'name code')
      .populate('teacherProfile.departmentId', 'name code')
      .populate('teacherProfile.subjects', 'name code')
      .populate('teacherProfile.classes.classId', 'name grade')
      .populate('teacherProfile.classes.subjectId', 'name code')
      .populate('staffProfile.departmentId', 'name code')
      .populate('createdBy', 'fullName email')
      .populate('updatedBy', 'fullName email');

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch user', error: error.message },
      { status: 500 }
    );
  }
});

/**
 * PUT - Update user by ID
 */
export const PUT = withAuth(async (request, authenticatedUser, userDoc) => {
  try {
    await dbConnect();
    const url = new URL(request.url);
    const parts = url.pathname.split('/').filter(Boolean);
    const id = parts[parts.length - 1];
    const body = await request.json();

    // Don't allow updating sensitive fields directly
    delete body.passwordHash;
    delete body.refreshToken;
    delete body.email; // Email update should be separate with verification

    // Sanitize empty string IDs that would fail ObjectId casting
    if (typeof body.branchId === 'string' && body.branchId.trim() === '') delete body.branchId;
    if (body.studentProfile) {
      if (typeof body.studentProfile.classId === 'string' && body.studentProfile.classId.trim() === '') delete body.studentProfile.classId;
      if (typeof body.studentProfile.departmentId === 'string' && body.studentProfile.departmentId.trim() === '') delete body.studentProfile.departmentId;
      // Sanitize feeDiscount.type: schema expects 'percentage' or 'fixed'.
      if (body.studentProfile.feeDiscount && body.studentProfile.feeDiscount.type !== undefined) {
        const t = body.studentProfile.feeDiscount.type;
        // Map numeric or boolean values to enum strings
        if (t === 0 || t === '0' || t === false) {
          body.studentProfile.feeDiscount.type = 'fixed';
        } else if (t === 1 || t === '1' || t === true) {
          body.studentProfile.feeDiscount.type = 'percentage';
        } else if (typeof t === 'string') {
          const v = t.trim().toLowerCase();
          if (v !== 'fixed' && v !== 'percentage') {
            delete body.studentProfile.feeDiscount.type;
          } else {
            body.studentProfile.feeDiscount.type = v;
          }
        } else {
          // Unknown type, remove to avoid validation error
          delete body.studentProfile.feeDiscount.type;
        }
      }
    }
    if (body.teacherProfile) {
      if (typeof body.teacherProfile.departmentId === 'string' && body.teacherProfile.departmentId.trim() === '') delete body.teacherProfile.departmentId;
    }
    if (body.staffProfile) {
      if (typeof body.staffProfile.departmentId === 'string' && body.staffProfile.departmentId.trim() === '') delete body.staffProfile.departmentId;
    }

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Deep-merge incoming body into the existing user document so
    // partial/patch-style updates work correctly for nested objects.
    function deepMerge(target, source) {
      for (const key of Object.keys(source)) {
        const srcVal = source[key];
        const tgtVal = target[key];

        if (srcVal && typeof srcVal === 'object' && !Array.isArray(srcVal)) {
          if (!tgtVal || typeof tgtVal !== 'object' || Array.isArray(tgtVal)) {
            // Replace non-object target with a plain object before merging
            target[key] = {};
          }
          deepMerge(target[key], srcVal);
        } else {
          // For primitive values and arrays, replace directly
          target[key] = srcVal;
        }
      }
    }

    deepMerge(user, body);
    user.updatedBy = userDoc._id;
    await user.save();

    // Populate fields
    await user.populate([
      { path: 'branchId', select: 'name code city' },
      { path: 'studentProfile.classId', select: 'name grade' },
      { path: 'studentProfile.departmentId', select: 'name code' },
      { path: 'teacherProfile.departmentId', select: 'name code' },
      { path: 'teacherProfile.subjects', select: 'name code' },
      { path: 'staffProfile.departmentId', select: 'name code' },
      { path: 'updatedBy', select: 'fullName email' },
    ]);

    // Send update email for students (non-blocking)
    if (user.role === 'student' && user.email) {
      try {
        const emailHtml = getStudentEmailTemplate('STUDENT_UPDATED', user.toObject());
        await sendEmail(user.email, '🔔 Your Student Profile Has Been Updated', emailHtml);
      } catch (emailErr) {
        console.error('Student update email failed (non-blocking):', emailErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      data: user,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update user', error: error.message },
      { status: 500 }
    );
  }
});

/**
 * DELETE - Delete user by ID (soft delete by setting status to inactive)
 */
export const DELETE = withAuth(async (request, authenticatedUser, userDoc) => {
  try {
    await dbConnect();
    const url = new URL(request.url);
    const parts = url.pathname.split('/').filter(Boolean);
    const id = parts[parts.length - 1];

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Soft delete: set status to inactive
    user.status = 'inactive';
    user.isActive = false;
    user.updatedBy = userDoc._id;
    await user.save();

    // Populate and send deactivation email if student
    await user.populate([
      { path: 'branchId', select: 'name code city' },
      { path: 'studentProfile.classId', select: 'name grade' },
      { path: 'studentProfile.departmentId', select: 'name code' },
    ]);

    if (user.role === 'student' && user.email) {
      try {
        const emailHtml = getStudentEmailTemplate('STUDENT_DEACTIVATED', user.toObject());
        await sendEmail(user.email, '⚠️ Student Account Deactivated', emailHtml);
      } catch (emailErr) {
        console.error('Email sending failed (non-blocking):', emailErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete user', error: error.message },
      { status: 500 }
    );
  }
});
