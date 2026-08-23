import React, { useState, useEffect } from "react";
import { api } from "../../api/client.js";
import { Settings, Save, AlertCircle, CheckCircle2, Clock, ShieldCheck, Mail } from "lucide-react";

export const AdminSettings: React.FC = () => {
  const [thresholdDays, setThresholdDays] = useState<number>(3);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get("/settings");
      if (res.data.settings?.overdueThresholdDays) {
        setThresholdDays(res.data.settings.overdueThresholdDays);
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await api.put("/settings", { overdueThresholdDays: thresholdDays });
      setMessage({ type: "success", text: "Overdue policy configuration saved successfully!" });
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to update settings.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Society System Settings
                </h1>
                <p className="mt-0.5 text-xs text-slate-500">
                  Configure society-wide SLAs, complaint overdue triggers, and notification rules.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="p-6 sm:p-8 space-y-6">
            {message && (
              <div
                className={`p-4 rounded-xl text-sm flex items-center gap-2 ${
                  message.type === "success"
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                    : "bg-rose-50 border border-rose-200 text-rose-700"
                }`}
              >
                {message.type === "success" ? (
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                )}
                <span>{message.text}</span>
              </div>
            )}

            {/* Overdue Threshold Setting */}
            <div className="bg-slate-50/70 p-6 rounded-2xl border border-slate-200/80">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    Complaint Overdue Threshold (Days)
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-lg leading-relaxed">
                    Unresolved tickets (Open or In Progress) exceeding this duration will be dynamically tagged as <strong>OVERDUE</strong>, highlighted with high-visibility badges, and surfaced to the top of the admin workflow desk.
                  </p>
                </div>
                <div className="w-32 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="30"
                      required
                      value={thresholdDays}
                      onChange={(e) => setThresholdDays(parseInt(e.target.value, 10) || 1)}
                      className="w-full text-center px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 font-bold text-base focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-semibold text-slate-500">Days</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Email Notification Information Panel */}
            <div className="bg-slate-50/70 p-6 rounded-2xl border border-slate-200/80">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4 text-indigo-600" />
                Automated Resident Notifications
              </h3>
              <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
                <li>
                  <strong>Complaint Status Transitions:</strong> Resident automatically receives formatted email updates with resolution notes whenever status changes from Open &rarr; In Progress &rarr; Resolved.
                </li>
                <li>
                  <strong>Important Notice Broadcasts:</strong> Pinned notices trigger society-wide notification delivery to all registered flat accounts.
                </li>
                <li>
                  <strong>Preview URLs:</strong> In development / demo mode, live Ethereal mail links are printed directly to the server log for instant email inspection.
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving || loading}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-200 transition-all hover:scale-[1.02] disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving Changes..." : "Save Configuration"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
