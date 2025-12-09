import connectDB from '@/lib/database';
import Branch from '@/backend/models/Branch';

const DUMMY_BRANCHES = [
  {
    name: 'Main Campus',
    code: 'MAIN-001',
    contactEmail: 'main@easeacademy.com',
    contactPhone: '02134567890',
    address: '123 Main Street, Education Tower',
    city: 'Karachi',
    state: 'Sindh',
    country: 'Pakistan',
    status: 'active',
  },
  {
    name: 'North Campus',
    code: 'NORTH-002',
    contactEmail: 'north@easeacademy.com',
    contactPhone: '04222334455',
    address: '456 North Avenue, Innovation Park',
    city: 'Lahore',
    state: 'Punjab',
    country: 'Pakistan',
    status: 'active',
  },
  {
    name: 'South Campus',
    code: 'SOUTH-003',
    contactEmail: 'south@easeacademy.com',
    contactPhone: '06156789012',
    address: '789 South Road, Metro Complex',
    city: 'Multan',
    state: 'Punjab',
    country: 'Pakistan',
    status: 'active',
  },
];

export async function POST(req) {
  try {
    await connectDB();

    // Check if branches already exist
    const existingBranches = await Branch.countDocuments();
    if (existingBranches > 0) {
      return Response.json(
        {
          success: false,
          message: 'Branches already exist in database. Clear them first if you want to recreate.',
          count: existingBranches,
        },
        { status: 400 }
      );
    }

    const createdBranches = [];

    for (const branchData of DUMMY_BRANCHES) {
      const branch = new Branch({
        name: branchData.name,
        code: branchData.code,
        contactEmail: branchData.contactEmail,
        contactPhone: branchData.contactPhone,
        address: branchData.address,
        city: branchData.city,
        state: branchData.state,
        country: branchData.country,
        status: branchData.status,
        students: [],
        teachers: [],
        classes: [],
      });

      const savedBranch = await branch.save();
      createdBranches.push({
        id: savedBranch._id,
        name: savedBranch.name,
        code: savedBranch.code,
        city: savedBranch.city,
        status: savedBranch.status,
      });
    }

    return Response.json(
      {
        success: true,
        message: 'Dummy branches created successfully!',
        count: createdBranches.length,
        branches: createdBranches,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Seeder Error:', error);
    return Response.json(
      {
        success: false,
        message: 'Failed to create dummy branches',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    await connectDB();

    // Delete all branches
    const result = await Branch.deleteMany({});

    return Response.json(
      {
        success: true,
        message: 'All branches deleted successfully!',
        deletedCount: result.deletedCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete Error:', error);
    return Response.json(
      {
        success: false,
        message: 'Failed to delete branches',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    await connectDB();

    const branches = await Branch.find({}, 'name code city status');

    return Response.json(
      {
        success: true,
        message: 'Branches fetched successfully!',
        count: branches.length,
        branches,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get Error:', error);
    return Response.json(
      {
        success: false,
        message: 'Failed to fetch branches',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
