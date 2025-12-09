import { NextResponse } from 'next/server';
import { registerUser } from '@/backend/controllers/authController';

export async function POST(request) {
  try {
    const body = await request.json();
    
    const { fullName, email, phone, password, role, branchId, permissions } = body;
    
    // Validate required fields
    if (!fullName || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Full name, email, and password are required' },
        { status: 400 }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }
    
    const result = await registerUser({
      fullName,
      email,
      phone,
      password,
      role,
      branchId,
      permissions,
    });
    
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to register user' },
      { status: 400 }
    );
  }
}
