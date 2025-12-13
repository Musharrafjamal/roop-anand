"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ShoppingCart,
  Package,
  Wallet,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  TrendingUp,
  Activity,
  Filter,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";

interface RecentSale {
  _id: string;
  employee: {
    fullName: string;
    profilePhoto?: string;
  };
  totalAmount: number;
  createdAt: string;
}

interface RecentStockRequest {
  _id: string;
  employee: {
    fullName: string;
    profilePhoto?: string;
  };
  product: {
    title: string;
  };
  quantity: number;
  status: "Pending" | "Approved" | "Rejected";
  createdAt: string;
}

interface RecentMoneyRequest {
  _id: string;
  employee: {
    fullName: string;
    profilePhoto?: string;
  };
  amount: number;
  method: "Cash" | "Online";
  status: "Pending" | "Approved" | "Rejected";
  createdAt: string;
}

interface RecentActivityProps {
  sales: RecentSale[];
  stockRequests: RecentStockRequest[];
  moneyRequests: RecentMoneyRequest[];
  filterLabel?: string;
  isFiltered?: boolean;
}

function formatCurrency(value: number): string {
  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`;
  } else if (value >= 1000) {
    return `₹${(value / 1000).toFixed(1)}K`;
  }
  return `₹${value.toLocaleString()}`;
}

function getStatusStyles(status: string) {
  switch (status) {
    case "Pending":
      return {
        bg: "bg-amber-50",
        text: "text-amber-600",
        border: "border-amber-200",
        icon: <Clock className="w-3.5 h-3.5" />,
      };
    case "Approved":
      return {
        bg: "bg-emerald-50",
        text: "text-emerald-600",
        border: "border-emerald-200",
        icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      };
    case "Rejected":
      return {
        bg: "bg-red-50",
        text: "text-red-600",
        border: "border-red-200",
        icon: <XCircle className="w-3.5 h-3.5" />,
      };
    default:
      return {
        bg: "bg-slate-50",
        text: "text-slate-600",
        border: "border-slate-200",
        icon: null,
      };
  }
}

type TabType = "sales" | "stock" | "money";

export function RecentActivity({
  sales,
  stockRequests,
  moneyRequests,
  filterLabel,
  isFiltered,
}: RecentActivityProps) {
  const [activeTab, setActiveTab] = useState<TabType>("sales");

  const tabs = [
    {
      id: "sales" as TabType,
      label: "Sales",
      icon: ShoppingCart,
      count: sales.length,
    },
    {
      id: "stock" as TabType,
      label: "Stock",
      icon: Package,
      count: stockRequests.filter((r) => r.status === "Pending").length,
    },
    {
      id: "money" as TabType,
      label: "Money",
      icon: Wallet,
      count: moneyRequests.filter((r) => r.status === "Pending").length,
    },
  ];

  const pendingCount =
    stockRequests.filter((r) => r.status === "Pending").length +
    moneyRequests.filter((r) => r.status === "Pending").length;

  return (
    <Card className="border-0 shadow-lg bg-white h-full flex flex-col">
      <CardHeader className="pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-slate-800">
                Recent Activity
              </CardTitle>
              {isFiltered && filterLabel ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded mt-0.5">
                  <Filter className="w-2.5 h-2.5" />
                  {filterLabel}
                </span>
              ) : (
                <p className="text-xs text-slate-500">Latest updates</p>
              )}
            </div>
          </div>
          {pendingCount > 0 && (
            <div className="px-2.5 py-1 bg-amber-100 rounded-full animate-pulse">
              <span className="text-xs font-semibold text-amber-700">
                {pendingCount} pending
              </span>
            </div>
          )}
        </div>

        {/* Premium Tab Navigation */}
        <div className="flex gap-1 mt-4 p-1 bg-slate-100 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count > 0 && tab.id !== "sales" && (
                <span
                  className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === tab.id
                      ? "bg-amber-100 text-amber-700"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="pt-4 flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
          {/* Sales Tab */}
          {activeTab === "sales" && (
            <>
              {sales.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 py-8">
                  <ShoppingCart className="w-10 h-10 mb-2 opacity-50" />
                  <p className="text-sm">No recent sales</p>
                </div>
              ) : (
                sales.map((sale, index) => (
                  <div
                    key={sale._id}
                    className="group relative flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-transparent border border-emerald-100 hover:border-emerald-200 hover:shadow-sm transition-all duration-200"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-800 truncate">
                          {sale.employee?.fullName || "Unknown Employee"}
                        </p>
                        {index === 0 && (
                          <span className="px-1.5 py-0.5 bg-emerald-500 text-white text-[9px] font-bold rounded uppercase">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        {formatDistanceToNow(new Date(sale.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-bold text-emerald-600">
                        +{formatCurrency(sale.totalAmount)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {/* Stock Requests Tab */}
          {activeTab === "stock" && (
            <>
              {stockRequests.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 py-8">
                  <Package className="w-10 h-10 mb-2 opacity-50" />
                  <p className="text-sm">No stock requests</p>
                </div>
              ) : (
                stockRequests.map((req) => {
                  const status = getStatusStyles(req.status);
                  return (
                    <div
                      key={req._id}
                      className={`group relative flex items-center gap-3 p-3 rounded-xl ${status.bg} border ${status.border} hover:shadow-sm transition-all duration-200`}
                    >
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-full bg-white/80 flex items-center justify-center ${status.text}`}
                      >
                        <Package className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">
                          {req.employee?.fullName || "Unknown"}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {req.product?.title || "Product"} × {req.quantity}
                        </p>
                      </div>
                      <div
                        className={`flex items-center gap-1 px-2 py-1 rounded-full ${status.bg} ${status.text}`}
                      >
                        {status.icon}
                        <span className="text-xs font-semibold">
                          {req.status}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}

          {/* Money Requests Tab */}
          {activeTab === "money" && (
            <>
              {moneyRequests.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 py-8">
                  <Wallet className="w-10 h-10 mb-2 opacity-50" />
                  <p className="text-sm">No money requests</p>
                </div>
              ) : (
                moneyRequests.map((req) => {
                  const status = getStatusStyles(req.status);
                  return (
                    <div
                      key={req._id}
                      className={`group relative flex items-center gap-3 p-3 rounded-xl ${status.bg} border ${status.border} hover:shadow-sm transition-all duration-200`}
                    >
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-full bg-white/80 flex items-center justify-center ${status.text}`}
                      >
                        <Wallet className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">
                          {req.employee?.fullName || "Unknown"}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                              req.method === "Cash"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {req.method}
                          </span>
                          <span>•</span>
                          <span>
                            {formatDistanceToNow(new Date(req.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-bold text-slate-800">
                          {formatCurrency(req.amount)}
                        </p>
                        <div
                          className={`flex items-center gap-1 justify-end ${status.text}`}
                        >
                          {status.icon}
                          <span className="text-xs font-medium">
                            {req.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}
        </div>

        {/* View All Link */}
        <div className="pt-3 mt-auto border-t border-slate-100">
          <Link
            href={activeTab === "sales" ? "/admin/sales" : "/admin/requests"}
            className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            View all {activeTab === "sales" ? "sales" : "requests"}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </CardContent>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </Card>
  );
}
