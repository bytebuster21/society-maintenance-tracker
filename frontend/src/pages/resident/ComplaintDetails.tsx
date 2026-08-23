import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../../api/client.js";
import { useAuth } from "../../context/AuthContext.js";
import { StatusBadge } from "../../components/StatusBadge.js";
import { PriorityBadge } from "../../components/PriorityBadge.js";
import { OverdueBadge } from "../../components/OverdueBadge.js";
import { Timeline } from "../../components/Timeline.js";
import { Modal } from "../../components/Modal.js";
import {
  ArrowLeft,
  Calendar,
  User,
  Home,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Edit3,
  Image as ImageIcon,
  Shield,
} from "lucide-react";
import { format } from "date-fns";

export const ComplaintDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAdmin } = useAuth();

  const [complaint, setComplaint] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Admin Status Update Modal State
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("OPEN");
  const [statusNote, setStatusNote] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Admin Priority Update Modal State
  const [priorityModalOpen, setPriorityModalOpen] = useState(false);
  const [newPriority, setNewPriority] = useState("MEDIUM");
  const [priorityNote, setPriorityNote] = useState("");
  const [updatingPriority, setUpdatingPriority] = useState(false);

  // Photo Lightbox Modal
  const [photoModalOpen, setPhotoModalOpen] = useState(false);

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const fetchComplaint = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/complaints/${id}`);
      setComplaint(res.data.complaint);
      setNewStatus(res.data.complaint.status);
      setNewPriority(res.data.complaint.priority);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load complaint details");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingStatus(true);
    try {
      const res = await api.patch(`/complaints/${id}/status`, {
        status: newStatus,
        note: statusNote,
      });
      setComplaint(res.data.complaint);
      setStatusModalOpen(false);
      setStatusNote("");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handlePrioritySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingPriority(true);
    try {
      const res = await api.patch(`/complaints/${id}/priority`, {
        priority: newPriority,
        note: priorityNote,
      });
      setComplaint(res.data.complaint);
      setPriorityModalOpen(false);
      setPriorityNote("");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update priority");
    } finally {
      setUpdatingPriority(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center max-w-md shadow-sm">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-800">Complaint Not Found</h2>
          <p className="text-xs text-slate-500 mt-1">{error || "The ticket you requested does not exist."}</p>
          <Link
            to={isAdmin ? "/admin/complaints" : "/dashboard"}
            className="inline-flex items-center gap-1.5 mt-5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          to={isAdmin ? "/admin/complaints" : "/dashboard"}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to {isAdmin ? "Complaint Management" : "My Complaints"}
        </Link>

        {/* Top Header Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2.5 flex-wrap mb-3">
                <span className="text-xs font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {complaint.category}
                </span>
                <StatusBadge status={complaint.status} />
                <PriorityBadge priority={complaint.priority} />
                {complaint.isOverdue && (
                  <OverdueBadge
                    daysOpen={complaint.daysOpen}
                    thresholdDays={complaint.thresholdDays}
                  />
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {complaint.title}
              </h1>

              <div className="flex items-center gap-6 mt-4 text-xs text-slate-500 font-medium flex-wrap">
                <span className="flex items-center gap-1.5">
                  <Home className="w-4 h-4 text-slate-400" />
                  Flat: <strong className="text-slate-700">{complaint.flatNumber}</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-slate-400" />
                  Raised by: <strong className="text-slate-700">{complaint.resident?.name}</strong> ({complaint.resident?.email})
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  Lodged: {format(new Date(complaint.createdAt), "MMM d, yyyy • h:mm a")}
                </span>
              </div>
            </div>

            {/* Admin Action Buttons */}
            {isAdmin && (
              <div className="flex items-center gap-3 self-start lg:self-center flex-wrap">
                <button
                  onClick={() => setStatusModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-100 transition-all hover:scale-[1.02]"
                >
                  <Edit3 className="w-4 h-4" /> Update Status
                </button>
                <button
                  onClick={() => setPriorityModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition-colors"
                >
                  <Shield className="w-4 h-4" /> Change Priority
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 2-Column Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Complaint Details & Photo */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                Problem Description
              </h2>
              <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-100 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {complaint.description}
              </div>

              {/* Photo Attachment Section */}
              {complaint.photoUrl && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-slate-400" /> Supporting Photo Attachment
                  </h3>
                  <div
                    onClick={() => setPhotoModalOpen(true)}
                    className="relative cursor-pointer group rounded-2xl overflow-hidden border border-slate-200 inline-block shadow-sm max-w-sm"
                  >
                    <img
                      src={complaint.photoUrl}
                      alt="Complaint Attachment"
                      className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                      Click to Enlarge
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Status & Priority Lifecycle Timeline */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm sticky top-24">
              <h2 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                Status History & Audit Trail
              </h2>
              <p className="text-xs text-slate-400 mb-6">
                Chronological record of state transitions, technician assignments, and admin notes.
              </p>

              <Timeline history={complaint.history || []} />
            </div>
          </div>
        </div>
      </div>

      {/* Admin Status Update Modal */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title="Update Complaint Status"
      >
        <form onSubmit={handleStatusSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              New Status
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
              Remark / Note to Resident (Optional)
            </label>
            <textarea
              rows={3}
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              placeholder="e.g. Technician scheduled for tomorrow between 2 PM to 5 PM..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              This note will be recorded in the complaint history and emailed to the resident.
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
              disabled={updatingStatus}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 disabled:opacity-50"
            >
              {updatingStatus ? "Updating..." : "Save Status"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Admin Priority Modal */}
      <Modal
        isOpen={priorityModalOpen}
        onClose={() => setPriorityModalOpen(false)}
        title="Change Complaint Priority"
      >
        <form onSubmit={handlePrioritySubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Set Priority
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
              Reason / Note
            </label>
            <input
              type="text"
              value={priorityNote}
              onChange={(e) => setPriorityNote(e.target.value)}
              placeholder="e.g. Escalated due to water leakage risk"
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
              disabled={updatingPriority}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 disabled:opacity-50"
            >
              {updatingPriority ? "Updating..." : "Save Priority"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Photo Lightbox */}
      <Modal
        isOpen={photoModalOpen}
        onClose={() => setPhotoModalOpen(false)}
        title="Attached Photo"
        maxWidth="max-w-3xl"
      >
        <div className="flex items-center justify-center">
          <img
            src={complaint.photoUrl}
            alt="Full Attachment"
            className="max-h-[70vh] rounded-xl object-contain shadow-sm"
          />
        </div>
      </Modal>
    </div>
  );
};
