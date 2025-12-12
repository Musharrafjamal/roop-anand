import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Employee from '@/models/Employee';
import { verifyMobileAuth } from '@/lib/verifyMobileAuth';

/**
 * PATCH /api/mobile/profile/status
 * Update the authenticated user's online/offline status
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
    const { status } = body;

    // Validate status
    if (!status || !['Online', 'Offline'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid status. Must be "Online" or "Offline"' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Update employee status
    const employee = await Employee.findByIdAndUpdate(
      user.id,
      { status },
      { new: true }
    ).select('-password -otp -otpExpiry');

    if (!employee) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Status updated to ${status}`,
      user: {
        id: employee._id.toString(),
        status: employee.status,
      },
    });
  } catch (error) {
    console.error('Status update error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

