"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Lightbulb,
  AlertTriangle,
  TrendingUp,
  Package,
  Clock,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

interface QuickInsightsProps {
  lowStockProducts: number;
  pendingRequests: number;
  todaySalesCount: number;
  monthlyGrowth: number;
}

export function QuickInsights({
  lowStockProducts,
  pendingRequests,
  todaySalesCount,
  monthlyGrowth,
}: QuickInsightsProps) {
  const insights = [
    {
      id: "sales",
      icon: TrendingUp,
      title: "Today's Performance",
      value: todaySalesCount,
      suffix: "sales",
      description: todaySalesCount > 0 ? "Keep it up!" : "No sales yet",
      color: "emerald",
      bgGradient: "from-emerald-500 to-teal-600",
      link: "/admin/sales",
    },
    {
      id: "growth",
      icon: Sparkles,
      title: "Monthly Growth",
      value: monthlyGrowth,
      suffix: "%",
      description: monthlyGrowth >= 0 ? "vs last month" : "Needs attention",
      color: monthlyGrowth >= 0 ? "blue" : "amber",
      bgGradient:
        monthlyGrowth >= 0
          ? "from-blue-500 to-indigo-600"
          : "from-amber-500 to-orange-600",
      link: "/admin/sales",
    },
    {
      id: "pending",
      icon: Clock,
      title: "Pending Requests",
      value: pendingRequests,
      suffix: "awaiting",
      description: pendingRequests > 0 ? "Action needed" : "All clear!",
      color: pendingRequests > 0 ? "amber" : "emerald",
      bgGradient:
        pendingRequests > 0
          ? "from-amber-500 to-orange-600"
          : "from-emerald-500 to-teal-600",
      link: "/admin/requests",
      urgent: pendingRequests > 5,
    },
    {
      id: "stock",
      icon: Package,
      title: "Low Stock Alert",
      value: lowStockProducts,
      suffix: "products",
      description:
        lowStockProducts > 0 ? "Need restocking" : "Stock is healthy",
      color: lowStockProducts > 0 ? "red" : "emerald",
      bgGradient:
        lowStockProducts > 0
          ? "from-red-500 to-rose-600"
          : "from-emerald-500 to-teal-600",
      link: "/admin/products",
      urgent: lowStockProducts > 0,
    },
  ];

  return (
    <Card className="border-0 shadow-lg bg-white h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Lightbulb className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-slate-800">
              Quick Insights
            </CardTitle>
            <p className="text-xs text-slate-500">Key metrics at a glance</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {insights.map((insight) => (
          <Link
            key={insight.id}
            href={insight.link}
            className={`block p-3 rounded-xl border transition-all duration-200 hover:shadow-md ${
              insight.urgent
                ? "border-red-200 bg-red-50/50 hover:border-red-300"
                : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg bg-gradient-to-br ${insight.bgGradient} flex items-center justify-center shadow-sm`}
              >
                <insight.icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-600">
                    {insight.title}
                  </p>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-xl font-bold text-slate-800">
                    {insight.id === "growth" && insight.value >= 0 ? "+" : ""}
                    {insight.value}
                  </span>
                  <span className="text-xs text-slate-500">
                    {insight.suffix}
                  </span>
                </div>
                <p
                  className={`text-xs mt-0.5 ${
                    insight.urgent
                      ? "text-red-600 font-medium"
                      : "text-slate-500"
                  }`}
                >
                  {insight.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
