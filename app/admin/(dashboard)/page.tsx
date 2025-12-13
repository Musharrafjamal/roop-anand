"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { TopEmployeesChart } from "@/components/dashboard/TopEmployeesChart";
import { TopProductsChart } from "@/components/dashboard/TopProductsChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { HoldingsOverview } from "@/components/dashboard/HoldingsOverview";
import { QuickInsights } from "@/components/dashboard/QuickInsights";
import { RequestStatus } from "@/components/dashboard/RequestStatus";
import {
  DateFilter,
  type DateRange,
  getDateRangeParams,
  getDateRangeLabel,
} from "@/components/dashboard/DateFilter";

interface DashboardData {
  statistics: {
    filteredSales?: {
      total: number;
      count: number;
      previousTotal: number;
      percentChange: number;
    };
    todaySales: {
      total: number;
      count: number;
      yesterdayTotal: number;
      percentChange: number;
    };
    monthSales: {
      total: number;
      count: number;
      lastMonthTotal: number;
      percentChange: number;
    };
    holdings: {
      total: number;
      cash: number;
      online: number;
    };
    pendingRequests: {
      stock: number;
      money: number;
      total: number;
    };
    employees: {
      total: number;
      online: number;
    };
    products: {
      total: number;
      lowStock: number;
    };
  };
  charts: {
    topEmployees: Array<{
      _id: string;
      name: string;
      totalSales: number;
      salesCount: number;
      profilePhoto?: string;
    }>;
    dailySales: Array<{
      date: string;
      total: number;
      count: number;
    }>;
    employeeHoldings: Array<{
      name: string;
      cash: number;
      online: number;
      total: number;
      profilePhoto?: string;
    }>;
    topProducts: Array<{
      _id: string;
      name: string;
      photo?: string;
      totalQuantity: number;
      totalRevenue: number;
    }>;
    requestsOverview: {
      pendingStock: number;
      pendingMoney: number;
      approvedStock: number;
      approvedMoney: number;
      rejectedStock: number;
      rejectedMoney: number;
    };
  };
  recentActivity: {
    sales: Array<{
      _id: string;
      employee: {
        fullName: string;
        profilePhoto?: string;
      };
      totalAmount: number;
      createdAt: string;
    }>;
    stockRequests: Array<{
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
    }>;
    moneyRequests: Array<{
      _id: string;
      employee: {
        fullName: string;
        profilePhoto?: string;
      };
      amount: number;
      method: "Cash" | "Online";
      status: "Pending" | "Approved" | "Rejected";
      createdAt: string;
    }>;
  };
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Stats skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-28 bg-slate-200 rounded-xl" />
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 h-[400px] bg-slate-200 rounded-xl" />
        <div className="h-[400px] bg-slate-200 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-[400px] bg-slate-200 rounded-xl" />
        <div className="h-[400px] bg-slate-200 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div className="h-[380px] bg-slate-200 rounded-xl" />
        <div className="h-[380px] bg-slate-200 rounded-xl" />
        <div className="h-[380px] bg-slate-200 rounded-xl" />
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>("all");

  const fetchDashboardData = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        setError(null);

        // Build URL with date params
        const params = getDateRangeParams(dateRange);
        const url = new URL("/api/admin/dashboard", window.location.origin);
        if (params.startDate)
          url.searchParams.set("startDate", params.startDate);
        if (params.endDate) url.searchParams.set("endDate", params.endDate);

        const response = await fetch(url.toString());
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const dashboardData = await response.json();
        setData(dashboardData);
        setLastUpdated(new Date());
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [dateRange]
  );

  useEffect(() => {
    fetchDashboardData();

    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
  };

  const formatLastUpdated = () => {
    if (!lastUpdated) return "";
    return lastUpdated.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-4 lg:p-6 bg-slate-50 min-h-screen">
      <div className="max-w-[1920px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-sm text-slate-500">
              Welcome back, {session?.user?.email?.split("@")[0] || "Admin"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <DateFilter value={dateRange} onChange={handleDateRangeChange} />
            {lastUpdated && (
              <span className="text-xs text-slate-400 hidden sm:inline">
                Updated {formatLastUpdated()}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchDashboardData(true)}
              disabled={refreshing}
              className="gap-2 bg-white"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-700 text-sm">{error}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchDashboardData()}
              className="mt-2 text-red-600 hover:text-red-700"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Loading State */}
        {loading && <DashboardSkeleton />}

        {/* Dashboard Content */}
        {!loading && data && (
          <div className="space-y-6">
            {/* Statistics Cards */}
            <section>
              <DashboardStats
                statistics={data.statistics}
                filterLabel={getDateRangeLabel(dateRange)}
                isFiltered={dateRange !== "all"}
              />
            </section>

            {/* Main Charts Row - Sales Trend + Recent Activity */}
            <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2">
                <SalesChart
                  data={data.charts.dailySales}
                  filterLabel={getDateRangeLabel(dateRange)}
                  isFiltered={dateRange !== "all"}
                />
              </div>
              <div className="min-h-[400px]">
                <RecentActivity
                  sales={data.recentActivity.sales}
                  stockRequests={data.recentActivity.stockRequests}
                  moneyRequests={data.recentActivity.moneyRequests}
                  filterLabel={getDateRangeLabel(dateRange)}
                  isFiltered={dateRange !== "all"}
                />
              </div>
            </section>

            {/* Employee & Product Performance Row */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="min-h-[400px]">
                <TopEmployeesChart
                  data={data.charts.topEmployees}
                  filterLabel={getDateRangeLabel(dateRange)}
                  isFiltered={dateRange !== "all"}
                />
              </div>
              <div className="min-h-[400px]">
                <TopProductsChart
                  data={data.charts.topProducts}
                  filterLabel={getDateRangeLabel(dateRange)}
                  isFiltered={dateRange !== "all"}
                />
              </div>
            </section>

            {/* Insights, Holdings & Requests Row */}
            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <div>
                <HoldingsOverview
                  data={data.statistics.holdings}
                  topHolders={data.charts.employeeHoldings}
                />
              </div>
              <div>
                <QuickInsights
                  lowStockProducts={data.statistics.products.lowStock}
                  pendingRequests={data.statistics.pendingRequests.total}
                  todaySalesCount={data.statistics.todaySales.count}
                  monthlyGrowth={data.statistics.monthSales.percentChange}
                />
              </div>
              <div className="md:col-span-2 xl:col-span-1">
                <RequestStatus
                  data={data.charts.requestsOverview}
                  filterLabel={getDateRangeLabel(dateRange)}
                  isFiltered={dateRange !== "all"}
                />
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
