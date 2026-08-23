import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client.js";
import { useAuth } from "../../context/AuthContext.js";
import { StatusBadge } from "../../components/StatusBadge.js";
import { PriorityBadge } from "../../components/PriorityBadge.js";
import { OverdueBadge } from "../../components/OverdueBadge.js";
import {
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  ChevronRight,
  Filter,
  Image as ImageIcon,
} from "lucide-react";
import { format } from "date-fns";

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  flatNumber: string;
  photoUrl?: string | null;
  status: string;
  priority: string;
  isOverdue: boolean;
  daysOpen: number;
  thresholdDays: number;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string | null;
  history?: any[];
}

export const ResidentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  useEffect(() => {
    fetchMyComplaints();
  }, []);

  const fetchMyComplaints = async () => {
    setLoading(true);
    try {
      const res = await api.get("/complaints/my");
      setComplaints(res.data.complaints || []);
    } catch (err) {
      console.error("Failed to load complaints:", err);
    } finally {
      setLoading(false);
    }
  };

  const totalComplaints = complaints.length;
  const openComplaints = complaints.filter((c) => c.status === "OPEN").length;
  const inProgressComplaints = complaints.filter((c) => c.status === "IN_PROGRESS").length;
  const resolvedComplaints = complaints.filter((c) => c.status === "RESOLVED").length;

  const filteredComplaints = complaints.filter((c) => {
    if (statusFilter !== "ALL" && c.status !== statusFilter) return false;
    if (categoryFilter !== "ALL" && c.category !== categoryFilter) return false;
    return true;
  });

  const categories = Array.from(new Set(complaints.map((c) => c.category)));

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      {/* Header Banner */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Welcome back, {user?.name}! ??
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Flat: <span className="font-semibold text-slate-700">{user?.flatNumber || "A-302"}</span> • Track and lodge society maintenance tickets
              </p>
            </div>
            <Link
              to="/raise"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-200 transition-all hover:scale-[1.02]"
            >
              <PlusCircle className="w-5 h-5" />
              Raise New Complaint
            </Link>
          </div>

          {/* Stats Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Raised</span>
                <FileText className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">{totalComplaints}</p>
            </div>

            <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Open Tickets</span>
                <AlertCircle className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-amber-900 mt-2">{openComplaints}</p>
            </div>

            <div className="bg-blue-50/60 border border-blue-200/80 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700">In Progress</span>
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-blue-900 mt-2">{inProgressComplaints}</p>
            </div>

            <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Resolved</span>
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-emerald-900 mt-2">{resolvedComplaints}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          {/* Filter Bar */}
          <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <h2 className="text-base font-bold text-slate-800">My Complaints List</h2>
              <span className="text-xs font-medium px-2 py-0.5 bg-slate-200 text-slate-700 rounded-full">
                {filteredComplaints.length}
              </span>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs font-semibold px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="OPEN">Open Only</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
              </select>

              {categories.length > 0 && (
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="text-xs font-semibold px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ALL">All Categories</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Complaints List */}
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
              <p className="text-sm text-slate-500 mt-2 font-medium">Loading complaints...</p>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-700">No complaints found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {statusFilter !== "ALL" || categoryFilter !== "ALL"
                  ? "No tickets match your filter criteria."
                  : "You have not raised any maintenance complaints yet."}
              </p>
              {statusFilter === "ALL" && categoryFilter === "ALL" && (
                <Link
                  to="/raise"
                  className="inline-flex items-center gap-1.5 mt-4 text-xs font-bold text-indigo-600 hover:text-indigo-700"
                >
                  <PlusCircle className="w-4 h-4" /> Raise your first ticket
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredComplaints.map((c) => (
                <Link
                  key={c.id}
                  to={`/complaints/${c.id}`}
                  className="block p-5 sm:p-6 hover:bg-slate-50/80 transition-colors group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {c.category}
                        </span>
                        <StatusBadge status={c.status} size="sm" />
                        <PriorityBadge priority={c.priority} size="sm" />
                        {c.isOverdue && (
                          <OverdueBadge daysOpen={c.daysOpen} thresholdDays={c.thresholdDays} />
                        )}
                        {c.photoUrl && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            <ImageIcon className="w-3 h-3 text-slate-400" /> Photo attached
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {c.title}
                      </h3>
                      <p className="text-sm text-slate-600 line-clamp-2 mt-1">
                        {c.description}
                      </p>

                      <div className="flex items-center gap-4 mt-3 text-xs text-slate-400 font-medium">
                        <span>Lodge Date: {format(new Date(c.createdAt), "MMM d, yyyy • h:mm a")}</span>
                        {c.resolvedAt && (
                          <span className="text-emerald-600">
                            Resolved on {format(new Date(c.resolvedAt), "MMM d, yyyy")}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-end text-slate-400 group-hover:text-indigo-600 transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
