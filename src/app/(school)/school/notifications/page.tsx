"use client";

import * as React from "react";
import { CalendarDays, Users, Briefcase } from "lucide-react";
import { Card, Button } from "@/components/ui";

const DUMMY_NOTIFICATIONS = [
  {
    id: "notif_1",
    title: "New Candidate Shared",
    message: "Admin coordinator has forwarded Ananya Verma's dossier for PGT Mathematics opening.",
    time: "2 hours ago",
    read: false,
    icon: Users,
  },
  {
    id: "notif_2",
    title: "Demonstration Lecture Confirmed",
    message: "Candidate Rajesh Tiwari has confirmed attendance for in-person demonstration on 14 Nov 2026.",
    time: "Yesterday",
    read: true,
    icon: CalendarDays,
  },
  {
    id: "notif_3",
    title: "Vacancy Approved & Published",
    message: "Your requirement for TGT Science Specialist has been verified and published to the active registry.",
    time: "3 days ago",
    read: true,
    icon: Briefcase,
  },
];

export default function SchoolNotificationsPage() {
  const [items, setItems] = React.useState(DUMMY_NOTIFICATIONS);

  function markAllRead() {
    setItems((prev) => prev.map((item) => ({ ...item, read: true })));
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#14264D]">Institution Notifications</h1>
          <p className="mt-1 text-xs text-[#687487]">
            Real-time updates regarding vacancy approvals, shared educator dossiers, and demo confirmations.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={markAllRead}>
          Mark All Read
        </Button>
      </div>

      <div className="space-y-3">
        {items.map((n) => {
          const Icon = n.icon;
          return (
            <Card
              key={n.id}
              className={`p-4 border-slate-200 transition ${
                !n.read ? "bg-blue-50/40 border-blue-200" : "bg-white"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1266C5]">
                  <Icon className="size-4" />
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#14264D]">{n.title}</span>
                    <span className="text-[11px] text-muted">{n.time}</span>
                  </div>
                  <p className="text-xs text-[#687487] mt-1 leading-relaxed">{n.message}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
