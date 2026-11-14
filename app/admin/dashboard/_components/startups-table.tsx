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
  CreditCard,
  FileCheck2,
  Filter,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import {
  approveStartupAndScheduleMeeting,
  markMeetingSuccessfulAndIssueNDA,
  verifyBankWirePayment,
  issueContractAction,
  markDepositCompletedManual,
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
  ndaAgreement: {
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
  contractAgreement: {
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
  payment: {
    id: string;
    amountCents: number;
    currency: string;
    status: string;
    paymentMethod: string | null;
    referenceNumber: string | null;
    paidAt?: Date | string | null;
  } | null;
  milestones: Array<{
    id: string;
    phaseNumber: number;
    title: string;
    status: string;
    progressPercentage: number;
  }>;
  activityLogsCount: number;
};

export function StartupsTable({ initialStartups }: { initialStartups: StartupRecord[] }) {
  const [startups, setStartups] = useState<StartupRecord[]>(initialStartups);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedStartup, setSelectedStartup] = useState<StartupRecord | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [completingMeetingId, setCompletingMeetingId] = useState<string | null>(null);
  const [verifyingPaymentId, setVerifyingPaymentId] = useState<string | null>(null);
  const [issuingContractId, setIssuingContractId] = useState<string | null>(null);
  const [markingPaymentId, setMarkingPaymentId] = useState<string | null>(null);

  // Form State for Scheduling Dialog
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingTime, setMeetingTime] = useState("15:00");
  const [meetingLink, setMeetingLink] = useState("https://meet.google.com/new");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter startups by search query and M3 Filter Chip
  const filtered = startups.filter((s) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      s.name.toLowerCase().includes(q) ||
      (s.description && s.description.toLowerCase().includes(q)) ||
      (s.user?.email && s.user.email.toLowerCase().includes(q)) ||
      (s.user?.name && s.user.name.toLowerCase().includes(q)) ||
      (s.payment?.referenceNumber && s.payment.referenceNumber.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (statusFilter === "all") return true;
    if (statusFilter === "needs_meeting") return !s.meeting || s.meeting.status !== "completed";
    if (statusFilter === "nda_pending") return s.meeting?.status === "completed" && s.ndaAgreement?.status !== "signed";
    if (statusFilter === "contract_pending") return s.ndaAgreement?.status === "signed" && s.contractAgreement?.status !== "signed";
    if (statusFilter === "wire_pending") return s.payment?.status === "pending";
    if (statusFilter === "cockpit_active") return s.payment?.status === "completed";

    return true;
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
      setNotes("");
    }
    setIsDialogOpen(true);
  };

  const handleApproveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStartup) return;

    if (!meetingDate || !meetingTime) {
      toast.error("Please choose a valid meeting date and time.");
      return;
    }

    setIsSubmitting(true);
    const combinedIso = `${meetingDate}T${meetingTime}:00`;

    try {
      const res = await approveStartupAndScheduleMeeting({
        startupId: selectedStartup.id,
        scheduledAt: combinedIso,
        meetingLink,
        durationMinutes: Number(durationMinutes),
        notes,
      });

      if (!res.success) {
        toast.error(res.error || "Failed to schedule meeting.");
        setIsSubmitting(false);
        return;
      }

      toast.success(`Meeting scheduled and approved for ${selectedStartup.name}!`);
      setIsDialogOpen(false);

      // Optimistic update
      setStartups((prev) =>
        prev.map((s) => {
          if (s.id === selectedStartup.id) {
            return {
              ...s,
              status: "approved",
              meeting: {
                id: s.meeting?.id || "temp-id",
                scheduledAt: combinedIso,
                meetingLink,
                durationMinutes: Number(durationMinutes),
                notes,
                status: "scheduled",
              },
            };
          }
          return s;
        })
      );
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
      if (!res.success) {
        toast.error(res.error || "Failed to mark meeting as successful.");
        return;
      }

      toast.success("Meeting marked completed & Mutual NDA issued to founder!");

      // Optimistic update
      setStartups((prev) =>
        prev.map((s) => {
          if (s.id === startupId) {
            return {
              ...s,
              meeting: s.meeting
                ? {
                    ...s.meeting,
                    status: "completed",
                    completedAt: new Date().toISOString(),
                  }
                : null,
              ndaAgreement: s.ndaAgreement || {
                id: "temp-nda",
                title: "Mutual Non-Disclosure Agreement (NDA)",
                status: "sent",
                signatures: [],
              },
            };
          }
          return s;
        })
      );
    } catch {
      toast.error("Failed to complete meeting.");
    } finally {
      setCompletingMeetingId(null);
    }
  };

  const handleVerifyWirePayment = async (paymentId: string, startupId: string) => {
    setVerifyingPaymentId(paymentId);
    try {
      const res = await verifyBankWirePayment(paymentId, startupId);
      if (!res.success) {
        toast.error(res.error || "Failed to verify payment.");
        return;
      }

      toast.success("Bank Wire Transfer verified ($100 USD)! Cockpit unlocked.");

      // Optimistic update
      setStartups((prev) =>
        prev.map((s) => {
          if (s.id === startupId && s.payment) {
            return {
              ...s,
              payment: {
                ...s.payment,
                status: "completed",
                paidAt: new Date().toISOString(),
              },
            };
          }
          return s;
        })
      );
    } catch {
      toast.error("Failed to verify wire payment.");
    } finally {
      setVerifyingPaymentId(null);
    }
  };

  const handleIssueContract = async (startupId: string) => {
    setIssuingContractId(startupId);
    try {
      const res = await issueContractAction(startupId);
      if (!res.success) {
        toast.error(res.error || "Failed to issue contract.");
        return;
      }

      toast.success("Master Services Agreement issued! Founder notified to execute.");

      // Optimistic update
      setStartups((prev) =>
        prev.map((s) => {
          if (s.id === startupId) {
            return {
              ...s,
              contractAgreement: s.contractAgreement || {
                id: "temp-contract",
                title: "Master Services Agreement (MSA) & IP Assignment",
                status: "sent",
                signatures: [],
              },
            };
          }
          return s;
        })
      );
    } catch {
      toast.error("Failed to issue contract.");
    } finally {
      setIssuingContractId(null);
    }
  };

  const handleMarkManualPayment = async (startupId: string) => {
    setMarkingPaymentId(startupId);
    try {
      const res = await markDepositCompletedManual(startupId);
      if (!res.success) {
        toast.error(res.error || "Failed to confirm payment.");
        return;
      }

      toast.success("$100 Token Deposit verified manually! Cockpit unlocked.");

      // Optimistic update
      setStartups((prev) =>
        prev.map((s) => {
          if (s.id === startupId) {
            return {
              ...s,
              payment: {
                id: s.payment?.id || "manual-paid",
                amountCents: 10000,
                currency: "usd",
                status: "completed",
                paymentMethod: "bank_wire",
                referenceNumber: "DIRECT-SBI-VERIFIED",
                paidAt: new Date().toISOString(),
              },
            };
          }
          return s;
        })
      );
    } catch {
      toast.error("Failed to record manual deposit.");
    } finally {
      setMarkingPaymentId(null);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Search Bar & M3 Filter Chips Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* M3 Outlined Search Field with Leading Icon */}
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search ventures, founders, or UTRs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-full border border-neutral-200/90 bg-white py-2.5 pl-10 pr-4 font-['Inter'] text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
          />
        </div>

        <div className="font-['JetBrains_Mono'] text-xs tabular-nums text-neutral-500">
          Showing {filtered.length} of {startups.length} submissions
        </div>
      </div>

      {/* Material 3 Expressive Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setStatusFilter("all")}
          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-['Plus_Jakarta_Sans'] text-xs font-medium transition ${
            statusFilter === "all"
              ? "bg-neutral-900 text-white shadow-xs"
              : "border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
          }`}
        >
          All Ventures ({startups.length})
        </button>

        <button
          onClick={() => setStatusFilter("needs_meeting")}
          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-['Plus_Jakarta_Sans'] text-xs font-medium transition ${
            statusFilter === "needs_meeting"
              ? "bg-neutral-900 text-white shadow-xs"
              : "border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
          }`}
        >
          <Calendar className="size-3" />
          Awaiting Call
        </button>

        <button
          onClick={() => setStatusFilter("nda_pending")}
          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-['Plus_Jakarta_Sans'] text-xs font-medium transition ${
            statusFilter === "nda_pending"
              ? "bg-neutral-900 text-white shadow-xs"
              : "border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
          }`}
        >
          <FileText className="size-3" />
          NDA Pending
        </button>

        <button
          onClick={() => setStatusFilter("contract_pending")}
          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-['Plus_Jakarta_Sans'] text-xs font-medium transition ${
            statusFilter === "contract_pending"
              ? "bg-neutral-900 text-white shadow-xs"
              : "border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
          }`}
        >
          <FileCheck2 className="size-3" />
          Contract Pending
        </button>

        <button
          onClick={() => setStatusFilter("wire_pending")}
          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-['Plus_Jakarta_Sans'] text-xs font-medium transition ${
            statusFilter === "wire_pending"
              ? "bg-amber-600 text-white shadow-xs"
              : "border border-amber-300 bg-amber-50/70 text-amber-800 hover:bg-amber-100"
          }`}
        >
          <CreditCard className="size-3" />
          Wire Pending Verification
        </button>

        <button
          onClick={() => setStatusFilter("cockpit_active")}
          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-['Plus_Jakarta_Sans'] text-xs font-medium transition ${
            statusFilter === "cockpit_active"
              ? "bg-emerald-700 text-white shadow-xs"
              : "border border-emerald-300 bg-emerald-50/70 text-emerald-800 hover:bg-emerald-100"
          }`}
        >
          <CheckCircle2 className="size-3" />
          Cockpit Active
        </button>
      </div>

      {/* Material 3 Outlined Elevated Table Card (rounded-[28px]) */}
      <div className="overflow-x-auto rounded-[28px] border border-neutral-200/80 bg-white shadow-xs">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-200/80 bg-neutral-50/70 font-['Plus_Jakarta_Sans'] text-xs font-semibold uppercase tracking-wider text-neutral-500">
            <tr>
              <th className="px-5 py-4">Startup &amp; Concept</th>
              <th className="px-5 py-4">Founder</th>
              <th className="px-5 py-4">Discovery Meeting</th>
              <th className="px-5 py-4">Legal Agreements</th>
              <th className="px-5 py-4">$100 Token Deposit</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 font-['Inter']">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-sm text-neutral-400">
                  No startup submissions match the current filter.
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const isMeetingScheduled = item.meeting?.status === "scheduled";
                const isMeetingCompleted = item.meeting?.status === "completed";
                const isNdaSigned = item.ndaAgreement?.status === "signed";
                const isNdaSent = item.ndaAgreement?.status === "sent";
                const isContractSigned = item.contractAgreement?.status === "signed";
                const isContractSent = item.contractAgreement?.status === "sent";
                const isPaymentCompleted = item.payment?.status === "completed";
                const isPaymentPending = item.payment?.status === "pending";

                return (
                  <tr key={item.id} className="transition-colors hover:bg-neutral-50/60">
                    {/* Startup Details */}
                    <td className="px-5 py-5 align-top">
                      <div className="font-['Space_Grotesk'] text-base font-semibold text-neutral-900">
                        {item.name}
                      </div>
                      <p className="mt-1 line-clamp-2 max-w-xs text-xs leading-relaxed text-neutral-500">
                        {item.description || "No description provided"}
                      </p>
                      <div className="mt-2 flex items-center gap-2 font-['JetBrains_Mono'] text-[11px] text-neutral-400">
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
                    <td className="px-5 py-5 align-top">
                      <div className="font-medium text-neutral-900">
                        {item.user?.name || "Unknown Founder"}
                      </div>
                      <div className="text-xs text-neutral-500">{item.user?.email || "No email"}</div>
                    </td>

                    {/* Discovery Meeting */}
                    <td className="px-5 py-5 align-top">
                      {isMeetingCompleted ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-50 px-3 py-1 font-['Plus_Jakarta_Sans'] text-xs font-semibold text-emerald-800">
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
                            {/* M3 Filled Tonal Button */}
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
                              Meet Successful → Issue NDA
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

                    {/* Legal Agreements (NDA & Contract) */}
                    <td className="px-5 py-5 align-top">
                      <div className="space-y-2">
                        {/* NDA Badge & Action */}
                        <div>
                          {isNdaSigned ? (
                            <div className="flex items-center gap-1.5">
                              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-50 px-2.5 py-0.5 font-['Plus_Jakarta_Sans'] text-[11px] font-semibold text-emerald-800">
                                <ShieldCheck className="size-3" />
                                NDA Signed
                              </span>
                              <a
                                href={`/api/startup/${item.id}/nda`}
                                download
                                className="text-neutral-400 hover:text-neutral-700"
                                title="Download Signed NDA"
                              >
                                <Download className="size-3" />
                              </a>
                            </div>
                          ) : isNdaSent ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/25 bg-amber-50 px-2.5 py-0.5 font-['Plus_Jakarta_Sans'] text-[11px] font-semibold text-amber-800">
                              <FileText className="size-3" />
                              NDA Awaiting Sign
                            </span>
                          ) : (
                            <span className="text-xs text-neutral-400">NDA Locked</span>
                          )}
                        </div>

                        {/* Contract Badge & Action */}
                        <div>
                          {isContractSigned ? (
                            <div className="flex items-center gap-1.5">
                              <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/25 bg-blue-50 px-2.5 py-0.5 font-['Plus_Jakarta_Sans'] text-[11px] font-semibold text-blue-800">
                                <FileCheck2 className="size-3" />
                                Contract Signed
                              </span>
                              <a
                                href={`/api/startup/${item.id}/contract`}
                                download
                                className="text-neutral-400 hover:text-neutral-700"
                                title="Download Signed MSA"
                              >
                                <Download className="size-3" />
                              </a>
                            </div>
                          ) : isContractSent ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/25 bg-amber-50 px-2.5 py-0.5 font-['Plus_Jakarta_Sans'] text-[11px] font-semibold text-amber-800">
                              <FileText className="size-3" />
                              Contract Pending Sign
                            </span>
                          ) : isNdaSigned ? (
                            <span className="text-xs text-neutral-400">Contract Ready</span>
                          ) : null}
                        </div>
                      </div>
                    </td>

                    {/* Deposit ($100 Token) */}
                    <td className="px-5 py-5 align-top">
                      {isPaymentCompleted && item.payment ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-50 px-2.5 py-0.5 font-['Plus_Jakarta_Sans'] text-xs font-semibold text-emerald-800">
                            <CheckCircle2 className="size-3 text-emerald-600" />
                            $100.00 Verified
                          </span>
                          <div className="font-['JetBrains_Mono'] text-[11px] text-neutral-500">
                            via {item.payment.paymentMethod === "paypal" ? "PayPal" : "SBI Wire"}
                          </div>
                          {item.payment.referenceNumber && (
                            <div className="font-['JetBrains_Mono'] text-[10px] text-neutral-400 truncate max-w-[120px]" title={item.payment.referenceNumber}>
                              Ref: {item.payment.referenceNumber}
                            </div>
                          )}
                        </div>
                      ) : isPaymentPending && item.payment ? (
                        <div className="space-y-2">
                          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/25 bg-amber-50 px-2.5 py-0.5 font-['Plus_Jakarta_Sans'] text-xs font-semibold text-amber-800">
                            <Clock className="size-3 text-amber-600" />
                            Wire Pending UTR
                          </span>
                          <div className="font-['JetBrains_Mono'] text-[11px] text-neutral-700">
                            UTR: {item.payment.referenceNumber || "Submitted"}
                          </div>
                          <div>
                            {/* M3 Filled Button */}
                            <button
                              onClick={() => handleVerifyWirePayment(item.payment!.id, item.id)}
                              disabled={verifyingPaymentId === item.payment.id}
                              className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3.5 py-1.5 font-['Plus_Jakarta_Sans'] text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-700 disabled:opacity-50"
                            >
                              {verifyingPaymentId === item.payment.id ? (
                                <Loader2 className="size-3 animate-spin" />
                              ) : (
                                <Check className="size-3" />
                              )}
                              Verify Wire Transfer
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-neutral-400">Awaiting Deposit</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-5 align-top text-right">
                      <div className="flex flex-col items-end gap-2">
                        {/* 1. Discovery Meeting Actions */}
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

                        {/* 2. Master Contract Actions */}
                        {isMeetingCompleted && isNdaSigned && !isContractSigned && (
                          <div className="flex items-center gap-1.5">
                            {!item.contractAgreement ? (
                              <button
                                onClick={() => handleIssueContract(item.id)}
                                disabled={issuingContractId === item.id}
                                className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2 font-['Plus_Jakarta_Sans'] text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700 disabled:opacity-50"
                              >
                                {issuingContractId === item.id ? (
                                  <Loader2 className="size-3.5 animate-spin" />
                                ) : (
                                  <FileCheck2 className="size-3.5" />
                                )}
                                Issue Master Contract
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-50 px-3 py-1 font-['Plus_Jakarta_Sans'] text-[11px] font-semibold text-amber-800">
                                <Clock className="size-3 text-amber-600" />
                                Awaiting Founder MSA Sign
                              </span>
                            )}
                          </div>
                        )}

                        {/* 3. Token Deposit Actions */}
                        {isContractSigned && !isPaymentCompleted && (
                          <div className="flex items-center gap-1.5">
                            {isPaymentPending ? (
                              <button
                                onClick={() => handleVerifyWirePayment(item.payment!.id, item.id)}
                                disabled={verifyingPaymentId === item.payment!.id}
                                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 font-['Plus_Jakarta_Sans'] text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-700 disabled:opacity-50"
                              >
                                {verifyingPaymentId === item.payment!.id ? (
                                  <Loader2 className="size-3.5 animate-spin" />
                                ) : (
                                  <Check className="size-3.5" />
                                )}
                                Verify Wire Transfer
                              </button>
                            ) : (
                              <button
                                onClick={() => handleMarkManualPayment(item.id)}
                                disabled={markingPaymentId === item.id}
                                className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-3.5 py-1.5 font-['Plus_Jakarta_Sans'] text-xs font-semibold text-neutral-700 shadow-2xs transition hover:bg-neutral-50 disabled:opacity-50"
                                title="Confirm payment if founder wired directly to SBI account"
                              >
                                {markingPaymentId === item.id ? (
                                  <Loader2 className="size-3 animate-spin" />
                                ) : (
                                  <CreditCard className="size-3 text-neutral-500" />
                                )}
                                Confirm $100 Received
                              </button>
                            )}
                          </div>
                        )}

                        {/* 4. Active in Cockpit */}
                        {isPaymentCompleted && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-50 px-3.5 py-1.5 font-['Plus_Jakarta_Sans'] text-xs font-semibold text-emerald-800">
                            <Sparkles className="size-3.5 text-emerald-600" />
                            Live in Cockpit
                          </span>
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

      {/* Material 3 Expressive Dialog Modal (rounded-[32px]) */}
      {isDialogOpen && selectedStartup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-[32px] border border-neutral-200 bg-white p-8 shadow-2xl">
            <div className="flex items-start justify-between border-b border-neutral-100 pb-4">
              <div>
                <h3 className="font-['Space_Grotesk'] text-lg font-bold text-neutral-900">
                  {selectedStartup.meeting?.status === "scheduled" ? "Reschedule Strategy Call" : "Approve Startup & Schedule Call"}
                </h3>
                <p className="mt-1 font-['Inter'] text-xs text-neutral-500">
                  Approving activates the startup and reveals the meeting slot on{" "}
                  <strong className="text-neutral-800">{selectedStartup.name}</strong>&apos;s workspace.
                </p>
              </div>
              <button
                onClick={() => setIsDialogOpen(false)}
                className="rounded-full p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleApproveSubmit} className="mt-6 space-y-4 font-['Inter']">
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
                    className="w-full rounded-2xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
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
                    className="w-full rounded-2xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-['Plus_Jakarta_Sans'] text-xs font-semibold text-neutral-700">
                  Meeting Video Link (Google Meet / Zoom)
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://meet.google.com/xyz-abc-def"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  className="w-full rounded-2xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-['Plus_Jakarta_Sans'] text-xs font-semibold text-neutral-700">
                    Duration
                  </label>
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full rounded-2xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>60 minutes</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="font-['Plus_Jakarta_Sans'] text-xs font-semibold text-neutral-700">
                    Preparation Notes (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bring domain architecture overview"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-2xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
                  />
                </div>
              </div>

              <div className="mt-8 flex items-center justify-end gap-3 border-t border-neutral-100 pt-5">
                <button
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                  className="rounded-full border border-neutral-200 bg-white px-5 py-2.5 font-['Plus_Jakarta_Sans'] text-xs font-semibold text-neutral-600 transition hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-6 py-2.5 font-['Plus_Jakarta_Sans'] text-xs font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="size-3 animate-spin" />}
                  Confirm &amp; Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
