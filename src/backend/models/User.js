// import mongoose from 'mongoose';
// import bcrypt from 'bcryptjs';

// const userSchema = new mongoose.Schema(
//   {
//     // ==================== COMMON FIELDS (ALL ROLES) ====================
//     role: {
//       type: String,
//       required: [true, 'Role is required'],
//       enum: ['super_admin', 'branch_admin', 'teacher', 'student', 'parent', 'staff'],
//       index: true,
//     },
    
//     // Basic Information
//     firstName: {
//       type: String,
//       trim: true,
//     },
//     lastName: {
//       type: String,
//       trim: true,
//     },
//     fullName: {
//       type: String,
//       trim: true,
//     },
//     email: {
//       type: String,
//       required: [true, 'Email is required'],
//       unique: true,
//       lowercase: true,
//       trim: true,
//       match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
//     },
//     phone: {
//       type: String,
//       trim: true,
//     },
//     alternatePhone: {
//       type: String,
//       trim: true,
//     },
//     dateOfBirth: {
//       type: Date,
//     },
//     gender: {
//       type: String,
//       enum: ['male', 'female', 'other'],
//     },
//     bloodGroup: {
//       type: String,
//       enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
//     },
//     religion: {
//       type: String,
//       trim: true,
//     },
//     nationality: {
//       type: String,
//       default: 'Pakistani',
//       trim: true,
//     },
//     cnic: {
//       type: String,
//       trim: true,
//       sparse: true,
//     },
    
//     // Profile Photo (Cloudinary)
//     profilePhoto: {
//       url: { type: String },
//       publicId: { type: String },
//       uploadedAt: { type: Date },
//     },
    
//     // Address Information
//     address: {
//       street: { type: String, trim: true },
//       city: { type: String, trim: true },
//       state: { type: String, trim: true },
//       postalCode: { type: String, trim: true },
//       country: { type: String, default: 'Pakistan', trim: true },
//     },
    
//     // Branch Association
//     branchId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Branch',
//       required: function() {
//         return this.role !== 'super_admin';
//       },
//     },

//     // ==================== AUTHENTICATION ====================
//     expoPushToken: {
//       type: String, // Mobile ka token yahan save hoga
//       default: null,
//       trim: true,
//     },
    
//     passwordHash: {
//       type: String,
//       required: true,
//       select: false,
//     },
//     refreshToken: {
//       type: String,
//       select: false,
//     },
//     emailVerified: {
//       type: Boolean,
//       default: false,
//     },
//     isActive: {
//       type: Boolean,
//       default: true,
//     },
//     approved: {
//       type: Boolean,
//       default: false,
//     },
//     lastLogin: {
//       type: Date,
//     },
//     loginHistory: [{
//       timestamp: { type: Date, default: Date.now },
//       ipAddress: String,
//       userAgent: String,
//       location: String,
//       device: String,
//     }],
    
//     // ==================== STUDENT PROFILE ====================
//     studentProfile: {
//       registrationNumber: {
//         type: String,
//         uppercase: true,
//         trim: true,
//         sparse: true,
//         unique: true,
//       },
//       classId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Class',
//       },
//       departmentId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Department',
//       },
//       section: {
//         type: String,
//         trim: true,
//       },
//       rollNumber: {
//         type: String,
//         trim: true,
//       },
//       admissionDate: {
//         type: Date,
//       },
//       academicYear: {
//         type: String,
//       },
      
//       // Previous School Information
//       previousSchool: {
//         name: { type: String, trim: true },
//         lastClass: { type: String, trim: true },
//         marks: { type: Number },
//         leavingDate: { type: Date },
//       },
      
//       // Parent/Guardian Information
//       father: {
//         name: { type: String, trim: true },
//         occupation: { type: String, trim: true },
//         phone: { type: String, trim: true },
//         email: { type: String, trim: true, lowercase: true },
//         cnic: { type: String, trim: true },
//         income: { type: Number },
//       },
//       mother: {
//         name: { type: String, trim: true },
//         occupation: { type: String, trim: true },
//         phone: { type: String, trim: true },
//         email: { type: String, trim: true, lowercase: true },
//         cnic: { type: String, trim: true },
//       },
//       guardian: {
//         name: { type: String, trim: true },
//         relation: { type: String, trim: true },
//         phone: { type: String, trim: true },
//         email: { type: String, trim: true, lowercase: true },
//         cnic: { type: String, trim: true },
//       },
//       guardianType: {
//         type: String,
//         enum: ['parent', 'guardian'],
//         default: 'parent',
//       },
      
//       // Fee Information
//       feeDiscount: {
//         type: { type: String, enum: ['percentage', 'fixed'], default: 'fixed' },
//         amount: { type: Number, default: 0, min: 0 },
//         reason: { type: String, trim: true },
//       },
//       transportFee: {
//         enabled: { type: Boolean, default: false },
//         // routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'TransportRoute' },
//         amount: { type: Number, default: 0 },
//       },
      
//       // Student Documents (Cloudinary)
//       documents: [{
//         type: {
//           type: String,
//           // enum: ['b_form', 'birth_certificate', 'photo', 'previous_result', 'leaving_certificate', 'medical_certificate', 'other'],
//         },
//         name: { type: String, trim: true },
//         url: { type: String },
//         publicId: { type: String },
//         uploadedAt: { type: Date, default: Date.now },
//       }],
//       // Generated QR for student (uploaded to Cloudinary)
//       qr: {
//         url: { type: String },
//         publicId: { type: String },
//         uploadedAt: { type: Date },
//       },
//     },
    
