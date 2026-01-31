import User from '../models/User.js';
import Class from '../models/Class.js';
import Level from '../models/Level.js';
import Stream from '../models/Stream.js';
import Subject from '../models/Subject.js';
import response from '../middleware/response.js';

// Get all students with optional session/faculty filtering
export const getAllStudents = async (req, res) => {
  try {
    const { sessionId, facultyId, classId, branchId } = req.query;

    let filter = { role: 'student' };
    if (branchId) filter.branchId = branchId;
    if (sessionId) filter['studentProfile.sessionId'] = sessionId;
    if (facultyId) filter['studentProfile.facultyId'] = facultyId;
    if (classId) filter['studentProfile.classId'] = classId;

    const students = await User.find(filter)
      .populate('branchId', 'name code')
      .populate('studentProfile.classId', 'name code')
      .populate('studentProfile.sessionId', 'name sessionYear')
      .populate('studentProfile.facultyId', 'name code')
      .select('-passwordHash -refreshToken -resetPasswordToken -resetPasswordExpires -verificationToken')
      .sort({ 'studentProfile.rollNumber': 1 });

    response.success(res, 'Students retrieved successfully', students);
  } catch (error) {
    console.error('Error fetching students:', error);
    response.error(res, 'Failed to retrieve students', 500);
  }
};

// Get student by ID
export const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await User.findOne({ _id: id, role: 'student' })
      .populate('branchId', 'name code')
      .populate('studentProfile.classId', 'name code sections')
      .populate('studentProfile.sessionId', 'name sessionYear')
      .populate('studentProfile.facultyId', 'name code')
      .populate('studentProfile.selectedSubjects.subjectId', 'name code creditHours')
      .populate('studentProfile.departmentId', 'name')
      .select('-passwordHash -refreshToken -resetPasswordToken -resetPasswordExpires -verificationToken');

    if (!student) {
      return response.error(res, 'Student not found', 404);
    }

    response.success(res, 'Student retrieved successfully', student);
  } catch (error) {
    console.error('Error fetching student:', error);
    response.error(res, 'Failed to retrieve student', 500);
  }
};

// Enroll student with session/faculty selection
export const enrollStudent = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      gender,
      address,
      sessionId,
      facultyId,
      classId,
      section,
      selectedSubjects,
      father,
      mother,
      guardian,
      guardianType,
      previousSchool
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !sessionId || !facultyId || !classId) {
      return response.error(res, 'Missing required fields', 400);
    }

    // Validate session exists and is active
    const session = await Level.findById(sessionId);
    if (!session || !session.isActive) {
      return response.error(res, 'Invalid or inactive session', 400);
    }

    // Validate faculty exists
    const faculty = await Stream.findById(facultyId);
    if (!faculty) {
      return response.error(res, 'Faculty not found', 400);
    }

    // Validate class exists and belongs to session/faculty
    const classData = await Class.findById(classId);
    if (!classData || classData.sessionId?.toString() !== sessionId || classData.facultyId?.toString() !== facultyId) {
      return response.error(res, 'Invalid class for selected session and faculty', 400);
    }

    // Validate selected subjects
    if (selectedSubjects && selectedSubjects.length > 0) {
      const subjectIds = selectedSubjects.map(s => s.subjectId);
      const validSubjects = await Subject.find({
        _id: { $in: subjectIds },
        facultyId: facultyId
      });

      if (validSubjects.length !== subjectIds.length) {
        return response.error(res, 'Some selected subjects are invalid for this faculty', 400);
      }
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return response.error(res, 'Email already exists', 400);
    }

    // Generate password (temporary)
    const defaultPassword = 'TempPass123!';

    // Create student
    const student = new User({
      role: 'student',
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      gender,
      address,
      branchId: req.user?.branchId || classData.branchId,
      passwordHash: defaultPassword, // Will be hashed by pre-save middleware
      studentProfile: {
        sessionId,
        facultyId,
        classId,
        section: section || 'A',
        selectedSubjects: selectedSubjects || [],
        admissionDate: new Date(),
        academicYear: `${session.sessionYear}-${session.sessionYear + 1}`,
        father,
        mother,
        guardian,
        guardianType: guardianType || 'parent',
        previousSchool
      },
      createdBy: req.user?.id,
      updatedBy: req.user?.id
    });

    await student.save();

    // Populate the response
    await student.populate('branchId', 'name code');
    await student.populate('studentProfile.classId', 'name code');
    await student.populate('studentProfile.sessionId', 'name sessionYear');
    await student.populate('studentProfile.facultyId', 'name code');

    response.success(res, 'Student enrolled successfully', student, 201);
  } catch (error) {
    console.error('Error enrolling student:', error);
    response.error(res, 'Failed to enroll student', 500);
  }
};

