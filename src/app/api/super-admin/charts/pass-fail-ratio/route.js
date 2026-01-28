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
    const timeRange = searchParams.get('timeRange') || 'current_academic_year';

    await connectDB();

    // Mock data for now - replace with actual database queries
    const mockData = [
      { name: 'Pass', value: 85, color: '#10b981' },
      { name: 'Fail', value: 15, color: '#ef4444' }
    ];

    return NextResponse.json({
      success: true,
      data: mockData
    });

  } catch (error) {
    console.error('Error fetching pass fail ratio:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch pass fail ratio' },
      { status: 500 }
    );
  }
}
