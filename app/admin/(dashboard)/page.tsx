"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { User, Users, Package, FileBarChart } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const { data: session } = useSession();

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-slate-600">Employee Stock Management System</p>
        </div>

        <Card className="shadow-xl mb-8 border-0">
          <CardContent className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-slate-800">
                  Welcome back!
                </h2>
                <p className="text-slate-600">{session?.user?.email}</p>
              </div>
            </div>
            <div className="border-t pt-6">
              <p className="text-slate-700 mb-4">
                You are successfully logged in to the admin panel.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 text-sm">
                  <strong>✓ Protected Route:</strong> This page is only
                  accessible to authenticated admin users.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/admin/employees">
            <Card className="shadow-lg hover:shadow-xl border-0 cursor-pointer hover:scale-105 transform transition-all">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    Employees
                  </h3>
                </div>
                <p className="text-slate-600 text-sm">
                  Manage employee data and stock allocations
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/stock">
            <Card className="shadow-lg hover:shadow-xl border-0 cursor-pointer hover:scale-105 transform transition-all">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    Stock Records
                  </h3>
                </div>
                <p className="text-slate-600 text-sm">
                  View and manage stock distribution
                </p>
              </CardContent>
            </Card>
          </Link>

          <Card className="shadow-lg hover:shadow-xl border-0 cursor-pointer hover:scale-105 transform transition-all opacity-60">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FileBarChart className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800">
                  Reports
                </h3>
              </div>
              <p className="text-slate-600 text-sm">
                Generate and export reports (Coming Soon)
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
