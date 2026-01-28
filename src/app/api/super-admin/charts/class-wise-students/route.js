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
    const filter = searchParams.get('filter') || 'all';

    await connectDB();

    // Mock data for now - replace with actual database queries
    const mockData = [
      { class: 'Class 1', students: 25, branch: 'Branch A' },
      { class: 'Class 2', students: 28, branch: 'Branch A' },
      { class: 'Class 3', students: 30, branch: 'Branch A' },
      { class: 'Class 4', students: 26, branch: 'Branch A' },
      { class: 'Class 5', students: 32, branch: 'Branch A' },
      { class: 'Class 6', students: 29, branch: 'Branch A' },
      { class: 'Class 7', students: 31, branch: 'Branch A' },
      { class: 'Class 8', students: 27, branch: 'Branch A' }
    ];

    return NextResponse.json({
      success: true,
      data: mockData
    });

  } catch (error) {
    console.error('Error fetching class-wise students:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch class-wise students' },
      { status: 500 }
    );
  }
}
