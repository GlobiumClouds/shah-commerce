import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/backend/middleware/auth';
import connectDB from '@/lib/database';
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
    const timeRange = searchParams.get('timeRange') || '6months';

    await connectDB();

    // Mock data for now - replace with actual database queries
    const mockData = [
      { month: 'Jan', students: 245, growth: 5 },
      { month: 'Feb', students: 252, growth: 3 },
      { month: 'Mar', students: 258, growth: 2 },
      { month: 'Apr', students: 265, growth: 3 },
      { month: 'May', students: 271, growth: 2 },
      { month: 'Jun', students: 278, growth: 3 }
    ];

    return NextResponse.json({
      success: true,
      data: mockData
    });

  } catch (error) {
    console.error('Error fetching student trends:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch student trends' },
      { status: 500 }
    );
  }
}
