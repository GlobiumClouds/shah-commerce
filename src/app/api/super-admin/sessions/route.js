import { NextRequest } from 'next/server';
import connectDB from '../../../../lib/database';
import { getAllSessions, createSession, updateSession, deleteSession } from '../../../../backend/controllers/sessionController';
import { authenticate, requireRole } from '../../../../backend/middleware/auth';

// GET /api/perper-admin/sessions - Get all sessions
export async function GET(request) {
  try {
    await connectDB();

    // Authenticate and authorize
    const authResult = await authenticate(request);
    if (authResult.error) {
      return Response.json(
        { success: false, message: authResult.message },
        { status: authResult.status }
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
    if (authResult.error) {
      return Response.json(
        { success: false, message: authResult.message },
        { status: authResult.status }
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

// PUT /api/super-admin/sessions - Update session
export async function PUT(request) {
  try {
    await connectDB();

    // Authenticate and authorize
    const authResult = await authenticate(request);
    if (authResult.error) {
      return Response.json(
        { success: false, message: authResult.message },
        { status: authResult.status }
      );
    }

    const authzResult = await requireRole(['super_admin'])(request, authResult.user);
    if (authzResult) {
      return authzResult;
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return Response.json(
        { success: false, message: 'Session ID is required' },
        { status: 400 }
      );
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
      user: authResult.user,
      params: { id },
      body: updateData
    };

    await updateSession(mockReq, mockRes);

    return Response.json(responseData, { status: statusCode });
  } catch (error) {
    console.error('Error in PUT /api/super-admin/sessions:', error);
    return Response.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/super-admin/sessions - Delete session
export async function DELETE(request) {
  try {
    await connectDB();

    // Authenticate and authorize
    const authResult = await authenticate(request);
    if (authResult.error) {
      return Response.json(
        { success: false, message: authResult.message },
        { status: authResult.status }
      );
    }

    const authzResult = await requireRole(['super_admin'])(request, authResult.user);
    if (authzResult) {
      return authzResult;
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return Response.json(
        { success: false, message: 'Session ID is required' },
        { status: 400 }
      );
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
      user: authResult.user,
      params: { id }
    };

    await deleteSession(mockReq, mockRes);

    return Response.json(responseData, { status: statusCode });
  } catch (error) {
    console.error('Error in DELETE /api/super-admin/sessions:', error);
    return Response.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
