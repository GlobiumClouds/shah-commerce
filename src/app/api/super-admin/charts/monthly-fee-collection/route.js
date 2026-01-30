import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/database';
import { authenticate } from '@/backend/middleware/auth';
import FeeVoucher from '@/backend/models/FeeVoucher';

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
    const timeRange = searchParams.get('timeRange') || '6months';

    await connectDB();

    // Calculate date range based on timeRange
    const now = new Date();
    let months = 6; // default

    switch (timeRange) {
      case '3months':
        months = 3;
        break;
      case '6months':
        months = 6;
        break;
      case '1year':
        months = 12;
        break;
      default:
        months = 6;
    }

    const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);

    // Build aggregation pipeline for monthly fee collection
    const pipeline = [
      // Match fee vouchers with approved payments
      {
        $match: {
          'paymentHistory.status': 'approved',
          ...(branch !== 'all' && { branchId: mongoose.Types.ObjectId(branch) })
        }
      },
      // Unwind payment history to get individual payments
      {
        $unwind: '$paymentHistory'
      },
      // Match only approved payments within date range
      {
        $match: {
          'paymentHistory.status': 'approved',
          'paymentHistory.paymentDate': { $gte: startDate }
        }
      },
      // Group by month and year
      {
        $group: {
          _id: {
            year: { $year: '$paymentHistory.paymentDate' },
            month: { $month: '$paymentHistory.paymentDate' }
          },
          totalAmount: { $sum: '$paymentHistory.amount' }
        }
      },
      // Project final format
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          amount: '$totalAmount'
        }
      },
      // Sort by date
      {
        $sort: { year: 1, month: 1 }
      }
    ];

    const data = await FeeVoucher.aggregate(pipeline);

    // Debug logging
    console.log('Monthly Fee Collection Debug:');
    console.log('Branch filter:', branch);
    console.log('Time range:', timeRange);
    console.log('Start date:', startDate);
    console.log('Raw aggregated data:', data);

    // If no data found, return data with zero values for axes
    if (!data || data.length === 0) {
      console.log('No fee collection data found, returning zero values for axes');

      const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];

      const zeroData = [];
      const currentDate = new Date();

      for (let i = months - 1; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthIndex = date.getMonth();

        zeroData.push({
          month: monthNames[monthIndex],
          amount: 0
        });
      }

      return NextResponse.json({
        success: true,
        data: zeroData
      });
    }

    // Format data for frontend (convert month numbers to names)
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const formattedData = data.map(item => ({
      month: monthNames[item.month - 1],
      amount: item.amount
    }));

    console.log('Final processed data:', formattedData);

    return NextResponse.json({
      success: true,
      data: formattedData
    });

  } catch (error) {
    console.error('Error fetching monthly fee collection:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch monthly fee collection' },
      { status: 500 }
    );
  }
}
