import { NextRequest } from 'next/server';
import connectDB from '../../../../lib/database';
import { getFacultyById, updateFaculty, deleteFaculty } from '../../../../backend/controllers/facultyController';
import { authenticate, requireRole } from '../../../../backend/middleware/auth';

// GET /api/super-admin/faculties/[id] - Get faculty by ID
export async function GET(request, { params }) {
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
      user: authResult.user,
      params
    };

    await getFacultyById(mockReq, mockRes);

    return Response.json(responseData, { status: statusCode });
  } catch (error) {
    console.error('Error in GET /api/super-admin/faculties/[id]:', error);
    return Response.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/super-admin/faculties/[id] - Update faculty
export async function PUT(request, { params }) {
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
      params,
      body
    };

    await updateFaculty(mockReq, mockRes);

    return Response.json(responseData, { status: statusCode });
  } catch (error) {
    console.error('Error in PUT /api/super-admin/faculties/[id]:', error);
    return Response.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/super-admin/faculties/[id] - Delete faculty
export async function DELETE(request, { params }) {
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
      user: authResult.user,
      params
    };

    await deleteFaculty(mockReq, mockRes);

    return Response.json(responseData, { status: statusCode });
  } catch (error) {
    console.error('Error in DELETE /api/super-admin/faculties/[id]:', error);
    return Response.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
