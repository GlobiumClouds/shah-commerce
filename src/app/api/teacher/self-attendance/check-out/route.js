import { teacherCheckOut } from '@/backend/controllers/teacherAttendanceController';
import { authenticate } from '@/backend/middleware/auth';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    console.log('=== CHECK-OUT API ROUTE START ===');
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));

    // Authenticate user
    const authResult = await authenticate(req);
    if (authResult.error) {
      console.log('Authentication failed:', authResult.message);
      return NextResponse.json(
        { success: false, message: authResult.message },
        { status: authResult.status || 401 }
      );
    }

    req.user = authResult.user;
    console.log('Authenticated user:', req.user);

    // Parse request body
    const body = await req.json();
    req.body = body;
    console.log('Request body:', body);

    // Create a proper mock response object that mimics Express response
    let responseData = null;
    let responseStatus = 200;
    let responseSent = false;

    const mockRes = {
      status: (code) => {
        responseStatus = code;
        return {
          json: (data) => {
            if (responseSent) {
              throw new Error('Response already sent');
            }
            responseData = data;
            responseStatus = code;
            responseSent = true;
            return mockRes;
          }
        };
      },
      json: (data) => {
        if (responseSent) {
          throw new Error('Response already sent');
        }
        responseData = data;
        responseSent = true;
        return mockRes;
      }
    };

    // Call controller
    await teacherCheckOut(req, mockRes);

    // Return the response from controller
    return NextResponse.json(responseData, { status: responseStatus });

  } catch (error) {
    console.error('Teacher check-out API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
