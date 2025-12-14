import { NextResponse } from 'next/server';
import { withAuth } from '@/backend/middleware/auth';
import connectDB from '@/lib/database';
import Student from '@/backend/models/Student';
import User from '@/backend/models/User';
import Class from '@/backend/models/Class';

// GET - Get all students for branch admin's branch
async function getStudents(request, authenticatedUser, userDoc) {
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
    const classId = searchParams.get('classId');
    const status = searchParams.get('status');

    // Build query - only for this branch
    const query = { branchId: authenticatedUser.branchId };
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { admissionNumber: { $regex: search, $options: 'i' } },
      ];
    }

    if (classId) {
      query.classId = classId;
    }

    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const [students, total] = await Promise.all([
      Student.find(query)
        .populate('classId', 'name code')
        .populate('parentId', 'fullName email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Student.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        students,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get students error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch students' },
      { status: 500 }
    );
  }
}

// POST - Create new student (only for branch admin's branch)
async function createStudent(request, authenticatedUser, userDoc) {
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

    // Ensure student is created for admin's branch only
    const studentData = {
      ...body,
      branchId: authenticatedUser.branchId, // Force branch to admin's branch
      createdBy: authenticatedUser.userId,
    };

    // Validate class belongs to this branch if classId provided
    if (studentData.classId) {
      const classDoc = await Class.findById(studentData.classId);
      if (!classDoc || classDoc.branchId.toString() !== authenticatedUser.branchId.toString()) {
        return NextResponse.json(
          { success: false, message: 'Invalid class for this branch' },
          { status: 400 }
        );
      }
    }

    const student = new Student(studentData);
    await student.save();

    // Create user account if email and password provided
    if (body.email && body.password) {
      const userAccount = new User({
        fullName: `${body.firstName} ${body.lastName}`,
        email: body.email,
        phone: body.phone,
        passwordHash: body.password,
        role: 'student',
        branchId: authenticatedUser.branchId,
        studentId: student._id,
        isActive: true,
      });
      await userAccount.save();

      student.userId = userAccount._id;
      await student.save();
    }

    return NextResponse.json({
      success: true,
      data: student,
      message: 'Student created successfully',
    });
  } catch (error) {
    console.error('Create student error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create student' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getStudents);
export const POST = withAuth(createStudent);
