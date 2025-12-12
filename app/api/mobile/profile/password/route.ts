import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Employee from '@/models/Employee';
import { verifyMobileAuth } from '@/lib/verifyMobileAuth';
import { comparePassword, hashPassword } from '@/lib/auth';

/**
 * PATCH /api/mobile/profile/password
 * Change the authenticated user's password (requires current password)
 * Requires: Authorization: Bearer <token>
 */
export async function PATCH(request: NextRequest) {
  try {
    // Verify JWT token
    const auth = verifyMobileAuth(request);

    if (!auth.success) {
      return auth.response;
    }

    const { user } = auth;

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    // Validate new password length
    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'New password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Prevent same password
    if (currentPassword === newPassword) {
      return NextResponse.json(
        { success: false, message: 'New password must be different from current password' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Fetch employee with password
    const employee = await Employee.findById(user.id);

    if (!employee) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(currentPassword, employee.password);

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await Employee.findByIdAndUpdate(user.id, {
      password: hashedPassword,
    });

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

