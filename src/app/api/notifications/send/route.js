// import { NextResponse } from 'next/server';
// import { Expo } from 'expo-server-sdk';
// import mongoose from 'mongoose';
// <<<<<<< HEAD
// import Notification from '@/backend/models/Notification'; // Apne Model ka path confirm karlena
// import User from '@/backend/models/User';
// import connectDB from '@/lib/database';
// =======
// import connectDB from '@/lib/database';
// import User from '@/backend/models/User';
// import Notification from '@/backend/models/Notification';
// import { withAuth, requireRole } from '@/backend/middleware/auth';
// >>>>>>> ca7a24cc2863b76a8c6680ffe9f29dc23140dc0c

// const expo = new Expo();

// async function sendNotification(request, currentUser, userDoc) {
//   try {
//     await connectDB();

// <<<<<<< HEAD
//     const body = await req.json();
//     const { title, message, type, targetRole, targetBranch } = body;

//     // 1. Users Filter Logic (Kisko bhejna hai?)
//     let query = { 
//       role: targetRole, 
//       isActive: true 
//     };

//     // Agar 'All Branches' nahi hai, to Specific Branch filter lagao
//     if (targetBranch && targetBranch !== 'all') {
//       query.branchId = targetBranch;
//     }

//     // 2. Users Dhoondo
//     // Hamein wo users chahiye jinka Token ho (Mobile ke liye) 
//     // Aur wo bhi chahiye jinka Token na ho (Sirf Web ke liye)
//     const users = await User.find(query).select('_id expoPushToken');

//     if (users.length === 0) {
//       return NextResponse.json({ success: false, message: "No users found" }, { status: 404 });
//     }

//     // 3. DATABASE SAVE (Web Dashboard ke liye)
//     // Sab users ke liye entry banao
//     const notificationsToSave = users.map(user => ({
// =======
//     const body = await request.json();
//     const { title, message, type, targetRole, metadata } = body;

//     console.log('📨 Sending notification from:', currentUser.role, currentUser.branchId);

//     // ============================================================
//     // STEP A: LOGIC - Kisko bhejna hai? (Super vs Branch Admin)
//     // ============================================================
    
//     let filter = { role: targetRole }; // e.g. 'student'

//     // Agar BRANCH ADMIN hai, toh filter restrict kro
//     if (currentUser.role === 'branch_admin') {
//       if (!currentUser.branchId) {
//         return NextResponse.json({ success: false, error: "Branch ID missing" }, { status: 400 });
//       }
//       filter.branchId = currentUser.branchId; // Sirf apni branch walo ko dhoondo
//     }
//     // Note: Super admin ke liye filter me branchId nahi lagega, wo sab uthayega

//     // Users dhoondo unke Tokens k sath
//     const users = await User.find(filter).select('_id expoPushToken');

//     if (!users.length) {
//       return NextResponse.json({ success: false, message: "No users found" }, { status: 404 });
//     }

//     console.log(`✅ Found ${users.length} users to notify`);

//     // ============================================================
//     // STEP B: DATABASE MEIN SAVE KRO (In-App List ke liye)
//     // ============================================================
    
//     const dbNotifications = users.map(user => ({
// >>>>>>> ca7a24cc2863b76a8c6680ffe9f29dc23140dc0c
//       type,
//       title,
//       message,
//       targetUser: user._id,
//       isRead: false,
//     }));

//     await Notification.insertMany(notificationsToSave);

//     // 4. MOBILE PUSH (Expo ke liye)
//     // Sirf unko bhejo jinke paas Token hai
//     let messages = [];
//     for (let user of users) {
//       if (user.expoPushToken && Expo.isExpoPushToken(user.expoPushToken)) {
//         messages.push({
//           to: user.expoPushToken,
//           sound: 'default',
//           title: title,
//           body: message,
//           data: { type }, // App click hone par data milega
//         });
//       }
//     }

// <<<<<<< HEAD
//     // Expo ko chunks mein bhejo
// =======
//     console.log(`📱 Sending push to ${messages.length} devices`);

//     // Expo ko chunks me bhejte hain (optimization)
// >>>>>>> ca7a24cc2863b76a8c6680ffe9f29dc23140dc0c
//     let chunks = expo.chunkPushNotifications(messages);
//     for (let chunk of chunks) {
//       try {
//         await expo.sendPushNotificationsAsync(chunk);
//       } catch (error) {
//         console.error("Expo Error:", error);
//       }
//     }

//     return NextResponse.json({ 
//       success: true, 
// <<<<<<< HEAD
//       message: `Sent to ${users.length} users (${messages.length} on Mobile)` 
//     });

//   } catch (error) {
//     console.error("Server Error:", error);
//     return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
// =======
//       message: `Notification saved and sent to ${messages.length} devices`,
//       totalUsers: users.length,
//       devicesNotified: messages.length
//     });

//   } catch (error) {
//     console.error("Notification Error:", error);
//     return NextResponse.json({ success: false, error: error.message || "Internal Server Error" }, { status: 500 });
// >>>>>>> ca7a24cc2863b76a8c6680ffe9f29dc23140dc0c
//   }
// }

// // Export with Auth Protection - Only super_admin and branch_admin can send notifications
// export const POST = withAuth(sendNotification, [requireRole(['super_admin', 'branch_admin'])]);





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
    // 🔥 targetBranch yahan zaroori hai Super Admin k liye
    const { title, message, type, targetRole, targetBranch, metadata } = body; 

    // Basic Validation
    if (!title || !message || !targetRole) {
      return NextResponse.json({ success: false, error: "Title, Message, and Role are required" }, { status: 400 });
    }

    console.log('📨 Request from:', currentUser.role, '| Branch ID:', currentUser.branchId);

    // ============================================================
    // 🎯 FILTERING LOGIC (Super vs Branch Admin)
    // ============================================================
    
    let query = { 
      role: targetRole,
      isActive: true // ✅ Sirf active users ko bhejo (Safety check)
    };

    // SCENARIO 1: Branch Admin
    if (currentUser.role === 'branch_admin') {
      if (!currentUser.branchId) {
        return NextResponse.json({ success: false, error: "Your account is not linked to any branch." }, { status: 400 });
      }
      query.branchId = currentUser.branchId; // Force restriction
    }
    
    // SCENARIO 2: Super Admin (Jo Merge me miss ho gaya tha)
    else if (currentUser.role === 'super_admin') {
      // Agar Super Admin ne 'All Branches' select nahi kiya, toh specific branch filter lagao
      if (targetBranch && targetBranch !== 'all') {
        query.branchId = targetBranch;
      }
      // Agar 'all' hai, toh query.branchId mat lagao (Sabko jayega)
    }

    console.log("🔍 Database Query:", query);

    // ============================================================
    // 👥 USERS FETCH
    // ============================================================

    // Hamein wo users chahiye jinka Token ho (Mobile ke liye) 
    // Aur wo bhi chahiye jinka Token na ho (Sirf Web ke liye)
    // Isliye hum sirf filter use karenge, token check loop me karenge
    const users = await User.find(query).select('_id expoPushToken');

    if (!users || users.length === 0) {
      return NextResponse.json({ success: false, message: "No users found matching criteria" }, { status: 404 });
    }

    console.log(`👥 Total Users Found: ${users.length}`);

    // ============================================================
    // 💾 DATABASE SAVE (Web Dashboard)
    // ============================================================
    
    const dbNotifications = users.map(user => ({
      type,
      title,
      message,
      targetUser: user._id,
      metadata: metadata || {},
      isRead: false,
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