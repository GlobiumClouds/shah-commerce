import { NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Subject from '@/backend/models/Subject';
import { withAuth } from '@/backend/middleware/auth';

// GET - List all subjects with filters
export const GET = withAuth(async (request, authenticatedUser, userDoc) => {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;
    
    const search = searchParams.get('search') || '';
    const classId = searchParams.get('classId');
    const branchId = searchParams.get('branchId');
    const grade = searchParams.get('grade');
    const status = searchParams.get('status');
    
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (classId) query.classId = classId;
    if (branchId) query.branchId = branchId;
    if (grade) query.grade = parseInt(grade);
    if (status) query.status = status;
    
    const [subjects, total] = await Promise.all([
      Subject.find(query)
        .populate('classId', 'name code grade')
        .populate('branchId', 'name code')
        .populate('departmentId', 'name code')
        .populate('headTeacherId', 'firstName lastName employeeId')
        .populate('teachers', 'firstName lastName employeeId')
        .sort({ grade: 1, name: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Subject.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: subjects,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch subjects',
        error: error.message,
      },
      { status: 500 }
    );
  }
});

// POST - Create new subject
export const POST = withAuth(async (request, authenticatedUser, userDoc) => {
  try {
    await connectDB();

    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'classId', 'branchId'];
    
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Missing required fields: ${missingFields.join(', ')}`,
        },
        { status: 400 }
      );
    }
    
    // Check if code already exists (if provided)
    if (body.code) {
      const existingSubject = await Subject.findOne({ code: body.code });
      if (existingSubject) {
        return NextResponse.json(
          {
            success: false,
            message: 'Subject code already exists',
          },
          { status: 400 }
        );
      }
    }
    
    // Verify class exists
    const Class = (await import('@/backend/models/Class')).default;
    const classExists = await Class.findById(body.classId);
    
    if (!classExists) {
      return NextResponse.json(
        {
          success: false,
          message: 'Class not found',
        },
        { status: 404 }
      );
    }
    
    // Verify branch exists
    const Branch = (await import('@/backend/models/Branch')).default;
    const branchExists = await Branch.findById(body.branchId);
    
    if (!branchExists) {
      return NextResponse.json(
        {
          success: false,
          message: 'Branch not found',
        },
        { status: 404 }
      );
    }
    
    // Create subject
    const subject = new Subject({
      ...body,
      createdBy: userDoc._id,
      updatedBy: userDoc._id,
    });
    
    await subject.save();
    
    // Populate and return
    await subject.populate([
      { path: 'classId', select: 'name code grade' },
      { path: 'branchId', select: 'name code' },
      { path: 'departmentId', select: 'name code' },
      { path: 'headTeacherId', select: 'firstName lastName employeeId' },
      { path: 'createdBy', select: 'fullName email' },
    ]);

    return NextResponse.json(
      {
        success: true,
        message: 'Subject created successfully',
        data: subject,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating subject:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create subject',
        error: error.message,
      },
      { status: 500 }
    );
  }
});
