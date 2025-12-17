import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/backend/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(request, { params }) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

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
}
