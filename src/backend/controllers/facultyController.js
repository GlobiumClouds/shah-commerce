import Faculty from '../models/Faculty.js';
import { successResponse, errorResponse, notFoundResponse } from '../middleware/response.js';
// Get all faculties
export const getAllFaculties = async (req, res) => {
  try {
    console.log('Fetching faculties...');
    console.log('Faculty model:', Faculty);
    const faculties = await Faculty.find({}).sort({ name: 1 });
    console.log('Faculties found:', faculties.length);
    res.status(200).json({
      success: true,
      message: 'Faculties retrieved successfully',
      data: faculties
    });
  } catch (error) {
    console.error('Error fetching faculties:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve faculties'
    });
  }
};

// Get faculty by ID
export const getFacultyById = async (req, res) => {
  try {
    const { id } = req.params;
    const faculty = await Faculty.findById(id);

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Faculty retrieved successfully',
      data: faculty
    });
  } catch (error) {
    console.error('Error fetching faculty:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve faculty'
    });
  }
};

// Create new faculty
export const createFaculty = async (req, res) => {
  try {
    const { name, code, description } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Faculty name is required'
      });
    }

    // Check if faculty name already exists
    const existingFaculty = await Faculty.findOne({ name });
    if (existingFaculty) {
      return res.status(400).json({
        success: false,
        message: 'Faculty name already exists'
      });
    }

    // Generate code if not provided
    const facultyCode = code || name.toUpperCase().replace(/\s+/g, '_');

    const faculty = new Faculty({
      name,
      code: facultyCode,
      description,
      createdBy: req.user?.userId,
      updatedBy: req.user?.userId
    });

    await faculty.save();
    res.status(201).json({
      success: true,
      message: 'Faculty created successfully',
      data: faculty
    });
  } catch (error) {
    console.error('Error creating faculty:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create faculty'
    });
  }
};

// Update faculty
export const updateFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, description } = req.body;

    const faculty = await Faculty.findById(id);
    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found'
      });
    }

    // Check if name is being changed and if it conflicts
    if (name && name !== faculty.name) {
      const existingFaculty = await Faculty.findOne({ name, _id: { $ne: id } });
      if (existingFaculty) {
        return res.status(400).json({
          success: false,
          message: 'Faculty name already exists'
        });
      }
    }

    // Update fields
    if (name) faculty.name = name;
    if (code) faculty.code = code;
    if (description !== undefined) faculty.description = description;

    faculty.updatedBy = req.user?.userId;
    await faculty.save();

    res.status(200).json({
      success: true,
      message: 'Faculty updated successfully',
      data: faculty
    });
  } catch (error) {
    console.error('Error updating faculty:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update faculty'
    });
  }
};

// Delete faculty
export const deleteFaculty = async (req, res) => {
  try {
    const { id } = req.params;

    const faculty = await Faculty.findById(id);
    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found'
      });
    }

    // Check if faculty has associated classes
    const Class = (await import('../models/Class.js')).default;
    const associatedClasses = await Class.countDocuments({ facultyId: id });

    if (associatedClasses > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete faculty with associated classes'
      });
    }

    // Check if faculty has associated subjects
    const Subject = (await import('../models/Subject.js')).default;
    const associatedSubjects = await Subject.countDocuments({ facultyId: id });

    if (associatedSubjects > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete faculty with associated subjects'
      });
    }

    await Faculty.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: 'Faculty deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting faculty:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete faculty'
    });
  }
};
// Get faculties with subject count
export const getFacultiesWithStats = async (req, res) => {
  try {
    const faculties = await Faculty.find({}).sort({ name: 1 });

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

    res.status(200).json({
      success: true,
      message: 'Faculties with stats retrieved successfully',
      data: facultiesWithStats
    });
  } catch (error) {
    console.error('Error fetching faculties with stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve faculties with stats'
    });
  }
};
