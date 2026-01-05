import { NextResponse } from 'next/server';
import { Expo } from 'expo-server-sdk';
import mongoose from 'mongoose';
import Notification from '@/backend/models/Notification'; // Apne Model ka path confirm karlena
import User from '@/backend/models/User';
import connectDB from '@/lib/database';

const expo = new Expo();

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { title, message, type, targetRole, targetBranch } = body;

    // 1. Users Filter Logic (Kisko bhejna hai?)
    let query = { 
      role: targetRole, 
      isActive: true 
    };

    // Agar 'All Branches' nahi hai, to Specific Branch filter lagao
    if (targetBranch && targetBranch !== 'all') {
      query.branchId = targetBranch;
    }

    // 2. Users Dhoondo
    // Hamein wo users chahiye jinka Token ho (Mobile ke liye) 
    // Aur wo bhi chahiye jinka Token na ho (Sirf Web ke liye)
    const users = await User.find(query).select('_id expoPushToken');

    if (users.length === 0) {
      return NextResponse.json({ success: false, message: "No users found" }, { status: 404 });
    }

    // 3. DATABASE SAVE (Web Dashboard ke liye)
    // Sab users ke liye entry banao
    const notificationsToSave = users.map(user => ({
      type,
      title,
      message,
      targetUser: user._id,
      isRead: false,
    }));

    await Notification.insertMany(notificationsToSave);

    // 4. MOBILE PUSH (Expo ke liye)
    // Sirf unko bhejo jinke paas Token hai
    let messages = [];
    for (let user of users) {
      if (user.expoPushToken && Expo.isExpoPushToken(user.expoPushToken)) {
        messages.push({
          to: user.expoPushToken,
          sound: 'default',
          title: title,
          body: message,
          data: { type }, // App click hone par data milega
        });
      }
    }

    // Expo ko chunks mein bhejo
    let chunks = expo.chunkPushNotifications(messages);
    for (let chunk of chunks) {
      try {
        await expo.sendPushNotificationsAsync(chunk);
      } catch (error) {
        console.error("Expo Error:", error);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Sent to ${users.length} users (${messages.length} on Mobile)` 
    });

  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}