// Update student enrollment
export const updateStudentEnrollment = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const student = await User.findOne({ _id: id, role: 'student' });
    if (!student) {
      return response.error(res, 'Student not found', 404);
    }

    // Validate session/faculty/class if being updated
    if (updateData.sessionId) {
      const session = await Level.findById(updateData.sessionId);
      if (!session || !session.isActive) {
        return response.error(res, 'Invalid or inactive session', 400);
      }
    }

    if (updateData.facultyId) {
      const faculty = await Stream.findById(updateData.facultyId);
      if (!faculty) {
        return response.error(res, 'Faculty not found', 400);
      }
    }

    if (updateData.classId) {
      const classData = await Class.findById(updateData.classId);
      if (!classData) {
        return response.error(res, 'Class not found', 400);
      }
    }

    // Update student profile
    if (updateData.sessionId !== undefined) student.studentProfile.sessionId = updateData.sessionId;
    if (updateData.facultyId !== undefined) student.studentProfile.facultyId = updateData.facultyId;
    if (updateData.classId !== undefined) student.studentProfile.classId = updateData.classId;
    if (updateData.section !== undefined) student.studentProfile.section = updateData.section;
    if (updateData.selectedSubjects !== undefined) student.studentProfile.selectedSubjects = updateData.selectedSubjects;

    student.updatedBy = req.user?.id;
    await student.save();

    // Populate the response
    await student.populate('studentProfile.classId', 'name code');
    await student.populate('studentProfile.sessionId', 'name sessionYear');
    await student.populate('studentProfile.facultyId', 'name code');

    response.success(res, 'Student enrollment updated successfully', student);
  } catch (error) {
    console.error('Error updating student enrollment:', error);
    response.error(res, 'Failed to update student enrollment', 500);
  }
};

// Get available subjects for a student
export const getAvailableSubjects = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await User.findOne({ _id: id, role: 'student' })
      .populate('studentProfile.facultyId', 'name code')
      .populate('studentProfile.classId', 'name code');

    if (!student) {
      return response.error(res, 'Student not found', 404);
    }

    if (!student.studentProfile.facultyId) {
      return response.error(res, 'Student not enrolled in a faculty', 400);
    }

    // Get all subjects for the student's faculty
    const allSubjects = await Subject.find({
      facultyId: student.studentProfile.facultyId._id,
      status: 'active'
    }).select('name code creditHours description');

    // Get already selected subjects
    const selectedSubjectIds = student.studentProfile.selectedSubjects?.map(s => s.subjectId.toString()) || [];

    const availableSubjects = allSubjects.filter(subject =>
      !selectedSubjectIds.includes(subject._id.toString())
    );

    const selectedSubjects = await Subject.find({
      _id: { $in: selectedSubjectIds }
    }).select('name code creditHours description');

    response.success(res, 'Available subjects retrieved successfully', {
      faculty: student.studentProfile.facultyId,
      availableSubjects,
      selectedSubjects: student.studentProfile.selectedSubjects || [],
      limits: {
        maxSubjects: 8, // Configurable limit
        minSubjects: 3  // Configurable minimum
      }
    });
  } catch (error) {
    console.error('Error fetching available subjects:', error);
    response.error(res, 'Failed to retrieve available subjects', 500);
  }
};

// Assign subjects to student
export const assignSubjectsToStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { subjectIds } = req.body;

    if (!Array.isArray(subjectIds)) {
      return response.error(res, 'subjectIds must be an array', 400);
    }

    const student = await User.findOne({ _id: id, role: 'student' });
    if (!student) {
      return response.error(res, 'Student not found', 404);
    }

    if (!student.studentProfile.facultyId) {
      return response.error(res, 'Student not enrolled in a faculty', 400);
    }

    // Validate subjects belong to student's faculty
    const validSubjects = await Subject.find({
      _id: { $in: subjectIds },
      facultyId: student.studentProfile.facultyId,
      status: 'active'
    });

    if (validSubjects.length !== subjectIds.length) {
      return response.error(res, 'Some subjects are invalid for this student\'s faculty', 400);
    }

    // Create selected subjects array
    const selectedSubjects = validSubjects.map(subject => ({
      subjectId: subject._id,
      subjectName: subject.name,
      creditHours: subject.creditHours
    }));

    student.studentProfile.selectedSubjects = selectedSubjects;
    student.updatedBy = req.user?.id;
    await student.save();

    response.success(res, 'Subjects assigned successfully', {
      studentId: student._id,
      selectedSubjects
    });
  } catch (error) {
    console.error('Error assigning subjects:', error);
    response.error(res, 'Failed to assign subjects', 500);
  }
};

// Get students by session and faculty
export const getStudentsBySessionFaculty = async (req, res) => {
  try {
    const { sessionId, facultyId } = req.params;

    const students = await User.find({
      role: 'student',
      'studentProfile.sessionId': sessionId,
      'studentProfile.facultyId': facultyId
    })
    .populate('studentProfile.classId', 'name code sections')
    .populate('studentProfile.selectedSubjects.subjectId', 'name code')
    .select('firstName lastName fullName studentProfile')
    .sort({ 'studentProfile.rollNumber': 1 });

    response.success(res, 'Students retrieved successfully', students);
  } catch (error) {
    console.error('Error fetching students by session and faculty:', error);
    response.error(res, 'Failed to retrieve students', 500);
  }
};
