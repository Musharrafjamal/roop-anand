"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, Cell } from "recharts";
import { Trophy, Filter } from "lucide-react";

interface TopEmployee {
  _id: string;
  name: string;
  totalSales: number;
  salesCount: number;
  profilePhoto?: string;
}

interface TopEmployeesChartProps {
  data: TopEmployee[];
  filterLabel?: string;
  isFiltered?: boolean;
}

const chartConfig = {
  totalSales: {
    label: "Total Sales",
    color: "hsl(221, 83%, 53%)",
  },
} satisfies ChartConfig;

const COLORS = [
  "hsl(45, 93%, 47%)", // Gold
  "hsl(0, 0%, 75%)", // Silver
  "hsl(30, 50%, 50%)", // Bronze
  "hsl(221, 83%, 53%)", // Blue
  "hsl(262, 83%, 58%)", // Purple
];

function formatCurrency(value: number): string {
  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`;
  } else if (value >= 1000) {
    return `₹${(value / 1000).toFixed(1)}K`;
  }
  return `₹${value}`;
}

export function TopEmployeesChart({
  data,
  filterLabel,
  isFiltered,
}: TopEmployeesChartProps) {
  const maxSales = Math.max(...data.map((d) => d.totalSales), 0);

  return (
    <Card className="border-0 shadow-lg h-full bg-white">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <CardTitle className="text-lg font-semibold text-slate-800">
            Top Performers
          </CardTitle>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          {isFiltered && filterLabel ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
              <Filter className="w-3 h-3" />
              {filterLabel}
            </span>
          ) : (
            <p className="text-sm text-slate-500">Top 5 employees by sales</p>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {data.length === 0 ? (
          <div className="h-[320px] flex items-center justify-center text-slate-400">
            No sales data available
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[320px] w-full">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
            >
              <XAxis
                type="number"
                tickFormatter={formatCurrency}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#64748b", fontSize: 11 }}
                domain={[0, maxSales * 1.1]}
              />
              <YAxis
                type="category"
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#334155", fontSize: 12, fontWeight: 500 }}
                width={100}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name, props: any) => (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-600">Sales:</span>
                          <span className="font-semibold">
                            {formatCurrency(value as number)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span>{props.payload.salesCount} transactions</span>
                        </div>
                      </div>
                    )}
                  />
                }
              />
              <Bar dataKey="totalSales" radius={[0, 6, 6, 0]} barSize={24}>
                {data.map((entry, index) => (
                  <Cell key={entry._id} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
        {data.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            {data.slice(0, 3).map((employee, index) => (
              <div
                key={employee._id}
                className={`p-2 rounded-lg ${
                  index === 0
                    ? "bg-amber-50"
                    : index === 1
                    ? "bg-slate-100"
                    : "bg-orange-50"
                }`}
              >
                <p className="text-xs font-medium text-slate-600 truncate">
                  {employee.name}
                </p>
                <p className="text-sm font-bold text-slate-800">
                  {formatCurrency(employee.totalSales)}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
