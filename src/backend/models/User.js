import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters'],
      maxlength: [100, 'Full name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[0-9]{10,15}$/, 'Please provide a valid phone number'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ['super_admin', 'branch_admin', 'teacher', 'parent', 'student'],
        message: '{VALUE} is not a valid role',
      },
      default: 'student',
      required: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      default: null,
      // Null for super admin, required for others
      validate: {
        validator: function (value) {
          // Super admin doesn't need branchId
          if (this.role === 'super_admin') {
            return true;
          }
          // Others must have branchId
          return value != null;
        },
        message: 'Branch ID is required for non-super admin users',
      },
    },
    permissions: {
      type: [String],
      default: [],
      validate: {
        validator: function (arr) {
          // Check for duplicate permissions
          return arr.length === new Set(arr).size;
        },
        message: 'Duplicate permissions are not allowed',
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
    emailVerified: {
      type: Boolean,
      default: false,
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

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ branchId: 1 });
userSchema.index({ isActive: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
  // Only hash password if it's modified
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

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.passwordHash);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Method to generate refresh token
userSchema.methods.generateRefreshToken = function () {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
};

// Method to check if user has permission
userSchema.methods.hasPermission = function (permission) {
  // Super admin has all permissions
  if (this.role === 'super_admin') {
    return true;
  }
  return this.permissions.includes(permission);
};

// Method to exclude sensitive fields from JSON response
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.refreshToken;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  delete obj.verificationToken;
  delete obj.__v;
  return obj;
};

// Virtual for full user info with branch
userSchema.virtual('branchInfo', {
  ref: 'Branch',
  localField: 'branchId',
  foreignField: '_id',
  justOne: true,
});

// Static method to find active users
userSchema.statics.findActive = function (filter = {}) {
  return this.find({ ...filter, isActive: true });
};

// Static method to find by role
userSchema.statics.findByRole = function (role, filter = {}) {
  return this.find({ ...filter, role });
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
