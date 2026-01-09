// import { NextResponse } from 'next/server';
// import { Expo } from 'expo-server-sdk';
// import connectDB from '@/lib/database';
// import User from '@/backend/models/User';
// import Notification from '@/backend/models/Notification';
// import { withAuth, requireRole } from '@/backend/middleware/auth';

// const expo = new Expo();

// async function sendNotification(request, currentUser) {
//   try {
//     await connectDB();

//     const body = await request.json();
//     // 🔥 targetBranch yahan zaroori hai Super Admin k liye
//     const { title, message, type, targetRole, targetBranch, metadata } = body; 

//     // Basic Validation
//     if (!title || !message || !targetRole) {
//       return NextResponse.json({ success: false, error: "Title, Message, and Role are required" }, { status: 400 });
//     }

//     console.log('📨 Request from:', currentUser.role, '| Branch ID:', currentUser.branchId);

//     // ============================================================
//     // 🎯 FILTERING LOGIC (Super vs Branch Admin)
//     // ============================================================
    
//     let query = { 
//       role: targetRole,
//       isActive: true // ✅ Sirf active users ko bhejo (Safety check)
//     };

//     // SCENARIO 1: Branch Admin
//     if (currentUser.role === 'branch_admin') {
//       if (!currentUser.branchId) {
//         return NextResponse.json({ success: false, error: "Your account is not linked to any branch." }, { status: 400 });
//       }
//       query.branchId = currentUser.branchId; // Force restriction
//     }
    
//     // SCENARIO 2: Super Admin (Jo Merge me miss ho gaya tha)
//     else if (currentUser.role === 'super_admin') {
//       // Agar Super Admin ne 'All Branches' select nahi kiya, toh specific branch filter lagao
//       if (targetBranch && targetBranch !== 'all') {
//         query.branchId = targetBranch;
//       }
//       // Agar 'all' hai, toh query.branchId mat lagao (Sabko jayega)
//     }

//     console.log("🔍 Database Query:", query);

//     // ============================================================
//     // 👥 USERS FETCH
//     // ============================================================

//     // Hamein wo users chahiye jinka Token ho (Mobile ke liye) 
//     // Aur wo bhi chahiye jinka Token na ho (Sirf Web ke liye)
//     // Isliye hum sirf filter use karenge, token check loop me karenge
//     const users = await User.find(query).select('_id expoPushToken');

//     if (!users || users.length === 0) {
//       return NextResponse.json({ success: false, message: "No users found matching criteria" }, { status: 404 });
//     }

//     console.log(`✅ Found ${users.length} users to notify`);

//     // ============================================================
//     // 💾 DATABASE SAVE (Web Dashboard)
//     // ============================================================
    
//     const dbNotifications = users.map(user => ({
//       type,
//       title,
//       message,
//       targetUser: user._id,
//       metadata: metadata || {},
//       isRead: false,
//     }));

//     await Notification.insertMany(dbNotifications);

//     // ============================================================
//     // 📱 MOBILE PUSH (Expo)
//     // ============================================================

//     let messages = [];
    
//     for (let user of users) {
//       // Token check logic
//       if (user.expoPushToken && Expo.isExpoPushToken(user.expoPushToken)) {
//         messages.push({
//           to: user.expoPushToken,
//           sound: 'default',
//           title: title,
//           body: message,
//           data: { type, ...metadata },
//         });
//       }
//     }

//     // Sending in Chunks (Expo Limit Handling)
//     if (messages.length > 0) {
//       console.log(`🚀 Pushing to ${messages.length} mobile devices...`);
//       let chunks = expo.chunkPushNotifications(messages);
      
//       for (let chunk of chunks) {
//         try {
//           await expo.sendPushNotificationsAsync(chunk);
//         } catch (error) {
//           console.error("Expo Push Error:", error);
//           // Error aane par process mat roko, continue karo
//         }
//       }
//     }

//     return NextResponse.json({ 
//       success: true, 
//       message: `Notification sent successfully to ${users.length} users (${messages.length} on Mobile)`,
//       totalUsers: users.length,
//       pushedTo: messages.length
//     });

