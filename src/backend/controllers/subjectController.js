import Subject from '../models/Subject.js';
import Class from '../models/Class.js';
import Stream from '../models/Stream.js';
import response from '../middleware/response.js';

// Get all subjects with optional faculty/class filtering
export const getAllSubjects = async (req, res) => {
  try {
    const { facultyId, classId, status } = req.query;

    let filter = {};
    if (facultyId) filter.facultyId = facultyId;
    if (classId) filter.classId = classId;
    if (status) filter.status = status;

    const subjects = await Subject.find(filter)
      .populate('classId', 'name code')
      .populate('facultyId', 'name code')
      .populate('departmentId', 'name')
      .populate('headTeacherId', 'firstName lastName fullName')
      .sort({ name: 1 });

    response.success(res, 'Subjects retrieved successfully', subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    response.error(res, 'Failed to retrieve subjects', 500);
  }
};

// Get subject by ID
export const getSubjectById = async (req, res) => {
  try {
    const { id } = req.params;

    const subject = await Subject.findById(id)
      .populate('classId', 'name code')
      .populate('facultyId', 'name code')
      .populate('departmentId', 'name')
      .populate('headTeacherId', 'firstName lastName fullName')
      .populate('teachers', 'firstName lastName fullName')
      .populate('prerequisites', 'name code');

    if (!subject) {
      return response.error(res, 'Subject not found', 404);
    }

    response.success(res, 'Subject retrieved successfully', subject);
  } catch (error) {
    console.error('Error fetching subject:', error);
    response.error(res, 'Failed to retrieve subject', 500);
  }
};

// Create new subject with faculty awareness
export const createSubject = async (req, res) => {
  try {
    const {
      name,
      code,
      classId,
      facultyId,
      subjectType,
      hoursPerWeek,
      totalHoursPerYear,
      creditHours,
      departmentId,
      headTeacherId,
      teachers,
      assessmentPattern,
      learningOutcomes,
      prerequisites,
      resources,
      description
    } = req.body;

    // Validate required fields
    if (!name || !code || !classId) {
      return response.error(res, 'Missing required fields', 400);
    }

    // Check if subject code already exists
    const existingSubject = await Subject.findOne({ code });
    if (existingSubject) {
      return response.error(res, 'Subject code already exists', 400);
    }

    // Validate class exists
    const classData = await Class.findById(classId);
    if (!classData) {
      return response.error(res, 'Class not found', 400);
    }

    // Validate faculty if provided
    if (facultyId) {
      const faculty = await Stream.findById(facultyId);
      if (!faculty) {
        return response.error(res, 'Faculty not found', 400);
      }
    }

    const subject = new Subject({
      name,
      code,
      classId,
      facultyId,
      subjectType: subjectType || 'core',
      hoursPerWeek: hoursPerWeek || 5,
      totalHoursPerYear: totalHoursPerYear || 150,
      creditHours: creditHours || 3,
      departmentId,
      headTeacherId,
      teachers: teachers || [],
      assessmentPattern: assessmentPattern || {
        continuousAssessment: 20,
        midTerm: 30,
        finalExam: 50
      },
      learningOutcomes: learningOutcomes || [],
      prerequisites: prerequisites || [],
      resources: resources || {},
      description,
      createdBy: req.user?.id,
      updatedBy: req.user?.id
    });

    await subject.save();

    // Populate the response
    await subject.populate('classId', 'name code');
    await subject.populate('facultyId', 'name code');
    await subject.populate('departmentId', 'name');

    response.success(res, 'Subject created successfully', subject, 201);
  } catch (error) {
    console.error('Error creating subject:', error);
    response.error(res, 'Failed to create subject', 500);
  }
};

// Update subject
export const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const subject = await Subject.findById(id);
    if (!subject) {
      return response.error(res, 'Subject not found', 404);
    }

    // Validate faculty if being updated
    if (updateData.facultyId) {
      const faculty = await Stream.findById(updateData.facultyId);
      if (!faculty) {
        return response.error(res, 'Faculty not found', 400);
      }
    }

    // Update fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        subject[key] = updateData[key];
      }
    });

    subject.updatedBy = req.user?.id;
    await subject.save();

    // Populate the response
    await subject.populate('classId', 'name code');
    await subject.populate('facultyId', 'name code');
    await subject.populate('departmentId', 'name');

    response.success(res, 'Subject updated successfully', subject);
  } catch (error) {
    console.error('Error updating subject:', error);
    response.error(res, 'Failed to update subject', 500);
  }
};

// Delete subject
export const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;

    const subject = await Subject.findById(id);
    if (!subject) {
      return response.error(res, 'Subject not found', 404);
    }

    // Check if subject is assigned to students
    const User = (await import('../models/User.js')).default;
    const assignedStudents = await User.countDocuments({
      'studentProfile.selectedSubjects.subjectId': id,
      role: 'student'
    });

    if (assignedStudents > 0) {
      return response.error(res, 'Cannot delete subject assigned to students', 400);
    }

    await Subject.findByIdAndDelete(id);
    response.success(res, 'Subject deleted successfully');
  } catch (error) {
    console.error('Error deleting subject:', error);
    response.error(res, 'Failed to delete subject', 500);
  }
};

// Get subjects by faculty
export const getSubjectsByFaculty = async (req, res) => {
  try {
    const { facultyId } = req.params;

    const faculty = await Stream.findById(facultyId);
    if (!faculty) {
      return response.error(res, 'Faculty not found', 404);
    }

    const subjects = await Subject.find({ facultyId })
      .populate('classId', 'name code')
      .populate('departmentId', 'name')
      .sort({ name: 1 });

    response.success(res, 'Subjects retrieved successfully', subjects);
  } catch (error) {
    console.error('Error fetching subjects by faculty:', error);
    response.error(res, 'Failed to retrieve subjects', 500);
  }
};

// Get subjects by class
export const getSubjectsByClass = async (req, res) => {
  try {
    const { classId } = req.params;

    const classData = await Class.findById(classId);
    if (!classData) {
      return response.error(res, 'Class not found', 404);
    }

    const subjects = await Subject.find({ classId })
      .populate('facultyId', 'name code')
      .populate('departmentId', 'name')
      .sort({ name: 1 });

    response.success(res, 'Subjects retrieved successfully', subjects);
  } catch (error) {
    console.error('Error fetching subjects by class:', error);
    response.error(res, 'Failed to retrieve subjects', 500);
  }
};
