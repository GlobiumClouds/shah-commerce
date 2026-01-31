import Level from '../models/Level';
import { successResponse, errorResponse } from '../middleware/response';

// Get all sessions
export const getAllSessions = async (req, res) => {
  try {
    const sessions = await Level.find({}).sort({ sessionYear: -1 });
    return successResponse(res, 'Sessions retrieved successfully', sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return errorResponse(res, 'Failed to fetch sessions', 500);
  }
};

// Get session by ID
export const getSessionById = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await Level.findById(id);

    if (!session) {
      return errorResponse(res, 'Session not found', 404);
    }

    return successResponse(res, 'Session retrieved successfully', session);
  } catch (error) {
    console.error('Error fetching session:', error);
    return errorResponse(res, 'Failed to fetch session', 500);
  }
};

// Create new session
export const createSession = async (req, res) => {
  try {
    const { name, code, sessionYear, description } = req.body;

    // Validate required fields
    if (!name || !code || !sessionYear) {
      return errorResponse(res, 'Name, code, and session year are required', 400);
    }

    // Check if session year already exists
    const existingSession = await Level.findOne({ sessionYear });
    if (existingSession) {
      return errorResponse(res, 'Session with this year already exists', 400);
    }

    // Create new session
    const session = new Level({
      name,
      code: code.toUpperCase(),
      sessionYear,
      description,
      createdBy: req.user.id,
      updatedBy: req.user.id
    });

    await session.save();

    return successResponse(res, 'Session created successfully', session, 201);
  } catch (error) {
    console.error('Error creating session:', error);
    if (error.code === 11000) {
      return errorResponse(res, 'Session code already exists', 400);
    }
    return errorResponse(res, 'Failed to create session', 500);
  }
};

// Update session
export const updateSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, sessionYear, description, isActive } = req.body;

    const session = await Level.findById(id);
    if (!session) {
      return errorResponse(res, 'Session not found', 404);
    }

    // Update fields
    if (name) session.name = name;
    if (code) session.code = code.toUpperCase();
    if (sessionYear) session.sessionYear = sessionYear;
    if (description !== undefined) session.description = description;
    if (isActive !== undefined) session.isActive = isActive;

    session.updatedBy = req.user.id;
    await session.save();

    return successResponse(res, 'Session updated successfully', session);
  } catch (error) {
    console.error('Error updating session:', error);
    if (error.code === 11000) {
      return errorResponse(res, 'Session code already exists', 400);
    }
    return errorResponse(res, 'Failed to update session', 500);
  }
};

// Delete session
export const deleteSession = async (req, res) => {
  try {
    const { id } = req.params;

    const session = await Level.findById(id);
    if (!session) {
      return errorResponse(res, 'Session not found', 404);
    }

    // Check if session has associated classes
    const Class = (await import('../models/Class')).default;
    const associatedClasses = await Class.countDocuments({ sessionId: id });
    if (associatedClasses > 0) {
      return errorResponse(res, 'Cannot delete session with associated classes', 400);
    }

    await Level.findByIdAndDelete(id);

    return successResponse(res, 'Session deleted successfully');
  } catch (error) {
    console.error('Error deleting session:', error);
    return errorResponse(res, 'Failed to delete session', 500);
  }
};
