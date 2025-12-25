import { NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Timetable from '@/backend/models/Timetable';
import mongoose from 'mongoose';

export async function GET(req) {
  try {
    await connectDB();

    console.log("---------------- API HIT ----------------");

    // 1. Header se ID lo (Iska naam hum teacherIdStr rakh rhy hain)
    const teacherIdStr = req.headers.get('x-user-id');

    console.log("Received Header ID:", teacherIdStr);

    if (!teacherIdStr) {
      return NextResponse.json({ success: false, error: 'Teacher ID missing in headers' }, { status: 401 });
    }

    // 2. String ID ko ObjectId me convert karo
    // (Yahan try-catch lagaya hai taake agar ID ghalat ho to crash na ho)
    let teacherObjectId;
    try {
      teacherObjectId = new mongoose.Types.ObjectId(teacherIdStr);
    } catch (err) {
      return NextResponse.json({ success: false, error: 'Invalid Teacher ID format' }, { status: 400 });
    }

    console.log("Searching Timetable for ObjectId:", teacherObjectId);

    // 3. Query: Check karo k ye teacher kahan kahan periods me hai
    const timetables = await Timetable.find({
      'periods.teacherId': teacherObjectId
    })
    .populate('classId', 'name code grade')
    .populate('periods.subjectId', 'name code');

    console.log("Timetables Found:", timetables.length);

    // 4. Data Formatting (Duplicates hatana)
    const dashboardData = [];
    const uniqueMap = new Set();

    timetables.forEach((tt) => {
      // Agar classId populate nahi hui (null hai), to skip kro
      if (!tt.classId) return;

      tt.periods.forEach((period) => {
        // Teacher Match check
        if (period.teacherId && period.teacherId.toString() === teacherIdStr) {
          
          // Unique Key: ClassID + Section + SubjectID
          const key = `${tt.classId._id}-${tt.section}-${period.subjectId?._id}`;

          if (!uniqueMap.has(key)) {
            dashboardData.push({
              classId: tt.classId._id,
              className: tt.classId.name,   // e.g. Class 3
              section: tt.section,          // e.g. A
              subjectId: period.subjectId?._id,
              subjectName: period.subjectId?.name || "Unknown Subject",
              timetableId: tt._id,
            });
            uniqueMap.add(key);
          }
        }
      });
    });

    return NextResponse.json({ 
      success: true, 
      count: dashboardData.length, 
      data: dashboardData 
    });

  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}