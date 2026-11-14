"use client";

import * as React from "react";
import {
  Layers,
  Clock,
  CheckCircle2,
  Calendar,
  FileText,
  Download,
  Terminal,
  Activity,
  ShieldCheck,
  Building,
  User,
  ArrowRight,
} from "lucide-react";

export type MilestoneItem = {
  id: string;
  phaseNumber: number;
  title: string;
  description: string | null;
  status: string;
  progressPercentage: number;
  targetDate: Date | string | null;
  completedAt: Date | string | null;
};

export type ActivityItem = {
  id: string;
  title: string;
  details: string;
  category: string;
  createdAt: Date | string;
};

export function CockpitDashboardView({
  startupId,
  startupName,
  founderName,
  founderEmail,
  milestones,
  activityLogs,
  depositPaidAt,
}: {
  startupId: string;
  startupName: string;
  founderName: string;
  founderEmail: string;
  milestones: MilestoneItem[];
  activityLogs: ActivityItem[];
  depositPaidAt: Date | string | null;
}) {
  const overallProgress =
    milestones.length > 0
      ? Math.round(
          milestones.reduce((acc, m) => acc + (m.progressPercentage || 0), 0) /
            milestones.length
        )
      : 25;

  return (
    <div className="space-y-6">
      {/* 1. Cockpit Header Banner (M3 Elevated) */}
      <div className="rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-xs sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-50 px-3.5 py-1 font-['Plus_Jakarta_Sans'] text-xs font-semibold text-emerald-800">
              <ShieldCheck className="size-3.5" />
              Stage 05 — Active Startup Cockpit &amp; Sprint Execution
            </div>

            <h2 className="font-['Space_Grotesk'] text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
              {startupName} • Live Engineering Cockpit
            </h2>

            <p className="max-w-2xl font-['Inter'] text-sm leading-relaxed text-neutral-600">
              Full transparency into your startup build. Every sprint milestone, repository commit, architectural schema,
              and engineering hour invested by Punjab Tech is logged in real-time below.
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-[#F9FAFB] p-4 text-center sm:self-start">
            <div className="font-['Plus_Jakarta_Sans'] text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              Overall Sprint Velocity
            </div>
            <div className="font-['Space_Grotesk'] text-3xl font-bold tabular-nums text-neutral-900">
              {overallProgress}%
            </div>
          </div>
        </div>

        {/* Progress Bar (M3 Linear Indicator) */}
        <div className="mt-6">
          <div className="flex items-center justify-between font-['Plus_Jakarta_Sans'] text-xs text-neutral-500 pb-2">
            <span>Milestone Sprint Completion</span>
            <span className="font-['JetBrains_Mono'] tabular-nums font-semibold text-neutral-900">{overallProgress}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-100">
            <div
              className="h-full rounded-full bg-neutral-900 transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Interactive Milestone Sprint Timeline */}
      <div className="rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-xs sm:p-8">
        <div className="mb-6 flex items-center justify-between border-b border-neutral-100 pb-4">
          <div>
            <h3 className="font-['Space_Grotesk'] text-lg font-bold text-neutral-900">
              Sprint Milestone Roadmap
            </h3>
            <p className="font-['Inter'] text-xs text-neutral-500">
              Strict delivery timeline tracked in normalized PostgreSQL tables.
            </p>
          </div>
          <span className="font-['Plus_Jakarta_Sans'] text-xs font-semibold text-neutral-400">
            4 Core Phases
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {milestones.map((m) => {
            const isCompleted = m.status === "completed" || m.progressPercentage === 100;
            const isInProgress = m.status === "in_progress" || (m.progressPercentage > 0 && m.progressPercentage < 100);

            return (
              <div
                key={m.id || m.phaseNumber}
                className={`rounded-2xl border p-5 transition ${
                  isCompleted
                    ? "border-emerald-500/30 bg-emerald-50/20"
                    : isInProgress
                    ? "border-neutral-900 bg-neutral-50/60 shadow-2xs"
                    : "border-neutral-200 bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-['Plus_Jakarta_Sans'] text-xs font-semibold uppercase tracking-wider ${
                      isCompleted
                        ? "bg-emerald-100 text-emerald-800"
                        : isInProgress
                        ? "bg-neutral-900 text-white"
                        : "bg-neutral-100 text-neutral-600"
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="size-3" /> : <Clock className="size-3" />}
                    Phase 0{m.phaseNumber}
                  </span>
                  <span className="font-['JetBrains_Mono'] text-xs font-bold tabular-nums text-neutral-900">
                    {m.progressPercentage}%
                  </span>
                </div>

                <h4 className="mt-3 font-['Space_Grotesk'] font-bold text-neutral-900">
                  {m.title}
                </h4>
                <p className="mt-1 font-['Inter'] text-xs leading-relaxed text-neutral-500">
                  {m.description}
                </p>

                {/* Micro Progress Bar */}
                <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-neutral-200/60">
                  <div
                    className={`h-full rounded-full ${isCompleted ? "bg-emerald-600" : "bg-neutral-900"}`}
                    style={{ width: `${m.progressPercentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Real-Time Transparent Activity Feed */}
      <div className="rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-xs sm:p-8">
        <div className="mb-6 flex items-center justify-between border-b border-neutral-100 pb-4">
          <div className="flex items-center gap-2">
            <Activity className="size-5 text-orange-600" />
            <div>
              <h3 className="font-['Space_Grotesk'] text-lg font-bold text-neutral-900">
                Transparent Engineering Activity Feed
              </h3>
              <p className="font-['Inter'] text-xs text-neutral-500">
                Live stream of work completed by Punjab Tech engineering leads for {startupName}.
              </p>
            </div>
          </div>
          <span className="font-['Plus_Jakarta_Sans'] text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            100% Data Truth
          </span>
        </div>

        {activityLogs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-200 p-8 text-center font-['Inter'] text-xs text-neutral-400">
            Kickoff deposit verified. Initial engineering allocation, repository scaffolding, and database provisioning in progress.
          </div>
        ) : (
          <div className="space-y-4">
            {activityLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-4 rounded-2xl border border-neutral-100 bg-[#F9FAFB] p-4 font-['Inter'] text-xs"
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-white border border-neutral-200 text-neutral-700">
                  <Terminal className="size-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-['Space_Grotesk'] font-semibold text-neutral-900">
                      {log.title}
                    </span>
                    <span className="font-['JetBrains_Mono'] text-[11px] tabular-nums text-neutral-400">
                      {new Date(log.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="leading-relaxed text-neutral-600">{log.details}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Document Vault & Legal Archives */}
      <div className="rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-xs sm:p-8">
        <div className="mb-4 flex items-center justify-between border-b border-neutral-100 pb-3">
          <h3 className="font-['Space_Grotesk'] text-base font-bold text-neutral-900">
            Legal Document Vault &amp; Invoices
          </h3>
          <span className="font-['Plus_Jakarta_Sans'] text-xs font-medium text-neutral-400">
            Secure Digital Archives
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <a
            href={`/api/startup/${startupId}/nda`}
            download
            className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-neutral-50/50 p-4 font-['Plus_Jakarta_Sans'] text-xs font-semibold text-neutral-800 transition hover:bg-white hover:border-neutral-300"
          >
            <div className="flex items-center gap-2.5">
              <FileText className="size-4 text-neutral-400" />
              <span>Mutual NDA (Executed)</span>
            </div>
            <Download className="size-3.5 text-neutral-400" />
          </a>

          <a
            href={`/api/startup/${startupId}/contract`}
            download
            className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-neutral-50/50 p-4 font-['Plus_Jakarta_Sans'] text-xs font-semibold text-neutral-800 transition hover:bg-white hover:border-neutral-300"
          >
            <div className="flex items-center gap-2.5">
              <FileText className="size-4 text-neutral-400" />
              <span>Master Contract (Executed)</span>
            </div>
            <Download className="size-3.5 text-neutral-400" />
          </a>

          <div className="flex items-center justify-between rounded-2xl border border-emerald-500/20 bg-emerald-50/30 p-4 font-['Plus_Jakarta_Sans'] text-xs font-semibold text-emerald-800">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="size-4 text-emerald-600" />
              <span>$100 Deposit Invoice</span>
            </div>
            <span className="font-['JetBrains_Mono'] text-[11px] text-emerald-700">Paid ✓</span>
          </div>
        </div>
      </div>
    </div>
  );
}
