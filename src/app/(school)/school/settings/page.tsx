"use client";

import * as React from "react";
import { Save } from "lucide-react";
import { Card, Input, Button, useToast } from "@/components/ui";

export default function SchoolSettingsPage() {
  const { push } = useToast();
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [emailAlerts, setEmailAlerts] = React.useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  function handlePasswordUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return push({ tone: "error", title: "Error", message: "Passwords do not match." });
    }
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      push({ tone: "success", title: "Password Updated", message: "Your portal password has been changed." });
    }, 600);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <h1 className="font-serif text-2xl font-bold text-[#14264D]">Account &amp; Security Settings</h1>
        <p className="mt-1 text-xs text-[#687487]">
          Manage your login credentials and candidate alert preferences.
        </p>
      </div>

      <Card className="p-6 border-slate-200">
        <h2 className="font-serif text-base font-bold text-[#14264D] mb-4">Change Password</h2>
        <form onSubmit={handlePasswordUpdate} className="space-y-3.5">
          <Input
            label="Current Password"
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <Input
            label="New Password"
            type="password"
            required
            placeholder="Minimum 8 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Input
            label="Confirm New Password"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button type="submit" size="md" disabled={saving} className="bg-[#1266C5] text-white">
            <Save className="mr-1.5 size-4" />
            <span>Update Password</span>
          </Button>
        </form>
      </Card>

      <Card className="p-6 border-slate-200">
        <h2 className="font-serif text-base font-bold text-[#14264D] mb-3">Notification Preferences</h2>
        <div className="space-y-3 text-xs">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="size-4 rounded text-[#1266C5]"
            />
            <span className="text-[#14264D] font-medium">Receive email notifications when new teacher dossiers are shared</span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={whatsappAlerts}
              onChange={(e) => setWhatsappAlerts(e.target.checked)}
              className="size-4 rounded text-[#1266C5]"
            />
            <span className="text-[#14264D] font-medium">Receive WhatsApp message alerts for interview demonstration confirmations</span>
          </label>
        </div>
      </Card>
    </div>
  );
}
