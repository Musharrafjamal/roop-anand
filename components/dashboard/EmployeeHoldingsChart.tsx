"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Pie, PieChart, Cell } from "recharts";
import { Wallet } from "lucide-react";

interface EmployeeHolding {
  name: string;
  cash: number;
  online: number;
  total: number;
  profilePhoto?: string;
}

interface EmployeeHoldingsChartProps {
  data: EmployeeHolding[];
}

const COLORS = [
  "hsl(221, 83%, 53%)", // Blue
  "hsl(142, 76%, 36%)", // Green
  "hsl(262, 83%, 58%)", // Purple
  "hsl(24, 95%, 53%)", // Orange
  "hsl(340, 82%, 52%)", // Pink
  "hsl(48, 96%, 53%)", // Yellow
  "hsl(173, 80%, 40%)", // Teal
  "hsl(291, 64%, 42%)", // Violet
  "hsl(0, 84%, 60%)", // Red
  "hsl(199, 89%, 48%)", // Sky
];

function formatCurrency(value: number): string {
  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`;
  } else if (value >= 1000) {
    return `₹${(value / 1000).toFixed(1)}K`;
  }
  return `₹${value}`;
}

export function EmployeeHoldingsChart({ data }: EmployeeHoldingsChartProps) {
  const totalHoldings = data.reduce((sum, emp) => sum + emp.total, 0);
  const totalCash = data.reduce((sum, emp) => sum + emp.cash, 0);
  const totalOnline = data.reduce((sum, emp) => sum + emp.online, 0);

  // Prepare data for pie chart
  const chartData = data.map((emp, index) => ({
    name: emp.name,
    value: emp.total,
    fill: COLORS[index % COLORS.length],
  }));

  // Build chart config dynamically
  const chartConfig: ChartConfig = data.reduce((acc, emp, index) => {
    acc[emp.name] = {
      label: emp.name,
      color: COLORS[index % COLORS.length],
    };
    return acc;
  }, {} as ChartConfig);

  return (
    <Card className="border-0 shadow-lg h-full bg-white">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-blue-500" />
            <CardTitle className="text-lg font-semibold text-slate-800">
              Employee Holdings
            </CardTitle>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-slate-800">
              {formatCurrency(totalHoldings)}
            </p>
            <p className="text-xs text-slate-500">Total held</p>
          </div>
        </div>
        <p className="text-sm text-slate-500">
          Money distribution across employees
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        {data.length === 0 ? (
          <div className="h-[280px] flex items-center justify-center text-slate-400">
            No holdings data available
          </div>
        ) : (
          <>
            <ChartContainer config={chartConfig} className="h-[260px] w-full">
              <PieChart>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name, props) => {
                        const emp = data.find(
                          (e) => e.name === props.payload.name
                        );
                        const percentage =
                          totalHoldings > 0
                            ? (
                                ((value as number) / totalHoldings) *
                                100
                              ).toFixed(1)
                            : 0;
                        return (
                          <div className="space-y-1">
                            <div className="font-medium text-slate-800">
                              {props.payload.name}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-600">Total:</span>
                              <span className="font-semibold">
                                {formatCurrency(value as number)}
                              </span>
                              <span className="text-slate-400">
                                ({percentage}%)
                              </span>
                            </div>
                            {emp && (
                              <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                                <span>Cash: {formatCurrency(emp.cash)}</span>
                                <span>
                                  Online: {formatCurrency(emp.online)}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      }}
                    />
                  }
                />
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>

            {/* Summary stats */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="p-3 bg-emerald-50 rounded-lg text-center">
                <p className="text-xs text-emerald-600 font-medium">Cash</p>
                <p className="text-lg font-bold text-emerald-700">
                  {formatCurrency(totalCash)}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg text-center">
                <p className="text-xs text-blue-600 font-medium">Online</p>
                <p className="text-lg font-bold text-blue-700">
                  {formatCurrency(totalOnline)}
                </p>
              </div>
            </div>

            {/* Top holders list */}
            <div className="mt-4 space-y-2">
              {data.slice(0, 3).map((emp, index) => (
                <div
                  key={emp.name}
                  className="flex items-center justify-between p-2 bg-slate-50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm font-medium text-slate-700 truncate max-w-[120px]">
                      {emp.name}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-slate-800">
                    {formatCurrency(emp.total)}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
