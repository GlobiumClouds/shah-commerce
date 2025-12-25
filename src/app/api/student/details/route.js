import { NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import User from '@/backend/models/User';

export async function GET(req) {
  await connectDB();

  // URL se ID nikalo (e.g., ?studentId=12345)
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get('studentId');

  // Database se dhoondo aur Parent/Class ki detail bhi sath le ao
  const student = await User.findById(studentId)
    .populate('studentProfile.classId', 'name') // Class Name
    .populate('branchId', 'name address');      // Branch Name

  return NextResponse.json({ success: true, data: student });
}
