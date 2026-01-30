import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { authenticate } from '@/backend/middleware/auth';
import Branch from '@/backend/models/Branch';
import User from '@/backend/models/User';

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

    await connectDB();

    // Get all branches and count students per branch
    const branches = await Branch.find({}).select('name code').lean();

    if (!branches || branches.length === 0) {
      console.log('No branches found, returning empty data');
      return NextResponse.json({
        success: true,
        data: []
      });
    }

    // Get student counts for each branch
    const branchData = await Promise.all(
      branches.map(async (branch) => {
        const studentCount = await User.countDocuments({
          role: 'student',
          branchId: branch._id
        });

        return {
          branch: branch.name,
          students: studentCount,
          code: branch.code
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: branchData
    });

  } catch (error) {
    console.error('Error fetching branch-wise students:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch branch-wise students' },
      { status: 500 }
    );
  }
}
