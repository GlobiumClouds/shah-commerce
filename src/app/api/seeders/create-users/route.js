import connectDB from '@/lib/database';
import User from '@/backend/models/User';
import Branch from '@/backend/models/Branch';

const DUMMY_USERS = [
  {
    fullName: 'Super Admin User',
    email: 'superadmin@easeacademy.com',
    phone: '03001111111',
    password: 'SuperAdmin@123',
    role: 'super_admin',
    isActive: true,
    emailVerified: true,
  },
  {
    fullName: 'Branch Admin User',
    email: 'branchadmin@easeacademy.com',
    phone: '03002222222',
    password: 'BranchAdmin@123',
    role: 'branch_admin',
    branchIndex: 0, // Will use first branch
    isActive: true,
    emailVerified: true,
  },
  {
    fullName: 'Teacher User',
    email: 'teacher@easeacademy.com',
    phone: '03003333333',
    password: 'Teacher@123',
    role: 'teacher',
    branchIndex: 0,
    isActive: true,
    emailVerified: true,
  },
  {
    fullName: 'Parent User',
    email: 'parent@easeacademy.com',
    phone: '03004444444',
    password: 'Parent@123',
    role: 'parent',
    branchIndex: 0,
    isActive: true,
    emailVerified: true,
  },
  {
    fullName: 'Student User',
    email: 'student@easeacademy.com',
    phone: '03005555555',
    password: 'Student@123',
    role: 'student',
    branchIndex: 0,
    isActive: true,
    emailVerified: true,
  },
];

export async function POST(req) {
  try {
    await connectDB();

    // Check if users already exist
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      return Response.json(
        {
          success: false,
          message: 'Users already exist in database. Clear them first if you want to recreate.',
          count: existingUsers,
        },
        { status: 400 }
      );
    }

    // Get branches
    const branches = await Branch.find({}, '_id');
    if (branches.length === 0) {
      return Response.json(
        {
          success: false,
          message: 'No branches found. Create branches first using /api/seeders/create-branches',
        },
        { status: 400 }
      );
    }

    const createdUsers = [];

    for (const userData of DUMMY_USERS) {
      // Get branch ID from index
      const branchId = userData.branchIndex !== undefined 
        ? branches[userData.branchIndex % branches.length]._id 
        : null;

      // Create user - pass plain password, let pre-save hook hash it
      const user = new User({
        fullName: userData.fullName,
        email: userData.email,
        phone: userData.phone,
        passwordHash: userData.password, // Plain password - will be hashed by pre-save hook
        role: userData.role,
        branchId: userData.role === 'super_admin' ? null : branchId,
        isActive: userData.isActive,
        emailVerified: userData.emailVerified,
        permissions: getDefaultPermissions(userData.role),
      });

      const savedUser = await user.save();
      createdUsers.push({
        id: savedUser._id,
        fullName: savedUser.fullName,
        email: savedUser.email,
        phone: savedUser.phone,
        role: savedUser.role,
        password: userData.password, // Return plain password for reference only
      });
    }

    return Response.json(
      {
        success: true,
        message: 'Dummy users created successfully!',
        count: createdUsers.length,
        users: createdUsers,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Seeder Error:', error);
    return Response.json(
      {
        success: false,
        message: 'Failed to create dummy users',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    await connectDB();

    // Delete all users
    const result = await User.deleteMany({});

    return Response.json(
      {
        success: true,
        message: 'All users deleted successfully!',
        deletedCount: result.deletedCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete Error:', error);
    return Response.json(
      {
        success: false,
        message: 'Failed to delete users',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    await connectDB();

    const users = await User.find({}, 'fullName email role isActive');

    return Response.json(
      {
        success: true,
        message: 'Users fetched successfully!',
        count: users.length,
        users,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get Error:', error);
    return Response.json(
      {
        success: false,
        message: 'Failed to fetch users',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

function getDefaultPermissions(role) {
  const permissions = {
    super_admin: [
      'manage_branches',
      'manage_admins',
      'manage_subscriptions',
      'manage_events',
      'manage_expenses',
      'manage_salaries',
      'view_reports',
      'system_settings',
    ],
    branch_admin: [
      'manage_teachers',
      'manage_students',
      'manage_classes',
      'manage_attendance',
      'manage_exams',
      'manage_finance',
      'manage_events',
      'view_reports',
    ],
    teacher: [
      'view_classes',
      'mark_attendance',
      'manage_exams',
      'enter_results',
      'view_profile',
    ],
    parent: [
      'view_children',
      'view_attendance',
      'view_results',
      'view_fees',
      'view_profile',
    ],
    student: [
      'view_classes',
      'view_attendance',
      'view_exams',
      'view_results',
      'view_profile',
    ],
  };

  return permissions[role] || [];
}
