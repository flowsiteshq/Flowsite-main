/**
 * SmsModal — 800.com SMS integration
 * Allows reps to send text messages to leads/clients and view conversation history.
 *
 * Message source: local sms_logs DB (outbound we sent + inbound via 800.com webhook).
 * Auto-polls every 15 seconds when the modal is open so inbound replies appear in real time.
 */

import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { getTZFromPhone, getLocalTimeInfo } from "@/lib/timezones";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  MessageSquare,
  Send,
  RefreshCw,
  Phone,
  AlertCircle,
  CheckCheck,
  Check,
  Clock,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SmsModalProps {
  open: boolean;
  onClose: () => void;
  contactName: string;
  contactPhone: string;
  leadId?: number;
  clientAccountId?: number;
}

type LocalMessage = {
  id: string;
  direction: "outbound" | "inbound";
  message: string;
  sentBy: string | null;
  status: string;
  createdAt: string;
  conversationId: string | null;
};

export function SmsModal({
  open,
  onClose,
  contactName,
  contactPhone,
  leadId,
}: SmsModalProps) {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [warnDismissed, setWarnDismissed] = useState(false);

  // Compute lead's local time info from their phone area code
  const tzInfo = contactPhone ? getTZFromPhone(contactPhone) : null;
  const [timeInfo, setTimeInfo] = useState(() =>
    tzInfo ? getLocalTimeInfo(tzInfo.tz) : null
  );

  // Re-compute every 60 seconds so the banner stays accurate
  useEffect(() => {
    if (!tzInfo) return;
    setTimeInfo(getLocalTimeInfo(tzInfo.tz));
    const interval = setInterval(() => {
      setTimeInfo(getLocalTimeInfo(tzInfo.tz));
    }, 60_000);
    return () => clearInterval(interval);
  }, [tzInfo?.tz]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset dismiss state when modal opens for a new contact
  useEffect(() => {
    if (open) setWarnDismissed(false);
  }, [open, contactPhone]);

  const showWarning = !warnDismissed && tzInfo && timeInfo && timeInfo.status !== "good";

  // Primary message source: local DB (outbound + inbound webhook replies)
  const {
    data: localMessages,
    isLoading: loadingLocal,
    refetch: refetchLocal,
  } = trpc.communications.getLocalMessages.useQuery(
    { contactPhone },
    {
      enabled: open && !!contactPhone,
      // Poll every 15 seconds while modal is open to pick up inbound replies
      refetchInterval: open ? 15_000 : false,
      refetchIntervalInBackground: false,
    }
  );

  // Scroll to bottom when messages update
  useEffect(() => {
    if (localMessages && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [localMessages]);

  const sendSmsMutation = trpc.communications.sendSms.useMutation({
    onSuccess: () => {
      toast.success(`SMS delivered to ${contactName}`);
      setMessage("");
      // Refresh messages after a short delay to show the sent message
      setTimeout(() => refetchLocal(), 800);
    },
    onError: (err: { message: string }) => {
      toast.error(`Failed to send SMS: ${err.message}`);
    },
  });

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed || !contactPhone) return;
    sendSmsMutation.mutate({
      recipientPhone: contactPhone,
      message: trimmed,
      leadId,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const messages = localMessages as LocalMessage[] | undefined;
  const isLoading = loadingLocal;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg w-full flex flex-col h-[600px] p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-border shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[oklch(0.5_0.2_25_/_15%)] flex items-center justify-center">
                <MessageSquare size={16} className="text-[oklch(0.5_0.2_25)]" />
              </div>
              <div>
                <DialogTitle className="text-sm font-semibold leading-tight">
                  {contactName}
                </DialogTitle>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                  {contactPhone}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Live indicator — pulses while polling */}
              {open && (
                <span className="flex items-center gap-1 text-[10px] text-green-600 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Live
                </span>
              )}
              <a
                href={`tel:${contactPhone}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-colors"
              >
                <Phone size={12} />
                Call
              </a>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => refetchLocal()}
                title="Refresh"
              >
                <RefreshCw size={13} className={cn(isLoading && "animate-spin")} />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Outside-hours warning banner */}
        {showWarning && (
          <div
            className={cn(
              "mx-4 mt-3 mb-0 rounded-xl px-3.5 py-2.5 flex items-start gap-2.5 text-sm shrink-0",
              timeInfo?.status === "closed"
                ? "bg-red-500/10 border border-red-500/25 text-red-600"
                : "bg-amber-500/10 border border-amber-500/25 text-amber-600"
            )}
          >
            <Clock size={15} className="mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-xs leading-snug">
                {timeInfo?.status === "closed" ? "Outside business hours" : "Borderline hours"}
                {" — "}
                <span className="font-bold">
                  {timeInfo?.time} {tzInfo?.label}
                </span>
                {" for "}{contactName}
              </p>
              <p className="text-[11px] mt-0.5 opacity-80">
                {timeInfo?.status === "closed"
                  ? "It's currently outside normal business hours (9am–6pm). Consider scheduling your message for later."
                  : "It's early morning or evening for this contact. They may not respond immediately."}
              </p>
            </div>
            <button
              onClick={() => setWarnDismissed(true)}
              className="shrink-0 opacity-60 hover:opacity-100 transition-opacity mt-0.5"
              title="Dismiss warning"
            >
              <X size={13} />
            </button>
          </div>
        )}

        {/* Message thread */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 min-h-0">
          {isLoading && (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              <RefreshCw size={14} className="animate-spin mr-2" />
              Loading conversation...
            </div>
          )}

          {!isLoading && (!messages || messages.length === 0) && (
            <div className="flex flex-col items-center justify-center h-full text-center gap-2">
              <MessageSquare size={32} className="text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No messages yet.</p>
              <p className="text-xs text-muted-foreground/60">
                Send a message below to start the conversation.
                <br />
                Inbound replies will appear here automatically.
              </p>
            </div>
          )}

          {messages?.map((msg) => {
            const isOutbound = msg.direction === "outbound";
            return (
              <div
                key={msg.id}
                className={cn(
                  "flex flex-col gap-0.5",
                  isOutbound ? "items-end" : "items-start"
                )}
              >
                {/* Sender label for outbound messages */}
                {isOutbound && msg.sentBy && (
                  <span className="text-[10px] text-muted-foreground px-1">
                    {msg.sentBy}
                  </span>
                )}
                {!isOutbound && (
                  <span className="text-[10px] text-muted-foreground px-1">
                    {contactName}
                  </span>
                )}
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
                    isOutbound
                      ? "bg-[oklch(0.5_0.2_25)] text-white rounded-br-sm"
                      : "bg-muted text-foreground rounded-bl-sm"
                  )}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                  <div
                    className={cn(
                      "flex items-center justify-end gap-1 mt-1",
                      isOutbound ? "text-white/60" : "text-muted-foreground"
                    )}
                  >
                    <span className="text-[10px]">{formatTime(msg.createdAt)}</span>
                    {isOutbound && (
                      msg.status === "delivered" ? (
                        <CheckCheck size={11} />
                      ) : (
                        <Check size={11} />
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        {/* Compose area */}
        <div className="px-4 pb-4 pt-3 border-t border-border shrink-0">
          <div className="flex gap-2 items-end">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${contactName}… (Ctrl+Enter to send)`}
              className="resize-none min-h-[60px] max-h-[120px] text-sm"
              maxLength={1600}
              disabled={sendSmsMutation.isPending}
            />
            <Button
              onClick={handleSend}
              disabled={!message.trim() || sendSmsMutation.isPending || !contactPhone}
              size="icon"
              className="h-10 w-10 shrink-0 bg-[oklch(0.5_0.2_25)] hover:bg-[oklch(0.45_0.2_25)] text-white"
              title="Send (Ctrl+Enter)"
            >
              {sendSmsMutation.isPending ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <Send size={14} />
              )}
            </Button>
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[10px] text-muted-foreground">
              Via 800.com · {contactPhone} · auto-refreshes every 15s
            </span>
            <span className="text-[10px] text-muted-foreground">
              {message.length}/1600
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Small inline "Text" button that opens the SmsModal with optional unread badge */
export function SmsButton({
  contactName,
  contactPhone,
  leadId,
  clientAccountId,
  variant = "default",
}: {
  contactName: string;
  contactPhone: string;
  leadId?: number;
  clientAccountId?: number;
  variant?: "default" | "compact";
}) {
  const [open, setOpen] = useState(false);

  // Poll for unread inbound messages (last 24h) to show a badge
  const { data: unreadData } = trpc.communications.getUnreadCount.useQuery(
    { contactPhone },
    {
      enabled: !!contactPhone && !open,
      refetchInterval: 60_000, // check every minute when modal is closed
      refetchIntervalInBackground: false,
    }
  );
  const unreadCount = unreadData?.count ?? 0;

  if (!contactPhone) return null;

  return (
    <>
      {variant === "compact" ? (
        <button
          onClick={(e) => { e.stopPropagation(); setOpen(true); }}
          className="relative inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-colors"
          title={`Text ${contactName}`}
        >
          <MessageSquare size={10} />
          Text
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      ) : (
        <button
          onClick={(e) => { e.stopPropagation(); setOpen(true); }}
          className="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-colors"
          title={`Text ${contactName}`}
        >
          <MessageSquare size={12} />
          Text
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      )}
      <SmsModal
        open={open}
        onClose={() => setOpen(false)}
        contactName={contactName}
        contactPhone={contactPhone}
        leadId={leadId}
        clientAccountId={clientAccountId}
      />
    </>
  );
}
