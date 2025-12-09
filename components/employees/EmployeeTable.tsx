"use client";

import { format } from "date-fns";
import { motion } from "framer-motion";
import { Pencil, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";

interface Employee {
  _id: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  gender: "Male" | "Female" | "Other";
  age: number;
  dateOfJoining: string;
  profilePhoto?: string;
  status: "Online" | "Offline";
  createdAt: string;
  updatedAt: string;
}

interface EmployeeTableProps {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, currentStatus: string) => void;
}

export function EmployeeTable({
  employees,
  onEdit,
  onDelete,
  onToggleStatus,
}: EmployeeTableProps) {
  if (employees.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-slate-400" />
          </div>
          <p className="text-slate-600">No employees found</p>
          <p className="text-sm text-slate-500">
            Click &quot;Add Employee&quot; to create your first employee record
          </p>
        </div>
      </Card>
    );
  }

  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
      },
    }),
  };

  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 hover:bg-slate-50">
            <TableHead className="w-[80px]">Photo</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead className="hidden md:table-cell">Email</TableHead>
            <TableHead className="hidden sm:table-cell">Gender</TableHead>
            <TableHead className="hidden sm:table-cell">Age</TableHead>
            <TableHead className="hidden lg:table-cell">Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee, index) => (
            <motion.tr
              key={employee._id}
              custom={index}
              variants={rowVariants}
              initial="hidden"
              animate="visible"
              className="border-b transition-colors hover:bg-slate-50/80 data-[state=selected]:bg-slate-100"
            >
              <TableCell>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="relative"
                >
                  <Avatar className="h-10 w-10 ring-2 ring-white shadow-sm">
                    {employee.profilePhoto ? (
                      <AvatarImage
                        src={employee.profilePhoto}
                        alt={employee.fullName}
                      />
                    ) : null}
                    <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-indigo-600 text-white font-medium">
                      {employee.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  {/* Status indicator on avatar */}
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                      employee.status === "Online"
                        ? "bg-green-500"
                        : "bg-slate-400"
                    }`}
                  />
                </motion.div>
              </TableCell>
              <TableCell className="font-medium text-slate-800">
                {employee.fullName}
              </TableCell>
              <TableCell>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onToggleStatus(employee._id, employee.status)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                    employee.status === "Online"
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      employee.status === "Online"
                        ? "bg-green-500"
                        : "bg-slate-400"
                    }`}
                  />
                  {employee.status}
                </motion.button>
              </TableCell>
              <TableCell className="text-slate-600">
                {employee.phoneNumber}
              </TableCell>
              <TableCell className="hidden md:table-cell text-slate-500">
                {employee.email || "—"}
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    employee.gender === "Male"
                      ? "bg-blue-100 text-blue-700"
                      : employee.gender === "Female"
                      ? "bg-pink-100 text-pink-700"
                      : "bg-purple-100 text-purple-700"
                  }`}
                >
                  {employee.gender}
                </span>
              </TableCell>
              <TableCell className="hidden sm:table-cell text-slate-600">
                {employee.age}
              </TableCell>
              <TableCell className="hidden lg:table-cell text-slate-500">
                {format(new Date(employee.dateOfJoining), "MMM d, yyyy")}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(employee)}
                      className="h-8 w-8 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(employee._id)}
                      className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </div>
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
