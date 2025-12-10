"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  ShoppingBag,
  Banknote,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
  ImageOff,
} from "lucide-react";

interface SaleItem {
  product?: {
    _id: string;
    title: string;
    photo?: string;
  };
  productTitle: string;
  quantity: number;
  totalPrice: number;
}

interface Sale {
  _id: string;
  items: SaleItem[];
  customer: { name: string; phone: string };
  paymentMethod: "Cash" | "Online";
  totalAmount: number;
  createdAt: string;
}

interface EmployeeSalesProps {
  employeeId: string;
}

type SortOption = "recent" | "oldest" | "price_high" | "price_low";
type PaymentFilter = "all" | "Cash" | "Online";

const ITEMS_PER_PAGE = 5;

export function EmployeeSales({ employeeId }: EmployeeSalesProps) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("all");
  const [productFilter, setProductFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchSales();
  }, [employeeId]);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/sales?employeeId=${employeeId}`);
      if (res.ok) {
        const data = await res.json();
        setSales(data);
      }
    } catch (error) {
      console.error("Error fetching sales:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique products from all sales
  const uniqueProducts = useMemo(() => {
    const productMap = new Map<string, string>();
    sales.forEach((sale) => {
      sale.items.forEach((item) => {
        if (item.product?._id) {
          productMap.set(item.product._id, item.productTitle);
        } else {
          productMap.set(item.productTitle, item.productTitle);
        }
      });
    });
    return Array.from(productMap, ([id, title]) => ({ id, title }));
  }, [sales]);

  // Filter and sort sales
  const filteredSales = useMemo(() => {
    let result = [...sales];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (sale) =>
          sale.customer.name.toLowerCase().includes(query) ||
          sale.customer.phone.includes(query)
      );
    }

    // Payment filter
    if (paymentFilter !== "all") {
      result = result.filter((sale) => sale.paymentMethod === paymentFilter);
    }

    // Product filter
    if (productFilter !== "all") {
      result = result.filter((sale) =>
        sale.items.some(
          (item) =>
            item.product?._id === productFilter ||
            item.productTitle === productFilter
        )
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "price_high":
          return b.totalAmount - a.totalAmount;
        case "price_low":
          return a.totalAmount - b.totalAmount;
        default:
          return 0;
      }
    });

    return result;
  }, [sales, searchQuery, paymentFilter, productFilter, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredSales.length / ITEMS_PER_PAGE);
  const paginatedSales = filteredSales.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, paymentFilter, productFilter, sortBy]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "MMM d, yyyy 'at' h:mm a");
    } catch {
      return "N/A";
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setPaymentFilter("all");
    setProductFilter("all");
    setSortBy("recent");
  };

  const hasActiveFilters =
    searchQuery ||
    paymentFilter !== "all" ||
    productFilter !== "all" ||
    sortBy !== "recent";

  // Calculate totals
  const totalCash = filteredSales
    .filter((s) => s.paymentMethod === "Cash")
    .reduce((sum, s) => sum + s.totalAmount, 0);
  const totalOnline = filteredSales
    .filter((s) => s.paymentMethod === "Online")
    .reduce((sum, s) => sum + s.totalAmount, 0);

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-slate-200 rounded w-full" />
            <div className="h-20 bg-slate-200 rounded" />
            <div className="h-20 bg-slate-200 rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-indigo-600" />
            Sales History
            <span className="text-sm font-normal text-slate-500">
              ({filteredSales.length} records)
            </span>
          </span>
          {sales.length > 0 && (
            <div className="flex items-center gap-3 text-sm font-normal">
              <span className="flex items-center gap-1.5 text-green-600">
                <Banknote className="h-4 w-4" />
                {formatCurrency(totalCash)}
              </span>
              <span className="flex items-center gap-1.5 text-blue-600">
                <CreditCard className="h-4 w-4" />
                {formatCurrency(totalOnline)}
              </span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {sales.length === 0 ? (
          <div className="py-12 text-center">
            <ShoppingBag className="h-12 w-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500">No sales yet</p>
          </div>
        ) : (
          <>
            {/* Search and Filters */}
            <div className="space-y-3 mb-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search by name or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowFilters(!showFilters)}
                  className={
                    showFilters ? "bg-indigo-50 border-indigo-300" : ""
                  }
                >
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </div>

              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-lg border">
                      <Select
                        value={sortBy}
                        onValueChange={(v) => setSortBy(v as SortOption)}
                      >
                        <SelectTrigger className="w-36 bg-white">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="recent">Most Recent</SelectItem>
                          <SelectItem value="oldest">Oldest First</SelectItem>
                          <SelectItem value="price_high">
                            Price: High to Low
                          </SelectItem>
                          <SelectItem value="price_low">
                            Price: Low to High
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      <Select
                        value={paymentFilter}
                        onValueChange={(v) =>
                          setPaymentFilter(v as PaymentFilter)
                        }
                      >
                        <SelectTrigger className="w-32 bg-white">
                          <SelectValue placeholder="Payment" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Payments</SelectItem>
                          <SelectItem value="Cash">Cash</SelectItem>
                          <SelectItem value="Online">Online</SelectItem>
                        </SelectContent>
                      </Select>

                      {uniqueProducts.length > 0 && (
                        <Select
                          value={productFilter}
                          onValueChange={setProductFilter}
                        >
                          <SelectTrigger className="w-40 bg-white">
                            <SelectValue placeholder="Product" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Products</SelectItem>
                            {uniqueProducts.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}

                      {hasActiveFilters && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearFilters}
                          className="gap-1 text-slate-500"
                        >
                          <X className="h-4 w-4" />
                          Clear
                        </Button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sales List */}
            {filteredSales.length === 0 ? (
              <div className="py-8 text-center">
                <Search className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500">No sales match your filters</p>
                <Button variant="link" onClick={clearFilters} className="mt-2">
                  Clear filters
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  <AnimatePresence mode="wait">
                    {paginatedSales.map((sale, index) => (
                      <motion.div
                        key={sale._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-semibold text-slate-800">
                              {sale.customer.name}
                            </p>
                            <p className="text-sm text-slate-500">
                              {sale.customer.phone}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                sale.paymentMethod === "Cash"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {sale.paymentMethod === "Cash" ? (
                                <Banknote className="h-3 w-3" />
                              ) : (
                                <CreditCard className="h-3 w-3" />
                              )}
                              {sale.paymentMethod}
                            </span>
                            <span className="text-lg font-bold text-slate-800">
                              {formatCurrency(sale.totalAmount)}
                            </span>
                          </div>
                        </div>

                        {/* Products */}
                        <div className="flex flex-wrap gap-2 mb-2">
                          {sale.items.map((item, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-2 bg-white rounded-lg px-2 py-1 border"
                            >
                              <div className="h-6 w-6 rounded overflow-hidden bg-slate-100 shrink-0">
                                {item.product?.photo ? (
                                  <img
                                    src={item.product.photo}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <ImageOff className="h-3 w-3 text-slate-300" />
                                  </div>
                                )}
                              </div>
                              <span className="text-xs text-slate-600">
                                {item.productTitle} ×{item.quantity}
                              </span>
                            </div>
                          ))}
                        </div>

                        <p className="text-xs text-slate-400">
                          {formatDate(sale.createdAt)}
                        </p>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <p className="text-sm text-slate-500">
                      Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{" "}
                      {Math.min(
                        currentPage * ITEMS_PER_PAGE,
                        filteredSales.length
                      )}{" "}
                      of {filteredSales.length}
                    </p>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          let pageNum: number;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          return (
                            <Button
                              key={pageNum}
                              variant={
                                currentPage === pageNum ? "default" : "outline"
                              }
                              size="icon"
                              className={`h-8 w-8 ${
                                currentPage === pageNum ? "bg-indigo-600" : ""
                              }`}
                              onClick={() => setCurrentPage(pageNum)}
                            >
                              {pageNum}
                            </Button>
                          );
                        }
                      )}
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
