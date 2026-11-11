"use client";

import * as React from "react";
import { Send } from "lucide-react";
import { Card, Button, useToast } from "@/components/ui";

const INITIAL_MESSAGES = [
  {
    sender: "admin",
    author: "Career Avsar Coordinator",
    text: "Welcome to Career Avsar School Recruitment Portal. We have forwarded two candidate dossiers for your PGT Mathematics opening.",
    time: "Yesterday, 04:30 PM",
  },
  {
    sender: "school",
    author: "You (DPS Principal)",
    text: "Thank you. We reviewed Ananya Verma's profile and would like to schedule an in-person demo for Class 11 Mathematics.",
    time: "Today, 10:15 AM",
  },
  {
    sender: "admin",
    author: "Career Avsar Coordinator",
    text: "We will coordinate with the candidate immediately and confirm the campus slot.",
    time: "Today, 11:20 AM",
  },
];

export default function SchoolMessagesPage() {
  const { push } = useToast();
  const [messages, setMessages] = React.useState(INITIAL_MESSAGES);
  const [newMsg, setNewMsg] = React.useState("");

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!newMsg.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        sender: "school",
        author: "You",
        text: newMsg.trim(),
        time: "Just now",
      },
    ]);
    setNewMsg("");
    push({ tone: "success", title: "Message Sent", message: "Sent to Career Avsar coordinator." });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <h1 className="font-serif text-2xl font-bold text-[#14264D]">Recruitment Communications</h1>
        <p className="mt-1 text-xs text-[#687487]">
          Direct message desk with your assigned Career Avsar institutional placement manager.
        </p>
      </div>

      <Card className="p-6 border-slate-200 max-w-3xl">
        <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2 pb-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${
                m.sender === "school" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`max-w-md rounded-2xl p-4 text-xs ${
                  m.sender === "school"
                    ? "bg-[#1266C5] text-white"
                    : "bg-slate-100 text-[#14264D] border border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-1">
                  <span className="font-bold text-[11px] opacity-90">{m.author}</span>
                  <span className="text-[10px] opacity-75">{m.time}</span>
                </div>
                <p className="leading-relaxed">{m.text}</p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSend} className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
          <input
            type="text"
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            placeholder="Type your message to Career Avsar coordinator..."
            className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-[#14264D] focus:border-[#1266C5] focus:outline-none"
          />
          <Button type="submit" size="md" className="bg-[#1266C5] text-white">
            <Send className="size-4" />
          </Button>
        </form>
      </Card>
    </div>
  );
}
