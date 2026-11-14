"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  Video,
  Lock,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

export type MeetingData = {
  id: string;
  scheduledAt: Date | string;
  durationMinutes: number;
  meetingLink: string | null;
  notes: string | null;
  status: string;
} | null;

export function MeetingStatusView({
  startupId,
  startupName,
  startupIdea,
  submittedAt,
  status,
  meeting,
}: {
  startupId: string;
  startupName: string;
  startupIdea: string | null;
  submittedAt: Date | string | null;
  status: string;
  meeting: MeetingData;
}) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isMeetingCompleted = meeting?.status === "completed";
  const isMeetingScheduled = !!meeting?.scheduledAt && meeting.status === "scheduled";

  useEffect(() => {
    if (isMeetingScheduled || isMeetingCompleted) return;

    const interval = setInterval(() => {
      router.refresh();
    }, 8000);

    return () => clearInterval(interval);
  }, [isMeetingScheduled, isMeetingCompleted, router]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <div className="space-y-6">
      {/* 1. Review Status Hero Card (M3 Elevated Surface) */}
      <div className="relative overflow-hidden rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-xs sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1 font-['Plus_Jakarta_Sans'] text-xs font-semibold">
              {isMeetingCompleted ? (
                <span className="flex items-center gap-1.5 text-emerald-800">
                  <CheckCircle2 className="size-3.5 text-emerald-600" />
                  Phase 01 &amp; 02 Complete — Strategy Call Completed
                </span>
              ) : isMeetingScheduled ? (
                <span className="flex items-center gap-1.5 text-amber-800">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex size-2 rounded-full bg-amber-500"></span>
                  </span>
                  Phase 02: Discovery Session Confirmed
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-amber-800">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex size-2 rounded-full bg-amber-500"></span>
                  </span>
                  Phase 01: Intake Review In Progress
                </span>
              )}
            </div>

            <h2 className="font-['Space_Grotesk'] text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
              {isMeetingCompleted
                ? "Discovery call completed & approved"
                : isMeetingScheduled
                ? "Your review is complete & call is scheduled"
                : "Your startup is in process"}
            </h2>

            <p className="max-w-2xl font-['Inter'] text-sm leading-relaxed text-neutral-600">
              {isMeetingCompleted
                ? "Your discovery consultation with PunjabTech has been successfully concluded. Advance to Stage 02 to execute the Mutual NDA."
                : isMeetingScheduled
                ? "Our technical leadership has completed the initial architectural evaluation. Your founder strategy session is confirmed below."
                : "We will review research and come back to you. Our engineering team is currently assessing your market positioning, technical stack requirements, and MVP scope."}
            </p>
          </div>

          <button
            onClick={handleManualRefresh}
            title="Check latest status"
            className="inline-flex items-center gap-1.5 self-start rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 font-['Plus_Jakarta_Sans'] text-xs font-semibold text-neutral-700 transition hover:bg-neutral-100"
          >
            <RefreshCw className={`size-3.5 ${isRefreshing ? "animate-spin text-neutral-900" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Submitted Details Box */}
        <div className="mt-6 rounded-2xl border border-neutral-100 bg-[#F9FAFB] p-5">
          <div className="flex items-center justify-between font-['Plus_Jakarta_Sans'] text-xs font-medium text-neutral-500">
            <span>Submitted Concept Details</span>
            <span className="font-['JetBrains_Mono'] tabular-nums text-neutral-400">
              {submittedAt
                ? new Date(submittedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Just now"}
            </span>
          </div>

          <div className="mt-2.5">
            <div className="font-['Space_Grotesk'] text-sm font-semibold text-neutral-900">{startupName}</div>
            <p className="mt-1 font-['Inter'] text-xs leading-relaxed text-neutral-600">
              {startupIdea || "No detailed description provided."}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Meet Link System Card (DEFAULT OFF vs ACTIVE) */}
      <div
        className={`relative overflow-hidden rounded-3xl border transition-all p-6 sm:p-8 ${
          isMeetingScheduled
            ? "border-emerald-500/30 bg-emerald-50/20 shadow-xs"
            : "border-neutral-200/80 bg-white"
        }`}
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-['Plus_Jakarta_Sans'] text-xs font-semibold uppercase tracking-wider ${
                  isMeetingScheduled
                    ? "border border-emerald-500/25 bg-emerald-50 text-emerald-800"
                    : "border border-neutral-200 bg-neutral-100 text-neutral-600"
                }`}
              >
                {isMeetingScheduled ? (
                  <>
                    <CheckCircle2 className="size-3.5 text-emerald-600" />
                    Meet System: Online &amp; Confirmed
                  </>
                ) : (
                  <>
                    <Lock className="size-3.5 text-neutral-500" />
                    Meet System: Offline (Default)
                  </>
                )}
              </span>
            </div>

            <h3 className="font-['Space_Grotesk'] text-xl font-bold tracking-tight text-neutral-900">
              {isMeetingScheduled ? "Founder Strategy & Discovery Meeting" : "Video Meeting Link (Offline)"}
            </h3>

            <p className="max-w-xl font-['Inter'] text-sm leading-relaxed text-neutral-600">
              {isMeetingScheduled
                ? "Your discovery session has been approved by the PunjabTech administration. Click the join button below at the scheduled time to enter the session."
                : "The video meeting system is turned off by default while our analysts review your research. Once the review is approved on our admin dashboard, the meeting date, time, and join button will automatically activate here."}
            </p>

            {/* Scheduled Meeting Details */}
            {isMeetingScheduled && meeting && (
              <div className="mt-4 inline-flex flex-col gap-3 rounded-2xl border border-emerald-200/80 bg-white p-4 shadow-2xs sm:flex-row sm:items-center sm:gap-6">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <Calendar className="size-5" />
                  </div>
                  <div>
                    <div className="font-['Plus_Jakarta_Sans'] text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Date</div>
                    <div className="font-['JetBrains_Mono'] text-sm font-semibold tabular-nums text-neutral-900">
                      {new Date(meeting.scheduledAt).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                </div>

                <div className="hidden h-8 w-px bg-neutral-200 sm:block" />

                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <Clock className="size-5" />
                  </div>
                  <div>
                    <div className="font-['Plus_Jakarta_Sans'] text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Time &amp; Duration</div>
                    <div className="font-['JetBrains_Mono'] text-sm font-semibold tabular-nums text-neutral-900">
                      {new Date(meeting.scheduledAt).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      ({meeting.durationMinutes} mins)
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isMeetingScheduled && meeting?.notes && (
              <p className="mt-2 font-['Inter'] text-xs italic text-neutral-500">
                Note from team: &ldquo;{meeting.notes}&rdquo;
              </p>
            )}
          </div>

          {/* Action Button */}
          <div className="flex flex-col items-start gap-2 sm:items-end">
            {isMeetingCompleted ? (
              <Link
                href={`/startup/${startupId}?tab=nda`}
                className="group inline-flex items-center gap-2 rounded-full bg-neutral-900 px-7 py-4 font-['Plus_Jakarta_Sans'] text-sm font-semibold text-white shadow-xs transition hover:bg-neutral-800"
              >
                <ShieldCheck className="size-4 text-emerald-400" />
                Proceed to Stage 02: Mutual NDA
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            ) : isMeetingScheduled && meeting?.meetingLink ? (
              <a
                href={meeting.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 rounded-full bg-neutral-900 px-7 py-4 font-['Plus_Jakarta_Sans'] text-sm font-semibold text-white shadow-xs transition hover:bg-neutral-800"
              >
                <Video className="size-4 text-emerald-400" />
                Join Video Meeting
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </a>
            ) : (
              <div className="space-y-1.5 text-center sm:text-right">
                <button
                  disabled
                  className="inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-neutral-200 bg-neutral-100 px-6 py-3.5 font-['Plus_Jakarta_Sans'] text-sm font-semibold text-neutral-400"
                >
                  <Lock className="size-4" />
                  Join Link Offline
                </button>
                <p className="font-['Inter'] text-[11px] text-neutral-400">Awaiting admin review</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Startup Launch Roadmap Stepper */}
      <div className="rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-xs sm:p-8">
        <h3 className="font-['Plus_Jakarta_Sans'] text-xs font-semibold uppercase tracking-wider text-neutral-400">
          Onboarding &amp; Execution Roadmap
        </h3>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-50/40 p-4">
            <div className="flex items-center gap-2 text-emerald-700">
              <CheckCircle2 className="size-4" />
              <span className="font-['Plus_Jakarta_Sans'] text-xs font-semibold uppercase">Step 01</span>
            </div>
            <div className="mt-2 font-['Space_Grotesk'] text-sm font-medium text-neutral-900">Intake Submitted</div>
            <p className="mt-1 font-['Inter'] text-xs text-neutral-500">Name and idea recorded into database.</p>
          </div>

          <div
            className={`rounded-2xl border p-4 ${
              isMeetingScheduled
                ? "border-emerald-500/20 bg-emerald-50/40 text-emerald-700"
                : "border-amber-500/25 bg-amber-50/40 text-amber-700"
            }`}
          >
            <div className="flex items-center gap-2">
              {isMeetingScheduled ? <CheckCircle2 className="size-4" /> : <Clock className="size-4" />}
              <span className="font-['Plus_Jakarta_Sans'] text-xs font-semibold uppercase">Step 02</span>
            </div>
            <div className="mt-2 font-['Space_Grotesk'] text-sm font-medium text-neutral-900">Research &amp; Scoping</div>
            <p className="mt-1 font-['Inter'] text-xs text-neutral-500">
              {isMeetingScheduled ? "Technical evaluation completed." : "Under team review right now."}
            </p>
          </div>

          <div
            className={`rounded-2xl border p-4 ${
              isMeetingScheduled
                ? "border-neutral-900 bg-neutral-50"
                : "border-neutral-200/60 bg-neutral-50/50 opacity-60"
            }`}
          >
            <div className="flex items-center gap-2 text-neutral-700">
              {isMeetingScheduled ? <Video className="size-4 text-emerald-600" /> : <Lock className="size-4" />}
              <span className="font-['Plus_Jakarta_Sans'] text-xs font-semibold uppercase">Step 03</span>
            </div>
            <div className="mt-2 font-['Space_Grotesk'] text-sm font-medium text-neutral-900">Discovery Meeting</div>
            <p className="mt-1 font-['Inter'] text-xs text-neutral-500">
              {isMeetingScheduled ? "Time confirmed — ready to join." : "Locked until admin schedule."}
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-200/60 bg-neutral-50/50 p-4 opacity-60">
            <div className="flex items-center gap-2 text-neutral-400">
              <Lock className="size-4" />
              <span className="font-['Plus_Jakarta_Sans'] text-xs font-semibold uppercase">Step 04</span>
            </div>
            <div className="mt-2 font-['Space_Grotesk'] text-sm font-medium text-neutral-900">Sprint Execution</div>
            <p className="mt-1 font-['Inter'] text-xs text-neutral-500">Milestone agreements and development.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
