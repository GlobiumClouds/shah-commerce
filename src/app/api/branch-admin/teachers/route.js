import { NextResponse } from 'next/server';
import { withAuth } from '@/backend/middleware/auth';
import connectDB from '@/lib/database';
import Teacher from '@/backend/models/Teacher';
import User from '@/backend/models/User';

// GET - Get all teachers for branch admin's branch
async function getTeachers(request, authenticatedUser, userDoc) {
  try {
    if (authenticatedUser.role !== 'branch_admin') {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    if (!authenticatedUser.branchId) {
      return NextResponse.json(
        { success: false, message: 'No branch assigned' },
        { status: 400 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');
    const departmentId = searchParams.get('departmentId');

    // Build query - only for this branch
    const query = { branchId: authenticatedUser.branchId };
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) {
      query.status = status;
    }

    if (departmentId) {
      query.departmentId = departmentId;
    }

    const skip = (page - 1) * limit;

    const [teachers, total] = await Promise.all([
      Teacher.find(query)
        .populate('departmentId', 'name code')
        .populate('subjects', 'name code')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Teacher.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        teachers,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get teachers error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch teachers' },
      { status: 500 }
    );
  }
}

// POST - Create new teacher (only for branch admin's branch)
async function createTeacher(request, authenticatedUser, userDoc) {
  try {
    if (authenticatedUser.role !== 'branch_admin') {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    if (!authenticatedUser.branchId) {
      return NextResponse.json(
        { success: false, message: 'No branch assigned' },
        { status: 400 }
      );
    }

    await connectDB();

    const body = await request.json();

    // Ensure teacher is created for admin's branch only
    const teacherData = {
      ...body,
      branchId: authenticatedUser.branchId, // Force branch to admin's branch
      createdBy: authenticatedUser.userId,
    };

    const teacher = new Teacher(teacherData);
    await teacher.save();

    // Create user account if email and password provided
    if (body.email && body.password) {
      const userAccount = new User({
        fullName: `${body.firstName} ${body.lastName}`,
        email: body.email,
        phone: body.phone,
        passwordHash: body.password,
        role: 'teacher',
        branchId: authenticatedUser.branchId,
        teacherId: teacher._id,
        isActive: true,
      });
      await userAccount.save();

      teacher.userId = userAccount._id;
      await teacher.save();
    }

    return NextResponse.json({
      success: true,
      data: teacher,
      message: 'Teacher created successfully',
    });
  } catch (error) {
    console.error('Create teacher error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create teacher' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getTeachers);
export const POST = withAuth(createTeacher);
