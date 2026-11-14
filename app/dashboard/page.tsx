import { auth } from "@/app/auth/_lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { startup, startupMilestone, startupActivityLog, payment, startupAgreement } from "@/drizzle/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import {
  Building2,
  ShieldCheck,
  Layers,
  Clock,
  CheckCircle2,
  Calendar,
  Download,
  Terminal,
  Activity,
  CreditCard,
  FileCheck2,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Code2,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/sign-up");
  }

  const userRole = (session.user as { role?: string }).role;

  // 1. Strict Role Segregation: Admin must go to admin dashboard
  if (userRole === "admin") {
    redirect("/admin/dashboard");
  }

  // 2. Query user's startup with all live relational data (0 mock data)
  const userStartup = await db.query.startup.findFirst({
    where: eq(startup.createdByUserId, session.user.id),
    orderBy: [desc(startup.createdAt)],
    with: {
      createdBy: true,
      agreements: {
        with: { signatures: true },
        orderBy: [desc(startupAgreement.createdAt)],
      },
      payments: {
        orderBy: [desc(payment.createdAt)],
      },
      milestones: {
        orderBy: [startupMilestone.phaseNumber],
      },
      activityLogs: {
        orderBy: [desc(startupActivityLog.createdAt)],
      },
    },
  });

  if (!userStartup) {
    redirect("/startup/new");
  }

  // 3. Check if user has paid the $100 kickoff deposit
  const completedPayment = userStartup.payments?.find((p) => p.status === "completed") || null;
  const pendingPayment = userStartup.payments?.find((p) => p.status === "pending") || null;
  const isPaid = !!completedPayment;
  const isPendingWire = !completedPayment && !!pendingPayment;

  // If deposit not yet submitted or paid, redirect back to the onboarding step
  if (!isPaid && !isPendingWire) {
    redirect(`/startup/${userStartup.id}`);
  }

  const ndaAgreement = userStartup.agreements?.find((a) => a.type === "nda") || null;
  const contractAgreement = userStartup.agreements?.find((a) => a.type === "contract") || null;

  const milestones = userStartup.milestones || [];
  const activityLogs = userStartup.activityLogs || [];

  const overallProgress =
    milestones.length > 0
      ? Math.round(
          milestones.reduce((acc, m) => acc + (m.progressPercentage || 0), 0) /
            milestones.length
        )
      : isPaid
      ? 25
      : 10;

  return (
    <main className="min-h-screen bg-[#F9FAFB] text-neutral-900">
      {/* Top Header */}
      <header className="border-b border-neutral-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="font-['Space_Grotesk'] text-sm font-bold tracking-tight text-neutral-900"
            >
              PUNJAB<span className="text-orange-600">TECH</span>
            </Link>
            <span className="text-neutral-300">/</span>
            <div className="flex items-center gap-1.5 font-['Plus_Jakarta_Sans'] text-xs font-medium text-neutral-700">
              <Building2 className="size-3.5 text-neutral-400" />
              <span>{userStartup.name}</span>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-50 px-2.5 py-0.5 font-['Plus_Jakarta_Sans'] text-[11px] font-semibold text-emerald-800">
              <Sparkles className="size-2.5 text-emerald-600" />
              Active Venture
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-['Inter']">
            <Link
              href={`/startup/${userStartup.id}?tab=contract`}
              className="font-['Plus_Jakarta_Sans'] text-neutral-500 hover:text-neutral-900"
            >
              View Onboarding Agreements
            </Link>
            <span className="text-neutral-300">|</span>
            <span className="text-neutral-500">
              Founder: <span className="font-medium text-neutral-800">{session.user.name}</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Dashboard Container */}
      <div className="mx-auto max-w-6xl px-6 py-8 space-y-6">
        {/* Wire Pending Notice Banner (if applicable) */}
        {isPendingWire && (
          <div className="rounded-3xl border border-amber-300 bg-amber-50/70 p-5 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3 text-amber-900">
              <Clock className="size-5 text-amber-600" />
              <div>
                <div className="font-['Space_Grotesk'] font-bold text-sm">
                  Bank Wire UTR ({pendingPayment?.referenceNumber}) Pending Reconciliation
                </div>
                <div className="font-['Inter'] text-xs text-amber-800 mt-0.5">
                  State Bank of India wire verification is currently being reconciled by Punjab Tech administration.
                </div>
              </div>
            </div>
            <span className="rounded-full bg-amber-200/60 px-3 py-1 font-['Plus_Jakarta_Sans'] text-xs font-semibold text-amber-900">
              Provisional Cockpit Live
            </span>
          </div>
        )}

        {/* Hero Card (M3 Elevated) */}
        <div className="rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-xs sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-50 px-3.5 py-1 font-['Plus_Jakarta_Sans'] text-xs font-semibold text-emerald-800">
                <ShieldCheck className="size-3.5" />
                Active Engineering Cockpit • Phase 1 Kickoff Complete
              </div>

              <h1 className="font-['Space_Grotesk'] text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
                {userStartup.name} • Founder Dashboard
              </h1>

              <p className="max-w-2xl font-['Inter'] text-sm leading-relaxed text-neutral-600">
                Welcome to your Punjab Tech command center. 100% transparent tracking of sprint deliverables,
                PostgreSQL schema design, real-time developer activity, and executed legal contracts.
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-[#F9FAFB] p-4 text-center sm:self-start min-w-[140px]">
              <div className="font-['Plus_Jakarta_Sans'] text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                Overall Velocity
              </div>
              <div className="font-['Space_Grotesk'] text-3xl font-bold tabular-nums text-neutral-900">
                {overallProgress}%
              </div>
            </div>
          </div>

          {/* Progress Bar (M3 Linear Track) */}
          <div className="mt-6">
            <div className="flex items-center justify-between font-['Plus_Jakarta_Sans'] text-xs text-neutral-500 pb-2">
              <span>Overall Milestone Completion</span>
              <span className="font-['JetBrains_Mono'] tabular-nums font-semibold text-neutral-900">
                {overallProgress}%
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-100">
              <div
                className="h-full rounded-full bg-neutral-900 transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* 4 Metric Summary Cards (Material 3 Expressive) */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-3xl border border-neutral-200/80 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="font-['Plus_Jakarta_Sans'] text-xs font-semibold uppercase tracking-wider">
                Sprint Target
              </span>
              <Layers className="size-4" />
            </div>
            <div className="mt-2 font-['Space_Grotesk'] text-2xl font-bold tabular-nums text-neutral-900">
              4 Phases
            </div>
            <div className="mt-1 font-['Inter'] text-xs text-neutral-500">Full MVP Roadmap</div>
          </div>

          <div className="rounded-3xl border border-neutral-200/80 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-emerald-600">
              <span className="font-['Plus_Jakarta_Sans'] text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Kickoff Deposit
              </span>
              <CreditCard className="size-4" />
            </div>
            <div className="mt-2 font-['Space_Grotesk'] text-2xl font-bold tabular-nums text-emerald-600">
              $100.00
            </div>
            <div className="mt-1 font-['Inter'] text-xs text-neutral-500">
              {completedPayment ? "Captured & Verified" : "Wire Pending Reconciliation"}
            </div>
          </div>

          <div className="rounded-3xl border border-neutral-200/80 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-blue-600">
              <span className="font-['Plus_Jakarta_Sans'] text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Legal Vault
              </span>
              <FileCheck2 className="size-4" />
            </div>
            <div className="mt-2 font-['Space_Grotesk'] text-2xl font-bold tabular-nums text-blue-600">
              2 Executed
            </div>
            <div className="mt-1 font-['Inter'] text-xs text-neutral-500">NDA &amp; MSA Signed</div>
          </div>

          <div className="rounded-3xl border border-neutral-200/80 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-orange-600">
              <span className="font-['Plus_Jakarta_Sans'] text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Activity Logs
              </span>
              <Code2 className="size-4" />
            </div>
            <div className="mt-2 font-['Space_Grotesk'] text-2xl font-bold tabular-nums text-orange-600">
              {activityLogs.length} Entries
            </div>
            <div className="mt-1 font-['Inter'] text-xs text-neutral-500">Real-time Engineering Feed</div>
          </div>
        </div>

        {/* Sprint Milestone Timeline & Legal Document Vault */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Sprints Column (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-xs sm:p-8">
              <div className="mb-6 flex items-center justify-between border-b border-neutral-100 pb-4">
                <div>
                  <h2 className="font-['Space_Grotesk'] text-lg font-bold text-neutral-900">
                    Sprint Milestone Roadmap
                  </h2>
                  <p className="font-['Inter'] text-xs text-neutral-500">
                    Strict delivery timeline tracked live in PostgreSQL.
                  </p>
                </div>
                <span className="font-['Plus_Jakarta_Sans'] text-xs font-semibold text-neutral-400">
                  {milestones.filter((m) => m.status === "completed").length} of {milestones.length} Completed
                </span>
              </div>

              <div className="space-y-4">
                {milestones.length === 0 ? (
                  <div className="py-8 text-center text-xs text-neutral-400">
                    Milestones are being initialized by engineering leadership.
                  </div>
                ) : (
                  milestones.map((m) => {
                    const isDone = m.status === "completed";
                    const isInProgress = m.status === "in_progress";

                    return (
                      <div
                        key={m.id}
                        className={`rounded-2xl border p-5 transition ${
                          isDone
                            ? "border-emerald-500/25 bg-emerald-50/30"
                            : isInProgress
                            ? "border-neutral-900/40 bg-white shadow-2xs"
                            : "border-neutral-200/70 bg-[#F9FAFB]/60 opacity-80"
                        }`}
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-3">
                            <span
                              className={`flex size-8 items-center justify-center rounded-full text-xs font-bold font-['Space_Grotesk'] ${
                                isDone
                                  ? "bg-emerald-600 text-white"
                                  : isInProgress
                                  ? "bg-neutral-900 text-white"
                                  : "bg-neutral-200 text-neutral-600"
                              }`}
                            >
                              0{m.phaseNumber}
                            </span>
                            <div>
                              <div className="font-['Space_Grotesk'] font-bold text-neutral-900 text-sm">
                                {m.title}
                              </div>
                              <p className="font-['Inter'] text-xs text-neutral-500 mt-0.5">
                                {m.description}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center">
                            {isDone ? (
                              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-100/60 px-3 py-1 font-['Plus_Jakarta_Sans'] text-xs font-semibold text-emerald-800">
                                <CheckCircle2 className="size-3" />
                                Completed
                              </span>
                            ) : isInProgress ? (
                              <span className="inline-flex items-center gap-1 rounded-full border border-neutral-900/20 bg-neutral-100 px-3 py-1 font-['Plus_Jakarta_Sans'] text-xs font-semibold text-neutral-900">
                                <Clock className="size-3" />
                                In Progress
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-3 py-1 font-['Plus_Jakarta_Sans'] text-xs font-medium text-neutral-400">
                                Upcoming
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Progress Bar per milestone */}
                        <div className="mt-4 pt-3 border-t border-neutral-100">
                          <div className="flex items-center justify-between font-['JetBrains_Mono'] text-[11px] text-neutral-500 mb-1.5">
                            <span>Sprint Completion</span>
                            <span className="font-semibold text-neutral-800">{m.progressPercentage}%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-neutral-200/60 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                isDone ? "bg-emerald-600" : "bg-neutral-900"
                              }`}
                              style={{ width: `${m.progressPercentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Live Activity Stream (M3 Expressive) */}
            <div className="rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-xs sm:p-8">
              <div className="mb-6 flex items-center justify-between border-b border-neutral-100 pb-4">
                <div className="flex items-center gap-2">
                  <Activity className="size-4 text-orange-600" />
                  <h2 className="font-['Space_Grotesk'] text-lg font-bold text-neutral-900">
                    Live Engineering Feed
                  </h2>
                </div>
                <span className="font-['JetBrains_Mono'] text-xs text-neutral-400">
                  Real-time Developer Audit Log
                </span>
              </div>

              <div className="divide-y divide-neutral-100 font-['Inter']">
                {activityLogs.length === 0 ? (
                  <div className="py-6 text-center text-xs text-neutral-400">
                    No activity logs recorded yet.
                  </div>
                ) : (
                  activityLogs.map((log) => (
                    <div key={log.id} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex items-center justify-between">
                        <span className="font-['Space_Grotesk'] text-xs font-bold text-neutral-900">
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
                      <p className="mt-1 text-xs leading-relaxed text-neutral-600">
                        {log.details}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Legal Documents Vault & Enterprise Credentials */}
          <div className="space-y-6">
            {/* Legal Document Vault */}
            <div className="rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-xs sm:p-7 space-y-4">
              <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
                <ShieldCheck className="size-4 text-emerald-600" />
                <h3 className="font-['Space_Grotesk'] text-base font-bold text-neutral-900">
                  Legal Document Vault
                </h3>
              </div>

              <div className="space-y-3">
                {/* NDA */}
                <div className="rounded-2xl border border-neutral-200 bg-[#F9FAFB] p-4 flex items-center justify-between">
                  <div>
                    <div className="font-['Space_Grotesk'] text-xs font-bold text-neutral-900">
                      Mutual Non-Disclosure Agreement
                    </div>
                    <div className="font-['Inter'] text-[11px] text-emerald-700 mt-0.5">
                      Signed &amp; Legally Active
                    </div>
                  </div>
                  <a
                    href={`/api/startup/${userStartup.id}/nda`}
                    download
                    className="inline-flex size-8 items-center justify-center rounded-full bg-white border border-neutral-200 text-neutral-700 shadow-2xs hover:bg-neutral-50"
                    title="Download Signed NDA"
                  >
                    <Download className="size-3.5" />
                  </a>
                </div>

                {/* Contract */}
                <div className="rounded-2xl border border-neutral-200 bg-[#F9FAFB] p-4 flex items-center justify-between">
                  <div>
                    <div className="font-['Space_Grotesk'] text-xs font-bold text-neutral-900">
                      Master Services Agreement (MSA)
                    </div>
                    <div className="font-['Inter'] text-[11px] text-emerald-700 mt-0.5">
                      Signed &amp; 100% IP Assigned
                    </div>
                  </div>
                  <a
                    href={`/api/startup/${userStartup.id}/contract`}
                    download
                    className="inline-flex size-8 items-center justify-center rounded-full bg-white border border-neutral-200 text-neutral-700 shadow-2xs hover:bg-neutral-50"
                    title="Download Signed MSA"
                  >
                    <Download className="size-3.5" />
                  </a>
                </div>

                {/* Payment Receipt */}
                <div className="rounded-2xl border border-neutral-200 bg-[#F9FAFB] p-4 flex items-center justify-between">
                  <div>
                    <div className="font-['Space_Grotesk'] text-xs font-bold text-neutral-900">
                      Kickoff Deposit ($100.00 USD)
                    </div>
                    <div className="font-['Inter'] text-[11px] text-neutral-500 mt-0.5">
                      {completedPayment ? "Confirmed via " + (completedPayment.paymentMethod === "paypal" ? "PayPal" : "SBI Wire") : "Wire Reference Submitted"}
                    </div>
                  </div>
                  <span className="font-['JetBrains_Mono'] text-xs font-semibold text-emerald-800">
                    $100.00
                  </span>
                </div>
              </div>
            </div>

            {/* Enterprise Registered Details */}
            <div className="rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-xs sm:p-7 space-y-3">
              <div className="font-['Plus_Jakarta_Sans'] text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Operating Enterprise
              </div>
              <div className="font-['Space_Grotesk'] text-base font-bold text-neutral-900">
                PUNJAB TECH
              </div>
              <div className="font-['JetBrains_Mono'] text-xs text-neutral-600 space-y-1">
                <div>Udyam: UDYAM-PB-08-0062632</div>
                <div>NIC Code: 62011 (Services)</div>
                <div>Proprietor: Akashdeep Singh</div>
                <div>State Bank of India • Qadian, Punjab</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
