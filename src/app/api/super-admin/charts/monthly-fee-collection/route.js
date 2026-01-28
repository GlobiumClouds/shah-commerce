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
    const timeRange = searchParams.get('timeRange') || '6months';

    await connectDB();

    // Mock data for now - replace with actual database queries
    const mockData = [
      { month: 'Jan', amount: 45000 },
      { month: 'Feb', amount: 52000 },
      { month: 'Mar', amount: 48000 },
      { month: 'Apr', amount: 61000 },
      { month: 'May', amount: 55000 },
      { month: 'Jun', amount: 58000 }
    ];

    return NextResponse.json({
      success: true,
      data: mockData
    });

  } catch (error) {
    console.error('Error fetching monthly fee collection:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch monthly fee collection' },
      { status: 500 }
    );
  }
}