//     // ==================== TEACHER PROFILE ====================
//     teacherProfile: {
//       employeeId: {
//         type: String,
//         uppercase: true,
//         trim: true,
//         sparse: true,
//         unique: true,
//       },
//       joiningDate: {
//         type: Date,
//       },
//       designation: {
//         type: String,
//         enum: [
//           'Principal',
//           'Vice Principal',
//           'Head Teacher',
//           'Senior Teacher',
//           'Teacher',
//           'Junior Teacher',
//           'Subject Specialist',
//           'Lab Instructor',
//           'Physical Instructor',
//           'Art Teacher',
//           'Music Teacher',
//           'Other',
//         ],
//       },
//       departmentId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Department',
//       },
//       department: {
//         type: String,
//         enum: [
//           'Science',
//           'Mathematics',
//           'English',
//           'Urdu',
//           'Islamiyat',
//           'Social Studies',
//           'Computer Science',
//           'Physics',
//           'Chemistry',
//           'Biology',
//           'Commerce',
//           'Arts',
//           'Physical Education',
//           'Other',
//         ],
//       },
      
//       // Qualifications
//       qualifications: [{
//         degree: { type: String },
//         institution: { type: String },
//         yearOfCompletion: { type: Number },
//         grade: String,
//         major: String,
//       }],
      
//       // Experience
//       experience: {
//         totalYears: { type: Number, default: 0 },
//         previousInstitutions: [{
//           institutionName: String,
//           designation: String,
//           fromDate: Date,
//           toDate: Date,
//           responsibilities: String,
//         }],
//       },
      
//       // Subjects & Classes
//       subjects: [{
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Subject',
//       }],
//       classes: [{
//         classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
//         section: String,
//         subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
//       }],
      
//       // Salary Information
//       salaryDetails: {
//         basicSalary: { type: Number },
//         allowances: {
//           houseRent: { type: Number, default: 0 },
//           medical: { type: Number, default: 0 },
//           transport: { type: Number, default: 0 },
//           other: { type: Number, default: 0 },
//         },
//         deductions: {
//           tax: { type: Number, default: 0 },
//           providentFund: { type: Number, default: 0 },
//           insurance: { type: Number, default: 0 },
//           other: { type: Number, default: 0 },
//         },
//       },
      
//       // Leave Balance
//       leaveBalance: {
//         casual: { type: Number, default: 15 },
//         sick: { type: Number, default: 10 },
//         annual: { type: Number, default: 20 },
//       },
      
//       // Emergency Contact
//       emergencyContact: {
//         name: String,
//         relationship: String,
//         phone: String,
//         alternatePhone: String,
//       },
      
//       // Teacher Documents (CV, Resume, Certificates - Cloudinary)
//       documents: [{
//         type: {
//           type: String,
//           enum: ['cnic', 'cv', 'resume', 'degree', 'certificate', 'experience_letter', 'photo', 'other'],
//         },
//         name: { type: String, trim: true },
//         url: { type: String },
//         publicId: { type: String },
//         uploadedAt: { type: Date, default: Date.now },
//       }],
      
//       // Generated QR for teacher (uploaded to Cloudinary)
//       qr: {
//         url: { type: String },
//         publicId: { type: String },
//         uploadedAt: { type: Date },
//       },
      
//       // Bank Account Details for Payroll
//       bankAccount: {
//         bankName: { type: String, trim: true },
//         accountNumber: { type: String, trim: true },
//         iban: { type: String, trim: true },
//         branchCode: { type: String, trim: true },
//       },
//     },
    
//     // ==================== STAFF PROFILE ====================
//     staffProfile: {
//       employeeId: {
//         type: String,
//         uppercase: true,
//         trim: true,
//         sparse: true,
//         unique: true,
//       },
//       joiningDate: {
//         type: Date,
//       },
//       departmentId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Department',
//       },
//       role: {
//         type: String,
//         trim: true,
//       },
//       shift: {
//         type: String,
//         enum: ['Morning', 'Evening', 'Night', 'Rotating'],
//       },
      
//       // Salary Information
//       salaryDetails: {
//         basicSalary: { type: Number },
//         allowances: {
//           houseRent: { type: Number, default: 0 },
//           medical: { type: Number, default: 0 },
//           transport: { type: Number, default: 0 },
//           other: { type: Number, default: 0 },
//         },
//         deductions: {
//           tax: { type: Number, default: 0 },
//           providentFund: { type: Number, default: 0 },
//           insurance: { type: Number, default: 0 },
//           other: { type: Number, default: 0 },
//         },
//       },
      
//       // Leave Balance
//       leaveBalance: {
//         casual: { type: Number, default: 12 },
//         sick: { type: Number, default: 10 },
//         annual: { type: Number, default: 15 },
//       },
      
//       // Emergency Contact
//       emergencyContact: {
//         name: String,
//         relationship: String,
//         phone: String,
//         alternatePhone: String,
//       },
      
//       // Staff Documents (Cloudinary)
//       documents: [{
//         type: {
//           type: String,
//           enum: ['cnic', 'cv', 'resume', 'certificate', 'experience_letter', 'photo', 'other'],
//         },
//         name: { type: String, trim: true },
//         url: { type: String },
//         publicId: { type: String },
//         uploadedAt: { type: Date, default: Date.now },
//       }],
//     },
    
