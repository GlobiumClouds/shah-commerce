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
    const timeRange = searchParams.get('timeRange') || 'current_month';

    await connectDB();

    // Mock data for now - replace with actual database queries
    const mockData = [
      { class: 'Class 1', percentage: 92 },
      { class: 'Class 2', percentage: 88 },
      { class: 'Class 3', percentage: 95 },
      { class: 'Class 4', percentage: 87 },
      { class: 'Class 5', percentage: 91 },
      { class: 'Class 6', percentage: 89 },
      { class: 'Class 7', percentage: 93 },
      { class: 'Class 8', percentage: 86 }
    ];

    return NextResponse.json({
      success: true,
      data: mockData
    });

  } catch (error) {
    console.error('Error fetching student attendance:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch student attendance' },
      { status: 500 }
    );
  }
}