//   } catch (error) {
//     console.error("Critical Notification Error:", error);
//     return NextResponse.json({ success: false, error: error.message || "Internal Server Error" }, { status: 500 });
//   }
// }

// // ✅ Correct Export with Middleware
// export const POST = withAuth(sendNotification, [requireRole(['super_admin', 'branch_admin'])]);



import { NextResponse } from 'next/server';
import { Expo } from 'expo-server-sdk';
import connectDB from '@/lib/database';
import User from '@/backend/models/User';
import Notification from '@/backend/models/Notification';
import { withAuth, requireRole } from '@/backend/middleware/auth';

const expo = new Expo();

async function sendNotification(request, currentUser) {
  try {
    await connectDB();

    const body = await request.json();
    const { title, message, type, targetRole, targetBranch, metadata } = body; 

    // Validation
    if (!title || !message || !targetRole) {
      return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
    }

    console.log(`\n📨 --- NEW NOTIFICATION REQUEST ---`);
    console.log(`FROM: ${currentUser.role} | TO: ${targetRole}`);

    // ============================================================
    // 1. FILTERING LOGIC
    // ============================================================
    let query = { 
      role: targetRole,
      isActive: true 
    };

    if (currentUser.role === 'branch_admin') {
      query.branchId = currentUser.branchId; 
    } 
    else if (currentUser.role === 'super_admin') {
      if (targetBranch && targetBranch !== 'all') {
        query.branchId = targetBranch;
      }
    }

    // ============================================================
    // 2. FETCH USERS
    // ============================================================
    // Hum 'fullName' bhi select kar rahe hain debugging ke liye
    const users = await User.find(query).select('_id expoPushToken fullName');

    if (!users || users.length === 0) {
      console.log("❌ No users found in DB matching query.");
      return NextResponse.json({ success: false, message: "No users found" }, { status: 404 });
    }

    console.log(`👥 Total Users Found: ${users.length}`);

    // ============================================================
    // 3. DB SAVE & TOKEN CHECK (Main Debugging Here)
    // ============================================================
    const dbNotifications = [];
    let messages = [];
    let tokenCount = 0;
    let missingTokenCount = 0;

    for (let user of users) {
      // DB Save List prepare
      dbNotifications.push({
        type, title, message, targetUser: user._id, metadata: metadata || {}, isRead: false,
      });

      // 🔥 TOKEN CHECK LOGIC
      if (!user.expoPushToken) {
        missingTokenCount++;
        // console.log(`🔸 No Token: ${user.fullName} (${user._id})`); // Uncomment to see names
      } 
      else if (!Expo.isExpoPushToken(user.expoPushToken)) {
        console.log(`❌ Invalid Token Format: ${user.fullName} -> ${user.expoPushToken}`);
      } 
      else {
        // ✅ Token Valid Hai
        console.log(`✅ Valid Token: ${user.fullName} -> ${user.expoPushToken}`);
        messages.push({
          to: user.expoPushToken,
          sound: 'default',
          title: title,
          body: message,
          data: { type, ...metadata },
        });
        tokenCount++;
      }
    }

    // DB Insert
    await Notification.insertMany(dbNotifications);
    console.log(`💾 Saved ${dbNotifications.length} notifications to DB.`);

    // ============================================================
    // 4. MOBILE PUSH SENDING
    // ============================================================
    console.log(`📱 Users with Tokens: ${tokenCount} | Without Tokens: ${missingTokenCount}`);

    if (messages.length > 0) {
      let chunks = expo.chunkPushNotifications(messages);
      
      for (let chunk of chunks) {
        try {
          let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          // 🔥 Ye dekhna zaroori hai
          console.log("🎫 Expo API Response:", JSON.stringify(ticketChunk)); 
        } catch (error) {
          console.error("🔥 Expo Sending Error:", error);
        }
      }
    } else {
      console.log("⚠️ No valid tokens found. Skipping Mobile Push.");
    }

    return NextResponse.json({ 
      success: true, 
      message: `Sent to ${users.length} users (${tokenCount} on Mobile)`,
    });

  } catch (error) {
    console.error("Critical Server Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export const POST = withAuth(sendNotification, [requireRole(['super_admin', 'branch_admin'])]);