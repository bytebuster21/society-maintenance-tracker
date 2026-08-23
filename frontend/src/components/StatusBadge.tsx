import React from "react";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

interface Props {
  status: string;
  className?: string;
  size?: "sm" | "md";
}

export const StatusBadge: React.FC<Props> = ({ status, className = "", size = "md" }) => {
  const isSm = size === "sm";

  switch (status?.toUpperCase()) {
    case "OPEN":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200 ${
            isSm ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-xs"
          } ${className}`}
        >
          <AlertCircle className={isSm ? "w-3 h-3" : "w-3.5 h-3.5"} />
          Open
        </span>
      );
    case "IN_PROGRESS":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200 ${
            isSm ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-xs"
          } ${className}`}
        >
          <Clock className={isSm ? "w-3 h-3" : "w-3.5 h-3.5 animate-spin-slow"} />
          In Progress
        </span>
      );
    case "RESOLVED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${
            isSm ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-xs"
          } ${className}`}
        >
          <CheckCircle2 className={isSm ? "w-3 h-3" : "w-3.5 h-3.5"} />
          Resolved
        </span>
      );
    default:
      return (
        <span
          className={`inline-flex items-center font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${
            isSm ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-xs"
          } ${className}`}
        >
          {status}
        </span>
      );
  }
};
