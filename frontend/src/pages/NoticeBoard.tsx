import React, { useState, useEffect } from "react";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.js";
import { Modal } from "../components/Modal.js";
import {
  Bell,
  Pin,
  PlusCircle,
  Trash2,
  Calendar,
  User,
  AlertTriangle,
  Flame,
  Info,
  CheckCircle2,
  Send,
} from "lucide-react";
import { format } from "date-fns";

const CATEGORIES = [
  { val: "GENERAL", label: "General", color: "bg-slate-100 text-slate-700" },
  { val: "MAINTENANCE", label: "Maintenance", color: "bg-blue-100 text-blue-800" },
  { val: "SECURITY", label: "Security", color: "bg-purple-100 text-purple-800" },
  { val: "EVENT", label: "Event", color: "bg-emerald-100 text-emerald-800" },
  { val: "EMERGENCY", label: "Emergency", color: "bg-rose-100 text-rose-800" },
];

export const NoticeBoard: React.FC = () => {
  const { isAdmin } = useAuth();
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Notice Modal State (Admin only)
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("GENERAL");
  const [isImportant, setIsImportant] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const res = await api.get("/notices");
      setNotices(res.data.notices || []);
    } catch (err) {
      console.error("Failed to load notices:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSubmitting(true);
    try {
      await api.post("/notices", {
        title: title.trim(),
        content: content.trim(),
        category,
        isImportant,
      });
      setModalOpen(false);
      setTitle("");
      setContent("");
      setIsImportant(false);
      fetchNotices();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to post notice");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteNotice = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this notice?")) return;
    try {
      await api.delete(`/notices/${id}`);
      setNotices(notices.filter((n) => n.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete notice");
    }
  };

  const pinnedNotices = notices.filter((n) => n.isImportant);
  const regularNotices = notices.filter((n) => !n.isImportant);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Society Notice Board
                </h1>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Official announcements, scheduled utility works, and emergency alerts.
              </p>
            </div>

            {isAdmin && (
              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition-all hover:scale-[1.02] self-start sm:self-center"
              >
                <PlusCircle className="w-4 h-4" />
                Post Announcement
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
            <p className="text-sm text-slate-500 mt-2 font-medium">Loading notice board...</p>
          </div>
        ) : notices.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">No active notices</h3>
            <p className="text-xs text-slate-500 mt-1">There are currently no announcements posted on the board.</p>
          </div>
        ) : (
          <>
            {/* Pinned / Important Section */}
            {pinnedNotices.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-amber-700">
                  <Pin className="w-3.5 h-3.5" /> Pinned Important Announcements
                </div>

                {pinnedNotices.map((notice) => (
                  <div
                    key={notice.id}
                    className="bg-gradient-to-r from-amber-50/90 via-orange-50/50 to-white rounded-3xl border-2 border-amber-300/80 p-6 shadow-md transition-all hover:shadow-lg relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-600 text-white shadow-sm">
                            <Pin className="w-3 h-3" /> Pinned
                          </span>
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                            {notice.category}
                          </span>
                        </div>

                        <h2 className="text-lg sm:text-xl font-black text-slate-900 mb-2">
                          {notice.title}
                        </h2>

                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                          {notice.content}
                        </p>

                        <div className="flex items-center gap-4 mt-4 text-xs text-slate-500 font-medium">
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            {notice.author?.name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {format(new Date(notice.createdAt), "MMM d, yyyy • h:mm a")}
                          </span>
                        </div>
                      </div>

                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteNotice(notice.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                          title="Delete Notice"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Regular Notices Section */}
            {regularNotices.length > 0 && (
              <div className="space-y-4 pt-4">
                {pinnedNotices.length > 0 && (
                  <div className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    Recent Notices
                  </div>
                )}

                {regularNotices.map((notice) => (
                  <div
                    key={notice.id}
                    className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {notice.category}
                          </span>
                        </div>

                        <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
                          {notice.title}
                        </h3>

                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                          {notice.content}
                        </p>

                        <div className="flex items-center gap-4 mt-4 text-xs text-slate-400 font-medium">
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            {notice.author?.name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {format(new Date(notice.createdAt), "MMM d, yyyy • h:mm a")}
                          </span>
                        </div>
                      </div>

                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteNotice(notice.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                          title="Delete Notice"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Admin Post Notice Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Post Community Notice"
      >
        <form onSubmit={handleCreateNotice} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Notice Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.val} value={cat.val}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Notice Headline / Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. ?? Scheduled Water Tank Cleaning"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Detailed Announcement *
            </label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write the complete announcement details, dates, instructions..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isImportant}
                onChange={(e) => setIsImportant(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-amber-300"
              />
              <div>
                <span className="text-xs font-bold text-amber-900 block">
                  Mark as Important (Pin to top & Send Email Broadcast)
                </span>
                <span className="text-[11px] text-amber-700 block">
                  Pins this notice permanently at the top of the notice board and automatically emails all registered residents.
                </span>
              </div>
            </label>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {submitting ? "Publishing..." : "Publish Notice"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
