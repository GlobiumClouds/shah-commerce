import { NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Teacher from '@/backend/models/Teacher';
import { withAuth } from '@/backend/middleware/auth';

// GET - List all teachers with filters
export const GET = withAuth(async (request, authenticatedUser, userDoc) => {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    
    // Pagination
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;
    
    // Filters
    const search = searchParams.get('search') || '';
    const branchId = searchParams.get('branchId');
    const status = searchParams.get('status');
    const designation = searchParams.get('designation');
    const department = searchParams.get('department');
    
    // Build query
    const query = {};
    
    // Search across multiple fields
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { cnic: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (branchId) query.branchId = branchId;
    if (status) query.status = status;
    if (designation) query.designation = designation;
    if (department) query.department = department;
    
    // Execute query
    const [teachers, total] = await Promise.all([
      Teacher.find(query)
        .populate('branchId', 'name code city')
        .populate('subjects', 'name code')
        .populate('classes.classId', 'name code grade')
        .populate('classes.subjectId', 'name code')
        .populate('createdBy', 'fullName email')
        .populate('updatedBy', 'fullName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Teacher.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: teachers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch teachers',
        error: error.message,
      },
      { status: 500 }
    );
  }
});

// POST - Create new teacher
export const POST = withAuth(async (request, authenticatedUser, userDoc) => {
  try {
    await connectDB();

    const body = await request.json();
    
    // Validate required fields
    const requiredFields = [
      'firstName',
      'lastName',
      'email',
      'phone',
      'dateOfBirth',
      'gender',
      'cnic',
      'branchId',
      'designation',
      'salaryDetails',
    ];
    
    const missingFields = requiredFields.filter(field => {
      if (field === 'salaryDetails') {
        return !body[field] || !body[field].basicSalary;
      }
      return !body[field];
    });
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Missing required fields: ${missingFields.join(', ')}`,
        },
        { status: 400 }
      );
    }
    
    // Check if email already exists
    const existingTeacher = await Teacher.findOne({
      $or: [
        { email: body.email },
        { cnic: body.cnic },
      ],
    });
    
    if (existingTeacher) {
      return NextResponse.json(
        {
          success: false,
          message: existingTeacher.email === body.email
            ? 'Email already exists'
            : 'CNIC already exists',
        },
        { status: 400 }
      );
    }
    
    // Verify branch exists
    const Branch = (await import('@/backend/models/Branch')).default;
    const branch = await Branch.findById(body.branchId);
    
    if (!branch) {
      return NextResponse.json(
        {
          success: false,
          message: 'Branch not found',
        },
        { status: 404 }
      );
    }
    
    // Create teacher
    const teacher = new Teacher({
      ...body,
      createdBy: userDoc._id,
      updatedBy: userDoc._id,
    });
    
    await teacher.save();
    
    // Populate fields before returning
    await teacher.populate([
      { path: 'branchId', select: 'name code city' },
      { path: 'subjects', select: 'name code' },
      { path: 'createdBy', select: 'fullName email' },
    ]);

    return NextResponse.json(
      {
        success: true,
        message: 'Teacher created successfully',
        data: teacher,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating teacher:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create teacher',
        error: error.message,
      },
      { status: 500 }
    );
  }
});
