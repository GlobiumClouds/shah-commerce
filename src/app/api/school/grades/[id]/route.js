import { NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Grade from '@/backend/models/Grade';
import { withAuth } from '@/backend/middleware/auth';

export const GET = withAuth(async (request) => {
  try {
    await connectDB();
    const id = request.url.split('/').pop();
    const grade = await Grade.findById(id).lean();
    if (!grade) return NextResponse.json({ success: false, message: 'Grade not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: grade });
  } catch (error) {
    console.error('Error fetching grade:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch grade', error: error.message }, { status: 500 });
  }
});

export const PUT = withAuth(async (request, authenticatedUser, userDoc) => {
  try {
    await connectDB();
    const id = request.url.split('/').pop();
    const body = await request.json();
    const grade = await Grade.findById(id);
    if (!grade) return NextResponse.json({ success: false, message: 'Grade not found' }, { status: 404 });
    Object.assign(grade, body);
    grade.updatedBy = userDoc._id;
    await grade.save();
    return NextResponse.json({ success: true, message: 'Grade updated', data: grade });
  } catch (error) {
    console.error('Error updating grade:', error);
    return NextResponse.json({ success: false, message: 'Failed to update grade', error: error.message }, { status: 500 });
  }
});

export const DELETE = withAuth(async (request) => {
  try {
    await connectDB();
    const id = request.url.split('/').pop();
    const grade = await Grade.findById(id);
    if (!grade) return NextResponse.json({ success: false, message: 'Grade not found' }, { status: 404 });
    await grade.remove();
    return NextResponse.json({ success: true, message: 'Grade deleted' });
  } catch (error) {
    console.error('Error deleting grade:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete grade', error: error.message }, { status: 500 });
  }
});
