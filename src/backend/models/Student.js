import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    // Basic Information
    registrationNumber: {
      type: String,
      required: [true, 'Registration number is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    phone: {
      type: String,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
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
    profilePhoto: {
      type: String,
    },

    // Address Information
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      postalCode: { type: String, trim: true },
      country: { type: String, default: 'Pakistan', trim: true },
    },

    // Academic Information
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: [true, 'Branch is required'],
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Class is required'],
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
      required: [true, 'Admission date is required'],
      default: Date.now,
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
    },
    previousSchool: {
      name: { type: String, trim: true },
      lastClass: { type: String, trim: true },
      marks: { type: Number },
      leavingDate: { type: Date },
    },

    // Parent/Guardian Information
    father: {
      name: { type: String, required: [true, 'Father name is required'], trim: true },
      occupation: { type: String, trim: true },
      phone: { type: String, required: [true, 'Father phone is required'], trim: true },
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

    // Documents
    documents: [{
      type: {
        type: String,
        enum: ['birth_certificate', 'cnic', 'photo', 'previous_result', 'leaving_certificate', 'medical_certificate', 'other'],
      },
      name: { type: String, trim: true },
      url: { type: String },
      uploadedAt: { type: Date, default: Date.now },
    }],

    // Fee Information
    feeDiscount: {
      type: {
        type: String,
        enum: ['percentage', 'fixed'],
        default: 'fixed',
      },
      amount: {
        type: Number,
        default: 0,
        min: 0,
      },
      reason: {
        type: String,
        trim: true,
      },
    },
    transportFee: {
      enabled: { type: Boolean, default: false },
      routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'TransportRoute' },
      amount: { type: Number, default: 0 },
    },

    // Status
    status: {
      type: String,
      enum: ['active', 'inactive', 'graduated', 'transferred', 'expelled'],
      default: 'active',
    },
    remarks: {
      type: String,
      trim: true,
    },

    // Login Credentials (optional)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // Metadata
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

// Virtual for full name
studentSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for age
studentSchema.virtual('age').get(function() {
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

// Indexes for faster queries
studentSchema.index({ registrationNumber: 1 });
studentSchema.index({ branchId: 1, classId: 1 });
studentSchema.index({ status: 1 });
studentSchema.index({ firstName: 1, lastName: 1 });
studentSchema.index({ 'father.phone': 1 });

const Student = mongoose.models.Student || mongoose.model('Student', studentSchema);

export default Student;
