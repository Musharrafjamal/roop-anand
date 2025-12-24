import dbConnect from "@/lib/mongodb";
import Admin from "@/models/Admin";
import { hashPassword } from "@/lib/auth";
import { SUPER_ADMIN_PERMISSIONS } from "@/lib/permissions";

export async function seedAdmin() {
  try {
    await dbConnect();
    
    // Check if any admin exists
    const existingAdmin = await Admin.findOne();
    
    if (!existingAdmin) {
      // Create default super-admin
      const hashedPassword = await hashPassword(
        process.env.DEFAULT_ADMIN_PASSWORD || "admin123"
      );
      
      await Admin.create({
        email: process.env.DEFAULT_ADMIN_EMAIL || "admin@roopanand.com",
        password: hashedPassword,
        name: "Super Admin",
        role: "super-admin",
        permissions: SUPER_ADMIN_PERMISSIONS,
        isActive: true,
      });
      
      console.log("Default super-admin created");
    } else if (!existingAdmin.role) {
      // Migrate existing admin to super-admin if role is not set
      existingAdmin.role = "super-admin";
      existingAdmin.name = existingAdmin.name || "Super Admin";
      existingAdmin.permissions = SUPER_ADMIN_PERMISSIONS;
      existingAdmin.isActive = true;
      await existingAdmin.save();
      
      console.log("Existing admin migrated to super-admin");
    }
  } catch (error) {
    console.error("Error seeding admin:", error);
  }
}
