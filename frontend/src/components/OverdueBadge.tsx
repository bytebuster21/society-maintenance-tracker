import React from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  daysOpen: number;
  thresholdDays?: number;
  className?: string;
}

export const OverdueBadge: React.FC<Props> = ({ daysOpen, thresholdDays = 3, className = "" }) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full bg-rose-100 text-rose-800 border border-rose-300 shadow-sm animate-pulse ${className}`}
      title={`Open for ${daysOpen} days (exceeds ${thresholdDays} days threshold)`}
    >
      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
      OVERDUE ({daysOpen}d)
    </span>
  );
};
