import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Employee from '@/models/Employee';
import { verifyMobileAuth } from '@/lib/verifyMobileAuth';
import { utapi, deleteUploadThingFile } from '@/lib/utapi';

/**
 * PATCH /api/mobile/profile/photo
 * Update the authenticated user's profile photo using FormData
 * Requires: Authorization: Bearer <token>
 * Content-Type: multipart/form-data
 * 
 * FormData fields:
 * - photo: File (image file, max 4MB) - required for upload
 * - action: "remove" (optional) - to remove existing photo without uploading
 */
export async function PATCH(request: NextRequest) {
  try {
    // Verify JWT token
    const auth = verifyMobileAuth(request);

    if (!auth.success) {
      return auth.response;
    }

    const { user } = auth;

    await dbConnect();

    // Fetch current employee to get existing photo URL
    const currentEmployee = await Employee.findById(user.id);

    if (!currentEmployee) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const oldProfilePhoto = currentEmployee.profilePhoto;

    // Parse FormData
    const formData = await request.formData();
    const action = formData.get('action') as string | null;
    const photoFile = formData.get('photo') as File | null;

    let newProfilePhoto: string | undefined = undefined;

    // Handle remove action
    if (action === 'remove') {
      // Delete old photo from UploadThing if exists
      if (oldProfilePhoto) {
        await deleteUploadThingFile(oldProfilePhoto);
      }

      // Update employee with no photo
      const employee = await Employee.findByIdAndUpdate(
        user.id,
        { $unset: { profilePhoto: 1 } },
        { new: true }
      ).select('-password -otp -otpExpiry');

      return NextResponse.json({
        success: true,
        message: 'Profile photo removed successfully',
        user: {
          id: employee?._id.toString(),
          profilePhoto: null,
        },
      });
    }

    // Handle photo upload
    if (!photoFile) {
      return NextResponse.json(
        { success: false, message: 'Photo file is required. Send a file with key "photo" or use action="remove" to remove existing photo.' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(photoFile.type)) {
      return NextResponse.json(
        { success: false, message: 'Invalid file type. Allowed: jpeg, jpg, png, webp, gif' },
        { status: 400 }
      );
    }

    // Validate file size (4MB max)
    const maxSize = 4 * 1024 * 1024; // 4MB
    if (photoFile.size > maxSize) {
      return NextResponse.json(
        { success: false, message: 'File too large. Maximum size is 4MB.' },
        { status: 400 }
      );
    }

    // Upload to UploadThing
    const uploadResponse = await utapi.uploadFiles(photoFile);

    if (!uploadResponse.data?.url) {
      return NextResponse.json(
        { success: false, message: 'Failed to upload image. Please try again.' },
        { status: 500 }
      );
    }

    newProfilePhoto = uploadResponse.data.url;

    // Delete old photo from UploadThing if exists
    if (oldProfilePhoto) {
      await deleteUploadThingFile(oldProfilePhoto);
    }

    // Update employee with new photo URL
    const employee = await Employee.findByIdAndUpdate(
      user.id,
      { profilePhoto: newProfilePhoto },
      { new: true }
    ).select('-password -otp -otpExpiry');

    if (!employee) {
      return NextResponse.json(
        { success: false, message: 'Failed to update profile photo' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Profile photo updated successfully',
      user: {
        id: employee._id.toString(),
        profilePhoto: employee.profilePhoto,
      },
    });
  } catch (error) {
    console.error('Profile photo update error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
