"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Pie, PieChart, Cell } from "recharts";
import { CreditCard } from "lucide-react";

interface PaymentData {
  cash: number;
  online: number;
}

interface PaymentMethodChartProps {
  data: PaymentData;
}

const chartConfig = {
  cash: {
    label: "Cash",
    color: "hsl(142, 76%, 36%)",
  },
  online: {
    label: "Online",
    color: "hsl(221, 83%, 53%)",
  },
} satisfies ChartConfig;

function formatCurrency(value: number): string {
  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`;
  } else if (value >= 1000) {
    return `₹${(value / 1000).toFixed(1)}K`;
  }
  return `₹${value.toLocaleString()}`;
}

export function PaymentMethodChart({ data }: PaymentMethodChartProps) {
  const total = data.cash + data.online;
  const cashPercent = total > 0 ? Math.round((data.cash / total) * 100) : 0;
  const onlinePercent = total > 0 ? Math.round((data.online / total) * 100) : 0;

  const chartData = [
    { name: "Cash", value: data.cash, fill: "hsl(142, 76%, 36%)" },
    { name: "Online", value: data.online, fill: "hsl(221, 83%, 53%)" },
  ];

  return (
    <Card className="border-0 shadow-lg bg-white h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-slate-800">
              Payment Methods
            </CardTitle>
            <p className="text-xs text-slate-500">Holdings breakdown</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {total === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-slate-400">
            No holdings data
          </div>
        ) : (
          <>
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <PieChart>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => (
                        <span className="font-semibold">
                          {formatCurrency(value as number)}
                        </span>
                      )}
                    />
                  }
                />
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="flex items-center gap-2 p-2.5 bg-emerald-50 rounded-lg">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <div className="flex-1">
                  <p className="text-xs text-slate-600">Cash</p>
                  <p className="text-sm font-bold text-slate-800">
                    {formatCurrency(data.cash)}
                  </p>
                  <p className="text-xs text-emerald-600">{cashPercent}%</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2.5 bg-blue-50 rounded-lg">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <div className="flex-1">
                  <p className="text-xs text-slate-600">Online</p>
                  <p className="text-sm font-bold text-slate-800">
                    {formatCurrency(data.online)}
                  </p>
                  <p className="text-xs text-blue-600">{onlinePercent}%</p>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
