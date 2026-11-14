"use client";

import * as React from "react";
import { useState } from "react";
import {
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  ExternalLink,
  Search,
  X,
  Loader2,
  CalendarCheck,
  FileText,
  Download,
  ShieldCheck,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import {
  approveStartupAndScheduleMeeting,
  markMeetingSuccessfulAndIssueNDA,
} from "../actions";

export type StartupRecord = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  submittedAt: Date | string | null;
  createdAt: Date | string;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  } | null;
  meeting: {
    id: string;
    scheduledAt: Date | string;
    meetingLink: string | null;
    durationMinutes: number;
    notes: string | null;
    status: string;
    completedAt?: Date | string | null;
  } | null;
  agreement: {
    id: string;
    title: string;
    status: string;
    fullySignedAt?: Date | string | null;
    sentAt?: Date | string | null;
    signatures: Array<{
      id: string;
      signerName: string;
      signerEmail: string;
      status: string;
      signedAt?: Date | string | null;
    }>;
  } | null;
};

export function StartupsTable({ initialStartups }: { initialStartups: StartupRecord[] }) {
  const [startups, setStartups] = useState<StartupRecord[]>(initialStartups);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStartup, setSelectedStartup] = useState<StartupRecord | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [completingMeetingId, setCompletingMeetingId] = useState<string | null>(null);

  // Form State for Scheduling Dialog
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingTime, setMeetingTime] = useState("15:00");
  const [meetingLink, setMeetingLink] = useState("https://meet.google.com/new");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter startups
  const filtered = startups.filter((s) => {
    const q = searchTerm.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      (s.description && s.description.toLowerCase().includes(q)) ||
      (s.user?.email && s.user.email.toLowerCase().includes(q)) ||
      (s.user?.name && s.user.name.toLowerCase().includes(q))
    );
  });

  const openApproveDialog = (item: StartupRecord) => {
    setSelectedStartup(item);
    if (item.meeting?.scheduledAt) {
      const d = new Date(item.meeting.scheduledAt);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const hh = String(d.getHours()).padStart(2, "0");
      const min = String(d.getMinutes()).padStart(2, "0");
      setMeetingDate(`${yyyy}-${mm}-${dd}`);
      setMeetingTime(`${hh}:${min}`);
      setMeetingLink(item.meeting.meetingLink || "https://meet.google.com/new");
      setDurationMinutes(item.meeting.durationMinutes || 30);
      setNotes(item.meeting.notes || "");
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const yyyy = tomorrow.getFullYear();
      const mm = String(tomorrow.getMonth() + 1).padStart(2, "0");
      const dd = String(tomorrow.getDate()).padStart(2, "0");
      setMeetingDate(`${yyyy}-${mm}-${dd}`);
      setMeetingTime("15:00");
      setMeetingLink("https://meet.google.com/new");
      setDurationMinutes(30);
      setNotes("Initial technical discovery and MVP roadmap strategy call.");
    }
    setIsDialogOpen(true);
  };

  const handleApproveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStartup) return;

    if (!meetingDate || !meetingTime) {
      toast.error("Please pick both a meeting date and time.");
      return;
    }

    const scheduledAt = `${meetingDate}T${meetingTime}:00`;
    setIsSubmitting(true);

    try {
      const res = await approveStartupAndScheduleMeeting({
        startupId: selectedStartup.id,
        scheduledAt,
        meetingLink,
        durationMinutes: Number(durationMinutes),
        notes,
      });

      if (res.success) {
        toast.success(`Meeting scheduled and startup approved!`);
        setStartups((prev) =>
          prev.map((s) =>
            s.id === selectedStartup.id
              ? {
                  ...s,
                  status: "approved",
                  meeting: {
                    id: s.meeting?.id || "temp-id",
                    scheduledAt: new Date(scheduledAt),
                    meetingLink,
                    durationMinutes: Number(durationMinutes),
                    notes,
                    status: "scheduled",
                  },
                }
              : s
          )
        );
        setIsDialogOpen(false);
      } else {
        toast.error(res.error || "Failed to schedule meeting.");
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkSuccessful = async (startupId: string) => {
    setCompletingMeetingId(startupId);
    try {
      const res = await markMeetingSuccessfulAndIssueNDA(startupId);
      if (res.success) {
        toast.success("Meeting marked successful! Mutual NDA issued to founder.");
        setStartups((prev) =>
          prev.map((s) =>
            s.id === startupId
              ? {
                  ...s,
                  meeting: s.meeting ? { ...s.meeting, status: "completed", completedAt: new Date() } : null,
                  agreement: {
                    id: s.agreement?.id || "nda-id",
                    title: "Mutual Non-Disclosure Agreement (NDA)",
                    status: "sent",
                    signatures: [],
                  },
                }
              : s
          )
        );
      } else {
        toast.error(res.error || "Failed to mark meeting as successful.");
      }
    } catch {
      toast.error("An error occurred while updating meeting.");
    } finally {
      setCompletingMeetingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search startups, ideas, or founders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-full border border-neutral-200 bg-white py-2.5 pl-9 pr-4 font-['Inter'] text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-900"
          />
        </div>
        <div className="font-['JetBrains_Mono'] text-xs tabular-nums text-neutral-500">
          Showing {filtered.length} of {startups.length} submissions
        </div>
      </div>

      {/* Startups Table */}
      <div className="overflow-x-auto rounded-3xl border border-neutral-200/80 bg-white shadow-xs">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50/70 font-['Plus_Jakarta_Sans'] text-xs font-semibold uppercase tracking-wider text-neutral-500">
            <tr>
              <th className="px-5 py-3.5">Startup &amp; Concept</th>
              <th className="px-5 py-3.5">Founder</th>
              <th className="px-5 py-3.5">Discovery Meeting</th>
              <th className="px-5 py-3.5">NDA Status</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 font-['Inter']">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-sm text-neutral-400">
                  No startup submissions found in database.
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const isMeetingScheduled = item.meeting?.status === "scheduled";
                const isMeetingCompleted = item.meeting?.status === "completed";
                const isNdaSigned = item.agreement?.status === "signed";
                const isNdaSent = item.agreement?.status === "sent";

                return (
                  <tr key={item.id} className="transition-colors hover:bg-neutral-50/60">
                    {/* Startup Details */}
                    <td className="px-5 py-4 align-top">
                      <div className="font-['Space_Grotesk'] font-semibold text-neutral-900">{item.name}</div>
                      <p className="mt-1 line-clamp-2 max-w-xs text-xs leading-relaxed text-neutral-500">
                        {item.description || "No description provided"}
                      </p>
                      <div className="mt-1.5 flex items-center gap-2 font-['JetBrains_Mono'] text-[11px] text-neutral-400">
                        <span>Submitted:</span>
                        <span className="tabular-nums">
                          {item.submittedAt || item.createdAt
                            ? new Date(item.submittedAt || item.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "N/A"}
                        </span>
                      </div>
                    </td>

                    {/* Founder */}
                    <td className="px-5 py-4 align-top">
                      <div className="font-medium text-neutral-900">
                        {item.user?.name || "Unknown Founder"}
                      </div>
                      <div className="text-xs text-neutral-500">{item.user?.email || "No email"}</div>
                    </td>

                    {/* Discovery Meeting */}
                    <td className="px-5 py-4 align-top">
                      {isMeetingCompleted ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-50 px-3 py-1 font-['Plus_Jakarta_Sans'] text-xs font-semibold text-emerald-800">
                            <Check className="size-3" />
                            Meeting Completed
                          </span>
                          <div className="font-['JetBrains_Mono'] text-[11px] tabular-nums text-neutral-400">
                            {item.meeting?.completedAt
                              ? new Date(item.meeting.completedAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "Verified"}
                          </div>
                        </div>
                      ) : isMeetingScheduled && item.meeting ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-900">
                            <CalendarCheck className="size-3.5 text-emerald-600" />
                            <span className="font-['JetBrains_Mono'] tabular-nums">
                              {new Date(item.meeting.scheduledAt).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })}{" "}
                              at{" "}
                              {new Date(item.meeting.scheduledAt).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>

                          {item.meeting.meetingLink && (
                            <a
                              href={item.meeting.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-neutral-500 hover:text-neutral-900"
                            >
                              <Video className="size-3 text-neutral-400" />
                              <span className="truncate max-w-[130px]">{item.meeting.meetingLink}</span>
                              <ExternalLink className="size-2.5" />
                            </a>
                          )}

                          <div>
                            <button
                              onClick={() => handleMarkSuccessful(item.id)}
                              disabled={completingMeetingId === item.id}
                              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-600/30 bg-emerald-50 px-3.5 py-1.5 font-['Plus_Jakarta_Sans'] text-xs font-semibold text-emerald-800 shadow-2xs transition hover:bg-emerald-100"
                            >
                              {completingMeetingId === item.id ? (
                                <Loader2 className="size-3 animate-spin" />
                              ) : (
                                <Check className="size-3" />
                              )}
                              Meet is Successful → Issue NDA
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                          <Clock className="size-3.5" />
                          <span>Call not scheduled</span>
                        </div>
                      )}
                    </td>

                    {/* NDA Status */}
                    <td className="px-5 py-4 align-top">
                      {isNdaSigned ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-50 px-3 py-1 font-['Plus_Jakarta_Sans'] text-xs font-semibold text-emerald-800">
                            <ShieldCheck className="size-3.5" />
                            NDA Signed &amp; Active
                          </span>
                          <div className="text-[11px]">
                            <a
                              href={`/api/startup/${item.id}/nda`}
                              download
                              className="inline-flex items-center gap-1 font-['Plus_Jakarta_Sans'] text-neutral-500 hover:text-neutral-900"
                            >
                              <Download className="size-2.5" />
                              Download Signed NDA
                            </a>
                          </div>
                        </div>
                      ) : isNdaSent ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/25 bg-amber-50 px-3 py-1 font-['Plus_Jakarta_Sans'] text-xs font-semibold text-amber-800">
                            <FileText className="size-3" />
                            NDA Sent — Awaiting Signature
                          </span>
                          <div className="text-[11px]">
                            <a
                              href={`/api/startup/${item.id}/nda`}
                              download
                              className="inline-flex items-center gap-1 font-['Plus_Jakarta_Sans'] text-neutral-500 hover:text-neutral-900"
                            >
                              <Download className="size-2.5" />
                              Download Template
                            </a>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-neutral-400">Locked (Requires Meeting)</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 align-top text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!isMeetingCompleted && (
                          <button
                            onClick={() => openApproveDialog(item)}
                            className={
                              isMeetingScheduled
                                ? "inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-4 py-2 font-['Plus_Jakarta_Sans'] text-xs font-semibold text-neutral-700 shadow-2xs transition hover:bg-neutral-50"
                                : "inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-4 py-2 font-['Plus_Jakarta_Sans'] text-xs font-semibold text-white shadow-2xs transition hover:bg-neutral-800"
                            }
                          >
                            <Calendar className="size-3.5" />
                            {isMeetingScheduled ? "Reschedule" : "Approve & Schedule"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Scheduling Dialog (M3 Rounded Modal) */}
      {isDialogOpen && selectedStartup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-neutral-200 bg-white p-7 shadow-xl">
            <div className="flex items-start justify-between border-b border-neutral-100 pb-4">
              <div>
                <h3 className="font-['Space_Grotesk'] text-base font-bold text-neutral-900">
                  {selectedStartup.meeting?.status === "scheduled" ? "Reschedule Strategy Call" : "Approve Startup & Schedule Call"}
                </h3>
                <p className="mt-1 font-['Inter'] text-xs text-neutral-500">
                  Approving activates the startup and reveals the meeting slot on{" "}
                  <strong className="text-neutral-800">{selectedStartup.name}</strong>&apos;s workspace.
                </p>
              </div>
              <button
                onClick={() => setIsDialogOpen(false)}
                className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleApproveSubmit} className="mt-5 space-y-4 font-['Inter']">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-['Plus_Jakarta_Sans'] text-xs font-semibold text-neutral-700">
                    Meeting Date
                  </label>
                  <input
                    type="date"
                    required
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    className="w-full rounded-2xl border border-neutral-200 bg-neutral-50/50 px-3.5 py-2.5 text-sm outline-none focus:border-neutral-900 focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-['Plus_Jakarta_Sans'] text-xs font-semibold text-neutral-700">
                    Meeting Time
                  </label>
                  <input
                    type="time"
                    required
                    value={meetingTime}
                    onChange={(e) => setMeetingTime(e.target.value)}
                    className="w-full rounded-2xl border border-neutral-200 bg-neutral-50/50 px-3.5 py-2.5 text-sm outline-none focus:border-neutral-900 focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-['Plus_Jakarta_Sans'] text-xs font-semibold text-neutral-700">
                  Duration (Minutes)
                </label>
                <select
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full rounded-2xl border border-neutral-200 bg-neutral-50/50 px-3.5 py-2.5 text-sm outline-none focus:border-neutral-900 focus:bg-white"
                >
                  <option value={15}>15 Minutes</option>
                  <option value={30}>30 Minutes</option>
                  <option value={45}>45 Minutes</option>
                  <option value={60}>60 Minutes</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-['Plus_Jakarta_Sans'] text-xs font-semibold text-neutral-700">
                  Google Meet / Video Link
                </label>
                <div className="relative">
                  <Video className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="url"
                    required
                    placeholder="https://meet.google.com/abc-defg-hij"
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    className="w-full rounded-2xl border border-neutral-200 bg-neutral-50/50 py-2.5 pl-10 pr-3.5 text-sm outline-none focus:border-neutral-900 focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-['Plus_Jakarta_Sans'] text-xs font-semibold text-neutral-700">
                  Founder Notes (Visible to Founder)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Reviewed your idea and market architecture. We will walk through technical scope on the call."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full resize-none rounded-2xl border border-neutral-200 bg-neutral-50/50 p-3.5 text-sm outline-none focus:border-neutral-900 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                  className="rounded-full border border-neutral-300 px-5 py-2.5 font-['Plus_Jakarta_Sans'] text-xs font-semibold text-neutral-700 transition hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-6 py-2.5 font-['Plus_Jakarta_Sans'] text-xs font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="size-3.5 animate-spin" />}
                  {isSubmitting ? "Saving..." : "Confirm & Save Meeting"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
