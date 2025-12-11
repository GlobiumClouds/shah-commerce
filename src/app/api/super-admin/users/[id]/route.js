import { NextResponse } from 'next/server';
import { withAuth } from '@/backend/middleware/auth';
import User from '@/backend/models/User';
import dbConnect from '@/lib/database';
import bcrypt from 'bcryptjs';

// GET - Get single user
export const GET = withAuth(async (request, authenticatedUser, userDoc) => {
  try {
    await dbConnect();
    
    // Extract userId from URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const userId = pathSegments[pathSegments.length - 1];

    const user = await User.findById(userId)
      .populate('branchId', 'name code address contact')
      .select('-passwordHash -refreshToken');

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'User not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: error.message,
      },
      { status: 500 }
    );
  }
});

// PUT - Update user
export const PUT = withAuth(async (request, authenticatedUser, userDoc) => {
  try {
    await dbConnect();
    
    // Extract userId from URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const userId = pathSegments[pathSegments.length - 1];
    
    const body = await request.json();
    const { fullName, email, phone, password, role, branchId, permissions, isActive } = body;

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'User not found',
        },
        { status: 404 }
      );
    }

    // Update fields
    if (fullName) user.fullName = fullName;
    if (email) user.email = email.toLowerCase();
    if (phone !== undefined) user.phone = phone;
    if (role) user.role = role;
    if (branchId !== undefined) user.branchId = role === 'super_admin' ? null : branchId;
    if (permissions !== undefined) user.permissions = permissions;
    if (isActive !== undefined) user.isActive = isActive;

    // Update password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(password, salt);
    }

    await user.save();

    const userResponse = user.toJSON();

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      data: { user: userResponse },
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: error.message,
      },
      { status: 500 }
    );
  }
});

// DELETE - Delete user
export const DELETE = withAuth(async (request, authenticatedUser, userDoc) => {
  try {
    await dbConnect();
    
    // Extract userId from URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const userId = pathSegments[pathSegments.length - 1];

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'User not found',
        },
        { status: 404 }
      );
    }

    await User.findByIdAndDelete(userId);

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: error.message,
      },
      { status: 500 }
    );
  }
});
