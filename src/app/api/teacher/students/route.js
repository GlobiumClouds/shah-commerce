import { NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import User from '@/backend/models/User';
import mongoose from 'mongoose';

export async function GET(req) {
  try {
    await connectDB();

    // 1. URL se data nikalo (e.g. ?classId=123&section=A)
    const { searchParams } = new URL(req.url);
    const classIdStr = searchParams.get('classId');
    const section = searchParams.get('section');

    console.log("--- FETCHING STUDENTS ---");
    console.log("Target Class ID:", classIdStr);
    console.log("Target Section:", section);

    // 2. Validation
    if (!classIdStr || !section) {
      return NextResponse.json({ success: false, error: 'Class ID and Section are required' }, { status: 400 });
    }

    // 3. Query (User model me dhoondo)
    // Role: 'student' hona chahiye
    // ClassId match honi chahiye
    // Section match hona chahiye
    const students = await User.find({
      role: 'student',
      'studentProfile.classId': new mongoose.Types.ObjectId(classIdStr), // ObjectId me convert kia
      'studentProfile.section': section, // Section String match (Exact spelling zaroori hai)
      isActive: true // Sirf active students
    })
    .select('firstName lastName fullName email profilePhoto studentProfile.rollNumber studentProfile.registrationNumber')
    .sort({ 'studentProfile.rollNumber': 1 }); // Roll number wise sort

    console.log(`Students Found: ${students.length}`);

    return NextResponse.json({ 
      success: true, 
      count: students.length, 
      data: students 
    });

  } catch (error) {
    console.error('Student Fetch Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}