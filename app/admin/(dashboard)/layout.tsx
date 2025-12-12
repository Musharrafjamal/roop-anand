"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Sidebar } from "@/components/ui/sidebar";
import { Toaster } from "sonner";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/admin/login");
    return null;
  }

  return (
    <div className="flex min-h-screen max-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-white">{children}</main>
      <Toaster richColors position="top-right" />
    </div>
  );
}
