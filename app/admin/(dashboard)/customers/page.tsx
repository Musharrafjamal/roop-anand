"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Loader2,
  UserCircle,
  Filter,
  ArrowUpDown,
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Customer {
  _id: string;
  deviceId?: string;
  email?: string;
  name: string;
  phone: string;
  address?: string;
  authType: "guest" | "registered";
  createdAt: string;
  updatedAt: string;
  requestCount?: number;
}

type SortField = "createdAt" | "name";
type SortOrder = "asc" | "desc";
type AuthTypeFilter = "all" | "guest" | "registered";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Filter and Sort states
  const [authTypeFilter, setAuthTypeFilter] = useState<AuthTypeFilter>("all");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [showFilters, setShowFilters] = useState(false);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (authTypeFilter !== "all") params.append("authType", authTypeFilter);
      params.append("sortBy", sortField);
      params.append("sortOrder", sortOrder);

      const res = await fetch(`/api/customers?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.customers || []);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, authTypeFilter, sortField, sortOrder]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleViewDetails = async (customer: Customer) => {
    try {
      const res = await fetch(`/api/customers/${customer._id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedCustomer(data.customer);
        setIsDetailsOpen(true);
      }
    } catch (error) {
      console.error("Error fetching customer details:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this customer and all their requests?"
      )
    )
      return;

    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchCustomers();
        if (selectedCustomer?._id === id) {
          setIsDetailsOpen(false);
        }
      }
    } catch (error) {
      console.error("Error deleting customer:", error);
    }
  };

  const guestCount = customers.filter((c) => c.authType === "guest").length;
  const registeredCount = customers.filter(
    (c) => c.authType === "registered"
  ).length;

  const clearFilters = () => {
    setAuthTypeFilter("all");
    setSortField("createdAt");
    setSortOrder("desc");
    setSearchQuery("");
  };

  const hasActiveFilters =
    authTypeFilter !== "all" ||
    sortField !== "createdAt" ||
    sortOrder !== "desc" ||
    searchQuery;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

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
            <h1 className="text-3xl font-bold text-slate-800">Customers</h1>
            <div className="flex items-center gap-4 mt-1">
              <p className="text-slate-600">
                Manage customer records
                {customers.length > 0 && (
                  <span className="ml-2 text-indigo-600 font-medium">
                    ({customers.length} total)
                  </span>
                )}
              </p>
              {customers.length > 0 && (
                <div className="flex items-center gap-3 text-sm">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span className="text-slate-600">
                      {registeredCount} Registered
                    </span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                    <span className="text-slate-600">{guestCount} Guest</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-6 space-y-4"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 transition-all focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
              />
            </div>

            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={`gap-2 ${
                showFilters ? "bg-indigo-50 border-indigo-300" : ""
              }`}
            >
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="ml-1 w-2 h-2 rounded-full bg-indigo-600"></span>
              )}
            </Button>
          </div>

          {/* Expanded Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  {/* Auth Type Filter */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600 font-medium">
                      Type:
                    </span>
                    <Select
                      value={authTypeFilter}
                      onValueChange={(v) =>
                        setAuthTypeFilter(v as AuthTypeFilter)
                      }
                    >
                      <SelectTrigger className="w-36 bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="registered">
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            Registered
                          </span>
                        </SelectItem>
                        <SelectItem value="guest">
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                            Guest
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort By */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600 font-medium">
                      Sort by:
                    </span>
                    <Select
                      value={sortField}
                      onValueChange={(v) => setSortField(v as SortField)}
                    >
                      <SelectTrigger className="w-36 bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="createdAt">Date Added</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort Order */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                    }
                    className="gap-2"
                  >
                    <ArrowUpDown className="h-4 w-4" />
                    {sortOrder === "asc" ? "Ascending" : "Descending"}
                  </Button>

                  {/* Clear Filters */}
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="gap-1 text-slate-500 hover:text-slate-700"
                    >
                      <X className="h-4 w-4" />
                      Clear
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
              <p className="text-slate-500">Loading customers...</p>
            </motion.div>
          ) : customers.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-slate-200"
            >
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <UserCircle className="h-8 w-8 text-indigo-600" />
              </div>
              <p className="text-slate-600 text-lg font-medium mb-2">
                No customers yet
              </p>
              <p className="text-slate-400 text-sm mb-4">
                Customers will appear here when they sign up via the mobile app
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="table"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="font-semibold">Name</TableHead>
                      <TableHead className="font-semibold">Contact</TableHead>
                      <TableHead className="font-semibold">Type</TableHead>
                      <TableHead className="font-semibold">Joined</TableHead>
                      <TableHead className="text-right font-semibold">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((customer) => (
                      <TableRow
                        key={customer._id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                              {customer.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-slate-800">
                                {customer.name}
                              </p>
                              {customer.address && (
                                <p className="text-sm text-slate-500 flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {customer.address.substring(0, 30)}
                                  {customer.address.length > 30 && "..."}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-sm text-slate-600 flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {customer.phone}
                            </p>
                            {customer.email && (
                              <p className="text-sm text-slate-500 flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {customer.email}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                              customer.authType === "registered"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {customer.authType === "registered" ? (
                              <Mail className="h-3 w-3" />
                            ) : (
                              <Smartphone className="h-3 w-3" />
                            )}
                            {customer.authType === "registered"
                              ? "Registered"
                              : "Guest"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-slate-600">
                            {formatDate(customer.createdAt)}
                          </p>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(customer)}
                            >
                              View
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDelete(customer._id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Customer Details Modal */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Customer Details</DialogTitle>
            </DialogHeader>
            {selectedCustomer && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-semibold">
                    {selectedCustomer.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {selectedCustomer.name}
                    </h3>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        selectedCustomer.authType === "registered"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {selectedCustomer.authType === "registered"
                        ? "Registered"
                        : "Guest"}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t">
                  <div className="flex items-center gap-3 text-slate-600">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <span>{selectedCustomer.phone}</span>
                  </div>
                  {selectedCustomer.email && (
                    <div className="flex items-center gap-3 text-slate-600">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <span>{selectedCustomer.email}</span>
                    </div>
                  )}
                  {selectedCustomer.address && (
                    <div className="flex items-start gap-3 text-slate-600">
                      <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                      <span>{selectedCustomer.address}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-slate-600">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span>Joined {formatDate(selectedCustomer.createdAt)}</span>
                  </div>
                  {selectedCustomer.requestCount !== undefined && (
                    <div className="flex items-center gap-3 text-slate-600">
                      <span className="text-sm font-medium text-indigo-600">
                        {selectedCustomer.requestCount} product request(s)
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-4 flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                      handleDelete(selectedCustomer._id);
                    }}
                  >
                    Delete Customer
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </motion.div>
  );
}
