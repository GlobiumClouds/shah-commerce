import { NextResponse } from 'next/server';
import { withAuth } from '@/backend/middleware/auth';
import User from '@/backend/models/User';
import dbConnect from '@/lib/database';

/**
 * GET - Get single user by ID
 */
export const GET = withAuth(async (request, authenticatedUser, userDoc, { params }) => {
  try {
    await dbConnect();

    const { id } = params;

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
export const PUT = withAuth(async (request, authenticatedUser, userDoc, { params }) => {
  try {
    await dbConnect();

    const { id } = params;
    const body = await request.json();

    // Don't allow updating sensitive fields directly
    delete body.passwordHash;
    delete body.refreshToken;
    delete body.email; // Email update should be separate with verification

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Update user
    Object.assign(user, body);
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
export const DELETE = withAuth(async (request, authenticatedUser, userDoc, { params }) => {
  try {
    await dbConnect();

    const { id } = params;

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
