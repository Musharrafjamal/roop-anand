"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  IndianRupee,
  CalendarDays,
  Wallet,
  Clock,
  Users,
  AlertTriangle,
  Filter,
} from "lucide-react";
import Link from "next/link";

interface FilteredSales {
  total: number;
  count: number;
  previousTotal: number;
  percentChange: number;
}

interface StatisticsData {
  filteredSales?: FilteredSales;
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
}

interface DashboardStatsProps {
  statistics: StatisticsData;
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

interface StatCardProps {
  title: string;
  value: string;
  subValue?: string;
  change?: number;
  changeLabel?: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  href?: string;
  alert?: boolean;
  filterBadge?: string;
}

function StatCard({
  title,
  value,
  subValue,
  change,
  changeLabel,
  icon: Icon,
  iconColor,
  iconBg,
  href,
  alert,
  filterBadge,
}: StatCardProps) {
  const content = (
    <Card
      className={`border-0 shadow-md bg-white hover:shadow-lg transition-all duration-200 ${
        href ? "cursor-pointer hover:scale-[1.02]" : ""
      }`}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div
                className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center`}
              >
                <Icon className={`w-4.5 h-4.5 ${iconColor}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{title}</p>
                {filterBadge && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <Filter className="w-2.5 h-2.5 text-indigo-500" />
                    <span className="text-[10px] font-medium text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                      {filterBadge}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{value}</p>
              {subValue && (
                <p className="text-xs text-slate-500 mt-0.5">{subValue}</p>
              )}
            </div>
          </div>
          <div className="text-right">
            {change !== undefined && (
              <div
                className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                  change >= 0
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {change >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>{Math.abs(change)}%</span>
              </div>
            )}
            {alert && (
              <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse ml-auto" />
            )}
            {changeLabel && (
              <p className="text-[10px] text-slate-400 mt-1">{changeLabel}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

export function DashboardStats({
  statistics,
  filterLabel,
  isFiltered,
}: DashboardStatsProps) {
  const showFilterBadge = isFiltered && filterLabel;

  // Use filtered sales if available, otherwise use today's sales
  const primarySales = statistics.filteredSales || statistics.todaySales;
  const primaryTitle = isFiltered ? "Sales" : "Today's Sales";
  const primaryChangeLabel = isFiltered ? "vs previous period" : "vs yesterday";

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <StatCard
        title={primaryTitle}
        value={formatCurrency(primarySales.total)}
        subValue={`${primarySales.count} orders`}
        change={primarySales.percentChange}
        changeLabel={primaryChangeLabel}
        icon={IndianRupee}
        iconColor="text-emerald-600"
        iconBg="bg-emerald-100"
        href="/admin/sales"
        filterBadge={showFilterBadge ? filterLabel : undefined}
      />
      <StatCard
        title="This Month"
        value={formatCurrency(statistics.monthSales.total)}
        subValue={`${statistics.monthSales.count} orders`}
        change={statistics.monthSales.percentChange}
        changeLabel="vs last month"
        icon={CalendarDays}
        iconColor="text-blue-600"
        iconBg="bg-blue-100"
        href="/admin/sales"
      />
      <StatCard
        title="Holdings"
        value={formatCurrency(statistics.holdings.total)}
        subValue={`Cash: ${formatCurrency(statistics.holdings.cash)}`}
        icon={Wallet}
        iconColor="text-violet-600"
        iconBg="bg-violet-100"
      />
      <StatCard
        title="Pending"
        value={statistics.pendingRequests.total.toString()}
        subValue={`${statistics.pendingRequests.stock} stock · ${statistics.pendingRequests.money} money`}
        icon={Clock}
        iconColor="text-amber-600"
        iconBg="bg-amber-100"
        href="/admin/requests"
        alert={statistics.pendingRequests.total > 0}
        filterBadge={showFilterBadge ? filterLabel : undefined}
      />
      <StatCard
        title="Employees"
        value={statistics.employees.total.toString()}
        subValue={`${statistics.employees.online} online`}
        icon={Users}
        iconColor="text-indigo-600"
        iconBg="bg-indigo-100"
        href="/admin/employees"
      />
      <StatCard
        title="Low Stock"
        value={statistics.products.lowStock.toString()}
        subValue={`of ${statistics.products.total} products`}
        icon={AlertTriangle}
        iconColor={
          statistics.products.lowStock > 0 ? "text-red-600" : "text-emerald-600"
        }
        iconBg={
          statistics.products.lowStock > 0 ? "bg-red-100" : "bg-emerald-100"
        }
        href="/admin/products"
        alert={statistics.products.lowStock > 0}
      />
    </div>
  );
}
