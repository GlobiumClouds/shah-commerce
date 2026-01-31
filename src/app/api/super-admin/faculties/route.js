import { NextRequest } from 'next/server';
import connectDB from '../../../../lib/database';
import { getAllFaculties, createFaculty, getFacultiesWithStats, updateFaculty, deleteFaculty } from '../../../../backend/controllers/facultyController';
import { authenticate, requireRole } from '../../../../backend/middleware/auth';

// GET /api/super-admin/faculties - Get all faculties
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

    // Check if stats query parameter is present
    const url = new URL(request.url);
    const includeStats = url.searchParams.get('stats') === 'true';

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
      query: { stats: includeStats }
    };

    // Call appropriate controller function
    if (includeStats) {
      await getFacultiesWithStats(mockReq, mockRes);
    } else {
      await getAllFaculties(mockReq, mockRes);
    }

    return Response.json(responseData, { status: statusCode });
  } catch (error) {
    console.error('Error in GET /api/super-admin/faculties:', error);
    return Response.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/super-admin/faculties - Create new faculty
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
    let statusCode = 201;

    const mockRes = {
      json: (data, status = 201) => {
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

    // Call controller function
    await createFaculty(mockReq, mockRes);

    return Response.json(responseData, { status: statusCode });
  } catch (error) {
    console.error('Error in POST /api/super-admin/faculties:', error);
    return Response.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
