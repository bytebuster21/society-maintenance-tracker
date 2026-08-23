import React from "react";
import { Flame, ShieldAlert, Shield } from "lucide-react";

interface Props {
  priority: string;
  className?: string;
  size?: "sm" | "md";
}

export const PriorityBadge: React.FC<Props> = ({ priority, className = "", size = "md" }) => {
  const isSm = size === "sm";

  switch (priority?.toUpperCase()) {
    case "HIGH":
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-full bg-red-50 text-red-700 border border-red-200 ${
            isSm ? "px-2 py-0.5 text-xs" : "px-2.5 py-0.5 text-xs"
          } ${className}`}
        >
          <Flame className={isSm ? "w-3 h-3 text-red-500" : "w-3.5 h-3.5 text-red-500"} />
          High Priority
        </span>
      );
    case "MEDIUM":
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-full bg-orange-50 text-orange-700 border border-orange-200 ${
            isSm ? "px-2 py-0.5 text-xs" : "px-2.5 py-0.5 text-xs"
          } ${className}`}
        >
          <ShieldAlert className={isSm ? "w-3 h-3 text-orange-500" : "w-3.5 h-3.5 text-orange-500"} />
          Medium
        </span>
      );
    case "LOW":
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${
            isSm ? "px-2 py-0.5 text-xs" : "px-2.5 py-0.5 text-xs"
          } ${className}`}
        >
          <Shield className={isSm ? "w-3 h-3 text-slate-500" : "w-3.5 h-3.5 text-slate-500"} />
          Low
        </span>
      );
    default:
      return (
        <span
          className={`inline-flex items-center font-medium rounded-full bg-slate-100 text-slate-700 ${
            isSm ? "px-2 py-0.5 text-xs" : "px-2.5 py-0.5 text-xs"
          } ${className}`}
        >
          {priority}
        </span>
      );
  }
};