//     // ==================== ADMIN PROFILE ====================
//     adminProfile: {
//       permissions: [{
//         type: String,
//         enum: [
//           'manage_users',
//           'manage_branches',
//           'manage_students',
//           'manage_teachers',
//           'manage_staff',
//           'manage_fees',
//           'manage_salaries',
//           'manage_attendance',
//           'manage_exams',
//           'view_reports',
//           'manage_settings',
//         ],
//       }],
//       documents: [{
//         type: { type: String, enum: ['cnic', 'id_card', 'cv', 'certificate', 'photo', 'other'] },
//         name: { type: String, trim: true },
//         url: { type: String },
//         publicId: { type: String },
//         uploadedAt: { type: Date, default: Date.now },
//       }],
//     },
    
//     // ==================== PARENT PROFILE ====================
//     parentProfile: {
//       children: [{
//         id: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: 'User',
//         },
//         name: {
//           type: String,
//           trim: true,
//         },
//         registrationNumber: {
//           type: String,
//           uppercase: true,
//           trim: true,
//         },
//         dateOfBirth: {
//           type: Date,
//         },
//         cnic: {
//           type: String,
//           trim: true,
//         },
//         bFormNumber: {
//           type: String,
//           trim: true,
//         },
//         gender: {
//           type: String,
//           enum: ['male', 'female', 'other'],
//         },
//         className: {
//           type: String,
//           trim: true,
//         },
//         classId: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: 'Class',
//         },
//         section: {
//           type: String,
//           trim: true,
//         },
//       }],
//       occupation: String,
//       income: Number,
//       fullName: {
//         type: String,
//         trim: true,
//       },
//       phone: {
//         type: String,
//         trim: true,
//       },
//       email: {
//         type: String,
//         lowercase: true,
//         trim: true,
//         match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
//       },
//       cnic: {
//         type: String,
//         trim: true,
//       },
//       address: {
//         street: { type: String, trim: true },
//         city: { type: String, trim: true },
//         state: { type: String, trim: true },
//         postalCode: { type: String, trim: true },
//         country: { type: String, default: 'Pakistan', trim: true },
//       },
//       dateOfBirth: {
//         type: Date,
//       },
//     },
    
//     // ==================== METADATA ====================
//     status: {
//       type: String,
//       enum: ['pending', 'approved', 'rejected', 'active', 'inactive', 'graduated', 'transferred', 'expelled', 'on_leave', 'terminated', 'resigned'],
//       default: 'active',
//     },
//     remarks: {
//       type: String,
//       trim: true,
//     },
//     // Rejection fields for pending approvals
//     rejectionReason: {
//       type: String,
//       trim: true,
//     },
//     rejectedAt: {
//       type: Date,
//     },
//     rejectedBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//     },
//     createdBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//     },
//     updatedBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//     },
//     resetPasswordToken: {
//       type: String,
//       select: false,
//     },
//     resetPasswordExpires: {
//       type: Date,
//       select: false,
//     },
//     verificationToken: {
//       type: String,
//       select: false,
//     },
//   },
//   {
//     timestamps: true,
//     toJSON: { virtuals: true },
//     toObject: { virtuals: true },
//   }
// );

// // ==================== INDEXES ====================
// // Note: email, studentProfile.registrationNumber, teacherProfile.employeeId, staffProfile.employeeId
// // already have unique indexes defined in schema, so no need to add them again here
// userSchema.index({ role: 1, branchId: 1 });
// userSchema.index({ role: 1, status: 1 });
// userSchema.index({ firstName: 1, lastName: 1 });
// userSchema.index({ 'studentProfile.classId': 1 });
// userSchema.index({ 'teacherProfile.departmentId': 1 });
// userSchema.index({ 'staffProfile.departmentId': 1 });
// userSchema.index({ 'parentProfile.children.id': 1 });
// userSchema.index({ isActive: 1 });


// // ==================== METHODS ====================

// // Compare password
// userSchema.methods.comparePassword = async function(candidatePassword) {
//   try {
//     return await bcrypt.compare(candidatePassword, this.passwordHash);
//   } catch (error) {
//     throw new Error('Error comparing passwords');
//   }
// };

// // Generate refresh token
// userSchema.methods.generateRefreshToken = function() {
//   const crypto = require('crypto');
//   return crypto.randomBytes(32).toString('hex');
// };

// // Check if user has permission
// userSchema.methods.hasPermission = function(permission) {
//   if (this.role === 'super_admin') return true;
//   if (this.role === 'branch_admin' && this.adminProfile?.permissions) {
//     return this.adminProfile.permissions.includes(permission);
//   }
//   return false;
// };

// // Generate employee ID for teacher/staff
// userSchema.methods.generateEmployeeId = async function(branchCode) {
//   const prefix = this.role === 'teacher' ? 'T' : 'S';
//   const year = new Date().getFullYear();
//   const count = await this.constructor.countDocuments({
//     role: this.role,
//     branchId: this.branchId,
//   });
  
//   return `${branchCode}-${prefix}-${year}-${String(count + 1).padStart(3, '0')}`;
// };

// // Generate registration number for student
// userSchema.methods.generateRegistrationNumber = async function(branchCode) {
//   const year = new Date().getFullYear().toString().slice(-2);
//   const count = await this.constructor.countDocuments({
//     role: 'student',
//     branchId: this.branchId,
//   });
  
//   return `${branchCode}-${year}-${String(count + 1).padStart(4, '0')}`;
// };

// // Generate 6-digit random roll number
// userSchema.methods.generateRollNumber = async function() {
//   let rollNumber;
//   let exists = true;
  
