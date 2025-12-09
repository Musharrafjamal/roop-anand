"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Loader2,
  Plus,
  Package,
  Trash2,
  AlertCircle,
  CheckCircle,
  ImageOff,
  Undo2,
} from "lucide-react";

interface Product {
  _id: string;
  photo?: string;
  title: string;
  stockQuantity: number;
  price: {
    base: number;
    lowestSellingPrice: number;
  };
  status: "Active" | "Inactive";
}

interface AssignedProduct {
  _id: string;
  product: Product;
  quantity: number;
  assignedAt: string;
}

interface Employee {
  _id: string;
  fullName: string;
  products: AssignedProduct[];
}

interface ProductAssignmentProps {
  employeeId: string;
  employeeName: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function ProductAssignment({
  employeeId,
  employeeName,
  isOpen,
  onClose,
  onUpdate,
}: ProductAssignmentProps) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [assignedProducts, setAssignedProducts] = useState<AssignedProduct[]>(
    []
  );
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("1");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch all products
      const productsRes = await fetch("/api/products");
      if (productsRes.ok) {
        const productsData = await products;
        setProducts(await productsRes.json());
      }

      // Fetch employee's assigned products
      const employeeRes = await fetch(`/api/employees/${employeeId}/products`);
      if (employeeRes.ok) {
        const employeeData: Employee = await employeeRes.json();
        setAssignedProducts(employeeData.products || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
      setSelectedProduct("");
      setQuantity("1");
      setError("");
      setSuccess("");
    }
  }, [isOpen, employeeId]);

  const handleAssign = async () => {
    if (!selectedProduct) {
      setError("Please select a product");
      return;
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1) {
      setError("Please enter a valid quantity");
      return;
    }

    const product = products.find((p) => p._id === selectedProduct);
    if (product && qty > product.stockQuantity) {
      setError(`Only ${product.stockQuantity} items available in stock`);
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const res = await fetch(`/api/employees/${employeeId}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct,
          quantity: qty,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSuccess(`${qty} units assigned successfully!`);
        setSelectedProduct("");
        setQuantity("1");
        fetchData();
        onUpdate();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to assign product");
      }
    } catch (error) {
      setError("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (assignmentId: string, returnToStock: boolean) => {
    if (
      !confirm(
        returnToStock
          ? "Remove this product and return to stock?"
          : "Remove this product assignment? Stock will not be returned."
      )
    ) {
      return;
    }

    try {
      const res = await fetch(
        `/api/employees/${employeeId}/products?assignmentId=${assignmentId}&returnToStock=${returnToStock}`,
        { method: "DELETE" }
      );

      if (res.ok) {
        setSuccess("Assignment removed successfully");
        fetchData();
        onUpdate();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to remove assignment");
      }
    } catch (error) {
      setError("An error occurred");
    }
  };

  const availableProducts = products.filter(
    (p) => p.stockQuantity > 0 && p.status === "Active"
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Package className="h-5 w-5 text-indigo-600" />
            Assign Products to {employeeName}
          </DialogTitle>
          <DialogDescription>
            Assign products from inventory to this employee. Stock will be
            deducted automatically.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Assign New Product */}
            <Card className="p-4 border-indigo-100 bg-indigo-50/30">
              <h3 className="font-medium text-slate-800 mb-4 flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Assign New Product
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <Label className="text-sm text-slate-600 mb-1.5 block">
                    Product
                  </Label>
                  <Select
                    value={selectedProduct}
                    onValueChange={setSelectedProduct}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProducts.length === 0 ? (
                        <div className="p-2 text-sm text-slate-500 text-center">
                          No products available
                        </div>
                      ) : (
                        availableProducts.map((product) => (
                          <SelectItem key={product._id} value={product._id}>
                            <div className="flex items-center gap-2">
                              <span>{product.title}</span>
                              <span className="text-xs text-slate-500">
                                ({product.stockQuantity} in stock)
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm text-slate-600 mb-1.5 block">
                    Quantity
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="bg-white"
                  />
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-3 flex items-center gap-2 text-red-600 text-sm"
                  >
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </motion.div>
                )}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-3 flex items-center gap-2 text-green-600 text-sm"
                  >
                    <CheckCircle className="h-4 w-4" />
                    {success}
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                onClick={handleAssign}
                disabled={submitting || !selectedProduct}
                className="mt-4 bg-indigo-600 hover:bg-indigo-700"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Assign Product
                  </>
                )}
              </Button>
            </Card>

            {/* Assigned Products List */}
            <div>
              <h3 className="font-medium text-slate-800 mb-3 flex items-center gap-2">
                <Package className="h-4 w-4" />
                Assigned Products ({assignedProducts.length})
              </h3>

              {assignedProducts.length === 0 ? (
                <Card className="p-8 text-center">
                  <Package className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No products assigned yet</p>
                </Card>
              ) : (
                <div className="space-y-2">
                  {assignedProducts.map((assignment, index) => (
                    <motion.div
                      key={assignment._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="p-3">
                        <div className="flex items-center gap-3">
                          {/* Product Image */}
                          <div className="h-12 w-12 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 flex items-center justify-center">
                            {assignment.product?.photo ? (
                              <img
                                src={assignment.product.photo}
                                alt={assignment.product.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ImageOff className="h-5 w-5 text-slate-400" />
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-800 truncate">
                              {assignment.product?.title || "Product Deleted"}
                            </p>
                            <div className="flex items-center gap-3 text-sm text-slate-500">
                              <span className="flex items-center gap-1">
                                <Package className="h-3 w-3" />
                                Qty:{" "}
                                <span className="font-medium text-slate-700">
                                  {assignment.quantity}
                                </span>
                              </span>
                              <span>
                                {format(
                                  new Date(assignment.assignedAt),
                                  "MMM d, yyyy"
                                )}
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1">
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  handleRemove(assignment._id, true)
                                }
                                title="Remove and return to stock"
                                className="h-8 w-8 text-slate-500 hover:text-amber-600 hover:bg-amber-50"
                              >
                                <Undo2 className="h-4 w-4" />
                              </Button>
                            </motion.div>
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  handleRemove(assignment._id, false)
                                }
                                title="Remove without returning to stock"
                                className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </motion.div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Close Button */}
            <div className="flex justify-end pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
