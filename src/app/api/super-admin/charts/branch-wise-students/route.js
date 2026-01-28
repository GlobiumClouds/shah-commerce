import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { authenticate } from '@/backend/middleware/auth';

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

    // Mock data for now - replace with actual database queries
    const mockData = [
      { branch: 'Main Campus', students: 245, code: 'MC' },
      { branch: 'North Branch', students: 189, code: 'NB' },
      { branch: 'South Branch', students: 156, code: 'SB' },
      { branch: 'East Branch', students: 203, code: 'EB' },
      { branch: 'West Branch', students: 178, code: 'WB' }
    ];

    return NextResponse.json({
      success: true,
      data: mockData
    });

  } catch (error) {
    console.error('Error fetching branch-wise students:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch branch-wise students' },
      { status: 500 }
    );
  }
}
