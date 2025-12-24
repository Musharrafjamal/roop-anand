import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/mongodb";
import Admin from "@/models/Admin";
import { comparePassword } from "@/lib/auth";
import { seedAdmin } from "@/lib/seedAdmin";
import { SUPER_ADMIN_PERMISSIONS } from "@/lib/permissions";
import { Permissions, AdminRole } from "@/types/permissions";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        await dbConnect();

        // Seed admin on first request if doesn't exist
        await seedAdmin();

        // Find admin by email
        const admin = await Admin.findOne({
          email: credentials.email.toLowerCase(),
        });

        if (!admin) {
          throw new Error("Invalid email or password");
        }

        // Check if admin is active
        if (admin.isActive === false) {
          throw new Error("Account is deactivated");
        }

        // Compare passwords
        const isPasswordValid = await comparePassword(
          credentials.password,
          admin.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid email or password");
        }

        // Return user with role and permissions
        return {
          id: admin._id.toString(),
          email: admin.email,
          name: admin.name || "Admin",
          role: (admin.role || 'super-admin') as AdminRole,
          permissions: (admin.permissions || SUPER_ADMIN_PERMISSIONS) as Permissions,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.permissions = user.permissions;
      }
      
      // Handle session update (e.g., when permissions change)
      if (trigger === "update" && session) {
        token.role = session.role;
        token.permissions = session.permissions;
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.role = token.role as AdminRole;
        session.user.permissions = token.permissions as Permissions;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
