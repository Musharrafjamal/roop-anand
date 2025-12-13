"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, Cell } from "recharts";
import { Clock } from "lucide-react";

interface RequestData {
  pendingStock: number;
  pendingMoney: number;
  approvedStock: number;
  approvedMoney: number;
  rejectedStock: number;
  rejectedMoney: number;
}

interface RequestsOverviewChartProps {
  data: RequestData;
}

const chartConfig = {
  pending: {
    label: "Pending",
    color: "hsl(45, 93%, 47%)",
  },
  approved: {
    label: "Approved",
    color: "hsl(142, 76%, 36%)",
  },
  rejected: {
    label: "Rejected",
    color: "hsl(0, 84%, 60%)",
  },
} satisfies ChartConfig;

export function RequestsOverviewChart({ data }: RequestsOverviewChartProps) {
  const chartData = [
    {
      name: "Stock",
      Pending: data.pendingStock,
      Approved: data.approvedStock,
      Rejected: data.rejectedStock,
    },
    {
      name: "Money",
      Pending: data.pendingMoney,
      Approved: data.approvedMoney,
      Rejected: data.rejectedMoney,
    },
  ];

  const totalPending = data.pendingStock + data.pendingMoney;

  return (
    <Card className="border-0 shadow-lg bg-white h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-slate-800">
                Requests Overview
              </CardTitle>
              <p className="text-xs text-slate-500">Stock & money requests</p>
            </div>
          </div>
          {totalPending > 0 && (
            <div className="px-2 py-1 bg-amber-100 rounded-full">
              <span className="text-xs font-medium text-amber-700">
                {totalPending} pending
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
          >
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#64748b", fontSize: 11 }}
            />
            <YAxis
              type="category"
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#334155", fontSize: 12, fontWeight: 500 }}
              width={50}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="Pending"
              fill="hsl(45, 93%, 47%)"
              radius={[0, 4, 4, 0]}
              barSize={16}
            />
            <Bar
              dataKey="Approved"
              fill="hsl(142, 76%, 36%)"
              radius={[0, 4, 4, 0]}
              barSize={16}
            />
            <Bar
              dataKey="Rejected"
              fill="hsl(0, 84%, 60%)"
              radius={[0, 4, 4, 0]}
              barSize={16}
            />
          </BarChart>
        </ChartContainer>

        <div className="flex items-center justify-center gap-4 mt-2">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-amber-400" />
            <span className="text-xs text-slate-600">Pending</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-emerald-500" />
            <span className="text-xs text-slate-600">Approved</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-red-500" />
            <span className="text-xs text-slate-600">Rejected</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