//   while (exists) {
//     // Generate random 6-digit number
//     rollNumber = Math.floor(100000 + Math.random() * 900000).toString();
    
//     // Check if it exists in the same branch and class
//     const existing = await this.constructor.findOne({
//       role: 'student',
//       branchId: this.branchId,
//       'studentProfile.classId': this.studentProfile?.classId,
//       'studentProfile.rollNumber': rollNumber
//     });
    
//     if (!existing) {
//       exists = false;
//     }
//   }
  
//   return rollNumber;
// };

// // Method to exclude sensitive fields from JSON response
// userSchema.methods.toJSON = function() {
//   const obj = this.toObject();
//   delete obj.passwordHash;
//   delete obj.refreshToken;
//   delete obj.resetPasswordToken;
//   delete obj.resetPasswordExpires;
//   delete obj.verificationToken;
//   delete obj.__v;
//   return obj;
// };

// // ==================== STATIC METHODS ====================

// // Find active users
// userSchema.statics.findActive = function(filter = {}) {
//   return this.find({ ...filter, isActive: true });
// };

// // Find by role
// userSchema.statics.findByRole = function(role, filter = {}) {
//   return this.find({ ...filter, role });
// };

// // ==================== MIDDLEWARE ====================

// // Pre-save: Auto-set fullName
// userSchema.pre('save', function(next) {
//   if (this.firstName && this.lastName) {
//     this.fullName = `${this.firstName} ${this.lastName}`;
//   }
//   next();
// });

// // Pre-save: Hash password
// userSchema.pre('save', async function(next) {
//   if (!this.isModified('passwordHash')) {
//     return next();
//   }
  
//   try {
//     const salt = await bcrypt.genSalt(10);
//     this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

// // Pre-save: Generate IDs
// userSchema.pre('save', async function(next) {
//   try {
//     // Auto-generate employee ID for teacher/staff
//     if ((this.role === 'teacher' || this.role === 'staff') && this.isNew) {
//       const profileKey = this.role === 'teacher' ? 'teacherProfile' : 'staffProfile';

//       if (!this[profileKey]?.employeeId && this.branchId) {
//         const Branch = mongoose.model('Branch');
//         const branch = await Branch.findById(this.branchId);
//         const branchCode = branch?.code || 'SCH';

//         this[profileKey] = this[profileKey] || {};
//         if (typeof this.generateEmployeeId === 'function') {
//           this[profileKey].employeeId = await this.generateEmployeeId(branchCode);
//         } else {
//           const prefix = this.role === 'teacher' ? 'T' : 'S';
//           const year = new Date().getFullYear();
//           const count = await this.constructor.countDocuments({
//             role: this.role,
//             branchId: this.branchId,
//           });
//           this[profileKey].employeeId = `${branchCode}-${prefix}-${year}-${String(count + 1).padStart(3, '0')}`;
//         }
//       }
//     }

//     // Auto-generate registration number for student
//     if (this.role === 'student') {
//       if (!this.studentProfile?.registrationNumber && this.branchId) {
//         const Branch = mongoose.model('Branch');
//         const branch = await Branch.findById(this.branchId);
//         const branchCode = branch?.code || 'SCH';

//         this.studentProfile = this.studentProfile || {};
//         if (typeof this.generateRegistrationNumber === 'function') {
//           this.studentProfile.registrationNumber = await this.generateRegistrationNumber(branchCode);
//         } else {
//           const year = new Date().getFullYear().toString().slice(-2);
//           const count = await this.constructor.countDocuments({
//             role: 'student',
//             branchId: this.branchId,
//           });
//           this.studentProfile.registrationNumber = `${branchCode}-${year}-${String(count + 1).padStart(4, '0')}`;
//         }
//       }
      
//       // Auto-generate 6-digit roll number if missing
//       if (!this.studentProfile?.rollNumber && this.branchId && this.studentProfile?.classId) {
//         this.studentProfile = this.studentProfile || {};
//         if (typeof this.generateRollNumber === 'function') {
//           this.studentProfile.rollNumber = await this.generateRollNumber();
//         } else {
//           let rollNumber;
//           let exists = true;
//           while (exists) {
//             rollNumber = Math.floor(100000 + Math.random() * 900000).toString();
//             const existing = await this.constructor.findOne({
//               role: 'student',
//               branchId: this.branchId,
//               'studentProfile.classId': this.studentProfile.classId,
//               'studentProfile.rollNumber': rollNumber
//             });
//             if (!existing) exists = false;
//           }
//           this.studentProfile.rollNumber = rollNumber;
//         }
//       }
//     }

//     next();
//   } catch (error) {
//     next(error);
//   }
// });

// const User = mongoose.models.User || mongoose.model('User', userSchema);

// export default User;





