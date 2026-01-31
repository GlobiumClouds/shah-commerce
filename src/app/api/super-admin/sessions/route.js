import { NextRequest } from 'next/server';
import connectDB from '../../../../lib/database';
import { getAllSessions, createSession } from '../../../../backend/controllers/sessionController';
import { authenticate, requireRole } from '../../../../backend/middleware/auth';

// GET /api/super-admin/sessions - Get all sessions
export async function GET(request) {
  try {
    await connectDB();

    // Authenticate and authorize
    const authResult = await authenticate(request);
    if (!authResult.success) {
      return Response.json(
        { success: false, message: 'Authentication failed' },
        { status: 401 }
      );
    }

    const authzResult = await requireRole(['super_admin'])(request, authResult.user);
    if (authzResult) {
      return authzResult;
    }

    // Mock response object for controller
    let responseData = null;
    let statusCode = 200;

    const mockRes = {
      json: (data, status = 200) => {
        responseData = data;
        statusCode = status;
        return { data, status };
      },
      status: (code) => ({
        json: (data) => {
          responseData = data;
          statusCode = code;
          return { data, status: code };
        }
      })
    };

    // Mock request object
    const mockReq = {
      user: authResult.user
    };

    await getAllSessions(mockReq, mockRes);

    return Response.json(responseData, { status: statusCode });
  } catch (error) {
    console.error('Error in GET /api/super-admin/sessions:', error);
    return Response.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/super-admin/sessions - Create new session
export async function POST(request) {
  try {
    await connectDB();

    // Authenticate and authorize
    const authResult = await authenticate(request);
    if (!authResult.success) {
      return Response.json(
        { success: false, message: 'Authentication failed' },
        { status: 401 }
      );
    }

    const authzResult = await requireRole(['super_admin'])(request, authResult.user);
    if (authzResult) {
      return authzResult;
    }

    const body = await request.json();

    // Mock response object for controller
    let responseData = null;
    let statusCode = 200;

    const mockRes = {
      json: (data, status = 200) => {
        responseData = data;
        statusCode = status;
        return { data, status };
      },
      status: (code) => ({
        json: (data) => {
          responseData = data;
          statusCode = code;
          return { data, status: code };
        }
      })
    };

    // Mock request object
    const mockReq = {
      user: authResult.user,
      body
    };

    await createSession(mockReq, mockRes);

    return Response.json(responseData, { status: statusCode });
  } catch (error) {
    console.error('Error in POST /api/super-admin/sessions:', error);
    return Response.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
