import { NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import User from '@/backend/models/User';
import { withAuth } from '@/backend/middleware/auth';

async function saveToken(request, currentUser, userDoc) {
  try {
    await connectDB();

    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ success: false, error: "Token is required" }, { status: 400 });
    }

    console.log('💾 Saving push token for user:', currentUser.email);

    // Update user's expo push token
    userDoc.expoPushToken = token;
    await userDoc.save();

    console.log('✅ Push token saved successfully');

    return NextResponse.json({ 
      success: true, 
      message: "Token saved successfully",
      userId: currentUser.userId
    });

  } catch (error) {
    console.error("Save Token Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Server Error" }, { status: 500 });
  }
}

<<<<<<< HEAD

=======
// Export with Auth Protection - All authenticated users can save their tokens
export const POST = withAuth(saveToken);
>>>>>>> ca7a24cc2863b76a8c6680ffe9f29dc23140dc0c
