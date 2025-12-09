import dbConnect from './mongodb';
import Admin from '@/models/Admin';
import { hashPassword } from './auth';

/**
 * Seeds the initial admin user from environment variables
 * This should be called when the application starts
 */
export async function seedAdmin(): Promise<void> {
  try {
    await dbConnect();

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.log('ADMIN_EMAIL and ADMIN_PASSWORD not provided. Skipping admin seeding.');
      return;
    }

    // Check if admin already exists (lowercase for consistency)
    const normalizedEmail = adminEmail.toLowerCase();
    const existingAdmin = await Admin.findOne({ email: normalizedEmail });

    if (existingAdmin) {
      console.log('Admin user already exists. Skipping seeding.');
      return;
    }

    // Create new admin with hashed password
    const hashedPassword = await hashPassword(adminPassword);
    await Admin.create({
      email: normalizedEmail,
      password: hashedPassword,
    });

    console.log('✓ Admin user seeded successfully with email:', normalizedEmail);
  } catch (error) {
    console.error('Error seeding admin:', error);
  }
}
