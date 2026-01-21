import { NextResponse } from 'next/server';
import { withAuth } from '@/backend/middleware/auth';
import connectDB from '@/lib/database';
import Notification from '@/backend/models/Notification';

/**
 * 🛰️ Global Notification Tracking API
 * Super Admin: Sees EVERYTHING
 * Branch Admin: Sees only THEIR OWN
 */
export const GET = withAuth(async (request, user) => {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const skip = (page - 1) * limit;

    // Filter Logic
    let matchQuery = {};

    // Agar Branch Admin hai to sirf uski apni dikhao
    if (user.role === 'branch_admin') {
      matchQuery["metadata.senderId"] = user.userId;
    }
    // Note: Super Admin ke liye matchQuery empty rahegi (Everything)

    const pipeline = [
      { $match: matchQuery },
      {
        $group: {
          _id: {
            title: "$title",
            message: "$message",
            // Group by minute to identify same "Campaign"
            timeMinute: {
              $dateToString: { format: "%Y-%m-%d %H:%M", date: "$createdAt" }
            },
            senderId: "$metadata.senderId"
          }
          ,
          count: { $sum: 1 },
          readCount: { $sum: { $cond: [{ $eq: ["$isRead", true] }, 1, 0] } },
          createdAt: { $max: "$createdAt" },
          type: { $first: "$type" },
          senderName: { $first: "$metadata.senderName" },
          senderRole: { $first: "$metadata.senderRole" },
          notificationIds: { $push: "$_id" }
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          total: [{ $count: "count" }]
        }
      }
    ];

    const results = await Notification.aggregate(pipeline);

    const campaigns = results[0].data || [];
    const totalCount = results[0].total[0]?.count || 0;

    return NextResponse.json({
      success: true,
      data: {
        notifications: campaigns.map(c => ({
          _id: `${c._id.title}-${c._id.timeMinute}`,
          title: c._id.title,
          message: c._id.message,
          type: c.type,
          createdAt: c.createdAt,
          recipientCount: c.count,
          readCount: c.readCount,
          unreadCount: c.count - c.readCount,
          senderName: c.senderName || 'System',
          senderRole: c.senderRole || 'admin',
          notificationIds: c.notificationIds
        })),
        pagination: {
          page,
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      }
    });

  } catch (error) {
    console.error('Tracking API Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
});
