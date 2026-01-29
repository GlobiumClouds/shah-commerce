import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { authenticate } from '@/backend/middleware/auth';
import User from '@/backend/models/User';
import Class from '@/backend/models/Class';

export async function GET(request) {
  try {
    // Authenticate user
    const authResult = await authenticate(request);
    if (authResult.error) {
      return NextResponse.json(
        { success: false, message: authResult.message },
        { status: authResult.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const branch = searchParams.get('branch') || 'all';
    const filter = searchParams.get('filter') || 'all';

    await connectDB();

    // Build aggregation pipeline for class-wise student count
    const pipeline = [
      {
        $match: {
          role: 'student',
          ...(branch !== 'all' && { branchId: branch })
        }
      },
      {
        $lookup: {
          from: 'classes',
          localField: 'studentProfile.classId',
          foreignField: '_id',
          as: 'classInfo'
        }
      },
      {
        $unwind: '$classInfo'
      },
      {
        $lookup: {
          from: 'branches',
          localField: 'branchId',
          foreignField: '_id',
          as: 'branchInfo'
        }
      },
      {
        $unwind: '$branchInfo'
      },
      {
        $group: {
          _id: {
            classId: '$classInfo._id',
            className: '$classInfo.name',
            branchName: '$branchInfo.name'
          },
          students: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          class: '$_id.className',
          students: 1,
          branch: '$_id.branchName'
        }
      },
      {
        $sort: { class: 1 }
      }
    ];

    const data = await User.aggregate(pipeline);

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Error fetching class-wise students:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch class-wise students' },
      { status: 500 }
    );
  }
}
