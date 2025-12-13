"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export type DateRange =
  | "today"
  | "yesterday"
  | "7days"
  | "30days"
  | "thisMonth"
  | "lastMonth"
  | "all";

interface DateFilterProps {
  value: DateRange;
  onChange: (value: DateRange) => void;
}

export const dateRangeLabels: Record<DateRange, string> = {
  today: "Today",
  yesterday: "Yesterday",
  "7days": "Last 7 Days",
  "30days": "Last 30 Days",
  thisMonth: "This Month",
  lastMonth: "Last Month",
  all: "All Time",
};

export function getDateRangeLabel(range: DateRange): string {
  return dateRangeLabels[range];
}

export function DateFilter({ value, onChange }: DateFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const options: DateRange[] = [
    "today",
    "yesterday",
    "7days",
    "30days",
    "thisMonth",
    "lastMonth",
    "all",
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        size="sm"
        className="gap-2 bg-white min-w-[160px] justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-slate-500" />
          <span>{dateRangeLabels[value]}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </Button>

      {isOpen && (
        <Card className="absolute top-full mt-2 right-0 z-50 w-48 border-0 shadow-lg">
          <CardContent className="p-1">
            {options.map((option) => (
              <button
                key={option}
                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                  value === option
                    ? "bg-indigo-50 text-indigo-700 font-medium"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
              >
                {dateRangeLabels[option]}
              </button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function getDateRangeParams(range: DateRange): {
  startDate?: string;
  endDate?: string;
} {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (range) {
    case "today": {
      return {
        startDate: today.toISOString(),
        endDate: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      };
    }
    case "yesterday": {
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      return {
        startDate: yesterday.toISOString(),
        endDate: today.toISOString(),
      };
    }
    case "7days": {
      const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      return {
        startDate: sevenDaysAgo.toISOString(),
        endDate: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      };
    }
    case "30days": {
      const thirtyDaysAgo = new Date(
        today.getTime() - 30 * 24 * 60 * 60 * 1000
      );
      return {
        startDate: thirtyDaysAgo.toISOString(),
        endDate: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      };
    }
    case "thisMonth": {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      return {
        startDate: monthStart.toISOString(),
        endDate: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      };
    }
    case "lastMonth": {
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);
      return {
        startDate: lastMonthStart.toISOString(),
        endDate: lastMonthEnd.toISOString(),
      };
    }
    case "all":
    default:
      return {};
  }
}
