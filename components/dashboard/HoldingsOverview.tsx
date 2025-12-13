"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingUp, Users, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface HoldingsData {
  total: number;
  cash: number;
  online: number;
}

interface EmployeeHolding {
  name: string;
  cash: number;
  online: number;
  total: number;
  profilePhoto?: string;
}

interface HoldingsOverviewProps {
  data: HoldingsData;
  topHolders?: EmployeeHolding[];
}

function formatCurrency(value: number): string {
  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`;
  } else if (value >= 1000) {
    return `₹${(value / 1000).toFixed(1)}K`;
  }
  return `₹${value.toLocaleString()}`;
}

export function HoldingsOverview({
  data,
  topHolders = [],
}: HoldingsOverviewProps) {
  const total = data.total || data.cash + data.online;
  const cashPercent = total > 0 ? Math.round((data.cash / total) * 100) : 0;
  const onlinePercent = total > 0 ? Math.round((data.online / total) * 100) : 0;

  return (
    <Card className="border-0 shadow-lg bg-white h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-slate-800">
                Holdings Overview
              </CardTitle>
              <p className="text-xs text-slate-500">
                Employee money distribution
              </p>
            </div>
          </div>
          <Link
            href="/admin/employees"
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowUpRight className="w-4 h-4 text-slate-400" />
          </Link>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Total Holdings */}
        <div className="text-center py-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
          <p className="text-3xl font-bold text-slate-800">
            {formatCurrency(total)}
          </p>
          <p className="text-sm text-slate-500 mt-1">Total Holdings</p>
        </div>

        {/* Cash vs Online Breakdown */}
        <div className="space-y-3">
          {/* Cash */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-600 font-medium">Cash</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800">
                  {formatCurrency(data.cash)}
                </span>
                <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                  {cashPercent}%
                </span>
              </div>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${cashPercent}%` }}
              />
            </div>
          </div>

          {/* Online */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-slate-600 font-medium">Online</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800">
                  {formatCurrency(data.online)}
                </span>
                <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                  {onlinePercent}%
                </span>
              </div>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${onlinePercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Top Holders */}
        {topHolders.length > 0 && (
          <div className="pt-3 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Top Holders
            </p>
            <div className="space-y-2">
              {topHolders.slice(0, 3).map((holder, index) => (
                <div
                  key={holder.name}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                        index === 0
                          ? "bg-amber-500"
                          : index === 1
                          ? "bg-slate-400"
                          : "bg-orange-400"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium text-slate-700 truncate max-w-[100px]">
                      {holder.name}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-slate-800">
                    {formatCurrency(holder.total)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
