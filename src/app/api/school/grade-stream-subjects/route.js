import { NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import GradeStreamSubject from '@/backend/models/GradeStreamSubject';
import { withAuth } from '@/backend/middleware/auth';

export const GET = withAuth(async (request) => {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const gradeId = searchParams.get('gradeId');
    const streamId = searchParams.get('streamId');

    const query = {};
    if (gradeId) query.gradeId = gradeId;
    if (streamId) query.streamId = streamId;

    const items = await GradeStreamSubject.find(query)
      .populate('subjectId', 'name code')
      .populate('gradeId', 'name gradeNumber')
      .populate('streamId', 'name')
      .lean();

    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    console.error('Error fetching grade-stream-subjects:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch mappings', error: error.message }, { status: 500 });
  }
});
