import { NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Level from '@/backend/models/Level';
import { withAuth } from '@/backend/middleware/auth';

export const GET = withAuth(async (request) => {
  try {
    await connectDB();
    const id = request.url.split('/').pop();
    const level = await Level.findById(id).lean();
    if (!level) return NextResponse.json({ success: false, message: 'Level not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: level });
  } catch (error) {
    console.error('Error fetching level:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch level', error: error.message }, { status: 500 });
  }
});

export const PUT = withAuth(async (request, authenticatedUser, userDoc) => {
  try {
    await connectDB();
    const id = request.url.split('/').pop();
    const body = await request.json();
    const level = await Level.findById(id);
    if (!level) return NextResponse.json({ success: false, message: 'Level not found' }, { status: 404 });
    Object.assign(level, body);
    level.updatedBy = userDoc._1d || userDoc._id;
    await level.save();
    return NextResponse.json({ success: true, message: 'Level updated', data: level });
  } catch (error) {
    console.error('Error updating level:', error);
    return NextResponse.json({ success: false, message: 'Failed to update level', error: error.message }, { status: 500 });
  }
});

export const DELETE = withAuth(async (request, authenticatedUser, userDoc) => {
  try {
    await connectDB();
    const id = request.url.split('/').pop();
    const level = await Level.findById(id);
    if (!level) return NextResponse.json({ success: false, message: 'Level not found' }, { status: 404 });
    await level.remove();
    return NextResponse.json({ success: true, message: 'Level deleted' });
  } catch (error) {
    console.error('Error deleting level:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete level', error: error.message }, { status: 500 });
  }
});