import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    // ==================== COMMON FIELDS (ALL ROLES) ====================
    role: {
      type: String,
      required: [true, 'Role is required'],
      enum: ['super_admin', 'branch_admin', 'teacher', 'student', 'parent', 'staff'],
      index: true,
    },
    
    // Basic Information
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    fullName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    phone: {
      type: String,
      trim: true,
    },
    alternatePhone: {
      type: String,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    religion: {
      type: String,
      trim: true,
    },
    nationality: {
      type: String,
      default: 'Pakistani',
      trim: true,
    },
    cnic: {
      type: String,
      trim: true,
      sparse: true,
    },
    
    // Profile Photo (Cloudinary)
    profilePhoto: {
      url: { type: String },
      publicId: { type: String },
      uploadedAt: { type: Date },
    },
    
    // Address Information
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      postalCode: { type: String, trim: true },
      country: { type: String, default: 'Pakistan', trim: true },
    },
    
    // Branch Association
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: function() {
        return this.role !== 'super_admin';
      },
    },

    // ==================== AUTHENTICATION ====================
    expoPushToken: {
      type: String, // Mobile ka token yahan save hoga
      default: null,
      trim: true,
    },
    
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    approved: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
    },
    loginHistory: [{
      timestamp: { type: Date, default: Date.now },
      ipAddress: String,
      userAgent: String,
      location: String,
      device: String,
    }],
    
    // ==================== STUDENT PROFILE ====================
    studentProfile: {
      registrationNumber: {
        type: String,
        uppercase: true,
        trim: true,
        sparse: true,
        unique: true,
      },
      classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
      },
      departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
      },
      section: {
        type: String,
        trim: true,
      },
      rollNumber: {
        type: String,
        trim: true,
      },
      admissionDate: {
        type: Date,
      },
      academicYear: {
        type: String,
      },
      
      // Previous School Information
      previousSchool: {
        name: { type: String, trim: true },
        lastClass: { type: String, trim: true },
        marks: { type: Number },
        leavingDate: { type: Date },
      },
      
      // Parent/Guardian Information
      father: {
        name: { type: String, trim: true },
        occupation: { type: String, trim: true },
        phone: { type: String, trim: true },
        email: { type: String, trim: true, lowercase: true },
        cnic: { type: String, trim: true },
        income: { type: Number },
      },
      mother: {
        name: { type: String, trim: true },
        occupation: { type: String, trim: true },
        phone: { type: String, trim: true },
        email: { type: String, trim: true, lowercase: true },
        cnic: { type: String, trim: true },
      },
      guardian: {
        name: { type: String, trim: true },
        relation: { type: String, trim: true },
        phone: { type: String, trim: true },
        email: { type: String, trim: true, lowercase: true },
        cnic: { type: String, trim: true },
      },
      guardianType: {
        type: String,
        enum: ['parent', 'guardian'],
        default: 'parent',
      },
      
      // Fee Information
      feeDiscount: {
        type: { type: String, enum: ['percentage', 'fixed'], default: 'fixed' },
        amount: { type: Number, default: 0, min: 0 },
        reason: { type: String, trim: true },
      },
      transportFee: {
        enabled: { type: Boolean, default: false },
        // routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'TransportRoute' },
        amount: { type: Number, default: 0 },
      },
      
      // Student Documents (Cloudinary)
      documents: [{
        type: {
          type: String,
          // enum: ['b_form', 'birth_certificate', 'photo', 'previous_result', 'leaving_certificate', 'medical_certificate', 'other'],
        },
        name: { type: String, trim: true },
        url: { type: String },
        publicId: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      }],
      // Generated QR for student (uploaded to Cloudinary)
      qr: {
        url: { type: String },
        publicId: { type: String },
        uploadedAt: { type: Date },
      },
    },
    
    // ==================== TEACHER PROFILE ====================
    teacherProfile: {
      employeeId: {
        type: String,
        uppercase: true,
        trim: true,
        sparse: true,
        unique: true,
      },
      joiningDate: {
        type: Date,
      },
      designation: {
        type: String,
        enum: [
          'Principal',
          'Vice Principal',
          'Head Teacher',
          'Senior Teacher',
          'Teacher',
          'Junior Teacher',
          'Subject Specialist',
          'Lab Instructor',
          'Physical Instructor',
          'Art Teacher',
          'Music Teacher',
          'Other',
        ],
      },
      departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
      },
      department: {
        type: String,
        enum: [
          'Science',
          'Mathematics',
          'English',
          'Urdu',
          'Islamiyat',
          'Social Studies',
          'Computer Science',
          'Physics',
          'Chemistry',
          'Biology',
          'Commerce',
          'Arts',
          'Physical Education',
          'Other',
        ],
      },
      
      // Qualifications
      qualifications: [{
        degree: { type: String },
        institution: { type: String },
        yearOfCompletion: { type: Number },
        grade: String,
        major: String,
      }],
      
      // Experience
      experience: {
        totalYears: { type: Number, default: 0 },
        previousInstitutions: [{
          institutionName: String,
          designation: String,
          fromDate: Date,
          toDate: Date,
          responsibilities: String,
        }],
      },
      
      // Subjects & Classes
      subjects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
      }],
      classes: [{
        classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
        section: String,
        subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
      }],
      
      // Salary Information
      salaryDetails: {
        basicSalary: { type: Number },
        allowances: {
          houseRent: { type: Number, default: 0 },
          medical: { type: Number, default: 0 },
          transport: { type: Number, default: 0 },
          other: { type: Number, default: 0 },
        },
        deductions: {
          tax: { type: Number, default: 0 },
          providentFund: { type: Number, default: 0 },
          insurance: { type: Number, default: 0 },
          other: { type: Number, default: 0 },
        },
      },
      
      // Leave Balance
      leaveBalance: {
        casual: { type: Number, default: 15 },
        sick: { type: Number, default: 10 },
        annual: { type: Number, default: 20 },
      },
      
      // Emergency Contact
      emergencyContact: {
        name: String,
        relationship: String,
        phone: String,
        alternatePhone: String,
      },
      
      // Teacher Documents (CV, Resume, Certificates - Cloudinary)
      documents: [{
        type: {
          type: String,
          enum: ['cnic', 'cv', 'resume', 'degree', 'certificate', 'experience_letter', 'photo', 'other'],
        },
        name: { type: String, trim: true },
        url: { type: String },
        publicId: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      }],
      
      // Generated QR for teacher (uploaded to Cloudinary)
      qr: {
        url: { type: String },
        publicId: { type: String },
        uploadedAt: { type: Date },
      },
      
      // Bank Account Details for Payroll
      bankAccount: {
        bankName: { type: String, trim: true },
        accountNumber: { type: String, trim: true },
        iban: { type: String, trim: true },
        branchCode: { type: String, trim: true },
      },
    },
    
    // ==================== STAFF PROFILE ====================
    staffProfile: {
      employeeId: {
        type: String,
        uppercase: true,
        trim: true,
        sparse: true,
        unique: true,
      },
      joiningDate: {
        type: Date,
      },
      departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
      },
      staffType: {
        type: String,
        required: [true, 'Staff type is required for staff role'],
        enum: [
          // Administrative Staff
          'Administrative Officer',
          'Office Superintendent',
          'Clerk',
          'Accountant',
          'Cashier',
          'Data Entry Operator',
          'Receptionist',
          'Office Assistant',
          
          // Academic Support Staff
          'Librarian',
          'Assistant Librarian',
          'Lab Assistant',
          'Lab Attendant',
          'Computer Lab Assistant',
          'Science Lab Assistant',
          
          // Support Staff
          'Peon',
          'Security Guard',
          'Gate Keeper',
          'Sweeper',
          'Cleaner',
          'Gardener',
          'Mali',
          
          // Health & Medical Staff
          'School Nurse',
          'Doctor',
          'First Aid Assistant',
          
          // Transportation Staff
          'Driver',
          'Transport Supervisor',
          'Transport Manager',
          
          // Kitchen & Canteen Staff
          'Cook',
          'Helper',
          'Canteen Manager',
          
          // Hostel Staff (if applicable)
          'Hostel Warden',
          'Assistant Hostel Warden',
          'Hostel Supervisor',
          
          // Maintenance Staff
          'Electrician',
          'Plumber',
          'Carpenter',
          'Painter',
          
          // Other
          'Store Keeper',
          'Inventory Manager',
          'Sports Equipment Manager',
          'Event Coordinator',
          'Other'
        ],
        trim: true,
      },
      designation: {
        type: String,
        trim: true,
      },
      shift: {
        type: String,
        enum: ['Morning', 'Evening', 'Night', 'Rotating'],
      },
      
      // Specialized Fields based on Staff Type
      specializedInfo: {
        // For Drivers
        driverLicense: {
          number: { type: String, trim: true },
          type: { type: String, enum: ['LTV', 'HTV', 'Motorcycle', 'Other'] },
          expiryDate: { type: Date },
        },
        
        // For Security Guards
        securityBadgeNumber: {
          type: String,
          trim: true,
        },
        
        // For Medical Staff
        medicalQualification: {
          type: String,
          trim: true,
        },
        
        // For Technical Staff (Electrician, Plumber, etc.)
        tradeCertificate: {
          type: String,
          trim: true,
        },
        
        // For Kitchen Staff
        foodHandlingCertificate: {
          type: String,
          trim: true,
        },
      },
      
      // Working Hours
      workingHours: {
        startTime: { type: String }, // Format: "09:00 AM"
        endTime: { type: String },   // Format: "05:00 PM"
        breakDuration: { type: Number, default: 60 }, // in minutes
        workingDays: [{
          type: String,
          enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        }],
      },
      
      // Salary Information
      salaryDetails: {
        basicSalary: { type: Number },
        salaryType: {
          type: String,
          enum: ['monthly', 'daily', 'hourly'],
          default: 'monthly',
        },
        allowances: {
          houseRent: { type: Number, default: 0 },
          medical: { type: Number, default: 0 },
          transport: { type: Number, default: 0 },
          uniform: { type: Number, default: 0 },
          other: { type: Number, default: 0 },
        },
        deductions: {
          tax: { type: Number, default: 0 },
          providentFund: { type: Number, default: 0 },
          insurance: { type: Number, default: 0 },
          loan: { type: Number, default: 0 },
          other: { type: Number, default: 0 },
        },
      },
      
      // Attendance Tracking
      attendanceMethod: {
        type: String,
        enum: ['biometric', 'manual', 'qr_code', 'mobile_app'],
        default: 'manual',
      },
      
      // Equipment/Assets Assigned
      assignedAssets: [{
        assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset' },
        assetName: { type: String, trim: true },
        assetType: { type: String, trim: true },
        serialNumber: { type: String, trim: true },
        assignedDate: { type: Date, default: Date.now },
        returnDate: { type: Date },
        condition: { type: String, enum: ['new', 'good', 'fair', 'poor'] },
      }],
      
      // Leave Balance
      leaveBalance: {
        casual: { type: Number, default: 12 },
        sick: { type: Number, default: 10 },
        annual: { type: Number, default: 15 },
        unpaid: { type: Number, default: 0 },
      },
      
      // Emergency Contact
      emergencyContact: {
        name: String,
        relationship: String,
        phone: String,
        alternatePhone: String,
        address: String,
      },
      
      // Uniform Details (if applicable)
      uniformDetails: {
        size: { type: String, trim: true },
        quantityIssued: { type: Number, default: 2 },
        lastIssuedDate: { type: Date },
      },
      
      // Performance/Training Records
      performanceRecords: [{
        date: { type: Date, default: Date.now },
        rating: { type: Number, min: 1, max: 5 },
        feedback: { type: String, trim: true },
        reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      }],
      
      trainingRecords: [{
        trainingName: { type: String, trim: true },
        institution: { type: String, trim: true },
        duration: { type: String, trim: true },
        completionDate: { type: Date },
        certificateUrl: { type: String },
      }],
      
      // Staff Documents (Cloudinary)
      documents: [{
        type: {
          type: String,
          enum: [
            'cnic',
            'cv',
            'resume',
            'certificate',
            'experience_letter',
            'photo',
            'driver_license',
            'medical_certificate',
            'security_clearance',
            'police_verification',
            'appointment_letter',
            'contract',
            'other'
          ],
        },
        name: { type: String, trim: true },
        url: { type: String },
        publicId: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      }],
      
      // Generated QR for staff (uploaded to Cloudinary)
      qr: {
        url: { type: String },
        publicId: { type: String },
        uploadedAt: { type: Date },
      },
      
      // Bank Account Details for Payroll
      bankAccount: {
        bankName: { type: String, trim: true },
        accountNumber: { type: String, trim: true },
        iban: { type: String, trim: true },
        branchCode: { type: String, trim: true },
      },
    },
    
    // ==================== ADMIN PROFILE ====================
    adminProfile: {
      permissions: [{
        type: String,
        enum: [
          'manage_users',
          'manage_branches',
          'manage_students',
          'manage_teachers',
          'manage_staff',
          'manage_fees',
          'manage_salaries',
          'manage_attendance',
          'manage_exams',
          'view_reports',
          'manage_settings',
        ],
      }],
      documents: [{
        type: { type: String, enum: ['cnic', 'id_card', 'cv', 'certificate', 'photo', 'other'] },
        name: { type: String, trim: true },
        url: { type: String },
        publicId: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      }],
    },
    
    // ==================== PARENT PROFILE ====================
    parentProfile: {
      children: [{
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        name: {
          type: String,
          trim: true,
        },
        registrationNumber: {
          type: String,
          uppercase: true,
          trim: true,
        },
        dateOfBirth: {
          type: Date,
        },
        cnic: {
          type: String,
          trim: true,
        },
        bFormNumber: {
          type: String,
          trim: true,
        },
        gender: {
          type: String,
          enum: ['male', 'female', 'other'],
        },
        className: {
          type: String,
          trim: true,
        },
        classId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Class',
        },
        section: {
          type: String,
          trim: true,
        },
      }],
      occupation: String,
      income: Number,
      fullName: {
        type: String,
        trim: true,
      },
      phone: {
        type: String,
        trim: true,
      },
      email: {
        type: String,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
      },
      cnic: {
        type: String,
        trim: true,
      },
      address: {
        street: { type: String, trim: true },
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        postalCode: { type: String, trim: true },
        country: { type: String, default: 'Pakistan', trim: true },
      },
      dateOfBirth: {
        type: Date,
      },
    },
    
    // ==================== METADATA ====================
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'active', 'inactive', 'graduated', 'transferred', 'expelled', 'on_leave', 'terminated', 'resigned'],
      default: 'active',
    },
    remarks: {
      type: String,
      trim: true,
    },
    // Rejection fields for pending approvals
    rejectionReason: {
      type: String,
      trim: true,
    },
    rejectedAt: {
      type: Date,
    },
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
    verificationToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ==================== INDEXES ====================
