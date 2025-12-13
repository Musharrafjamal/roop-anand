"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { TrendingUp, Filter } from "lucide-react";

interface DailySale {
  date: string;
  total: number;
  count: number;
}

interface SalesChartProps {
  data: DailySale[];
  filterLabel?: string;
  isFiltered?: boolean;
}

const chartConfig = {
  total: {
    label: "Sales",
    color: "hsl(142, 76%, 36%)",
  },
} satisfies ChartConfig;

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function formatCurrency(value: number): string {
  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`;
  } else if (value >= 1000) {
    return `₹${(value / 1000).toFixed(1)}K`;
  }
  return `₹${Math.round(value).toLocaleString()}`;
}

export function SalesChart({ data, filterLabel, isFiltered }: SalesChartProps) {
  const totalSales = data.reduce((sum, day) => sum + day.total, 0);
  const avgDailySales = data.length > 0 ? totalSales / data.length : 0;

  // Calculate trend (compare last 7 days to previous 7 days)
  const last7Days = data.slice(-7).reduce((sum, day) => sum + day.total, 0);
  const prev7Days = data
    .slice(-14, -7)
    .reduce((sum, day) => sum + day.total, 0);
  const trend =
    prev7Days > 0 ? Math.round(((last7Days - prev7Days) / prev7Days) * 100) : 0;

  return (
    <Card className="border-0 shadow-lg bg-white h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-slate-800">
              Sales Trend
            </CardTitle>
            <div className="flex items-center gap-2 mt-0.5">
              {isFiltered && filterLabel ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  <Filter className="w-3 h-3" />
                  {filterLabel}
                </span>
              ) : (
                <p className="text-sm text-slate-500">All time performance</p>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-800">
              {formatCurrency(totalSales)}
            </p>
            <div className="flex items-center gap-1 text-xs">
              <TrendingUp
                className={`w-3 h-3 ${
                  trend >= 0 ? "text-emerald-500" : "text-red-500"
                }`}
              />
              <span
                className={trend >= 0 ? "text-emerald-600" : "text-red-600"}
              >
                {trend >= 0 ? "+" : ""}
                {trend}% this week
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ChartContainer config={chartConfig} className="h-[320px] w-full">
          <AreaChart
            data={data}
            margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="hsl(142, 76%, 36%)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="100%"
                  stopColor="hsl(142, 76%, 36%)"
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e2e8f0"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#64748b", fontSize: 11 }}
              interval={4}
            />
            <YAxis
              tickFormatter={formatCurrency}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#64748b", fontSize: 11 }}
              width={60}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600">{name}:</span>
                      <span className="font-semibold">
                        {formatCurrency(value as number)}
                      </span>
                    </div>
                  )}
                  labelFormatter={(label) => formatDate(label as string)}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="hsl(142, 76%, 36%)"
              strokeWidth={2}
              fill="url(#salesGradient)"
            />
          </AreaChart>
        </ChartContainer>
        <div className="mt-4 flex items-center justify-center gap-6 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span>Avg Daily: {formatCurrency(avgDailySales)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
