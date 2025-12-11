import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Employee from '@/models/Employee';
import { comparePassword } from '@/lib/auth';
import { generateResetToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp } = body;

    // Validate required fields
    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find employee by email
    const employee = await Employee.findOne({ email: email.toLowerCase() });

    if (!employee) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or OTP' },
        { status: 400 }
      );
    }

    // Check if OTP exists
    if (!employee.otp || !employee.otpExpiry) {
      return NextResponse.json(
        { success: false, message: 'No OTP request found. Please request a new OTP.' },
        { status: 400 }
      );
    }

    // Check if OTP is expired
    if (new Date() > employee.otpExpiry) {
      // Clear expired OTP
      await Employee.findByIdAndUpdate(employee._id, {
        otp: undefined,
        otpExpiry: undefined,
      });

      return NextResponse.json(
        { success: false, message: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Verify OTP - ensure input is string
    const inputOtp = String(otp);
    const isOTPValid = await comparePassword(inputOtp, employee.otp);

    if (!isOTPValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid OTP' },
        { status: 400 }
      );
    }

    // Generate a temporary reset token (valid for 5 minutes)
    const resetToken = generateResetToken({
      id: employee._id.toString(),
      email: employee.email!,
      purpose: 'password-reset',
    });

    // Clear OTP after successful verification
    await Employee.findByIdAndUpdate(employee._id, {
      otp: undefined,
      otpExpiry: undefined,
    });

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
      resetToken,
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
