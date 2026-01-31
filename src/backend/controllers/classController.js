import Class from '../models/Class.js';
import Level from '../models/Level.js';
import Stream from '../models/Stream.js';
import Subject from '../models/Subject.js';
import User from '../models/User.js';
import response from '../middleware/response.js';

// Get all classes with optional session/faculty filtering
export const getAllClasses = async (req, res) => {
  try {
    const { sessionId, facultyId, branchId, status } = req.query;

    let filter = {};
    if (sessionId) filter.sessionId = sessionId;
    if (facultyId) filter.facultyId = facultyId;
    if (branchId) filter.branchId = branchId;
    if (status) filter.status = status;

    const classes = await Class.find(filter)
      .populate('grade', 'name gradeNumber')
      .populate('sessionId', 'name sessionYear')
      .populate('facultyId', 'name code')
      .populate('branchId', 'name code')
      .populate('subjects', 'name code')
      .sort({ 'grade.gradeNumber': 1, name: 1 });

    response.success(res, 'Classes retrieved successfully', classes);
  } catch (error) {
    console.error('Error fetching classes:', error);
    response.error(res, 'Failed to retrieve classes', 500);
  }
};

// Get class by ID
export const getClassById = async (req, res) => {
  try {
    const { id } = req.params;

    const classData = await Class.findById(id)
      .populate('grade', 'name gradeNumber')
      .populate('sessionId', 'name sessionYear')
      .populate('facultyId', 'name code')
      .populate('branchId', 'name code')
      .populate('subjects', 'name code facultyId')
      .populate('sections.classTeacherId', 'firstName lastName fullName');

    if (!classData) {
      return response.error(res, 'Class not found', 404);
    }

    response.success(res, 'Class retrieved successfully', classData);
  } catch (error) {
    console.error('Error fetching class:', error);
    response.error(res, 'Failed to retrieve class', 500);
  }
};

// Create new class with session/faculty awareness
export const createClass = async (req, res) => {
  try {
    const {
      name,
      code,
      gradeId,
      sessionId,
      facultyId,
      sections,
      subjects,
      description
    } = req.body;

    // Validate required fields
    if (!name || !code || !gradeId || !sessionId) {
      return response.error(res, 'Missing required fields', 400);
    }

    // Check if class code already exists
    const existingClass = await Class.findOne({ code });
    if (existingClass) {
      return response.error(res, 'Class code already exists', 400);
    }

    // Validate session exists and is active
    const session = await Level.findById(sessionId);
    if (!session || !session.isActive) {
      return response.error(res, 'Invalid or inactive session', 400);
    }

    // Validate faculty if provided
    if (facultyId) {
      const faculty = await Stream.findById(facultyId);
      if (!faculty) {
        return response.error(res, 'Faculty not found', 400);
      }
    }

    // Get branch from user or use default
    const branchId = req.user?.branchId;

    const classData = new Class({
      name,
      code,
      grade: gradeId,
      sessionId,
      facultyId,
      branchId,
      sections: sections || [{
        name: 'A',
        capacity: 40
      }],
      subjects: subjects || [],
      academicYear: `${session.sessionYear}-${session.sessionYear + 1}`,
      description,
      createdBy: req.user?.id,
      updatedBy: req.user?.id
    });

    await classData.save();

    // Populate the response
    await classData.populate('grade', 'name gradeNumber');
    await classData.populate('sessionId', 'name sessionYear');
    await classData.populate('facultyId', 'name code');
    await classData.populate('branchId', 'name code');

    response.success(res, 'Class created successfully', classData, 201);
  } catch (error) {
    console.error('Error creating class:', error);
    response.error(res, 'Failed to create class', 500);
  }
};

// Update class
export const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const classData = await Class.findById(id);
    if (!classData) {
      return response.error(res, 'Class not found', 404);
    }

    // Validate session if being updated
    if (updateData.sessionId) {
      const session = await Level.findById(updateData.sessionId);
      if (!session || !session.isActive) {
        return response.error(res, 'Invalid or inactive session', 400);
      }
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
        classData[key] = updateData[key];
      }
    });

    classData.updatedBy = req.user?.id;
    await classData.save();

    // Populate the response
    await classData.populate('grade', 'name gradeNumber');
    await classData.populate('sessionId', 'name sessionYear');
    await classData.populate('facultyId', 'name code');
    await classData.populate('branchId', 'name code');

    response.success(res, 'Class updated successfully', classData);
  } catch (error) {
    console.error('Error updating class:', error);
    response.error(res, 'Failed to update class', 500);
  }
};

