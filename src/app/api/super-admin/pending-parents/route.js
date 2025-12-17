import { NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import User from '@/backend/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find all parents who are not approved
    const pendingParents = await User.find({
      role: 'parent',
      approved: false,
    }).populate({
      path: 'parentProfile.children.id',
      select: 'fullName studentProfile.registrationNumber studentProfile.classId branchId'
    }).sort({ createdAt: -1 });

    return NextResponse.json({ parents: pendingParents });
  } catch (error) {
    console.error('Get pending parents error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