userSchema.index({ role: 1, branchId: 1 });
userSchema.index({ role: 1, status: 1 });
userSchema.index({ firstName: 1, lastName: 1 });
userSchema.index({ 'studentProfile.classId': 1 });
userSchema.index({ 'teacherProfile.departmentId': 1 });
userSchema.index({ 'staffProfile.departmentId': 1 });
userSchema.index({ 'staffProfile.staffType': 1 });
userSchema.index({ 'parentProfile.children.id': 1 });
userSchema.index({ isActive: 1 });

// ==================== METHODS ====================

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.passwordHash);
  } catch (error) {
    throw new Error('Error comparing passwords');
  }
};

// Generate refresh token
userSchema.methods.generateRefreshToken = function() {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
};

// Check if user has permission
userSchema.methods.hasPermission = function(permission) {
  if (this.role === 'super_admin') return true;
  if (this.role === 'branch_admin' && this.adminProfile?.permissions) {
    return this.adminProfile.permissions.includes(permission);
  }
  return false;
};

// Generate employee ID for teacher/staff
userSchema.methods.generateEmployeeId = async function(branchCode) {
  let prefix;
  
  if (this.role === 'teacher') {
    prefix = 'T';
  } else if (this.role === 'staff') {
    // Different prefix based on staff type
    const staffType = this.staffProfile?.staffType;
    if (staffType?.includes('Security') || staffType?.includes('Guard')) {
      prefix = 'SG';
    } else if (staffType?.includes('Driver')) {
      prefix = 'DR';
    } else if (staffType?.includes('Peon') || staffType?.includes('Cleaner')) {
      prefix = 'PN';
    } else if (staffType?.includes('Clerk') || staffType?.includes('Accountant')) {
      prefix = 'AD';
    } else if (staffType?.includes('Lab')) {
      prefix = 'LA';
    } else if (staffType?.includes('Librarian')) {
      prefix = 'LB';
    } else if (staffType?.includes('Nurse') || staffType?.includes('Doctor')) {
      prefix = 'MD';
    } else {
      prefix = 'ST'; // General Staff
    }
  }
  
  const year = new Date().getFullYear();
  const count = await this.constructor.countDocuments({
    role: this.role,
    branchId: this.branchId,
  });
  
  return `${branchCode}-${prefix}-${year}-${String(count + 1).padStart(3, '0')}`;
};

