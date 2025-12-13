"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ClipboardList,
  Package,
  Wallet,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowUpRight,
  Filter,
} from "lucide-react";
import Link from "next/link";

interface RequestData {
  pendingStock: number;
  pendingMoney: number;
  approvedStock: number;
  approvedMoney: number;
  rejectedStock: number;
  rejectedMoney: number;
}

interface RequestStatusProps {
  data: RequestData;
  filterLabel?: string;
  isFiltered?: boolean;
}

export function RequestStatus({
  data,
  filterLabel,
  isFiltered,
}: RequestStatusProps) {
  const totalStock =
    data.pendingStock + data.approvedStock + data.rejectedStock;
  const totalMoney =
    data.pendingMoney + data.approvedMoney + data.rejectedMoney;
  const totalPending = data.pendingStock + data.pendingMoney;

  const stockApprovalRate =
    totalStock > 0 ? Math.round((data.approvedStock / totalStock) * 100) : 0;
  const moneyApprovalRate =
    totalMoney > 0 ? Math.round((data.approvedMoney / totalMoney) * 100) : 0;

  return (
    <Card className="border-0 shadow-lg bg-white h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <ClipboardList className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-slate-800">
                Request Status
              </CardTitle>
              {isFiltered && filterLabel ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded mt-0.5">
                  <Filter className="w-2.5 h-2.5" />
                  {filterLabel}
                </span>
              ) : (
                <p className="text-xs text-slate-500">Approval overview</p>
              )}
            </div>
          </div>
          <Link
            href="/admin/requests"
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowUpRight className="w-4 h-4 text-slate-400" />
          </Link>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Pending Alert */}
        {totalPending > 0 && (
          <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">
                {totalPending} Pending Request{totalPending !== 1 ? "s" : ""}
              </p>
              <p className="text-xs text-amber-600">
                {data.pendingStock} stock, {data.pendingMoney} money
              </p>
            </div>
          </div>
        )}

        {/* Stock Requests */}
        <div className="p-4 bg-gradient-to-r from-indigo-50 to-transparent rounded-xl border border-indigo-100">
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-semibold text-slate-700">
              Stock Requests
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 bg-white rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Clock className="w-3 h-3 text-amber-500" />
              </div>
              <p className="text-lg font-bold text-slate-800">
                {data.pendingStock}
              </p>
              <p className="text-[10px] text-slate-500 uppercase">Pending</p>
            </div>
            <div className="text-center p-2 bg-white rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              </div>
              <p className="text-lg font-bold text-slate-800">
                {data.approvedStock}
              </p>
              <p className="text-[10px] text-slate-500 uppercase">Approved</p>
            </div>
            <div className="text-center p-2 bg-white rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <XCircle className="w-3 h-3 text-red-500" />
              </div>
              <p className="text-lg font-bold text-slate-800">
                {data.rejectedStock}
              </p>
              <p className="text-[10px] text-slate-500 uppercase">Rejected</p>
            </div>
          </div>
          {totalStock > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${stockApprovalRate}%` }}
                />
              </div>
              <span className="text-xs font-medium text-emerald-600">
                {stockApprovalRate}% approved
              </span>
            </div>
          )}
        </div>

        {/* Money Requests */}
        <div className="p-4 bg-gradient-to-r from-emerald-50 to-transparent rounded-xl border border-emerald-100">
          <div className="flex items-center gap-2 mb-3">
            <Wallet className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-semibold text-slate-700">
              Money Requests
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 bg-white rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Clock className="w-3 h-3 text-amber-500" />
              </div>
              <p className="text-lg font-bold text-slate-800">
                {data.pendingMoney}
              </p>
              <p className="text-[10px] text-slate-500 uppercase">Pending</p>
            </div>
            <div className="text-center p-2 bg-white rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              </div>
              <p className="text-lg font-bold text-slate-800">
                {data.approvedMoney}
              </p>
              <p className="text-[10px] text-slate-500 uppercase">Approved</p>
            </div>
            <div className="text-center p-2 bg-white rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <XCircle className="w-3 h-3 text-red-500" />
              </div>
              <p className="text-lg font-bold text-slate-800">
                {data.rejectedMoney}
              </p>
              <p className="text-[10px] text-slate-500 uppercase">Rejected</p>
            </div>
          </div>
          {totalMoney > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${moneyApprovalRate}%` }}
                />
              </div>
              <span className="text-xs font-medium text-emerald-600">
                {moneyApprovalRate}% approved
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
