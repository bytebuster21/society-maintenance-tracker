import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../../api/client.js";
import { StatusBadge } from "../../components/StatusBadge.js";
import { PriorityBadge } from "../../components/PriorityBadge.js";
import { OverdueBadge } from "../../components/OverdueBadge.js";
import { Modal } from "../../components/Modal.js";
import {
  Search,
  Filter,
  ArrowUpDown,
  Edit3,
  Calendar,
  User,
  Home,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Image as ImageIcon,
  RotateCcw,
  Clock,
  Shield,
  Eye,
} from "lucide-react";
import { format } from "date-fns";

const CATEGORIES = [
  "ALL",
  "Plumbing",
  "Electrical",
  "Carpentry",
  "Lift",
  "Common Area",
  "Security",
  "Cleaning / Sanitation",
  "Gardening",
  "Other",
];

export const ComplaintManager: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialOverdue = searchParams.get("isOverdue");

  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [overdueFilter, setOverdueFilter] = useState(initialOverdue === "true" ? "true" : "ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Modal State for Quick Status Change
  const [selectedComplaint, setSelectedComplaint] = useState<any | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("OPEN");
  const [statusNote, setStatusNote] = useState("");
  const [updating, setUpdating] = useState(false);

  // Modal State for Priority Change
  const [priorityModalOpen, setPriorityModalOpen] = useState(false);
  const [newPriority, setNewPriority] = useState("MEDIUM");
  const [priorityNote, setPriorityNote] = useState("");

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, categoryFilter, priorityFilter, overdueFilter, startDate, endDate]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (statusFilter !== "ALL") params.status = statusFilter;
      if (categoryFilter !== "ALL") params.category = categoryFilter;
      if (priorityFilter !== "ALL") params.priority = priorityFilter;
      if (overdueFilter !== "ALL") params.isOverdue = overdueFilter;
      if (search.trim()) params.search = search.trim();
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await api.get("/complaints", { params });
      setComplaints(res.data.complaints || []);
    } catch (err) {
      console.error("Failed to load complaints:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchComplaints();
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setCategoryFilter("ALL");
    setPriorityFilter("ALL");
    setOverdueFilter("ALL");
    setStartDate("");
    setEndDate("");
    setSearchParams({});
  };

  const openStatusModal = (complaint: any) => {
    setSelectedComplaint(complaint);
    setNewStatus(complaint.status);
    setStatusNote("");
    setStatusModalOpen(true);
  };

  const openPriorityModal = (complaint: any) => {
    setSelectedComplaint(complaint);
    setNewPriority(complaint.priority);
    setPriorityNote("");
    setPriorityModalOpen(true);
  };

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    setUpdating(true);
    try {
      await api.patch(`/complaints/${selectedComplaint.id}/status`, {
        status: newStatus,
        note: statusNote,
      });
      setStatusModalOpen(false);
      fetchComplaints();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handlePriorityUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    setUpdating(true);
    try {
      await api.patch(`/complaints/${selectedComplaint.id}/priority`, {
        priority: newPriority,
        note: priorityNote,
      });
      setPriorityModalOpen(false);
      fetchComplaints();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update priority");
    } finally {
      setUpdating(false);
    }
  };

  const overdueCount = complaints.filter((c) => c.isOverdue).length;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Society Maintenance Complaints
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Manage, filter, prioritize tickets, and track resolution audit history with automatic overdue surfacing.
              </p>
            </div>
            {overdueCount > 0 && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-rose-100 text-rose-800 text-xs font-bold border border-rose-200 shadow-sm animate-pulse">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                {overdueCount} Ticket{overdueCount > 1 ? "s" : ""} Overdue & Surfaced to Top
              </div>
            )}
          </div>

          {/* Search & Filter Controls */}
          <div className="mt-6 space-y-3">
            {/* Search Input Bar */}
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by title, description, flat number, resident name or email..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-100 transition-colors"
              >
                Search
              </button>
            </form>

            {/* Filter Dropdowns Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2">
              {/* Status */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full text-xs font-semibold px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">
                  Category
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full text-xs font-semibold px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:ring-2 focus:ring-indigo-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c === "ALL" ? "All Categories" : c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">
                  Priority
                </label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full text-xs font-semibold px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ALL">All Priorities</option>
                  <option value="HIGH">High Priority</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>

              {/* Overdue */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">
                  Overdue Filter
                </label>
                <select
                  value={overdueFilter}
                  onChange={(e) => setOverdueFilter(e.target.value)}
                  className="w-full text-xs font-semibold px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ALL">All (Overdue on Top)</option>
                  <option value="true">Overdue Only ??</option>
                  <option value="false">Non-Overdue</option>
                </select>
              </div>

              {/* Date From */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700"
                />
              </div>

              {/* Date To / Reset */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">
                  To Date
                </label>
                <div className="flex gap-1">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full text-xs font-semibold px-2 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700"
                  />
                  <button
                    onClick={handleResetFilters}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs"
                    title="Reset All Filters"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table / Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
              <p className="text-sm text-slate-500 mt-2 font-medium">Loading complaints list...</p>
            </div>
          ) : complaints.length === 0 ? (
            <div className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">No complaints matching criteria</h3>
              <p className="text-xs text-slate-500 mt-1">Try resetting or adjusting your filter keywords.</p>
              <button
                onClick={handleResetFilters}
                className="mt-4 px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-xs hover:bg-indigo-100 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="py-3.5 px-4 sm:px-6">Status & Urgency</th>
                    <th className="py-3.5 px-4">Complaint / Category</th>
                    <th className="py-3.5 px-4">Flat / Resident</th>
                    <th className="py-3.5 px-4">Lodged Date</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {complaints.map((c) => (
                    <tr
                      key={c.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        c.isOverdue ? "bg-rose-50/30" : ""
                      }`}
                    >
                      {/* Status & Badges */}
                      <td className="py-4 px-4 sm:px-6 align-top whitespace-nowrap">
                        <div className="flex flex-col gap-1.5 items-start">
                          <StatusBadge status={c.status} size="sm" />
                          <PriorityBadge priority={c.priority} size="sm" />
                          {c.isOverdue && (
                            <OverdueBadge daysOpen={c.daysOpen} thresholdDays={c.thresholdDays} />
                          )}
                        </div>
                      </td>

                      {/* Complaint Details */}
                      <td className="py-4 px-4 align-top max-w-xs sm:max-w-md">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {c.category}
                          </span>
                          {c.photoUrl && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                              <ImageIcon className="w-3 h-3 text-slate-400" /> Photo
                            </span>
                          )}
                        </div>

                        <Link
                          to={`/complaints/${c.id}`}
                          className="font-bold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1 text-sm"
                        >
                          {c.title}
                        </Link>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                          {c.description}
                        </p>
                      </td>

                      {/* Resident Info */}
                      <td className="py-4 px-4 align-top whitespace-nowrap text-xs">
                        <div className="font-bold text-slate-800 flex items-center gap-1.5">
                          <Home className="w-3.5 h-3.5 text-slate-400" />
                          {c.flatNumber}
                        </div>
                        <div className="text-slate-500 mt-0.5 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {c.resident?.name}
                        </div>
                      </td>

                      {/* Lodge Date */}
                      <td className="py-4 px-4 align-top whitespace-nowrap text-xs text-slate-500">
                        <div>{format(new Date(c.createdAt), "MMM d, yyyy")}</div>
                        <div className="text-[11px] text-slate-400">{format(new Date(c.createdAt), "h:mm a")}</div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 align-top text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openStatusModal(c)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors"
                            title="Update Status"
                          >
                            <Clock className="w-3.5 h-3.5" /> Status
                          </button>

                          <button
                            onClick={() => openPriorityModal(c)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                            title="Update Priority"
                          >
                            <Shield className="w-3.5 h-3.5" /> Priority
                          </button>

                          <Link
                            to={`/complaints/${c.id}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                            title="View Full Detail & History"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Quick Status Modal */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title={`Update Status: ${selectedComplaint?.title || ""}`}
      >
        <form onSubmit={handleStatusUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Select Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { val: "OPEN", label: "Open" },
                { val: "IN_PROGRESS", label: "In Progress" },
                { val: "RESOLVED", label: "Resolved" },
              ].map((s) => (
                <button
                  key={s.val}
                  type="button"
                  onClick={() => setNewStatus(s.val)}
                  className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all ${
                    newStatus === s.val
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Status Change Note (Optional)
            </label>
            <textarea
              rows={3}
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              placeholder="e.g. Electrician scheduled for tomorrow morning..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Resident will receive an automated email notification with this note.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setStatusModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updating}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 disabled:opacity-50"
            >
              {updating ? "Saving..." : "Save & Notify"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Priority Modal */}
      <Modal
        isOpen={priorityModalOpen}
        onClose={() => setPriorityModalOpen(false)}
        title={`Change Priority: ${selectedComplaint?.title || ""}`}
      >
        <form onSubmit={handlePriorityUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Select Priority
            </label>
            <div className="grid grid-cols-3 gap-2">
              {["LOW", "MEDIUM", "HIGH"].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setNewPriority(p)}
                  className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all ${
                    newPriority === p
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Reason / Remark
            </label>
            <input
              type="text"
              value={priorityNote}
              onChange={(e) => setPriorityNote(e.target.value)}
              placeholder="e.g. Critical common utility issue"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setPriorityModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updating}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 disabled:opacity-50"
            >
              {updating ? "Saving..." : "Update Priority"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
