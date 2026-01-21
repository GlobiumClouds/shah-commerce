import { NextResponse } from 'next/server';
import { Expo } from 'expo-server-sdk';
import mongoose from 'mongoose';
import connectDB from '@/lib/database';
import User from '@/backend/models/User';
import Notification from '@/backend/models/Notification';
import { withAuth, requireRole } from '@/backend/middleware/auth';

// Expo SDK Initialize
const expo = new Expo();

async function sendNotification(request, currentUser, userDoc) {
  try {
    await connectDB();

    const body = await request.json();
    const { title, message, type, targetRole, targetBranch, metadata } = body;

    console.log('📨 Sending notification from:', currentUser.role, currentUser.branchId);
    console.log('🎯 Target Role:', targetRole);
    console.log('🎯 Target Branch:', targetBranch);

    // ============================================================
    // 🎯 FILTERING LOGIC (Super vs Branch Admin)
    // ============================================================

    let filter = { isActive: true };

    // Handle targetRole
    if (targetRole === 'all') {
      // Send to everyone: students, parents, teachers, staff, branch_admins
      filter.role = { $in: ['student', 'parent', 'teacher', 'staff', 'branch_admin'] };
    } else {
      // Specific role (student/parent/teacher/staff/branch_admin)
      filter.role = targetRole;
    }

    // SCENARIO 1: Branch Admin
    if (currentUser.role === 'branch_admin') {
      if (!currentUser.branchId) {
        return NextResponse.json({ success: false, error: "Your account is not linked to any branch." }, { status: 400 });
      }
      filter.branchId = currentUser.branchId; // Sirf apni branch walo ko dhoondo
    }
    // Agar SUPER ADMIN hai aur specific branch select ki hai
    else if (currentUser.role === 'super_admin' && targetBranch && targetBranch !== 'all') {
      filter.branchId = targetBranch; // Specific branch ko target kro
      console.log('🏢 Filtering by specific branch:', targetBranch);
    }
    // Agar 'all' hai toh koi branch filter nahi lagegi

    // Handle Specific Users (e.g. specific students)
    if (body.targetUserIds && Array.isArray(body.targetUserIds) && body.targetUserIds.length > 0) {
      filter._id = { $in: body.targetUserIds };
      console.log(`🎯 Targeting ${body.targetUserIds.length} specific users`);
    }

    // Users dhoondo unke Tokens k sath
    const users = await User.find(filter).select('_id expoPushToken');

    if (!users || users.length === 0) {
      return NextResponse.json({ success: false, message: "No users found matching criteria" }, { status: 404 });
    }

    console.log(`👥 Total Users Found: ${users.length}`);

    // ============================================================
    // 💾 DATABASE SAVE (Web Dashboard)
    // ============================================================

    // Add Sender Info to Metadata for History Tracking
    const senderName = currentUser.fullName || `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || 'Unknown';

    const enhancedMetadata = {
      ...metadata,
      senderId: currentUser.userId,
      senderName: senderName,
      senderRole: currentUser.role,
      sentAt: new Date()
    };

    const dbNotifications = users.map(user => ({
      type,
      title,
      message,
      targetUser: user._id,
      metadata: enhancedMetadata,
      isRead: false
    }));

    await Notification.insertMany(dbNotifications);

    // ============================================================
    // 📱 MOBILE PUSH (Expo)
    // ============================================================

    let messages = [];
    let tokenCount = 0;
    let missingTokenCount = 0;

    for (let user of users) {
      // Token check logic
      if (user.expoPushToken && Expo.isExpoPushToken(user.expoPushToken)) {
        messages.push({
          to: user.expoPushToken,
          sound: 'default',
          title: title,
          body: message,
          data: { type: type, ...metadata }, // Ye data app click hony p kaam ayega
        });
        tokenCount++;
      }
    }

    // Sending in Chunks (Expo Limit Handling)
    if (messages.length > 0) {
      console.log(`🚀 Pushing to ${messages.length} mobile devices...`);
      let chunks = expo.chunkPushNotifications(messages);

      for (let chunk of chunks) {
        try {
          await expo.sendPushNotificationsAsync(chunk);
        } catch (error) {
          console.error("Expo Push Error:", error);
          // Error aane par process mat roko, continue karo
        }
      }
    } else {
      console.log("⚠️ No valid tokens found. Skipping Mobile Push.");
    }

    return NextResponse.json({
      success: true,
      message: `Notification sent successfully to ${users.length} users (${messages.length} on Mobile)`,
      totalUsers: users.length,
      pushedTo: messages.length
    });

  } catch (error) {
    console.error("Critical Notification Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

// ✅ Correct Export with Middleware
export const POST = withAuth(sendNotification, [requireRole(['super_admin', 'branch_admin'])]);