// Generate registration number for student
userSchema.methods.generateRegistrationNumber = async function(branchCode) {
  const year = new Date().getFullYear().toString().slice(-2);
  const count = await this.constructor.countDocuments({
    role: 'student',
    branchId: this.branchId,
  });
  
  return `${branchCode}-${year}-${String(count + 1).padStart(4, '0')}`;
};

// Generate 6-digit random roll number
userSchema.methods.generateRollNumber = async function() {
  let rollNumber;
  let exists = true;
  
  while (exists) {
    // Generate random 6-digit number
    rollNumber = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Check if it exists in the same branch and class
    const existing = await this.constructor.findOne({
      role: 'student',
      branchId: this.branchId,
      'studentProfile.classId': this.studentProfile?.classId,
      'studentProfile.rollNumber': rollNumber
    });
    
    if (!existing) {
      exists = false;
    }
  }
  
  return rollNumber;
};

// Method to exclude sensitive fields from JSON response
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.refreshToken;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  delete obj.verificationToken;
  delete obj.__v;
  return obj;
};

// ==================== STATIC METHODS ====================

// Find active users
userSchema.statics.findActive = function(filter = {}) {
  return this.find({ ...filter, isActive: true });
};

// Find by role
userSchema.statics.findByRole = function(role, filter = {}) {
  return this.find({ ...filter, role });
};

