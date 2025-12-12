import { NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Stream from '@/backend/models/Stream';
import { withAuth } from '@/backend/middleware/auth';

export const GET = withAuth(async (request) => {
  try {
    await connectDB();
    const id = request.url.split('/').pop();
    const stream = await Stream.findById(id).lean();
    if (!stream) return NextResponse.json({ success: false, message: 'Stream not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: stream });
  } catch (error) {
    console.error('Error fetching stream:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch stream', error: error.message }, { status: 500 });
  }
});

export const PUT = withAuth(async (request, authenticatedUser, userDoc) => {
  try {
    await connectDB();
    const id = request.url.split('/').pop();
    const body = await request.json();
    const stream = await Stream.findById(id);
    if (!stream) return NextResponse.json({ success: false, message: 'Stream not found' }, { status: 404 });
    Object.assign(stream, body);
    stream.updatedBy = userDoc._id;
    await stream.save();
    return NextResponse.json({ success: true, message: 'Stream updated', data: stream });
  } catch (error) {
    console.error('Error updating stream:', error);
    return NextResponse.json({ success: false, message: 'Failed to update stream', error: error.message }, { status: 500 });
  }
});

export const DELETE = withAuth(async (request) => {
  try {
    await connectDB();
    const id = request.url.split('/').pop();
    const stream = await Stream.findById(id);
    if (!stream) return NextResponse.json({ success: false, message: 'Stream not found' }, { status: 404 });
    await stream.remove();
    return NextResponse.json({ success: true, message: 'Stream deleted' });
  } catch (error) {
    console.error('Error deleting stream:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete stream', error: error.message }, { status: 500 });
  }
});
