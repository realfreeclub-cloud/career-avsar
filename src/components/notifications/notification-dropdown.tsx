"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  CalendarDays,
  CheckCheck,
  FileText,
  Megaphone,
  Info,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  type: "system" | "application" | "interview" | "announcement";
  channel?: "in_app" | "email" | "sms" | "whatsapp";
  priority?: "normal" | "high" | "urgent";
  href?: string;
  read: boolean;
  createdAt: string;
};

function formatRelativeTime(dateStr: string): string {
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    if (diffMs < 0) return "Just now";
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return "Just now";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(dateStr).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

export function NotificationDropdown({ className }: { className?: string }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [markingAll, setMarkingAll] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const fetchNotifications = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/teacher/notifications", { credentials: "same-origin" });
      if (res.ok) {
        const json = await res.json();
        if (json?.data?.items) {
          setItems(json.data.items);
          setUnreadCount(json.data.unread ?? json.data.items.filter((i: NotificationItem) => !i.read).length);
        }
      }
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 45000); // polite background polling
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  React.useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  async function handleMarkRead(item: NotificationItem) {
    if (!item.read) {
      // optimistic update
      setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, read: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
      await fetch(`/api/teacher/notifications/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      }).catch(() => {});
    }
    if (item.href) {
      setOpen(false);
      router.push(item.href);
    }
  }

  async function handleMarkAllRead() {
    setMarkingAll(true);
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    try {
      await fetch("/api/teacher/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_all_read" }),
      });
    } catch {
      // fallback
    } finally {
      setMarkingAll(false);
    }
  }

  const getTypeIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "interview":
        return <CalendarDays className="size-4 text-secondary" />;
      case "application":
        return <FileText className="size-4 text-primary" />;
      case "announcement":
        return <Megaphone className="size-4 text-accent-gold" />;
      default:
        return <Info className="size-4 text-muted" />;
    }
  };

  const previewList = items.slice(0, 5);

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          if (!open) fetchNotifications();
        }}
        className="touch-target relative inline-flex size-9 items-center justify-center rounded-xl border border-border/80 bg-white/90 text-primary transition-all duration-200 hover:border-border hover:bg-soft-blue hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 shadow-xs"
        aria-label={`Notifications (${unreadCount} unread)`}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <Bell className="size-4.5" aria-hidden />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white shadow-xs animate-in zoom-in-75">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Notification Center"
          className="absolute right-0 top-full z-50 mt-2.5 w-[min(380px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border/80 bg-white/95 p-0 shadow-2xl backdrop-blur-md animate-in fade-in-50 zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/70 bg-[#FAF9F5]/80 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="font-serif text-sm font-bold text-primary">Notifications</span>
              {unreadCount > 0 ? (
                <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-semibold text-primary">
                  {unreadCount} new
                </span>
              ) : null}
            </div>
            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={markingAll}
                className="flex items-center gap-1 text-[11px] font-medium text-secondary hover:text-primary disabled:opacity-50"
              >
                <CheckCheck className="size-3.5" />
                <span>Mark all read</span>
              </button>
            ) : null}
          </div>

          {/* List items */}
          <div className="max-h-[380px] divide-y divide-border/40 overflow-y-auto">
            {loading && items.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-8 text-center text-muted">
                <Loader2 className="size-5 animate-spin text-secondary" />
                <span className="text-xs">Loading notifications...</span>
              </div>
            ) : previewList.length === 0 ? (
              <div className="py-8 text-center text-muted">
                <Bell className="mx-auto size-6 text-muted/50 mb-1.5" />
                <p className="text-xs font-medium text-text">No notifications yet</p>
                <p className="text-[11px] text-muted">Updates regarding applications will appear here</p>
              </div>
            ) : (
              previewList.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleMarkRead(item)}
                  className={cn(
                    "group flex cursor-pointer items-start gap-3 p-3.5 text-left transition-colors hover:bg-soft-blue/50",
                    !item.read ? "bg-[#FAF9F5]/60" : "bg-white",
                  )}
                >
                  <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-white shadow-2xs">
                    {getTypeIcon(item.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p
                        className={cn(
                          "truncate text-xs text-primary",
                          !item.read ? "font-bold" : "font-medium",
                        )}
                      >
                        {item.title}
                      </p>
                      <span className="shrink-0 text-[10px] text-muted">
                        {formatRelativeTime(item.createdAt)}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-[11px] text-muted">
                      {item.body}
                    </p>
                  </div>
                  {!item.read ? (
                    <span className="mt-2 size-2 shrink-0 rounded-full bg-accent" />
                  ) : null}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border/70 bg-[#FAF9F5]/80 p-2.5 text-center">
            <Link
              href="/teacher/dashboard/notifications"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-1.5 rounded-xl py-1.5 text-xs font-semibold text-secondary hover:bg-soft-blue hover:text-primary transition"
            >
              <span>View All Notifications & Preferences</span>
              <ChevronRight className="size-3.5" />
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
