import { NextResponse } from 'next/server';
import { withAuth } from '@/backend/middleware/auth';
import connectDB from '@/lib/database';
import Attendance from '@/backend/models/Attendance';
import User from '@/backend/models/User';

// POST - Scan QR code for attendance
async function scanAttendance(request, authenticatedUser, userDoc) {
  try {
    if (authenticatedUser.role !== 'branch_admin') {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    if (!authenticatedUser.branchId) {
      return NextResponse.json(
        { success: false, message: 'No branch assigned' },
        { status: 400 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { qr, date, subjectId, eventId, attendanceType } = body;

    if (!qr) {
      return NextResponse.json(
        { success: false, message: 'QR data is required' },
        { status: 400 }
      );
    }

    // Parse QR data - could be JSON or plain text (registration number)
    let qrData;
    try {
      qrData = JSON.parse(qr);
    } catch (e) {
      // If not JSON, treat as registration number
      qrData = { registrationNumber: qr };
    }

    // Find student by registration number
    const student = await User.findOne({
      registrationNumber: qrData.registrationNumber,
      role: 'student',
      branchId: authenticatedUser.branchId,
    });

    if (!student) {
      return NextResponse.json(
        { success: false, message: 'Student not found' },
        { status: 404 }
      );
    }

    const attendanceDate = date ? new Date(date) : new Date();

    // Find or create attendance record for today
    let attendance = await Attendance.findOne({
      branchId: authenticatedUser.branchId,
      classId: student.studentProfile?.classId || student.classId,
      date: attendanceDate,
      attendanceType: attendanceType || 'daily',
      ...(subjectId && { subjectId }),
      ...(eventId && { eventId }),
    });

    if (!attendance) {
      // Create new attendance record
      attendance = new Attendance({
        branchId: authenticatedUser.branchId,
        classId: student.studentProfile?.classId || student.classId,
        section: student.section,
        subjectId: subjectId || null,
        eventId: eventId || null,
        date: attendanceDate,
        attendanceType: attendanceType || 'daily',
        markedBy: authenticatedUser.userId,
        records: [],
      });
    }

    // Check if student already marked
    const existingRecord = attendance.records.find(r => r.studentId.toString() === student._id.toString());

    if (existingRecord) {
      return NextResponse.json(
        { success: false, message: 'Attendance already marked for this student today' },
        { status: 400 }
      );
    }

    // Add student record
    attendance.records.push({
      studentId: student._id,
      status: 'present',
      markedAt: new Date(),
    });

    await attendance.save();

    return NextResponse.json({
      success: true,
      message: 'Attendance recorded successfully',
      data: {
        student: {
          _id: student._id,
          firstName: student.firstName,
          lastName: student.lastName,
          registrationNumber: student.registrationNumber,
          rollNumber: student.rollNumber,
        },
        attendance,
      },
    });
  } catch (error) {
    console.error('Scan attendance error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to record attendance' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(scanAttendance);
