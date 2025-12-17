import { NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import User from '@/backend/models/User';
import { withAuth, requireRole } from '@/backend/middleware/auth';

export const POST = withAuth(async (request, user, userDoc, { params }) => {
  try {
    await connectDB();

    const { id } = await params;

    const parent = await User.findById(id);
    if (!parent || parent.role !== 'parent') {
      return NextResponse.json({ error: 'Parent not found' }, { status: 404 });
    }

    if (parent.approved) {
      return NextResponse.json({ error: 'Parent already approved' }, { status: 400 });
    }

    parent.approved = true;
    parent.isActive = true;
    await parent.save();

    return NextResponse.json({ message: 'Parent approved successfully' });
  } catch (error) {
    console.error('Approve parent error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}, [requireRole('super_admin')]);
