import NextAuth from "next-auth";
import { Permissions, AdminRole } from "./permissions";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: AdminRole;
      permissions: Permissions;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string;
    role: AdminRole;
    permissions: Permissions;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name?: string;
    role: AdminRole;
    permissions: Permissions;
  }
}
