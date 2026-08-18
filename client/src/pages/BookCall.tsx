import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useSEO } from "@/hooks/useSEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  Calendar,
  Globe,
  Video,
  ArrowRight,
  Sparkles,
  ClipboardList,
} from "lucide-react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function formatTime(time: string) {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

function formatDate(dateStr: string) {
  const [y, mo, d] = dateStr.split("-").map(Number);
  const date = new Date(y, mo - 1, d);
  return date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

function formatDateShort(dateStr: string) {
  const [y, mo, d] = dateStr.split("-").map(Number);
  const date = new Date(y, mo - 1, d);
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

type Step = "calendar" | "slots" | "form" | "questionnaire" | "confirmed";

export default function BookCall() {
  useSEO({
    title: "Schedule a Call | FlowSites",
    description: "Book a free 30-minute strategy call with the FlowSites team. We'll discuss your business goals and how a high-converting website can grow your enrollment.",
    keywords: "schedule a call, discovery call, martial arts website consultation, free consultation, FlowSites",
  });

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ startTime: string; endTime: string } | null>(null);
  const [step, setStep] = useState<Step>("calendar");
  const [confirmationCode, setConfirmationCode] = useState<string | null>(null);

  const [form, setForm] = useState({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    businessName: "",
    notes: "",
  });
  const [formError, setFormError] = useState<string | null>(null);

  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
  const [questionnaireError, setQuestionnaireError] = useState<string | null>(null);

  const { data: questionsData } = trpc.questionnaire.getQuestions.useQuery(undefined, { staleTime: 300_000 });
  const activeQuestions = questionsData ?? [];

  const { data: monthData, isLoading: monthLoading } = trpc.scheduling.getMonthAvailability.useQuery(
    { year: viewYear, month: viewMonth },
    { staleTime: 60_000 }
  );

  const { data: slotsData, isLoading: slotsLoading } = trpc.scheduling.getAvailableSlots.useQuery(
    { date: selectedDate ?? "" },
    { enabled: !!selectedDate, staleTime: 30_000 }
  );

  const createBooking = trpc.scheduling.createBooking.useMutation({
    onSuccess: (data) => {
      setConfirmationCode(data.confirmationCode);
      setStep("confirmed");
    },
    onError: (err) => {
      setFormError(err.message);
    },
  });

  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth - 1, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
    const pad = (n: number) => String(n).padStart(2, "0");
    const days: Array<{ date: string; day: number; status: string; isPast: boolean } | null> = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${viewYear}-${pad(viewMonth)}-${pad(d)}`;
      const dateObj = new Date(viewYear, viewMonth - 1, d);
      const isPast = dateObj < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const status = monthData?.[dateStr] ?? "unavailable";
      days.push({ date: dateStr, day: d, status, isPast });
    }
    return days;
  }, [viewYear, viewMonth, monthData]);

  const prevMonth = () => {
    if (viewMonth === 1) { setViewYear(y => y - 1); setViewMonth(12); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 12) { setViewYear(y => y + 1); setViewMonth(1); }
    else setViewMonth(m => m + 1);
  };

  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    setSelectedSlot(null);
    setStep("slots");
  };

  const handleSlotClick = (slot: { startTime: string; endTime: string }) => {
    setSelectedSlot(slot);
    setStep("form");
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!form.guestName.trim() || !form.guestEmail.trim()) {
      setFormError("Name and email are required.");
      return;
    }
    if (activeQuestions.length > 0) {
      setStep("questionnaire");
    } else {
      submitBooking();
    }
  };

  const handleQuestionnaireSubmit = () => {
    setQuestionnaireError(null);
    for (const q of activeQuestions) {
      if (q.isRequired === 1) {
        const ans = answers[q.id];
        const isEmpty = !ans || (Array.isArray(ans) ? ans.length === 0 : !String(ans).trim());
        if (isEmpty) {
          setQuestionnaireError(`Please answer: "${q.questionText}"`);
          return;
        }
      }
    }
    submitBooking();
  };

  const submitBooking = () => {
    if (!selectedDate || !selectedSlot) return;
    const formattedAnswers = activeQuestions.map(q => ({
      questionId: q.id,
      answerText: (() => {
        const ans = answers[q.id];
        if (!ans) return null;
        if (Array.isArray(ans)) return ans.join(", ");
        return String(ans);
      })(),
    }));
    createBooking.mutate({
      ...form,
      bookingDate: selectedDate,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      answers: formattedAnswers,
    });
  };

  const getDayClass = (status: string, isPast: boolean, isSelected: boolean) => {
    if (isPast || status === "unavailable" || status === "full") {
      return "text-white/20 cursor-not-allowed";
    }
    if (isSelected) {
      return "bg-[oklch(0.5_0.2_25)] text-white font-bold cursor-pointer ring-2 ring-[oklch(0.5_0.2_25_/_50%)]";
    }
    if (status === "partial") {
      return "text-[oklch(0.78_0.12_85)] hover:bg-[oklch(0.78_0.12_85_/_15%)] cursor-pointer font-medium";
    }
    return "text-white hover:bg-white/10 cursor-pointer font-medium";
  };

  // Left panel info — shown on all steps
  const LeftPanel = () => (
    <div className="flex flex-col gap-6">
      {/* Host card */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[oklch(0.5_0.2_25)] to-[oklch(0.4_0.18_25)] flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-[oklch(0.5_0.2_25_/_30%)]">
          FS
        </div>
        <div>
          <p className="text-white/50 text-xs uppercase tracking-widest mb-0.5">FlowSites Agency</p>
          <h2 className="text-white font-bold text-lg leading-tight">Strategy Call</h2>
        </div>
      </div>

      {/* Call details */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 text-white/60 text-sm">
          <Clock size={15} className="text-[oklch(0.5_0.2_25)] shrink-0" />
          <span>30 minutes</span>
        </div>
        <div className="flex items-center gap-3 text-white/60 text-sm">
          <Video size={15} className="text-[oklch(0.5_0.2_25)] shrink-0" />
          <span>Google Meet / Zoom</span>
        </div>
        <div className="flex items-center gap-3 text-white/60 text-sm">
          <Globe size={15} className="text-[oklch(0.5_0.2_25)] shrink-0" />
          <span>Central Time (CT)</span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-white/10" />

      {/* What to expect */}
      <div>
        <p className="text-white/40 text-xs uppercase tracking-widest mb-3">What to expect</p>
        <ul className="space-y-2.5">
          {[
            "Review your current website & goals",
            "Discuss DojoFlow CRM integration",
            "Get a custom growth roadmap",
            "Transparent pricing & timeline",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm text-white/70">
              <CheckCircle2 size={14} className="text-[oklch(0.5_0.2_25)] mt-0.5 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Divider */}
      <div className="h-px bg-white/10" />

      {/* Selected summary (shown after date/time picked) */}
      {selectedDate && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
          <p className="text-white/40 text-xs uppercase tracking-widest">Your selection</p>
          <div className="flex items-center gap-2 text-white text-sm font-medium">
            <Calendar size={13} className="text-[oklch(0.5_0.2_25)]" />
            {formatDateShort(selectedDate)}
          </div>
          {selectedSlot && (
            <div className="flex items-center gap-2 text-white text-sm font-medium">
              <Clock size={13} className="text-[oklch(0.5_0.2_25)]" />
              {formatTime(selectedSlot.startTime)} – {formatTime(selectedSlot.endTime)} CT
            </div>
          )}
        </div>
      )}

      {/* Badge */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-[oklch(0.5_0.2_25_/_10%)] border border-[oklch(0.5_0.2_25_/_20%)] w-fit">
        <Sparkles size={12} className="text-[oklch(0.5_0.2_25)]" />
        <span className="text-xs text-[oklch(0.65_0.18_25)]">100% Free · No commitment</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[oklch(0.06_0.005_260)] text-white flex flex-col">
      {/* Minimal top bar */}
      <nav className="border-b border-white/8 px-6 py-3 flex items-center justify-between shrink-0">
        <Link href="/" className="flex items-center">
          <img
            src="/flowsites-logo.png"
            alt="FlowSites"
            className="h-28 w-auto"
          />
        </Link>
        <Link href="/" className="text-white/40 hover:text-white text-xs flex items-center gap-1 transition-colors">
          <ChevronLeft size={13} /> Back to site
        </Link>
      </nav>

      {/* Main content */}
      <div className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-5xl">
          {step === "confirmed" ? (
            /* ── CONFIRMED: full-width centered ── */
            <motion.div
              key="confirmed"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="max-w-lg mx-auto text-center"
            >
              <div className="w-20 h-20 rounded-full bg-[oklch(0.5_0.2_25_/_20%)] border border-[oklch(0.5_0.2_25_/_40%)] flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={36} className="text-[oklch(0.5_0.2_25)]" />
              </div>
              <h1 className="text-3xl font-bold mb-2">You're Booked!</h1>
              <p className="text-white/60 mb-8 leading-relaxed">
                Your strategy call is confirmed for{" "}
                <span className="text-white font-semibold">{selectedDate ? formatDate(selectedDate) : ""}</span>{" "}
                at{" "}
                <span className="text-white font-semibold">{selectedSlot ? formatTime(selectedSlot.startTime) : ""} CT</span>.
              </p>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6 text-left space-y-4">
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Confirmation Code</p>
                  <p className="text-2xl font-mono font-bold text-[oklch(0.5_0.2_25)]">{confirmationCode}</p>
                  <p className="text-white/40 text-xs mt-1">Save this to reschedule or cancel.</p>
                </div>
                <div className="h-px bg-white/10" />
                <div className="space-y-2 text-sm text-white/60">
                  <div className="flex items-center gap-2"><Calendar size={13} className="text-[oklch(0.5_0.2_25)]" />{selectedDate ? formatDate(selectedDate) : ""}</div>
                  <div className="flex items-center gap-2"><Clock size={13} className="text-[oklch(0.5_0.2_25)]" />{selectedSlot ? `${formatTime(selectedSlot.startTime)} – ${formatTime(selectedSlot.endTime)} CT` : ""}</div>
                  <div className="flex items-center gap-2"><Video size={13} className="text-[oklch(0.5_0.2_25)]" />Google Meet / Zoom link will be emailed to you</div>
                </div>
              </div>

              <p className="text-white/40 text-sm mb-6">
                A confirmation email has been sent. We'll follow up with a meeting link before your call.
              </p>
              <Link href="/">
                <Button className="bg-[oklch(0.5_0.2_25)] hover:bg-[oklch(0.55_0.22_25)] text-white font-semibold px-8 py-3 rounded-xl">
                  Back to Homepage
                </Button>
              </Link>
            </motion.div>
          ) : (
            /* ── TWO-PANEL LAYOUT ── */
            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-0 bg-[oklch(0.09_0.005_260)] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              {/* LEFT PANEL */}
              <div className="p-8 border-b lg:border-b-0 lg:border-r border-white/10 bg-[oklch(0.08_0.005_260)]">
                <LeftPanel />
              </div>

              {/* RIGHT PANEL */}
              <div className="p-8">
                <AnimatePresence mode="wait">
                  {/* STEP: Calendar */}
                  {step === "calendar" && (
                    <motion.div key="calendar" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                      <h3 className="text-white font-semibold text-lg mb-1">Select a Date</h3>
                      <p className="text-white/40 text-sm mb-6">Choose an available day to see open time slots.</p>

                      {/* Month nav */}
                      <div className="flex items-center justify-between mb-5">
                        <button
                          onClick={prevMonth}
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors text-white/60 hover:text-white"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <span className="text-white font-semibold text-sm">
                          {MONTH_NAMES[viewMonth - 1]} {viewYear}
                        </span>
                        <button
                          onClick={nextMonth}
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors text-white/60 hover:text-white"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>

                      {/* Day headers */}
                      <div className="grid grid-cols-7 mb-2">
                        {DAY_NAMES.map(d => (
                          <div key={d} className="text-center text-white/30 text-xs font-medium py-1">{d}</div>
                        ))}
                      </div>

                      {/* Calendar grid */}
                      {monthLoading ? (
                        <div className="h-48 flex items-center justify-center text-white/30 text-sm">Loading availability...</div>
                      ) : (
                        <div className="grid grid-cols-7 gap-1">
                          {calendarDays.map((day, i) => {
                            if (!day) return <div key={`empty-${i}`} />;
                            const isSelected = day.date === selectedDate;
                            const isAvailable = !day.isPast && day.status !== "unavailable" && day.status !== "full";
                            return (
                              <button
                                key={day.date}
                                disabled={!isAvailable}
                                onClick={() => isAvailable && handleDateClick(day.date)}
                                className={`
                                  h-9 w-full rounded-lg text-sm transition-all duration-150 flex items-center justify-center
                                  ${getDayClass(day.status, day.isPast, isSelected)}
                                `}
                              >
                                {day.day}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Legend */}
                      <div className="flex items-center gap-5 mt-6 text-xs text-white/40">
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-[oklch(0.5_0.2_25_/_40%)]" />
                          Available
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-[oklch(0.78_0.12_85_/_40%)]" />
                          Filling up
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-white/10" />
                          Unavailable
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP: Time slots */}
                  {step === "slots" && (
                    <motion.div key="slots" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                      <button
                        onClick={() => setStep("calendar")}
                        className="flex items-center gap-1.5 text-white/50 hover:text-white text-sm mb-5 transition-colors"
                      >
                        <ChevronLeft size={14} /> Back to calendar
                      </button>
                      <h3 className="text-white font-semibold text-lg mb-1">
                        {selectedDate ? formatDate(selectedDate) : ""}
                      </h3>
                      <p className="text-white/40 text-sm mb-6">All times shown in Central Time (CT)</p>

                      {slotsLoading ? (
                        <div className="h-40 flex items-center justify-center text-white/30 text-sm">Loading slots...</div>
                      ) : !slotsData || slotsData.slots.filter(s => s.available).length === 0 ? (
                        <div className="text-center py-10">
                          <p className="text-white/40 text-sm mb-4">No available slots for this day.</p>
                          <button
                            onClick={() => setStep("calendar")}
                            className="text-[oklch(0.65_0.18_25)] text-sm hover:underline"
                          >
                            Choose a different date
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                          {slotsData.slots.filter(s => s.available).map((slot) => (
                            <button
                              key={slot.startTime}
                              onClick={() => handleSlotClick(slot)}
                              className="group relative px-3 py-3 rounded-xl border border-white/15 hover:border-[oklch(0.5_0.2_25_/_60%)] hover:bg-[oklch(0.5_0.2_25_/_10%)] transition-all duration-150 text-center"
                            >
                              <span className="text-white text-sm font-medium group-hover:text-[oklch(0.65_0.18_25)] transition-colors">
                                {formatTime(slot.startTime)}
                              </span>
                              <ArrowRight size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/0 group-hover:text-[oklch(0.5_0.2_25)] transition-all" />
                            </button>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* STEP: Contact form */}
                  {step === "form" && (
                    <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                      <button
                        onClick={() => setStep("slots")}
                        className="flex items-center gap-1.5 text-white/50 hover:text-white text-sm mb-5 transition-colors"
                      >
                        <ChevronLeft size={14} /> Back to time slots
                      </button>
                      <h3 className="text-white font-semibold text-lg mb-1">Your Details</h3>
                      <p className="text-white/40 text-sm mb-6">We'll send a confirmation to your email.</p>

                      <form onSubmit={handleFormSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-white/70 text-xs uppercase tracking-wider">Full Name *</Label>
                            <Input
                              value={form.guestName}
                              onChange={e => setForm(f => ({ ...f, guestName: e.target.value }))}
                              placeholder="John Smith"
                              className="bg-white/5 border-white/15 text-white placeholder:text-white/25 focus:border-[oklch(0.5_0.2_25)] focus:ring-0 h-11 rounded-xl"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-white/70 text-xs uppercase tracking-wider">Email Address *</Label>
                            <Input
                              type="email"
                              value={form.guestEmail}
                              onChange={e => setForm(f => ({ ...f, guestEmail: e.target.value }))}
                              placeholder="john@example.com"
                              className="bg-white/5 border-white/15 text-white placeholder:text-white/25 focus:border-[oklch(0.5_0.2_25)] focus:ring-0 h-11 rounded-xl"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-white/70 text-xs uppercase tracking-wider">Phone Number</Label>
                            <Input
                              type="tel"
                              value={form.guestPhone}
                              onChange={e => setForm(f => ({ ...f, guestPhone: e.target.value }))}
                              placeholder="(555) 000-0000"
                              className="bg-white/5 border-white/15 text-white placeholder:text-white/25 focus:border-[oklch(0.5_0.2_25)] focus:ring-0 h-11 rounded-xl"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-white/70 text-xs uppercase tracking-wider">Business Name</Label>
                            <Input
                              value={form.businessName}
                              onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))}
                              placeholder="My Business LLC"
                              className="bg-white/5 border-white/15 text-white placeholder:text-white/25 focus:border-[oklch(0.5_0.2_25)] focus:ring-0 h-11 rounded-xl"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-white/70 text-xs uppercase tracking-wider">Anything you'd like us to know?</Label>
                          <Textarea
                            value={form.notes}
                            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                            placeholder="Tell us about your business, current website, or goals..."
                            rows={3}
                            className="bg-white/5 border-white/15 text-white placeholder:text-white/25 focus:border-[oklch(0.5_0.2_25)] focus:ring-0 rounded-xl resize-none"
                          />
                        </div>

                        {formError && (
                          <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-2.5">{formError}</p>
                        )}

                        <Button
                          type="submit"
                          className="w-full bg-[oklch(0.5_0.2_25)] hover:bg-[oklch(0.55_0.22_25)] text-white font-semibold h-12 rounded-xl text-base transition-all shadow-lg shadow-[oklch(0.5_0.2_25_/_25%)] hover:shadow-[oklch(0.5_0.2_25_/_40%)]"
                        >
                          {activeQuestions.length > 0 ? "Next: Quick Questions" : "Confirm Booking"}
                          <ArrowRight size={16} className="ml-2" />
                        </Button>

                        <p className="text-center text-white/25 text-xs">
                          By booking, you agree to receive a confirmation email. No spam, ever.
                        </p>
                      </form>
                    </motion.div>
                  )}

                  {/* STEP: Questionnaire */}
                  {step === "questionnaire" && (
                    <motion.div key="questionnaire" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                      <button
                        onClick={() => setStep("form")}
                        className="flex items-center gap-1.5 text-white/50 hover:text-white text-sm mb-5 transition-colors"
                      >
                        <ChevronLeft size={14} /> Back to details
                      </button>
                      <div className="flex items-center gap-2 mb-1">
                        <ClipboardList size={18} className="text-[oklch(0.5_0.2_25)]" />
                        <h3 className="text-white font-semibold text-lg">A Few Quick Questions</h3>
                      </div>
                      <p className="text-white/40 text-sm mb-6">Help us make the most of your strategy call.</p>

                      <div className="space-y-5">
                        {activeQuestions.map((q) => {
                          const opts: string[] = q.options ? (() => { try { return JSON.parse(q.options!) as string[]; } catch { return []; } })() : [];
                          const currentAnswer = answers[q.id];

                          return (
                            <div key={q.id} className="space-y-2">
                              <Label className="text-white/80 font-medium text-sm">
                                {q.questionText}
                                {q.isRequired === 1 && <span className="text-[oklch(0.5_0.2_25)] ml-1">*</span>}
                              </Label>
                              {q.placeholder && <p className="text-white/35 text-xs">{q.placeholder}</p>}

                              {q.fieldType === "text" && (
                                <Input
                                  value={(currentAnswer as string) ?? ""}
                                  onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))}
                                  placeholder={q.placeholder ?? ""}
                                  className="bg-white/5 border-white/15 text-white placeholder:text-white/25 focus:border-[oklch(0.5_0.2_25)] h-11 rounded-xl"
                                />
                              )}
                              {q.fieldType === "textarea" && (
                                <Textarea
                                  value={(currentAnswer as string) ?? ""}
                                  onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))}
                                  placeholder={q.placeholder ?? ""}
                                  rows={3}
                                  className="bg-white/5 border-white/15 text-white placeholder:text-white/25 focus:border-[oklch(0.5_0.2_25)] rounded-xl resize-none"
                                />
                              )}
                              {q.fieldType === "select" && (
                                <select
                                  value={(currentAnswer as string) ?? ""}
                                  onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))}
                                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white"
                                >
                                  <option value="" className="bg-[#111118] text-white/40">Select an option...</option>
                                  {opts.map(opt => (
                                    <option key={opt} value={opt} className="bg-[#111118]">{opt}</option>
                                  ))}
                                </select>
                              )}
                              {q.fieldType === "radio" && (
                                <div className="space-y-2">
                                  {opts.map(opt => (
                                    <label key={opt} className="flex items-center gap-2.5 cursor-pointer group">
                                      <input
                                        type="radio"
                                        name={`q-${q.id}`}
                                        value={opt}
                                        checked={currentAnswer === opt}
                                        onChange={() => setAnswers(a => ({ ...a, [q.id]: opt }))}
                                        className="accent-[oklch(0.5_0.2_25)]"
                                      />
                                      <span className="text-sm text-white/60 group-hover:text-white transition-colors">{opt}</span>
                                    </label>
                                  ))}
                                </div>
                              )}
                              {q.fieldType === "checkbox" && (
                                <div className="space-y-2">
                                  {opts.map(opt => {
                                    const checked = Array.isArray(currentAnswer) && currentAnswer.includes(opt);
                                    return (
                                      <label key={opt} className="flex items-center gap-2.5 cursor-pointer group">
                                        <input
                                          type="checkbox"
                                          checked={checked}
                                          onChange={e => {
                                            const prev = Array.isArray(currentAnswer) ? currentAnswer : [];
                                            setAnswers(a => ({
                                              ...a,
                                              [q.id]: e.target.checked ? [...prev, opt] : prev.filter(v => v !== opt),
                                            }));
                                          }}
                                          className="accent-[oklch(0.5_0.2_25)]"
                                        />
                                        <span className="text-sm text-white/60 group-hover:text-white transition-colors">{opt}</span>
                                      </label>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {questionnaireError && (
                          <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-2.5">{questionnaireError}</p>
                        )}

                        <Button
                          onClick={handleQuestionnaireSubmit}
                          disabled={createBooking.isPending}
                          className="w-full bg-[oklch(0.5_0.2_25)] hover:bg-[oklch(0.55_0.22_25)] text-white font-semibold h-12 rounded-xl text-base transition-all shadow-lg shadow-[oklch(0.5_0.2_25_/_25%)]"
                        >
                          {createBooking.isPending ? "Confirming..." : "Confirm My Booking"}
                          <ArrowRight size={16} className="ml-2" />
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
