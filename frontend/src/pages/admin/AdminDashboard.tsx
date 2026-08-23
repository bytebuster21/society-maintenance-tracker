import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client.js";
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Users,
  TrendingUp,
  ArrowRight,
  ShieldAlert,
  Calendar,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { format } from "date-fns";

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await api.get("/dashboard/metrics");
      setData(res.data);
    } catch (err) {
      console.error("Failed to load dashboard metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  const summary = data?.summary || {};
  const byStatus = data?.byStatus || [];
  const byCategory = data?.byCategory || [];
  const recentActivity = data?.recentActivity || [];

  const STATUS_COLORS: Record<string, string> = {
    OPEN: "#f59e0b",
    IN_PROGRESS: "#3b82f6",
    RESOLVED: "#10b981",
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-extrabold uppercase tracking-wider mb-2">
                Society Administrator Desk
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Operations & Maintenance Analytics
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Real-time society maintenance health, resolution velocity, and overdue escalations.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/admin/complaints"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition-all hover:scale-[1.02]"
              >
                Manage All Complaints
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Overdue Urgent Alert Banner */}
          {summary.overdueCount > 0 && (
            <div className="mt-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-rose-900">
                    {summary.overdueCount} Maintenance Complaint{summary.overdueCount > 1 ? "s" : ""} Overdue!
                  </h4>
                  <p className="text-xs text-rose-700">
                    Tickets open beyond configured threshold ({summary.thresholdDays} days) require immediate contractor or admin attention.
                  </p>
                </div>
              </div>
              <Link
                to="/admin/complaints?isOverdue=true"
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl self-start sm:self-center transition-colors flex-shrink-0"
              >
                Review Overdue Tickets
              </Link>
            </div>
          )}

          {/* KPI Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Tickets</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{summary.totalComplaints}</p>
            </div>

            <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Open Tickets</span>
              <p className="text-2xl font-black text-amber-900 mt-1">{summary.openCount}</p>
            </div>

            <div className="bg-blue-50/60 border border-blue-200/80 rounded-2xl p-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">In Progress</span>
              <p className="text-2xl font-black text-blue-900 mt-1">{summary.inProgressCount}</p>
            </div>

            <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Resolved</span>
              <p className="text-2xl font-black text-emerald-900 mt-1">{summary.resolvedCount}</p>
            </div>

            <div className="bg-rose-50/60 border border-rose-200/80 rounded-2xl p-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">Overdue (&gt;{summary.thresholdDays}d)</span>
              <p className="text-2xl font-black text-rose-900 mt-1">{summary.overdueCount}</p>
            </div>

            <div className="bg-purple-50/60 border border-purple-200/80 rounded-2xl p-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700">Avg Resolution</span>
              <p className="text-2xl font-black text-purple-900 mt-1">{summary.avgResolutionDays} <span className="text-xs font-medium text-slate-500">days</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts & Activity Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Status Distribution */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-1">Complaints by Status</h3>
            <p className="text-xs text-slate-400 mb-4">Proportion of Open, In Progress, and Resolved tickets</p>

            <div className="h-64 flex items-center justify-center">
              {byStatus.reduce((acc: number, curr: any) => acc + curr.count, 0) > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={byStatus}
                      dataKey="count"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={5}
                    >
                      {byStatus.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || "#94a3b8"} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1e293b", color: "#fff", borderRadius: "12px", border: "none" }}
                      itemStyle={{ color: "#fff" }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-xs text-slate-400 italic">No complaint data recorded.</p>
              )}
            </div>
          </div>

          {/* Chart 2: Category Breakdown */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-1">Complaints by Category</h3>
            <p className="text-xs text-slate-400 mb-4">Volume distribution across maintenance domains</p>

            <div className="h-64">
              {byCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byCategory} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <XAxis dataKey="category" tick={{ fontSize: 11, fill: "#64748b" }} interval={0} angle={-20} textAnchor="end" />
                    <YAxis tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1e293b", color: "#fff", borderRadius: "12px", border: "none" }}
                      itemStyle={{ color: "#fff" }}
                    />
                    <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-xs text-slate-400 italic">No category data recorded.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Operations Activity Log */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Workflow & Status Activity</h3>
              <p className="text-xs text-slate-400">Live feed of updates made by residents and admins</p>
            </div>
            <Link
              to="/admin/complaints"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              View Complaints Table <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentActivity.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center italic">No recent activity.</p>
            ) : (
              recentActivity.map((act: any) => (
                <div key={act.id} className="py-3.5 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-bold flex-shrink-0 mt-0.5">
                      {act.actor?.name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <p className="text-xs text-slate-800">
                        <strong className="font-semibold">{act.actor?.name}</strong>{" "}
                        <span className="text-slate-500">
                          {act.action === "CREATED"
                            ? "lodged a new ticket"
                            : act.action === "STATUS_CHANGE"
                            ? `changed status to ${act.toStatus}`
                            : act.action === "PRIORITY_CHANGE"
                            ? `updated priority to ${act.toPriority}`
                            : act.action}
                        </span>{" "}
                        on{" "}
                        <Link
                          to={`/complaints/${act.complaint?.id}`}
                          className="font-bold text-indigo-600 hover:underline"
                        >
                          "{act.complaint?.title}"
                        </Link>
                      </p>
                      {act.note && (
                        <p className="text-[11px] text-slate-500 italic mt-0.5 bg-slate-50 px-2 py-0.5 rounded inline-block">
                          "{act.note}"
                        </p>
                      )}
                    </div>
                  </div>

                  <time className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
                    {format(new Date(act.createdAt), "MMM d, h:mm a")}
                  </time>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
