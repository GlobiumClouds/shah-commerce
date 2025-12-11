import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema(
  {
    // Basic Information
    employeeId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
    },
    alternatePhone: {
      type: String,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: true,
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    nationality: {
      type: String,
      default: 'Pakistani',
    },
    cnic: {
      type: String,
      required: true,
      unique: true,
    },
    
    // Address Information
    address: {
      street: String,
      city: String,
      state: String,
      country: { type: String, default: 'Pakistan' },
      postalCode: String,
    },
    
    // Academic Information
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    joiningDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    designation: {
      type: String,
      required: true,
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
    qualifications: [
      {
        degree: {
          type: String,
          required: true,
        },
        institution: {
          type: String,
          required: true,
        },
        yearOfCompletion: {
          type: Number,
          required: true,
        },
        grade: String,
        major: String,
      },
    ],
    
    // Experience
    experience: {
      totalYears: {
        type: Number,
        default: 0,
      },
      previousInstitutions: [
        {
          institutionName: String,
          designation: String,
          fromDate: Date,
          toDate: Date,
          responsibilities: String,
        },
      ],
    },
    
    // Subjects Teaching
    subjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
      },
    ],
    
    // Classes Assigned
    classes: [
      {
        classId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Class',
        },
        section: String,
        subjectId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Subject',
        },
      },
    ],
    
    // Salary Information
    salaryDetails: {
      basicSalary: {
        type: Number,
        required: true,
      },
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
    
    // Emergency Contact
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
      alternatePhone: String,
    },
    
    // Documents
    documents: [
      {
        type: {
          type: String,
          enum: ['CNIC', 'Degree', 'Certificate', 'Experience Letter', 'Photo', 'Other'],
        },
        name: String,
        url: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    
    // Status
    status: {
      type: String,
      enum: ['active', 'inactive', 'on_leave', 'terminated', 'resigned'],
      default: 'active',
    },
    
    // Leave Balance
    leaveBalance: {
      casual: { type: Number, default: 15 },
      sick: { type: Number, default: 10 },
      annual: { type: Number, default: 20 },
    },
    
    // Additional Information
    remarks: String,
    
    // Timestamps
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
teacherSchema.index({ employeeId: 1 });
teacherSchema.index({ email: 1 });
teacherSchema.index({ branchId: 1 });
teacherSchema.index({ status: 1 });
teacherSchema.index({ firstName: 1, lastName: 1 });
teacherSchema.index({ branchId: 1, status: 1 });

// Virtual for full name
teacherSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for age
teacherSchema.virtual('age').get(function () {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Virtual for total salary
teacherSchema.virtual('totalSalary').get(function () {
  if (!this.salaryDetails) return 0;
  
  const basic = this.salaryDetails.basicSalary || 0;
  const allowances = this.salaryDetails.allowances || {};
  const totalAllowances = Object.values(allowances).reduce((sum, val) => sum + (val || 0), 0);
  
  return basic + totalAllowances;
});

// Virtual for net salary (after deductions)
teacherSchema.virtual('netSalary').get(function () {
  if (!this.salaryDetails) return 0;
  
  const total = this.totalSalary;
  const deductions = this.salaryDetails.deductions || {};
  const totalDeductions = Object.values(deductions).reduce((sum, val) => sum + (val || 0), 0);
  
  return total - totalDeductions;
});

// Ensure virtuals are included in JSON
teacherSchema.set('toJSON', { virtuals: true });
teacherSchema.set('toObject', { virtuals: true });

// Pre-save middleware to generate employee ID if not provided
teacherSchema.pre('save', async function (next) {
  if (!this.employeeId) {
    // Get branch code
    const Branch = mongoose.model('Branch');
    const branch = await Branch.findById(this.branchId);
    const branchCode = branch?.code || 'TCH';
    
    // Get count of teachers for this branch
    const count = await this.constructor.countDocuments({ branchId: this.branchId });
    const year = new Date().getFullYear();
    
    // Format: BRANCH-YEAR-COUNT (e.g., MRG-2025-001)
    this.employeeId = `${branchCode}-${year}-${String(count + 1).padStart(3, '0')}`;
  }
  
  next();
});

const Teacher = mongoose.models.Teacher || mongoose.model('Teacher', teacherSchema);

export default Teacher;
