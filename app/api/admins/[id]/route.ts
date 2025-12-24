import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/mongodb";
import Admin from "@/models/Admin";
import { hashPassword } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/permissions";

// GET - Get single admin
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    if (!isSuperAdmin(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    const { id } = await params;
    
    await dbConnect();
    
    const admin = await Admin.findById(id)
      .select("-password -resetToken -resetTokenExpiry");
    
    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }
    
    return NextResponse.json({ admin });
  } catch (error) {
    console.error("Error fetching admin:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin" },
      { status: 500 }
    );
  }
}

// PUT - Update admin permissions/status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    if (!isSuperAdmin(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    const { id } = await params;
    const body = await request.json();
    const { name, password, permissions, isActive } = body;
    
    await dbConnect();
    
    const admin = await Admin.findById(id);
    
    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }
    
    // Special handling for super-admin
    if (admin.role === "super-admin") {
      // Only the super-admin themselves can edit their own name/password
      if (session.user.id !== id) {
        return NextResponse.json(
          { error: "Cannot modify another super-admin" },
          { status: 403 }
        );
      }
      
      // Super-admin can only update name and password
      if (name !== undefined) admin.name = name;
      if (password && password.length >= 6) {
        admin.password = await hashPassword(password);
      }
      
      // Ignore any other fields for super-admin
      await admin.save();
      
      const adminResponse = {
        _id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        permissions: admin.permissions,
        isActive: admin.isActive,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt,
      };
      
      return NextResponse.json({ admin: adminResponse });
    }
    
    // For sub-admins, allow full editing
    if (name !== undefined) admin.name = name;
    if (permissions !== undefined) admin.permissions = permissions;
    if (isActive !== undefined) admin.isActive = isActive;
    
    // Update password if provided
    if (password && password.length >= 6) {
      admin.password = await hashPassword(password);
    }
    
    await admin.save();
    
    // Return updated admin without sensitive fields
    const adminResponse = {
      _id: admin._id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      permissions: admin.permissions,
      isActive: admin.isActive,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    };
    
    return NextResponse.json({ admin: adminResponse });
  } catch (error) {
    console.error("Error updating admin:", error);
    return NextResponse.json(
      { error: "Failed to update admin" },
      { status: 500 }
    );
  }
}

// DELETE - Delete admin
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    if (!isSuperAdmin(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    const { id } = await params;
    
    // Prevent self-deletion
    if (session.user.id === id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }
    
    await dbConnect();
    
    const admin = await Admin.findById(id);
    
    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }
    
    // Prevent deleting super-admin
    if (admin.role === "super-admin") {
      return NextResponse.json(
        { error: "Cannot delete super-admin" },
        { status: 403 }
      );
    }
    
    await Admin.findByIdAndDelete(id);
    
    return NextResponse.json({ message: "Admin deleted successfully" });
  } catch (error) {
    console.error("Error deleting admin:", error);
    return NextResponse.json(
      { error: "Failed to delete admin" },
      { status: 500 }
    );
  }
}
