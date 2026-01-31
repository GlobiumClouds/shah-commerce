import Stream from '../models/Stream.js';
import { successResponse, errorResponse, notFoundResponse } from '../middleware/response.js';
// Get all faculties
export const getAllFaculties = async (req, res) => {
  try {
    const faculties = await Stream.find({}).sort({ name: 1 });
    return successResponse(res, faculties, 'Faculties retrieved successfully');
  } catch (error) {
    console.error('Error fetching faculties:', error);
    return errorResponse(res, 'Failed to retrieve faculties', 500);
  }
};

// Get faculty by ID
export const getFacultyById = async (req, res) => {
  try {
    const { id } = req.params;
    const faculty = await Stream.findById(id);

    if (!faculty) {
      return notFoundResponse('Faculty not found');
    }

    return successResponse(faculty, 'Faculty retrieved successfully');
  } catch (error) {
    console.error('Error fetching faculty:', error);
    return errorResponse('Failed to retrieve faculty', 500);
  }
};

// Create new faculty
export const createFaculty = async (req, res) => {
  try {
    const { name, code, description } = req.body;

    // Validate required fields
    if (!name) {
      return {
        success: false,
        message: 'Faculty name is required',
        status: 400
      };
    }

    // Check if faculty name already exists
    const existingFaculty = await Stream.findOne({ name });
    if (existingFaculty) {
      return {
        success: false,
        message: 'Faculty name already exists',
        status: 400
      };
    }

    // Generate code if not provided
    const facultyCode = code || name.toUpperCase().replace(/\s+/g, '_');

    const faculty = new Stream({
      name,
      code: facultyCode,
      description,
      createdBy: req.user?.id,
      updatedBy: req.user?.id
    });

    await faculty.save();
    return {
      success: true,
      message: 'Faculty created successfully',
      data: faculty,
      status: 201
    };
  } catch (error) {
    console.error('Error creating faculty:', error);
    return {
      success: false,
      message: 'Failed to create faculty',
      status: 500
    };
  }
};

// Update faculty
export const updateFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, description } = req.body;

    const faculty = await Stream.findById(id);
    if (!faculty) {
      return errorResponse(res, 'Faculty not found', 404);
    }

    // Check if name is being changed and if it conflicts
    if (name && name !== faculty.name) {
      const existingFaculty = await Stream.findOne({ name, _id: { $ne: id } });
      if (existingFaculty) {
        return errorResponse(res, 'Faculty name already exists', 400);
      }
    }

    // Update fields
    if (name) faculty.name = name;
    if (code) faculty.code = code;
    if (description !== undefined) faculty.description = description;

    faculty.updatedBy = req.user?.id;
    await faculty.save();

    return successResponse(res, faculty, 'Faculty updated successfully');
  } catch (error) {
    console.error('Error updating faculty:', error);
    return errorResponse(res, 'Failed to update faculty', 500);
  }
};

// Delete faculty
export const deleteFaculty = async (req, res) => {
  try {
    const { id } = req.params;

    const faculty = await Stream.findById(id);
    if (!faculty) {
      return notFoundResponse('Faculty not found');
    }

    // Check if faculty has associated classes
    const Class = (await import('../models/Class.js')).default;
    const associatedClasses = await Class.countDocuments({ facultyId: id });

    if (associatedClasses > 0) {
      return errorResponse('Cannot delete faculty with associated classes', 400);
    }

    // Check if faculty has associated subjects
    const Subject = (await import('../models/Subject.js')).default;
    const associatedSubjects = await Subject.countDocuments({ facultyId: id });

    if (associatedSubjects > 0) {
      return errorResponse('Cannot delete faculty with associated subjects', 400);
    }

    await Stream.findByIdAndDelete(id);
    return successResponse(null, 'Faculty deleted successfully');
  } catch (error) {
    console.error('Error deleting faculty:', error);
    return errorResponse('Failed to delete faculty', 500);
  }
};
// Get faculties with subject count
export const getFacultiesWithStats = async (req, res) => {
  try {
    const faculties = await Stream.find({}).sort({ name: 1 });

    // Get subject counts for each faculty
    const Subject = (await import('../models/Subject.js')).default;
    const facultiesWithStats = await Promise.all(
      faculties.map(async (faculty) => {
        const subjectCount = await Subject.countDocuments({ facultyId: faculty._id });
        return {
          ...faculty.toObject(),
          subjectCount
        };
      })
    );

    return successResponse(facultiesWithStats, 'Faculties with stats retrieved successfully');
  } catch (error) {
    console.error('Error fetching faculties with stats:', error);
    return errorResponse('Failed to retrieve faculties with stats', 500);
  }
};
