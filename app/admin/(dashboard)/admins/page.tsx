"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Plus, Loader2, Shield, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AdminForm } from "@/components/admins/AdminForm";
import { AdminTable } from "@/components/admins/AdminTable";
import { usePermissions } from "@/hooks/usePermissions";
import { Permissions } from "@/types/permissions";

interface AdminData {
  _id: string;
  email: string;
  name: string;
  role: "super-admin" | "sub-admin";
  permissions: Permissions;
  isActive: boolean;
  createdAt: string;
}

export default function AdminsPage() {
  const { data: session } = useSession();
  const {
    isSuperAdmin,
    role,
    isLoading: permissionsLoading,
  } = usePermissions();
  const [admins, setAdmins] = useState<AdminData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAdmins = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admins");
      if (res.ok) {
        const data = await res.json();
        setAdmins(data.admins || []);
      } else {
        toast.error("Failed to fetch admins");
      }
    } catch (error) {
      console.error("Error fetching admins:", error);
      toast.error("Failed to fetch admins");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Wait for permissions to load, then check if super admin
    if (!permissionsLoading && role === "super-admin") {
      fetchAdmins();
    } else if (!permissionsLoading) {
      setLoading(false);
    }
  }, [fetchAdmins, role, permissionsLoading]);

  const handleCreate = () => {
    setEditingAdmin(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (admin: AdminData) => {
    setEditingAdmin(admin);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setTimeout(() => setEditingAdmin(null), 200);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this admin?")) return;

    try {
      const res = await fetch(`/api/admins/${id}`, { method: "DELETE" });

      if (res.ok) {
        toast.success("Admin deleted successfully");
        fetchAdmins();
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to delete admin");
      }
    } catch (error) {
      console.error("Error deleting admin:", error);
      toast.error("Failed to delete admin");
    }
  };

  const handleSubmit = async (data: {
    email: string;
    password: string;
    name: string;
    isActive: boolean;
    permissions: Permissions;
  }) => {
    setIsSubmitting(true);
    try {
      const url = editingAdmin
        ? `/api/admins/${editingAdmin._id}`
        : "/api/admins";
      const method = editingAdmin ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success(
          editingAdmin
            ? "Admin updated successfully"
            : "Admin created successfully"
        );
        handleCloseDialog();
        fetchAdmins();
      } else {
        const error = await res.json();
        toast.error(error.error || "An error occurred");
      }
    } catch (error) {
      console.error("Error saving admin:", error);
      toast.error("An error occurred while saving");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter admins by search
  const filteredAdmins = admins.filter(
    (admin) =>
      admin.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Access denied for non-super-admins
  if (!isSuperAdmin()) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <Shield className="h-16 w-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-semibold text-slate-700">Access Denied</h2>
        <p className="text-slate-500">
          Only super-admins can manage other admins.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="p-8"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Admin Management
            </h1>
            <p className="text-slate-600 mt-1">
              Manage sub-admins and their permissions
              {admins.length > 0 && (
                <span className="ml-2 text-indigo-600 font-medium">
                  ({admins.length} total)
                </span>
              )}
            </p>
          </div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={handleCreate}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all"
            >
              <Plus className="h-4 w-4" />
              Add Sub-Admin
            </Button>
          </motion.div>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-6"
        >
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search admins..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </motion.div>

        {/* Table */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-16"
            >
              <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-4" />
              <p className="text-slate-500">Loading admins...</p>
            </motion.div>
          ) : filteredAdmins.length === 0 && searchQuery ? (
            <motion.div
              key="no-results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center py-16"
            >
              <Search className="h-12 w-12 text-slate-300 mb-4" />
              <p className="text-slate-600 text-lg">No admins found</p>
              <p className="text-slate-400 text-sm">
                Try a different search term
              </p>
            </motion.div>
          ) : admins.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-slate-200"
            >
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-indigo-600" />
              </div>
              <p className="text-slate-600 text-lg font-medium mb-2">
                No sub-admins yet
              </p>
              <p className="text-slate-400 text-sm mb-4">
                Create sub-admins to delegate access
              </p>
              <Button
                onClick={handleCreate}
                className="gap-2 bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4" />
                Add Sub-Admin
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="table"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <AdminTable
                admins={filteredAdmins}
                onEdit={handleEdit}
                onDelete={handleDelete}
                currentUserId={session?.user?.id}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {editingAdmin?.role === "super-admin"
                  ? "Edit Profile"
                  : editingAdmin
                  ? "Edit Sub-Admin"
                  : "Create Sub-Admin"}
              </DialogTitle>
              <DialogDescription>
                {editingAdmin?.role === "super-admin"
                  ? "Update your name and password."
                  : editingAdmin
                  ? "Update the admin details and permissions below."
                  : "Create a new sub-admin with specific permissions."}
              </DialogDescription>
            </DialogHeader>
            <AdminForm
              key={editingAdmin?._id || "new"}
              initialData={editingAdmin || undefined}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              onCancel={handleCloseDialog}
              isEditing={!!editingAdmin}
              isSuperAdminEdit={editingAdmin?.role === "super-admin"}
            />
          </DialogContent>
        </Dialog>
      </div>
    </motion.div>
  );
}
