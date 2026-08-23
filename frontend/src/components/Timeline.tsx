import React from "react";
import { format } from "date-fns";
import { Clock, User, CheckCircle2, AlertCircle, FileEdit, ArrowRight } from "lucide-react";
import { StatusBadge } from "./StatusBadge.js";
import { PriorityBadge } from "./PriorityBadge.js";

export interface HistoryItem {
  id: string;
  action: string;
  fromStatus?: string | null;
  toStatus?: string | null;
  fromPriority?: string | null;
  toPriority?: string | null;
  note?: string | null;
  createdAt: string;
  actor?: {
    id: string;
    name: string;
    role: string;
  };
}

interface TimelineProps {
  history: HistoryItem[];
}

export const Timeline: React.FC<TimelineProps> = ({ history }) => {
  if (!history || history.length === 0) {
    return <p className="text-sm text-slate-500 italic">No history logs recorded yet.</p>;
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {history.map((item, index) => {
          const isLast = index === history.length - 1;
          const isCreation = item.action === "CREATED";
          const isStatusChange = item.action === "STATUS_CHANGE";
          const isPriorityChange = item.action === "PRIORITY_CHANGE";

          return (
            <li key={item.id || index}>
              <div className="relative pb-8">
                {!isLast && (
                  <span
                    className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-slate-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex items-start space-x-3">
                  {/* Icon Marker */}
                  <div className="relative">
                    <span
                      className={`h-10 w-10 rounded-full flex items-center justify-center ring-8 ring-white ${
                        isCreation
                          ? "bg-indigo-100 text-indigo-600"
                          : item.toStatus === "RESOLVED"
                          ? "bg-emerald-100 text-emerald-600"
                          : isStatusChange
                          ? "bg-blue-100 text-blue-600"
                          : "bg-amber-100 text-amber-600"
                      }`}
                    >
                      {item.toStatus === "RESOLVED" ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : isCreation ? (
                        <AlertCircle className="w-5 h-5" />
                      ) : isPriorityChange ? (
                        <FileEdit className="w-5 h-5" />
                      ) : (
                        <Clock className="w-5 h-5" />
                      )}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1 bg-slate-50/80 p-4 rounded-xl border border-slate-200/80">
                    <div className="flex items-center justify-between flex-wrap gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">
                          {isCreation
                            ? "Complaint Registered"
                            : isStatusChange
                            ? "Status Updated"
                            : isPriorityChange
                            ? "Priority Updated"
                            : item.action}
                        </span>
                        {item.actor && (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-slate-200/60 text-slate-700">
                            <User className="w-3 h-3 text-slate-500" />
                            {item.actor.name} ({item.actor.role.toLowerCase()})
                          </span>
                        )}
                      </div>
                      <time className="text-xs text-slate-500 font-medium">
                        {format(new Date(item.createdAt), "MMM d, yyyy • h:mm a")}
                      </time>
                    </div>

                    {/* Transition details */}
                    {isStatusChange && item.toStatus && (
                      <div className="flex items-center gap-2 my-2 text-xs font-medium">
                        {item.fromStatus && (
                          <>
                            <StatusBadge status={item.fromStatus} size="sm" />
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                          </>
                        )}
                        <StatusBadge status={item.toStatus} size="sm" />
                      </div>
                    )}

                    {isPriorityChange && item.toPriority && (
                      <div className="flex items-center gap-2 my-2 text-xs font-medium">
                        {item.fromPriority && (
                          <>
                            <PriorityBadge priority={item.fromPriority} size="sm" />
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                          </>
                        )}
                        <PriorityBadge priority={item.toPriority} size="sm" />
                      </div>
                    )}

                    {/* Optional Note */}
                    {item.note && (
                      <div className="mt-2 text-sm text-slate-700 bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                        <span className="font-semibold text-xs text-slate-500 uppercase tracking-wider block mb-1">
                          Note / Remark:
                        </span>
                        <p className="whitespace-pre-line text-slate-800">{item.note}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
