import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { authenticate } from '@/backend/middleware/auth';
import Attendance from '@/backend/models/Attendance';
import Class from '@/backend/models/Class';

export async function GET(request) {
  try {
    // Authenticate user
    const authResult = await authenticate(request);
    if (authResult.error) {
      return NextResponse.json(
        { success: false, message: authResult.message },
        { status: authResult.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const branch = searchParams.get('branch') || 'all';
    const timeRange = searchParams.get('timeRange') || 'current_month';

    await connectDB();

    // Calculate date range based on timeRange
    const now = new Date();
    let startDate, endDate;

    switch (timeRange) {
      case 'current_week':
        startDate = new Date(now.setDate(now.getDate() - now.getDay()));
        endDate = new Date(now.setDate(now.getDate() + 6));
        break;
      case 'current_month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'last_month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    // Build aggregation pipeline for attendance percentages by class
    const pipeline = [
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
          attendanceType: 'daily',
          ...(branch !== 'all' && { branchId: branch })
        }
      },
      {
        $lookup: {
          from: 'classes',
          localField: 'classId',
          foreignField: '_id',
          as: 'classInfo'
        }
      },
      {
        $unwind: '$classInfo'
      },
      {
        $group: {
          _id: {
            classId: '$classInfo._id',
            className: '$classInfo.name'
          },
          totalRecords: { $sum: { $size: '$records' } },
          presentCount: {
            $sum: {
              $size: {
                $filter: {
                  input: '$records',
                  cond: { $eq: ['$$this.status', 'present'] }
                }
              }
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          class: '$_id.className',
          percentage: {
            $cond: {
              if: { $eq: ['$totalRecords', 0] },
              then: 0,
              else: {
                $multiply: [
                  { $divide: ['$presentCount', '$totalRecords'] },
                  100
                ]
              }
            }
          }
        }
      },
      {
        $sort: { class: 1 }
      }
    ];

    const data = await Attendance.aggregate(pipeline);

    // If no data found, return zero values for all classes to show axes
    if (!data || data.length === 0) {
      console.log('No student attendance data found, returning zero values for axes');

      const classes = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8'];
      const zeroData = classes.map(className => ({
        class: className,
        percentage: 0
      }));

      return NextResponse.json({
        success: true,
        data: zeroData
      });
    }

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Error fetching student attendance:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch student attendance' },
      { status: 500 }
    );
  }
}