// Delete class
export const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;

    const classData = await Class.findById(id);
    if (!classData) {
      return response.error(res, 'Class not found', 404);
    }

    // Check if class has enrolled students
    const enrolledStudents = await User.countDocuments({
      'studentProfile.classId': id,
      role: 'student'
    });

    if (enrolledStudents > 0) {
      return response.error(res, 'Cannot delete class with enrolled students', 400);
    }

    // Remove class reference from subjects
    await Subject.updateMany(
      { classId: id },
      { $unset: { classId: 1 } }
    );

    await Class.findByIdAndDelete(id);
    response.success(res, 'Class deleted successfully');
  } catch (error) {
    console.error('Error deleting class:', error);
    response.error(res, 'Failed to delete class', 500);
  }
};

// Get classes by session
export const getClassesBySession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await Level.findById(sessionId);
    if (!session) {
      return response.error(res, 'Session not found', 404);
    }

    const classes = await Class.find({ sessionId })
      .populate('grade', 'name gradeNumber')
      .populate('facultyId', 'name code')
      .populate('branchId', 'name code')
      .sort({ 'grade.gradeNumber': 1, name: 1 });

    response.success(res, 'Classes retrieved successfully', classes);
  } catch (error) {
    console.error('Error fetching classes by session:', error);
    response.error(res, 'Failed to retrieve classes', 500);
  }
};

// Get classes by faculty
export const getClassesByFaculty = async (req, res) => {
  try {
    const { facultyId } = req.params;

    const faculty = await Stream.findById(facultyId);
    if (!faculty) {
      return response.error(res, 'Faculty not found', 404);
    }

    const classes = await Class.find({ facultyId })
      .populate('grade', 'name gradeNumber')
      .populate('sessionId', 'name sessionYear')
      .populate('branchId', 'name code')
      .sort({ 'grade.gradeNumber': 1, name: 1 });

    response.success(res, 'Classes retrieved successfully', classes);
  } catch (error) {
    console.error('Error fetching classes by faculty:', error);
    response.error(res, 'Failed to retrieve classes', 500);
  }
};

// Get classes by session and faculty
export const getClassesBySessionFaculty = async (req, res) => {
  try {
    const { sessionId, facultyId } = req.params;

    const classes = await Class.find({ sessionId, facultyId })
      .populate('grade', 'name gradeNumber')
      .populate('branchId', 'name code')
      .sort({ 'grade.gradeNumber': 1, name: 1 });

    response.success(res, 'Classes retrieved successfully', classes);
  } catch (error) {
    console.error('Error fetching classes by session and faculty:', error);
    response.error(res, 'Failed to retrieve classes', 500);
  }
};

// Add subject to class
export const addSubjectToClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { subjectId } = req.body;

    const classData = await Class.findById(id);
    if (!classData) {
      return response.error(res, 'Class not found', 404);
    }

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return response.error(res, 'Subject not found', 400);
    }

    // Check if subject is already added
    if (classData.subjects.includes(subjectId)) {
      return response.error(res, 'Subject already added to class', 400);
    }

    classData.subjects.push(subjectId);
    classData.updatedBy = req.user?.id;
    await classData.save();

    response.success(res, 'Subject added to class successfully', classData);
  } catch (error) {
    console.error('Error adding subject to class:', error);
    response.error(res, 'Failed to add subject to class', 500);
  }
};

// Remove subject from class
export const removeSubjectFromClass = async (req, res) => {
  try {
    const { id, subjectId } = req.params;

    const classData = await Class.findById(id);
    if (!classData) {
      return response.error(res, 'Class not found', 404);
    }

    // Check if subject is assigned to students in this class
    const assignedStudents = await User.countDocuments({
      'studentProfile.classId': id,
      'studentProfile.selectedSubjects.subjectId': subjectId,
      role: 'student'
    });

    if (assignedStudents > 0) {
      return response.error(res, 'Cannot remove subject assigned to students', 400);
    }

    classData.subjects = classData.subjects.filter(subId => subId.toString() !== subjectId);
    classData.updatedBy = req.user?.id;
    await classData.save();

    response.success(res, 'Subject removed from class successfully', classData);
  } catch (error) {
    console.error('Error removing subject from class:', error);
    response.error(res, 'Failed to remove subject from class', 500);
  }
};
