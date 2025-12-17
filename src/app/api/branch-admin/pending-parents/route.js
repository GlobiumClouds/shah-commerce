import { NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import User from '@/backend/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'branch_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find parents with children in this branch who are not approved
    const pendingParents = await User.find({
      role: 'parent',
      approved: false,
      'parentProfile.children.id': {
        $exists: true,
        $ne: null
      }
    }).populate({
      path: 'parentProfile.children.id',
      match: { branchId: session.user.branchId },
      select: 'fullName studentProfile.registrationNumber studentProfile.classId'
    }).sort({ createdAt: -1 });

    // Filter out parents who don't have children in this branch
    const filteredParents = pendingParents.filter(parent =>
      parent.parentProfile.children.some(child => child.id)
    );

    return NextResponse.json({ parents: filteredParents });
  } catch (error) {
    console.error('Get pending parents error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
