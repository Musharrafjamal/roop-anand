"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Plus,
  Search,
  Package,
  Banknote,
  CreditCard,
  Check,
  X,
  Clock,
  AlertCircle,
  FileText,
  ImageOff,
  Filter,
} from "lucide-react";
import { PermissionGate } from "@/components/ui/permission-gate";

interface Employee {
  _id: string;
  fullName: string;
  profilePhoto?: string;
  phoneNumber: string;
  holdings?: {
    cash: number;
    online: number;
    total: number;
  };
}

interface Product {
  _id: string;
  title: string;
  photo?: string;
  price: { base: number };
  stockQuantity: number;
}

interface StockRequest {
  _id: string;
  employee: Employee;
  product: Product;
  quantity: number;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  rejectionReason?: string;
  createdAt: string;
  processedAt?: string;
}

interface MoneyRequest {
  _id: string;
  employee: Employee;
  amount: number;
  method: "Cash" | "Online";
  referenceNumber?: string;
  status: "Pending" | "Approved" | "Rejected";
  rejectionReason?: string;
  createdAt: string;
  processedAt?: string;
}

type RequestTab = "stock" | "money";
type StatusFilter = "all" | "Pending" | "Approved" | "Rejected";

export default function RequestsPage() {
  const [activeTab, setActiveTab] = useState<RequestTab>("stock");
  const [stockRequests, setStockRequests] = useState<StockRequest[]>([]);
  const [moneyRequests, setMoneyRequests] = useState<MoneyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // Create dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stock request form
  const [stockForm, setStockForm] = useState({
    employeeId: "",
    productId: "",
    quantity: 1,
    reason: "",
  });

  // Money request form
  const [moneyForm, setMoneyForm] = useState({
    employeeId: "",
    amount: 0,
    method: "Cash" as "Cash" | "Online",
    referenceNumber: "",
  });

  // Rejection dialog
  const [rejectingRequest, setRejectingRequest] = useState<{
    id: string;
    type: RequestTab;
  } | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const fetchStockRequests = useCallback(async () => {
    try {
      const res = await fetch(`/api/requests/stock?status=${statusFilter}`);
      if (res.ok) {
        const data = await res.json();
        setStockRequests(data);
      }
    } catch (error) {
      console.error("Error fetching stock requests:", error);
    }
  }, [statusFilter]);

  const fetchMoneyRequests = useCallback(async () => {
    try {
      const res = await fetch(`/api/requests/money?status=${statusFilter}`);
      if (res.ok) {
        const data = await res.json();
        setMoneyRequests(data);
      }
    } catch (error) {
      console.error("Error fetching money requests:", error);
    }
  }, [statusFilter]);

  const fetchEmployees = async () => {
    try {
      const res = await fetch("/api/employees");
      if (res.ok) {
        const data = await res.json();
        setEmployees(data);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data.filter((p: Product) => p.stockQuantity > 0));
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      await Promise.all([fetchStockRequests(), fetchMoneyRequests()]);
      setLoading(false);
    };
    fetchAll();
  }, [fetchStockRequests, fetchMoneyRequests]);

  const handleOpenCreate = async () => {
    await Promise.all([fetchEmployees(), fetchProducts()]);
    setStockForm({ employeeId: "", productId: "", quantity: 1, reason: "" });
    setMoneyForm({
      employeeId: "",
      amount: 0,
      method: "Cash",
      referenceNumber: "",
    });
    setIsCreateOpen(true);
  };

  const handleCreateStockRequest = async () => {
    if (!stockForm.employeeId || !stockForm.productId || !stockForm.reason) {
      toast.warning("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/requests/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stockForm),
      });

      if (res.ok) {
        setIsCreateOpen(false);
        fetchStockRequests();
        toast.success("Stock request created successfully");
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to create request");
      }
    } catch (error) {
      console.error("Error creating request:", error);
      toast.error("Failed to create request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateMoneyRequest = async () => {
    if (!moneyForm.employeeId || !moneyForm.amount) {
      toast.warning("Please fill all required fields");
      return;
    }

    if (moneyForm.method === "Online" && !moneyForm.referenceNumber) {
      toast.warning("Reference number is required for online payments");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/requests/money", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(moneyForm),
      });

      if (res.ok) {
        setIsCreateOpen(false);
        fetchMoneyRequests();
        toast.success("Money request created successfully");
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to create request");
      }
    } catch (error) {
      console.error("Error creating request:", error);
      toast.error("Failed to create request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (id: string, type: RequestTab) => {
    try {
      const res = await fetch(`/api/requests/${type}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      });

      if (res.ok) {
        if (type === "stock") fetchStockRequests();
        else fetchMoneyRequests();
        toast.success("Request approved successfully");
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to approve request");
      }
    } catch (error) {
      console.error("Error approving request:", error);
      toast.error("Failed to approve request");
    }
  };

  const handleReject = async () => {
    if (!rejectingRequest || !rejectionReason.trim()) {
      toast.warning("Please provide a rejection reason");
      return;
    }

    try {
      const res = await fetch(
        `/api/requests/${rejectingRequest.type}/${rejectingRequest.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "reject", rejectionReason }),
        }
      );

      if (res.ok) {
        setRejectingRequest(null);
        setRejectionReason("");
        if (rejectingRequest.type === "stock") fetchStockRequests();
        else fetchMoneyRequests();
        toast.success("Request rejected");
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to reject request");
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast.error("Failed to reject request");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "MMM d, yyyy h:mm a");
    } catch {
      return "N/A";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
            <Clock className="h-3 w-3" />
            Pending
          </span>
        );
      case "Approved":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <Check className="h-3 w-3" />
            Approved
          </span>
        );
      case "Rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <X className="h-3 w-3" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  // Filter requests
  const filteredStockRequests = stockRequests.filter(
    (req) =>
      req.employee?.fullName
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      req.product?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMoneyRequests = moneyRequests.filter((req) =>
    req.employee?.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingStockCount = stockRequests.filter(
    (r) => r.status === "Pending"
  ).length;
  const pendingMoneyCount = moneyRequests.filter(
    (r) => r.status === "Pending"
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Requests</h1>
            <p className="text-slate-600">
              Manage stock and money submission requests
            </p>
          </div>
          <Button
            onClick={handleOpenCreate}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200"
          >
            <Plus className="h-4 w-4" />
            New Request
          </Button>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === "stock" ? "default" : "outline"}
            onClick={() => setActiveTab("stock")}
            className={`gap-2 ${activeTab === "stock" ? "bg-indigo-600" : ""}`}
          >
            <Package className="h-4 w-4" />
            Stock Requests
            {pendingStockCount > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-yellow-400 text-yellow-900 text-xs rounded-full">
                {pendingStockCount}
              </span>
            )}
          </Button>
          <Button
            variant={activeTab === "money" ? "default" : "outline"}
            onClick={() => setActiveTab("money")}
            className={`gap-2 ${activeTab === "money" ? "bg-indigo-600" : ""}`}
          >
            <Banknote className="h-4 w-4" />
            Money Requests
            {pendingMoneyCount > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-yellow-400 text-yellow-900 text-xs rounded-full">
                {pendingMoneyCount}
              </span>
            )}
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by employee or product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as StatusFilter)}
          >
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === "stock" ? (
              <motion.div
                key="stock"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                {filteredStockRequests.length === 0 ? (
                  <Card className="p-12 text-center">
                    <Package className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-500">No stock requests found</p>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {filteredStockRequests.map((request, index) => (
                      <motion.div
                        key={request._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-4">
                                <Avatar className="h-12 w-12">
                                  {request.employee?.profilePhoto && (
                                    <AvatarImage
                                      src={request.employee.profilePhoto}
                                    />
                                  )}
                                  <AvatarFallback className="bg-indigo-100 text-indigo-600">
                                    {request.employee?.fullName
                                      ?.split(" ")
                                      .map((n) => n[0])
                                      .join("")
                                      .slice(0, 2)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="font-semibold text-slate-800">
                                      {request.employee?.fullName}
                                    </p>
                                    {getStatusBadge(request.status)}
                                  </div>
                                  <div className="flex items-center gap-3 text-sm text-slate-600 mb-2">
                                    <span className="flex items-center gap-1">
                                      <div className="h-6 w-6 rounded overflow-hidden bg-slate-100">
                                        {request.product?.photo ? (
                                          <img
                                            src={request.product.photo}
                                            alt=""
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <ImageOff className="h-4 w-4 text-slate-300 m-1" />
                                        )}
                                      </div>
                                      {request.product?.title}
                                    </span>
                                    <span className="font-medium">
                                      ×{request.quantity}
                                    </span>
                                  </div>
                                  <div className="flex items-start gap-1 text-sm text-slate-500">
                                    <FileText className="h-4 w-4 shrink-0 mt-0.5" />
                                    <span>{request.reason}</span>
                                  </div>
                                  <p className="text-xs text-slate-400 mt-2">
                                    {formatDate(request.createdAt)}
                                  </p>
                                  {request.rejectionReason && (
                                    <p className="text-sm text-red-600 mt-2">
                                      <strong>Rejection:</strong>{" "}
                                      {request.rejectionReason}
                                    </p>
                                  )}
                                </div>
                              </div>
                              {request.status === "Pending" && (
                                <div className="flex gap-2">
                                  <PermissionGate
                                    module="requests"
                                    action="approve"
                                  >
                                    <Button
                                      size="sm"
                                      className="gap-1 bg-green-600 hover:bg-green-700"
                                      onClick={() =>
                                        handleApprove(request._id, "stock")
                                      }
                                    >
                                      <Check className="h-4 w-4" />
                                      Approve
                                    </Button>
                                  </PermissionGate>
                                  <PermissionGate
                                    module="requests"
                                    action="reject"
                                  >
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="gap-1 border-red-300 text-red-600 hover:bg-red-50"
                                      onClick={() =>
                                        setRejectingRequest({
                                          id: request._id,
                                          type: "stock",
                                        })
                                      }
                                    >
                                      <X className="h-4 w-4" />
                                      Reject
                                    </Button>
                                  </PermissionGate>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="money"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {filteredMoneyRequests.length === 0 ? (
                  <Card className="p-12 text-center">
                    <Banknote className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-500">No money requests found</p>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {filteredMoneyRequests.map((request, index) => (
                      <motion.div
                        key={request._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-4">
                                <Avatar className="h-12 w-12">
                                  {request.employee?.profilePhoto && (
                                    <AvatarImage
                                      src={request.employee.profilePhoto}
                                    />
                                  )}
                                  <AvatarFallback className="bg-indigo-100 text-indigo-600">
                                    {request.employee?.fullName
                                      ?.split(" ")
                                      .map((n) => n[0])
                                      .join("")
                                      .slice(0, 2)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="font-semibold text-slate-800">
                                      {request.employee?.fullName}
                                    </p>
                                    {getStatusBadge(request.status)}
                                  </div>
                                  <div className="flex items-center gap-3 mb-2">
                                    <span className="text-2xl font-bold text-slate-800">
                                      {formatCurrency(request.amount)}
                                    </span>
                                    <span
                                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                        request.method === "Cash"
                                          ? "bg-green-100 text-green-700"
                                          : "bg-blue-100 text-blue-700"
                                      }`}
                                    >
                                      {request.method === "Cash" ? (
                                        <Banknote className="h-3 w-3" />
                                      ) : (
                                        <CreditCard className="h-3 w-3" />
                                      )}
                                      {request.method}
                                    </span>
                                  </div>
                                  {request.referenceNumber && (
                                    <p className="text-sm text-slate-600 mb-1">
                                      <strong>Ref:</strong>{" "}
                                      {request.referenceNumber}
                                    </p>
                                  )}
                                  <p className="text-xs text-slate-400">
                                    {formatDate(request.createdAt)}
                                  </p>
                                  {request.rejectionReason && (
                                    <p className="text-sm text-red-600 mt-2">
                                      <strong>Rejection:</strong>{" "}
                                      {request.rejectionReason}
                                    </p>
                                  )}
                                </div>
                              </div>
                              {request.status === "Pending" && (
                                <div className="flex gap-2">
                                  <PermissionGate
                                    module="requests"
                                    action="approve"
                                  >
                                    <Button
                                      size="sm"
                                      className="gap-1 bg-green-600 hover:bg-green-700"
                                      onClick={() =>
                                        handleApprove(request._id, "money")
                                      }
                                    >
                                      <Check className="h-4 w-4" />
                                      Approve
                                    </Button>
                                  </PermissionGate>
                                  <PermissionGate
                                    module="requests"
                                    action="reject"
                                  >
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="gap-1 border-red-300 text-red-600 hover:bg-red-50"
                                      onClick={() =>
                                        setRejectingRequest({
                                          id: request._id,
                                          type: "money",
                                        })
                                      }
                                    >
                                      <X className="h-4 w-4" />
                                      Reject
                                    </Button>
                                  </PermissionGate>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Create Request Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Request</DialogTitle>
              <DialogDescription>
                Create a {activeTab === "stock" ? "stock" : "money"} request on
                behalf of an employee.
              </DialogDescription>
            </DialogHeader>

            {/* Tabs in Dialog */}
            <div className="flex gap-2 mb-4">
              <Button
                size="sm"
                variant={activeTab === "stock" ? "default" : "outline"}
                onClick={() => setActiveTab("stock")}
                className={activeTab === "stock" ? "bg-indigo-600" : ""}
              >
                <Package className="h-4 w-4 mr-2" />
                Stock
              </Button>
              <Button
                size="sm"
                variant={activeTab === "money" ? "default" : "outline"}
                onClick={() => setActiveTab("money")}
                className={activeTab === "money" ? "bg-indigo-600" : ""}
              >
                <Banknote className="h-4 w-4 mr-2" />
                Money
              </Button>
            </div>

            {activeTab === "stock" ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Employee *</Label>
                  <Select
                    value={stockForm.employeeId}
                    onValueChange={(v) =>
                      setStockForm({ ...stockForm, employeeId: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp._id} value={emp._id}>
                          {emp.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Product *</Label>
                  <Select
                    value={stockForm.productId}
                    onValueChange={(v) =>
                      setStockForm({ ...stockForm, productId: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((prod) => (
                        <SelectItem key={prod._id} value={prod._id}>
                          {prod.title} ({prod.stockQuantity} available)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Quantity *</Label>
                  <Input
                    type="number"
                    min="1"
                    value={stockForm.quantity}
                    onChange={(e) =>
                      setStockForm({
                        ...stockForm,
                        quantity: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Reason *</Label>
                  <Textarea
                    placeholder="Reason for requesting stock..."
                    value={stockForm.reason}
                    onChange={(e) =>
                      setStockForm({ ...stockForm, reason: e.target.value })
                    }
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateStockRequest}
                    disabled={isSubmitting}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Create Request"
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Employee *</Label>
                  <Select
                    value={moneyForm.employeeId}
                    onValueChange={(v) =>
                      setMoneyForm({ ...moneyForm, employeeId: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp._id} value={emp._id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{emp.fullName}</span>
                            <span className="text-xs text-slate-500 ml-2">
                              Cash: {formatCurrency(emp.holdings?.cash || 0)} |
                              Online:{" "}
                              {formatCurrency(emp.holdings?.online || 0)} |
                              Total: {formatCurrency(emp.holdings?.total || 0)}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Amount *</Label>
                  <Input
                    type="number"
                    min="1"
                    value={moneyForm.amount}
                    onChange={(e) =>
                      setMoneyForm({
                        ...moneyForm,
                        amount: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="Enter amount"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Payment Method *</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={
                        moneyForm.method === "Cash" ? "default" : "outline"
                      }
                      onClick={() =>
                        setMoneyForm({ ...moneyForm, method: "Cash" })
                      }
                      className={`flex-1 gap-2 ${
                        moneyForm.method === "Cash"
                          ? "bg-green-600 hover:bg-green-700"
                          : ""
                      }`}
                    >
                      <Banknote className="h-4 w-4" />
                      Cash
                    </Button>
                    <Button
                      type="button"
                      variant={
                        moneyForm.method === "Online" ? "default" : "outline"
                      }
                      onClick={() =>
                        setMoneyForm({ ...moneyForm, method: "Online" })
                      }
                      className={`flex-1 gap-2 ${
                        moneyForm.method === "Online"
                          ? "bg-blue-600 hover:bg-blue-700"
                          : ""
                      }`}
                    >
                      <CreditCard className="h-4 w-4" />
                      Online
                    </Button>
                  </div>
                </div>

                {moneyForm.method === "Online" && (
                  <div className="space-y-2">
                    <Label>Reference Number *</Label>
                    <Input
                      value={moneyForm.referenceNumber}
                      onChange={(e) =>
                        setMoneyForm({
                          ...moneyForm,
                          referenceNumber: e.target.value,
                        })
                      }
                      placeholder="Transaction reference number"
                    />
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateMoneyRequest}
                    disabled={isSubmitting}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Create Request"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Rejection Dialog */}
        <Dialog
          open={!!rejectingRequest}
          onOpenChange={() => setRejectingRequest(null)}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                Reject Request
              </DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this request.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="Reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setRejectingRequest(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={!rejectionReason.trim()}
                >
                  Reject Request
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </motion.div>
  );
}
