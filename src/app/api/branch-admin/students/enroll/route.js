import { NextRequest } from 'next/server';
import connectDB from '../../../../../lib/database';
import {
  enrollStudent,
  getStudentsBySessionFaculty
} from '../../../../../backend/controllers/studentController';
import { authenticate, authorize } from '../../../../../backend/middleware/auth';

// GET /api/branch-admin/students/enroll - Get students by session/faculty (for enrollment management)
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

    const authzResult = authorize(['super_admin', 'branch_admin'])(authResult.user);
    if (!authzResult) {
      return Response.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Check query parameters
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('sessionId');
    const facultyId = url.searchParams.get('facultyId');

    if (!sessionId || !facultyId) {
      return Response.json(
        { success: false, message: 'sessionId and facultyId are required' },
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
      params: { sessionId, facultyId }
    };

    await getStudentsBySessionFaculty(mockReq, mockRes);

    return Response.json(responseData, { status: statusCode });
  } catch (error) {
    console.error('Error in GET /api/branch-admin/students/enroll:', error);
    return Response.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/branch-admin/students/enroll - Enroll new student
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

    const authzResult = authorize(['super_admin', 'branch_admin'])(authResult.user);
    if (!authzResult) {
      return Response.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
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

    await enrollStudent(mockReq, mockRes);

    return Response.json(responseData, { status: statusCode });
  } catch (error) {
    console.error('Error in POST /api/branch-admin/students/enroll:', error);
    return Response.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
