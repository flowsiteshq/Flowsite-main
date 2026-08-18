import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Calendar, Clock, Plus, Trash2, CheckCircle2, XCircle, ChevronLeft,
  Ban, User, Phone, Mail, Building2, MessageSquare, RefreshCw,
  ClipboardList, Edit3, ChevronDown
} from "lucide-react";
import { toast } from "sonner";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatTime(time: string) {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

function formatDate(dateStr: string) {
  const [y, mo, d] = dateStr.split("-").map(Number);
  return new Date(y, mo - 1, d).toLocaleDateString("en-US", {
    weekday: "short", year: "numeric", month: "short", day: "numeric"
  });
}

const STATUS_STYLES: Record<string, string> = {
  confirmed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  cancelled: "bg-red-500/15 text-red-400 border-red-500/30",
  completed: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  no_show: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
};

type Tab = "bookings" | "availability" | "blocked" | "questionnaire";

const FIELD_TYPE_LABELS: Record<string, string> = {
  text: "Short Text",
  textarea: "Long Text",
  select: "Dropdown",
  radio: "Multiple Choice",
  checkbox: "Checkboxes",
};

type FieldType = "text" | "textarea" | "select" | "radio" | "checkbox";

export default function AdminScheduling() {
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<Tab>("bookings");

  // ─── Verify admin session ───────────────────────────────────────────────────
  const { data: auth, isLoading: authLoading } = trpc.admin.verify.useQuery();

  // ─── Bookings ───────────────────────────────────────────────────────────────
  const { data: bookings, refetch: refetchBookings } = trpc.scheduling.adminGetBookings.useQuery(
    undefined, { enabled: !!auth?.authenticated }
  );
  const updateStatus = trpc.scheduling.adminUpdateBookingStatus.useMutation({
    onSuccess: () => { refetchBookings(); toast.success("Status updated"); },
    onError: (e) => toast.error(e.message),
  });

  // ─── Availability ───────────────────────────────────────────────────────────
  const { data: avail, refetch: refetchAvail } = trpc.scheduling.adminGetAvailability.useQuery(
    undefined, { enabled: !!auth?.authenticated }
  );
  const upsertAvail = trpc.scheduling.adminUpsertAvailability.useMutation({
    onSuccess: () => { refetchAvail(); toast.success("Availability saved"); setNewAvail(null); },
    onError: (e) => toast.error(e.message),
  });
  const deleteAvail = trpc.scheduling.adminDeleteAvailability.useMutation({
    onSuccess: () => { refetchAvail(); toast.success("Deleted"); },
    onError: (e) => toast.error(e.message),
  });

  const [newAvail, setNewAvail] = useState<{
    dayOfWeek: number; startTime: string; endTime: string; slotDurationMins: number;
  } | null>(null);

  // ─── Blocked Dates ──────────────────────────────────────────────────────────
  const { data: blocked, refetch: refetchBlocked } = trpc.scheduling.adminGetBlockedDates.useQuery(
    undefined, { enabled: !!auth?.authenticated }
  );
  const addBlocked = trpc.scheduling.adminAddBlockedDate.useMutation({
    onSuccess: () => { refetchBlocked(); toast.success("Date blocked"); setNewBlockDate(""); },
    onError: (e) => toast.error(e.message),
  });
  const removeBlocked = trpc.scheduling.adminRemoveBlockedDate.useMutation({
    onSuccess: () => { refetchBlocked(); toast.success("Unblocked"); },
    onError: (e) => toast.error(e.message),
  });

  const [newBlockDate, setNewBlockDate] = useState("");
  const [newBlockReason, setNewBlockReason] = useState("");

  // ─── Questionnaire ──────────────────────────────────────────────────────────
  const { data: questions, refetch: refetchQuestions } = trpc.questionnaire.adminGetQuestions.useQuery(
    undefined, { enabled: !!auth?.authenticated }
  );
  const createQuestion = trpc.questionnaire.adminCreateQuestion.useMutation({
    onSuccess: () => { refetchQuestions(); setNewQuestion(null); toast.success("Question added"); },
    onError: (e) => toast.error(e.message),
  });
  const updateQuestion = trpc.questionnaire.adminUpdateQuestion.useMutation({
    onSuccess: () => { refetchQuestions(); setEditingId(null); toast.success("Saved"); },
    onError: (e) => toast.error(e.message),
  });
  const deleteQuestion = trpc.questionnaire.adminDeleteQuestion.useMutation({
    onSuccess: () => { refetchQuestions(); toast.success("Deleted"); },
    onError: (e) => toast.error(e.message),
  });

  const [newQuestion, setNewQuestion] = useState<{
    questionText: string;
    fieldType: FieldType;
    options: string;
    isRequired: number;
    placeholder: string;
  } | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<{
    questionText: string;
    fieldType: FieldType;
    options: string;
    isRequired: number;
    placeholder: string;
  }>({ questionText: "", fieldType: "text", options: "", isRequired: 0, placeholder: "" });
  const [expandedBookingId, setExpandedBookingId] = useState<number | null>(null);
  const utils = trpc.useUtils();
  const [answersCache, setAnswersCache] = useState<Record<number, Array<{ question: { questionText: string } | null; answerText: string | null }>>>({});

  const toggleBookingAnswers = async (bookingId: number) => {
    if (expandedBookingId === bookingId) {
      setExpandedBookingId(null);
      return;
    }
    setExpandedBookingId(bookingId);
    if (!answersCache[bookingId]) {
      const data = await utils.questionnaire.adminGetBookingAnswers.fetch({ bookingId });
      setAnswersCache(prev => ({ ...prev, [bookingId]: data }));
    }
  };

  if (authLoading) {
    return (
      <div className="light-admin-scheduling min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
      </div>
    );
  }

  if (!auth?.authenticated) {
    return (
      <div className="light-admin-scheduling min-h-screen flex items-center justify-center text-slate-900">
        <div className="text-center">
          <p className="text-white/60 mb-4">Admin access required.</p>
          <Link href="/flowsites-admin-secret">
            <Button className="bg-[oklch(0.5_0.2_25)] hover:bg-[oklch(0.55_0.22_25)]">Go to Admin Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "bookings", label: "Bookings", icon: <Calendar size={15} /> },
    { key: "availability", label: "Availability", icon: <Clock size={15} /> },
    { key: "blocked", label: "Blocked Dates", icon: <Ban size={15} /> },
    { key: "questionnaire", label: "Questionnaire", icon: <ClipboardList size={15} /> },
  ];

  return (
    <div className="light-admin-scheduling min-h-screen text-slate-900">
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/flowsites-admin-dashboard" className="text-white/50 hover:text-white transition-colors">
            <ChevronLeft size={18} />
          </Link>
          <h1 className="font-bold text-lg">Scheduling Manager</h1>
        </div>
        <Link href="/get-started" target="_blank" className="text-xs text-white/40 hover:text-white/70 transition-colors">
          View booking page ↗
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-1 bg-white/5 rounded-xl p-1 mb-8 w-fit">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t.key
                  ? "bg-white/10 text-white"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* ─── BOOKINGS TAB ─────────────────────────────────────────────────── */}
        {tab === "bookings" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">All Bookings</h2>
              <button onClick={() => refetchBookings()} className="text-white/40 hover:text-white/80 transition-colors">
                <RefreshCw size={15} />
              </button>
            </div>

            {!bookings?.length ? (
              <div className="text-center py-16 text-white/30">
                <Calendar size={40} className="mx-auto mb-3 opacity-30" />
                <p>No bookings yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map(b => (
                  <div key={b.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      {/* Left: booking info */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_STYLES[b.status] ?? "bg-white/10 text-white/60"}`}>
                            {b.status.replace("_", " ").toUpperCase()}
                          </span>
                          <span className="text-white/40 text-xs">#{b.confirmationCode}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-[oklch(0.5_0.2_25)] shrink-0" />
                          <span className="font-semibold">{formatDate(b.bookingDate)}</span>
                          <span className="text-white/50">{formatTime(b.startTime)} – {formatTime(b.endTime)}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-sm text-white/70">
                          <div className="flex items-center gap-1.5">
                            <User size={12} className="text-white/40" />
                            {b.guestName}
                          </div>
                          {b.businessName && (
                            <div className="flex items-center gap-1.5">
                              <Building2 size={12} className="text-white/40" />
                              {b.businessName}
                            </div>
                          )}
                          <div className="flex items-center gap-1.5">
                            <Mail size={12} className="text-white/40" />
                            <a href={`mailto:${b.guestEmail}`} className="hover:text-white transition-colors">{b.guestEmail}</a>
                          </div>
                          {b.guestPhone && (
                            <div className="flex items-center gap-1.5">
                              <Phone size={12} className="text-white/40" />
                              <a href={`tel:${b.guestPhone}`} className="hover:text-white transition-colors">{b.guestPhone}</a>
                            </div>
                          )}
                        </div>

                        {b.notes && (
                          <div className="flex items-start gap-1.5 text-sm text-white/50 bg-white/5 rounded-lg px-3 py-2">
                            <MessageSquare size={12} className="mt-0.5 shrink-0" />
                            {b.notes}
                          </div>
                        )}

                        {/* Questionnaire answers toggle */}
                        <button
                          onClick={() => toggleBookingAnswers(b.id)}
                          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors mt-1"
                        >
                          <ClipboardList size={12} />
                          {expandedBookingId === b.id ? "Hide answers" : "View questionnaire answers"}
                          <ChevronDown size={12} className={`transition-transform ${expandedBookingId === b.id ? "rotate-180" : ""}`} />
                        </button>

                        {expandedBookingId === b.id && (
                          <div className="mt-2 bg-white/5 border border-white/10 rounded-lg p-3 space-y-2">
                            {!answersCache[b.id] ? (
                              <p className="text-white/30 text-xs">Loading answers...</p>
                            ) : answersCache[b.id].length === 0 ? (
                              <p className="text-white/30 text-xs">No questionnaire answers for this booking.</p>
                            ) : (
                              answersCache[b.id].map((a, idx) => (
                                <div key={idx} className="space-y-0.5">
                                  <p className="text-white/50 text-xs font-medium">{a.question?.questionText ?? `Question ${idx + 1}`}</p>
                                  <p className="text-white/80 text-sm">{a.answerText ?? <span className="text-white/30 italic">No answer</span>}</p>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>

                      {/* Right: actions */}
                      <div className="flex flex-row sm:flex-col gap-2 shrink-0">
                        {b.status === "confirmed" && (
                          <>
                            <button
                              onClick={() => updateStatus.mutate({ id: b.id, status: "completed" })}
                              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400 hover:bg-blue-500/25 transition-colors"
                            >
                              <CheckCircle2 size={12} /> Complete
                            </button>
                            <button
                              onClick={() => updateStatus.mutate({ id: b.id, status: "no_show" })}
                              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/25 transition-colors"
                            >
                              <XCircle size={12} /> No Show
                            </button>
                            <button
                              onClick={() => updateStatus.mutate({ id: b.id, status: "cancelled" })}
                              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 transition-colors"
                            >
                              <Ban size={12} /> Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── AVAILABILITY TAB ─────────────────────────────────────────────── */}
        {tab === "availability" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-lg">Weekly Availability</h2>
                <p className="text-white/40 text-sm">Set which days and times you're available for calls.</p>
              </div>
              <Button
                onClick={() => setNewAvail({ dayOfWeek: 1, startTime: "09:00", endTime: "17:00", slotDurationMins: 30 })}
                className="bg-[oklch(0.5_0.2_25)] hover:bg-[oklch(0.55_0.22_25)] text-white text-sm"
                size="sm"
              >
                <Plus size={14} className="mr-1" /> Add Slot
              </Button>
            </div>

            {/* Add new availability form */}
            {newAvail && (
              <div className="bg-white/5 border border-[oklch(0.5_0.2_25_/_30%)] rounded-xl p-4 mb-4">
                <h3 className="font-medium mb-3 text-sm">New Availability Rule</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <Label className="text-white/60 text-xs">Day</Label>
                    <select
                      value={newAvail.dayOfWeek}
                      onChange={e => setNewAvail(a => a ? { ...a, dayOfWeek: Number(e.target.value) } : a)}
                      className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-sm text-white"
                    >
                      {DAY_NAMES.map((d, i) => <option key={i} value={i} className="bg-[#1a1a2e]">{d}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-white/60 text-xs">Start Time</Label>
                    <Input
                      type="time"
                      value={newAvail.startTime}
                      onChange={e => setNewAvail(a => a ? { ...a, startTime: e.target.value } : a)}
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-white/60 text-xs">End Time</Label>
                    <Input
                      type="time"
                      value={newAvail.endTime}
                      onChange={e => setNewAvail(a => a ? { ...a, endTime: e.target.value } : a)}
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-white/60 text-xs">Slot (mins)</Label>
                    <select
                      value={newAvail.slotDurationMins}
                      onChange={e => setNewAvail(a => a ? { ...a, slotDurationMins: Number(e.target.value) } : a)}
                      className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-sm text-white"
                    >
                      {[15, 20, 30, 45, 60].map(m => <option key={m} value={m} className="bg-[#1a1a2e]">{m} min</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    onClick={() => upsertAvail.mutate(newAvail)}
                    disabled={upsertAvail.isPending}
                    className="bg-[oklch(0.5_0.2_25)] hover:bg-[oklch(0.55_0.22_25)] text-white"
                  >
                    {upsertAvail.isPending ? "Saving..." : "Save"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setNewAvail(null)} className="text-white/50 hover:text-white">
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Availability list grouped by day */}
            {!avail?.length ? (
              <div className="text-center py-16 text-white/30">
                <Clock size={40} className="mx-auto mb-3 opacity-30" />
                <p>No availability set. Add your first availability window above.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {DAY_NAMES.map((day, dow) => {
                  const daySlots = avail.filter(a => a.dayOfWeek === dow);
                  if (!daySlots.length) return null;
                  return (
                    <div key={dow} className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{day}</span>
                      </div>
                      <div className="space-y-2">
                        {daySlots.map(slot => (
                          <div key={slot.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-3 text-white/70">
                              <Clock size={13} className="text-[oklch(0.5_0.2_25)]" />
                              <span>{formatTime(slot.startTime)} – {formatTime(slot.endTime)}</span>
                              <span className="text-white/40">({slot.slotDurationMins} min slots)</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full border ${
                                slot.isActive ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-white/5 text-white/30 border-white/10"
                              }`}>
                                {slot.isActive ? "Active" : "Inactive"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => upsertAvail.mutate({ ...slot, isActive: slot.isActive ? 0 : 1 })}
                                className="text-xs text-white/40 hover:text-white/80 transition-colors px-2 py-1 rounded hover:bg-white/5"
                              >
                                {slot.isActive ? "Disable" : "Enable"}
                              </button>
                              <button
                                onClick={() => deleteAvail.mutate({ id: slot.id })}
                                className="text-red-400/60 hover:text-red-400 transition-colors p-1 rounded hover:bg-red-400/10"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ─── QUESTIONNAIRE TAB ────────────────────────────────────────────── */}
        {tab === "questionnaire" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-lg">Pre-Booking Questionnaire</h2>
                <p className="text-white/40 text-sm">Prospects answer these questions before confirming their booking.</p>
              </div>
              <Button
                onClick={() => setNewQuestion({ questionText: "", fieldType: "text", options: "", isRequired: 0, placeholder: "" })}
                className="bg-[oklch(0.5_0.2_25)] hover:bg-[oklch(0.55_0.22_25)] text-white text-sm"
                size="sm"
              >
                <Plus size={14} className="mr-1" /> Add Question
              </Button>
            </div>

            {/* Add new question form */}
            {newQuestion && (
              <div className="bg-white/5 border border-[oklch(0.5_0.2_25_/_30%)] rounded-xl p-4 mb-4 space-y-3">
                <h3 className="font-medium text-sm">New Question</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <Label className="text-white/60 text-xs">Question Text *</Label>
                    <Input
                      value={newQuestion.questionText}
                      onChange={e => setNewQuestion(q => q ? { ...q, questionText: e.target.value } : q)}
                      placeholder="e.g. What is your biggest challenge right now?"
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-white/60 text-xs">Field Type</Label>
                    <select
                      value={newQuestion.fieldType}
                      onChange={e => setNewQuestion(q => q ? { ...q, fieldType: e.target.value as FieldType } : q)}
                      className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-sm text-white"
                    >
                      {Object.entries(FIELD_TYPE_LABELS).map(([v, l]) => (
                        <option key={v} value={v} className="bg-[#1a1a2e]">{l}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-white/60 text-xs">Placeholder / Helper Text</Label>
                    <Input
                      value={newQuestion.placeholder}
                      onChange={e => setNewQuestion(q => q ? { ...q, placeholder: e.target.value } : q)}
                      placeholder="Optional hint shown inside the field"
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
                    />
                  </div>
                  {["select", "radio", "checkbox"].includes(newQuestion.fieldType) && (
                    <div className="sm:col-span-2 space-y-1">
                      <Label className="text-white/60 text-xs">Options (one per line)</Label>
                      <textarea
                        value={newQuestion.options}
                        onChange={e => setNewQuestion(q => q ? { ...q, options: e.target.value } : q)}
                        placeholder="Option A\nOption B\nOption C"
                        rows={3}
                        className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 resize-none"
                      />
                      <p className="text-white/30 text-xs">Enter each option on a new line.</p>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="nq-required"
                      checked={newQuestion.isRequired === 1}
                      onChange={e => setNewQuestion(q => q ? { ...q, isRequired: e.target.checked ? 1 : 0 } : q)}
                      className="accent-[oklch(0.5_0.2_25)]"
                    />
                    <Label htmlFor="nq-required" className="text-white/60 text-sm cursor-pointer">Required</Label>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      if (!newQuestion.questionText.trim()) return toast.error("Question text is required");
                      const optionsJson = ["select", "radio", "checkbox"].includes(newQuestion.fieldType) && newQuestion.options.trim()
                        ? JSON.stringify(newQuestion.options.split("\n").map(o => o.trim()).filter(Boolean))
                        : undefined;
                      createQuestion.mutate({
                        questionText: newQuestion.questionText,
                        fieldType: newQuestion.fieldType,
                        options: optionsJson,
                        isRequired: newQuestion.isRequired,
                        isActive: 1,
                        sortOrder: (questions?.length ?? 0) * 10,
                        placeholder: newQuestion.placeholder || undefined,
                      });
                    }}
                    disabled={createQuestion.isPending}
                    className="bg-[oklch(0.5_0.2_25)] hover:bg-[oklch(0.55_0.22_25)] text-white"
                  >
                    {createQuestion.isPending ? "Saving..." : "Save Question"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setNewQuestion(null)} className="text-white/50 hover:text-white">
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Questions list */}
            {!questions?.length ? (
              <div className="text-center py-16 text-white/30">
                <ClipboardList size={40} className="mx-auto mb-3 opacity-30" />
                <p>No questions yet. Add your first question above.</p>
                <p className="text-xs mt-2">Prospects will see these questions after selecting a time slot.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {questions.map((q, idx) => (
                  <div key={q.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                    {editingId === q.id ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="sm:col-span-2 space-y-1">
                            <Label className="text-white/60 text-xs">Question Text *</Label>
                            <Input
                              value={editDraft.questionText}
                              onChange={e => setEditDraft(d => ({ ...d, questionText: e.target.value }))}
                              className="bg-white/5 border-white/20 text-white"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-white/60 text-xs">Field Type</Label>
                            <select
                              value={editDraft.fieldType}
                              onChange={e => setEditDraft(d => ({ ...d, fieldType: e.target.value as FieldType }))}
                              className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-sm text-white"
                            >
                              {Object.entries(FIELD_TYPE_LABELS).map(([v, l]) => (
                                <option key={v} value={v} className="bg-[#1a1a2e]">{l}</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-white/60 text-xs">Placeholder</Label>
                            <Input
                              value={editDraft.placeholder}
                              onChange={e => setEditDraft(d => ({ ...d, placeholder: e.target.value }))}
                              className="bg-white/5 border-white/20 text-white"
                            />
                          </div>
                          {["select", "radio", "checkbox"].includes(editDraft.fieldType) && (
                            <div className="sm:col-span-2 space-y-1">
                              <Label className="text-white/60 text-xs">Options (one per line)</Label>
                              <textarea
                                value={editDraft.options}
                                onChange={e => setEditDraft(d => ({ ...d, options: e.target.value }))}
                                rows={3}
                                className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-sm text-white resize-none"
                              />
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`eq-required-${q.id}`}
                              checked={editDraft.isRequired === 1}
                              onChange={e => setEditDraft(d => ({ ...d, isRequired: e.target.checked ? 1 : 0 }))}
                              className="accent-[oklch(0.5_0.2_25)]"
                            />
                            <Label htmlFor={`eq-required-${q.id}`} className="text-white/60 text-sm cursor-pointer">Required</Label>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              const optionsJson = ["select", "radio", "checkbox"].includes(editDraft.fieldType) && editDraft.options.trim()
                                ? JSON.stringify(editDraft.options.split("\n").map((o: string) => o.trim()).filter(Boolean))
                                : null;
                              updateQuestion.mutate({
                                id: q.id,
                                questionText: editDraft.questionText,
                                fieldType: editDraft.fieldType,
                                options: optionsJson,
                                isRequired: editDraft.isRequired,
                                placeholder: editDraft.placeholder || null,
                              });
                            }}
                            disabled={updateQuestion.isPending}
                            className="bg-[oklch(0.5_0.2_25)] hover:bg-[oklch(0.55_0.22_25)] text-white"
                          >
                            {updateQuestion.isPending ? "Saving..." : "Save"}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="text-white/50 hover:text-white">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/60 border border-white/10">
                              {FIELD_TYPE_LABELS[q.fieldType] ?? q.fieldType}
                            </span>
                            {q.isRequired === 1 && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-[oklch(0.5_0.2_25_/_15%)] text-[oklch(0.7_0.15_25)] border border-[oklch(0.5_0.2_25_/_30%)]">
                                Required
                              </span>
                            )}
                            {q.isActive === 0 && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/30 border border-white/10">
                                Hidden
                              </span>
                            )}
                            <span className="text-white/20 text-xs">#{idx + 1}</span>
                          </div>
                          <p className="font-medium text-white/90">{q.questionText}</p>
                          {q.placeholder && <p className="text-white/40 text-xs mt-0.5">Hint: {q.placeholder}</p>}
                          {q.options && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {(() => { try { return JSON.parse(q.options) as string[]; } catch { return []; } })().map((opt: string) => (
                                <span key={opt} className="text-xs px-2 py-0.5 rounded bg-white/5 text-white/50 border border-white/10">{opt}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => updateQuestion.mutate({ id: q.id, isActive: q.isActive ? 0 : 1 })}
                            className="text-xs text-white/40 hover:text-white/80 transition-colors px-2 py-1 rounded hover:bg-white/5"
                          >
                            {q.isActive ? "Hide" : "Show"}
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(q.id);
                              setEditDraft({
                                questionText: q.questionText,
                                fieldType: q.fieldType as FieldType,
                                options: q.options ? (() => { try { return (JSON.parse(q.options!) as string[]).join("\n"); } catch { return q.options ?? ""; } })() : "",
                                isRequired: q.isRequired,
                                placeholder: q.placeholder ?? "",
                              });
                            }}
                            className="text-white/40 hover:text-white/80 transition-colors p-1 rounded hover:bg-white/5"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm("Delete this question? This cannot be undone.")) {
                                deleteQuestion.mutate({ id: q.id });
                              }
                            }}
                            className="text-red-400/60 hover:text-red-400 transition-colors p-1 rounded hover:bg-red-400/10"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── BLOCKED DATES TAB ────────────────────────────────────────────── */}
        {tab === "blocked" && (
          <div>
            <div className="mb-4">
              <h2 className="font-semibold text-lg">Blocked Dates</h2>
              <p className="text-white/40 text-sm">Block specific dates when you're unavailable (holidays, vacations, etc.)</p>
            </div>

            {/* Add blocked date form */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
              <h3 className="font-medium mb-3 text-sm">Block a Date</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 space-y-1">
                  <Label className="text-white/60 text-xs">Date</Label>
                  <Input
                    type="date"
                    value={newBlockDate}
                    onChange={e => setNewBlockDate(e.target.value)}
                    className="bg-white/5 border-white/20 text-white"
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <Label className="text-white/60 text-xs">Reason (optional)</Label>
                  <Input
                    value={newBlockReason}
                    onChange={e => setNewBlockReason(e.target.value)}
                    placeholder="Holiday, vacation..."
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={() => {
                      if (!newBlockDate) return toast.error("Please select a date");
                      addBlocked.mutate({ blockedDate: newBlockDate, reason: newBlockReason || undefined });
                      setNewBlockReason("");
                    }}
                    disabled={addBlocked.isPending || !newBlockDate}
                    className="bg-[oklch(0.5_0.2_25)] hover:bg-[oklch(0.55_0.22_25)] text-white"
                  >
                    <Plus size={14} className="mr-1" /> Block
                  </Button>
                </div>
              </div>
            </div>

            {/* Blocked dates list */}
            {!blocked?.length ? (
              <div className="text-center py-12 text-white/30">
                <Ban size={36} className="mx-auto mb-3 opacity-30" />
                <p>No blocked dates.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {blocked.map(b => (
                  <div key={b.id} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Ban size={14} className="text-red-400/60" />
                      <span className="font-medium">{formatDate(b.blockedDate)}</span>
                      {b.reason && <span className="text-white/40 text-sm">— {b.reason}</span>}
                    </div>
                    <button
                      onClick={() => removeBlocked.mutate({ id: b.id })}
                      className="text-white/30 hover:text-red-400 transition-colors p-1 rounded hover:bg-red-400/10"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
