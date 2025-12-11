import { NextResponse } from 'next/server';
import dbConnect from '@/lib/database';
import Student from '@/backend/models/Student';
import Branch from '@/backend/models/Branch';
import Class from '@/backend/models/Class';
import { withAuth } from '@/backend/middleware/auth';

// GET - List all students
async function getStudents(request, authenticatedUser) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const branchId = searchParams.get('branchId') || '';
    const classId = searchParams.get('classId') || '';
    const status = searchParams.get('status') || '';
    const gender = searchParams.get('gender') || '';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;

    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { registrationNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'father.name': { $regex: search, $options: 'i' } },
        { 'father.phone': { $regex: search, $options: 'i' } },
      ];
    }
    if (branchId) query.branchId = branchId;
    if (classId) query.classId = classId;
    if (status) query.status = status;
    if (gender) query.gender = gender;

    // Get total count
    const total = await Student.countDocuments(query);

    // Get students with pagination
    const students = await Student.find(query)
      .populate('branchId', 'name code city')
      .populate('classId', 'name grade sections')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    return NextResponse.json({
      success: true,
      data: students,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch students', error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new student
async function createStudent(request, authenticatedUser, userDoc) {
  try {
    await dbConnect();

    const body = await request.json();

    // Validation
    if (!body.firstName || !body.lastName || !body.dateOfBirth || !body.branchId || !body.classId) {
      return NextResponse.json(
        { success: false, message: 'Required fields are missing' },
        { status: 400 }
      );
    }

    // Check if registration number already exists
    if (body.registrationNumber) {
      const existingStudent = await Student.findOne({ 
        registrationNumber: body.registrationNumber.toUpperCase() 
      });
      if (existingStudent) {
        return NextResponse.json(
          { success: false, message: 'Registration number already exists' },
          { status: 400 }
        );
      }
    } else {
      // Auto-generate registration number
      const branch = await Branch.findById(body.branchId);
      if (!branch) {
        return NextResponse.json(
          { success: false, message: 'Invalid branch ID' },
          { status: 400 }
        );
      }
      
      const year = new Date().getFullYear().toString().slice(-2);
      const count = await Student.countDocuments({ branchId: body.branchId });
      body.registrationNumber = `${branch.code}-${year}-${String(count + 1).padStart(4, '0')}`;
    }

    // Validate class
    const classDoc = await Class.findById(body.classId);
    if (!classDoc) {
      return NextResponse.json(
        { success: false, message: 'Invalid class ID' },
        { status: 400 }
      );
    }

    // Create student
    const student = await Student.create({
      ...body,
      registrationNumber: body.registrationNumber.toUpperCase(),
      createdBy: userDoc._id,
    });

    const populatedStudent = await Student.findById(student._id)
      .populate('branchId', 'name code city')
      .populate('classId', 'name grade')
      .populate('createdBy', 'name email');

    return NextResponse.json({
      success: true,
      message: 'Student created successfully',
      data: populatedStudent,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create student', error: error.message },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getStudents);
export const POST = withAuth(createStudent);