// Find staff by type
userSchema.statics.findStaffByType = function(staffType, filter = {}) {
  return this.find({ 
    ...filter, 
    role: 'staff',
    'staffProfile.staffType': staffType 
  });
};

// ==================== MIDDLEWARE ====================

// Pre-save: Auto-set fullName
userSchema.pre('save', function(next) {
  if (this.firstName && this.lastName) {
    this.fullName = `${this.firstName} ${this.lastName}`;
  }
  next();
});

// Pre-save: Hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save: Generate IDs
userSchema.pre('save', async function(next) {
  try {
    // Auto-generate employee ID for teacher/staff
    if ((this.role === 'teacher' || this.role === 'staff') && this.isNew) {
      const profileKey = this.role === 'teacher' ? 'teacherProfile' : 'staffProfile';

      if (!this[profileKey]?.employeeId && this.branchId) {
        const Branch = mongoose.model('Branch');
        const branch = await Branch.findById(this.branchId);
        const branchCode = branch?.code || 'SCH';

        this[profileKey] = this[profileKey] || {};
        if (typeof this.generateEmployeeId === 'function') {
          this[profileKey].employeeId = await this.generateEmployeeId(branchCode);
        } else {
          // Fallback logic
          let prefix = 'ST';
          if (this.role === 'teacher') {
            prefix = 'T';
          } else if (this.role === 'staff') {
            const staffType = this.staffProfile?.staffType;
            if (staffType?.includes('Security')) prefix = 'SG';
            else if (staffType?.includes('Driver')) prefix = 'DR';
            else if (staffType?.includes('Peon')) prefix = 'PN';
            else prefix = 'ST';
          }
          
          const year = new Date().getFullYear();
          const count = await this.constructor.countDocuments({
            role: this.role,
            branchId: this.branchId,
          });
          this[profileKey].employeeId = `${branchCode}-${prefix}-${year}-${String(count + 1).padStart(3, '0')}`;
        }
      }
    }

    // Auto-generate registration number for student
    if (this.role === 'student') {
      if (!this.studentProfile?.registrationNumber && this.branchId) {
        const Branch = mongoose.model('Branch');
        const branch = await Branch.findById(this.branchId);
        const branchCode = branch?.code || 'SCH';

        this.studentProfile = this.studentProfile || {};
        if (typeof this.generateRegistrationNumber === 'function') {
          this.studentProfile.registrationNumber = await this.generateRegistrationNumber(branchCode);
        } else {
          const year = new Date().getFullYear().toString().slice(-2);
          const count = await this.constructor.countDocuments({
            role: 'student',
            branchId: this.branchId,
          });
          this.studentProfile.registrationNumber = `${branchCode}-${year}-${String(count + 1).padStart(4, '0')}`;
        }
      }
      
      // Auto-generate 6-digit roll number if missing
      if (!this.studentProfile?.rollNumber && this.branchId && this.studentProfile?.classId) {
        this.studentProfile = this.studentProfile || {};
        if (typeof this.generateRollNumber === 'function') {
          this.studentProfile.rollNumber = await this.generateRollNumber();
        } else {
          let rollNumber;
          let exists = true;
          while (exists) {
            rollNumber = Math.floor(100000 + Math.random() * 900000).toString();
            const existing = await this.constructor.findOne({
              role: 'student',
              branchId: this.branchId,
              'studentProfile.classId': this.studentProfile.classId,
              'studentProfile.rollNumber': rollNumber
            });
            if (!existing) exists = false;
          }
          this.studentProfile.rollNumber = rollNumber;
        }
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Post-save: Link parent with student
userSchema.post('save', async function(doc, next) {
  try {
    if (doc.role === 'parent' && doc.parentProfile?.children?.length > 0) {
      for (const child of doc.parentProfile.children) {
        await mongoose.model('User').updateOne(
          { _id: child.id },
          { 
            $addToSet: { 
              'studentProfile.parentIds': doc._id 
            }
          }
        );
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;