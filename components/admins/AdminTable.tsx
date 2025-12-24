"use client";

import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Edit2,
  Trash2,
  Shield,
  ShieldCheck,
  ShieldOff,
  Crown,
} from "lucide-react";
import { Permissions, AdminRole } from "@/types/permissions";

interface AdminData {
  _id: string;
  email: string;
  name: string;
  role: AdminRole;
  permissions: Permissions;
  isActive: boolean;
  createdAt: string;
}

interface AdminTableProps {
  admins: AdminData[];
  onEdit: (admin: AdminData) => void;
  onDelete: (id: string) => void;
  currentUserId?: string;
}

export function AdminTable({
  admins,
  onEdit,
  onDelete,
  currentUserId,
}: AdminTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const countPermissions = (permissions: Permissions): number => {
    return Object.values(permissions).reduce((count, actions) => {
      return count + (actions?.length || 0);
    }, 0);
  };

  // Sort admins: super-admin first
  const sortedAdmins = [...admins].sort((a, b) => {
    if (a.role === "super-admin" && b.role !== "super-admin") return -1;
    if (a.role !== "super-admin" && b.role === "super-admin") return 1;
    return 0;
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead className="font-semibold">Admin</TableHead>
            <TableHead className="font-semibold">Role</TableHead>
            <TableHead className="font-semibold">Permissions</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Created</TableHead>
            <TableHead className="text-right font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedAdmins.map((admin, index) => {
            const isSuperAdmin = admin.role === "super-admin";

            return (
              <motion.tr
                key={admin._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`hover:bg-slate-50 transition-colors ${
                  isSuperAdmin
                    ? "bg-gradient-to-r from-amber-50/80 to-yellow-50/50 border-l-4 border-l-amber-400"
                    : ""
                }`}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                        isSuperAdmin
                          ? "bg-gradient-to-br from-amber-400 to-orange-500 ring-2 ring-amber-200"
                          : "bg-gradient-to-br from-indigo-400 to-purple-500"
                      }`}
                    >
                      {isSuperAdmin ? (
                        <Crown className="h-5 w-5" />
                      ) : (
                        admin.name?.charAt(0).toUpperCase() ||
                        admin.email.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <p
                        className={`font-medium ${
                          isSuperAdmin ? "text-amber-700" : "text-slate-800"
                        }`}
                      >
                        {admin.name || "Unnamed"}
                        {isSuperAdmin && (
                          <span className="ml-2 text-xs bg-amber-200 text-amber-700 px-1.5 py-0.5 rounded-full">
                            Owner
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-slate-500">{admin.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={isSuperAdmin ? "default" : "secondary"}
                    className={
                      isSuperAdmin
                        ? "bg-amber-100 text-amber-700 hover:bg-amber-100"
                        : "bg-slate-100 text-slate-700"
                    }
                  >
                    {isSuperAdmin ? (
                      <>
                        <ShieldCheck className="h-3 w-3 mr-1" /> Super Admin
                      </>
                    ) : (
                      <>
                        <Shield className="h-3 w-3 mr-1" /> Sub Admin
                      </>
                    )}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-slate-600">
                    {isSuperAdmin
                      ? "Full Access"
                      : `${countPermissions(admin.permissions)} actions`}
                  </span>
                </TableCell>
                <TableCell>
                  {admin.isActive ? (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                      Active
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="bg-red-100 text-red-700"
                    >
                      <ShieldOff className="h-3 w-3 mr-1" /> Inactive
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <span className="text-sm text-slate-600">
                    {formatDate(admin.createdAt)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {/* Sub-admins: can edit all and delete (except self) */}
                    {!isSuperAdmin && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(admin)}
                          className="text-slate-600 hover:text-indigo-600"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        {admin._id !== currentUserId && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(admin._id)}
                            className="text-slate-600 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </>
                    )}
                    {/* Super-admin: can only edit name/password (self) */}
                    {isSuperAdmin && admin._id === currentUserId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(admin)}
                        className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                        title="Edit name and password"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    )}
                    {isSuperAdmin && admin._id !== currentUserId && (
                      <span className="text-xs text-slate-400 italic">
                        Protected
                      </span>
                    )}
                  </div>
                </TableCell>
              </motion.tr>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
