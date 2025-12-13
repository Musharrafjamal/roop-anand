"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, Cell } from "recharts";
import { ShoppingBag, Filter } from "lucide-react";

interface TopProduct {
  _id: string;
  name: string;
  photo?: string;
  totalQuantity: number;
  totalRevenue: number;
}

interface TopProductsChartProps {
  data: TopProduct[];
  filterLabel?: string;
  isFiltered?: boolean;
}

const chartConfig = {
  totalRevenue: {
    label: "Revenue",
    color: "hsl(262, 83%, 58%)",
  },
} satisfies ChartConfig;

const COLORS = [
  "hsl(262, 83%, 58%)", // Purple
  "hsl(280, 83%, 58%)", // Magenta
  "hsl(300, 70%, 50%)", // Pink
  "hsl(320, 70%, 55%)", // Rose
  "hsl(340, 70%, 55%)", // Red-Pink
];

function formatCurrency(value: number): string {
  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`;
  } else if (value >= 1000) {
    return `₹${(value / 1000).toFixed(1)}K`;
  }
  return `₹${value}`;
}

function truncateName(name: string, maxLength: number = 15): string {
  if (name.length <= maxLength) return name;
  return name.substring(0, maxLength) + "...";
}

export function TopProductsChart({
  data,
  filterLabel,
  isFiltered,
}: TopProductsChartProps) {
  const maxRevenue = Math.max(...data.map((d) => d.totalRevenue), 0);
  const totalRevenue = data.reduce((sum, p) => sum + p.totalRevenue, 0);

  return (
    <Card className="border-0 shadow-lg h-full bg-white">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-violet-500" />
            <CardTitle className="text-lg font-semibold text-slate-800">
              Top Products
            </CardTitle>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-slate-800">
              {formatCurrency(totalRevenue)}
            </p>
            <p className="text-xs text-slate-500">Total revenue</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          {isFiltered && filterLabel ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
              <Filter className="w-3 h-3" />
              {filterLabel}
            </span>
          ) : (
            <p className="text-sm text-slate-500">Top 5 products by revenue</p>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {data.length === 0 ? (
          <div className="h-[320px] flex items-center justify-center text-slate-400">
            No product sales data available
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
                domain={[0, maxRevenue * 1.1]}
              />
              <YAxis
                type="category"
                dataKey="name"
                tickFormatter={(value) => truncateName(value)}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#334155", fontSize: 12, fontWeight: 500 }}
                width={100}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name, props) => (
                      <div className="space-y-1">
                        <div className="font-medium text-slate-800">
                          {props.payload.name}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-600">Revenue:</span>
                          <span className="font-semibold">
                            {formatCurrency(value as number)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span>{props.payload.totalQuantity} units sold</span>
                        </div>
                      </div>
                    )}
                  />
                }
              />
              <Bar dataKey="totalRevenue" radius={[0, 6, 6, 0]} barSize={24}>
                {data.map((entry, index) => (
                  <Cell key={entry._id} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
        {data.length > 0 && (
          <div className="mt-4 space-y-2">
            {data.slice(0, 3).map((product, index) => (
              <div
                key={product._id}
                className="flex items-center justify-between p-2 bg-slate-50 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400">
                    #{index + 1}
                  </span>
                  <span className="text-sm font-medium text-slate-700 truncate max-w-[150px]">
                    {product.name}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-800">
                    {formatCurrency(product.totalRevenue)}
                  </p>
                  <p className="text-xs text-slate-500">
                    {product.totalQuantity} sold
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
