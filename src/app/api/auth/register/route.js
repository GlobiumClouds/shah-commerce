import { NextResponse } from 'next/server';
import { registerUser } from '@/backend/controllers/authController';

export async function POST(request) {
  try {
    const body = await request.json();

    const { email, password, firstName, lastName, role, ...otherData } = body;

    // Validate required fields
    if (!email || !password || !firstName || !role) {
      return NextResponse.json(
        { success: false, message: 'Email, password, firstName, and role are required' },
        { status: 400 }
      );
    }

    // Prepare user data
    const userData = {
      email,
      password,
      firstName,
      lastName,
      role,
      ...otherData
    };

    const result = await registerUser(userData);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Registration failed' },
      { status: 400 }
    );
  }
}
