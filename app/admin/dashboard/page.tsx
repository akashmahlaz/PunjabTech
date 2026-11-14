import { auth } from "@/app/auth/_lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { startup, meeting, startupAgreement, payment, startupMilestone, startupActivityLog } from "@/drizzle/schema";
import { desc, eq } from "drizzle-orm";
import { AppSidebar } from "./_components/app-sidebar";
import { SiteHeader } from "./_components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { StartupsTable } from "./_components/startups-table";
import { Calendar, Clock, Layers, FileCheck, CreditCard, ShieldCheck } from "lucide-react";

const SUPER_ADMIN_EMAIL = "akashdalla406@gmail.com";

export default async function AdminDashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Strict Super Admin Access: Only akashdalla406@gmail.com with admin role can access
  const isSuperAdmin =
    session?.user?.email === SUPER_ADMIN_EMAIL &&
    (session?.user as { role?: string })?.role === "admin";

  if (!session || !isSuperAdmin) {
    redirect("/startup/new");
  }

  // 1. Fetch live startups with relations (0 mock data - 100% database truth)
  const rawStartups = await db.query.startup.findMany({
    orderBy: [desc(startup.createdAt)],
    with: {
      createdBy: true,
      meetings: {
        orderBy: [desc(meeting.createdAt)],
        limit: 1,
      },
      agreements: {
        orderBy: [desc(startupAgreement.createdAt)],
        with: {
          signatures: true,
        },
      },
      payments: {
        orderBy: [desc(payment.createdAt)],
      },
      milestones: {
        orderBy: [startupMilestone.phaseNumber],
      },
      activityLogs: {
        orderBy: [desc(startupActivityLog.createdAt)],
        limit: 5,
      },
    },
  });

  const formattedStartups = rawStartups.map((s) => {
    const nda = s.agreements?.find((a) => a.type === "nda") || null;
    const contract = s.agreements?.find((a) => a.type === "contract") || null;
    const latestPayment = s.payments?.[0] || null;

    return {
      id: s.id,
      name: s.name,
      slug: s.slug,
      description: s.description,
      status: s.status,
      submittedAt: s.submittedAt,
      createdAt: s.createdAt,
      user: s.createdBy
        ? {
            id: s.createdBy.id,
            name: s.createdBy.name,
            email: s.createdBy.email,
            image: s.createdBy.image,
          }
        : null,
      meeting: s.meetings?.[0]
        ? {
            id: s.meetings[0].id,
            scheduledAt: s.meetings[0].scheduledAt,
            meetingLink: s.meetings[0].meetingLink,
            durationMinutes: s.meetings[0].durationMinutes,
            notes: s.meetings[0].notes,
            status: s.meetings[0].status,
            completedAt: s.meetings[0].completedAt,
          }
        : null,
      ndaAgreement: nda
        ? {
            id: nda.id,
            title: nda.title,
            status: nda.status,
            fullySignedAt: nda.fullySignedAt,
            sentAt: nda.sentAt,
            signatures: nda.signatures || [],
          }
        : null,
      contractAgreement: contract
        ? {
            id: contract.id,
            title: contract.title,
            status: contract.status,
            fullySignedAt: contract.fullySignedAt,
            sentAt: contract.sentAt,
            signatures: contract.signatures || [],
          }
        : null,
      payment: latestPayment
        ? {
            id: latestPayment.id,
            amountCents: latestPayment.amountCents,
            currency: latestPayment.currency,
            status: latestPayment.status,
            paymentMethod: latestPayment.paymentMethod,
            referenceNumber: latestPayment.referenceNumber,
            paidAt: latestPayment.paidAt,
          }
        : null,
      milestones: (s.milestones || []).map((m) => ({
        id: m.id,
        phaseNumber: m.phaseNumber,
        title: m.title,
        status: m.status,
        progressPercentage: m.progressPercentage,
      })),
      activityLogsCount: s.activityLogs?.length || 0,
    };
  });

  const totalCount = formattedStartups.length;
  const ndaActiveCount = formattedStartups.filter(
    (s) => s.ndaAgreement?.status === "signed"
  ).length;
  const contractActiveCount = formattedStartups.filter(
    (s) => s.contractAgreement?.status === "signed"
  ).length;
  const depositActiveCount = formattedStartups.filter(
    (s) => s.payment?.status === "completed"
  ).length;

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col bg-[#F9FAFB]">
          <div className="@container/main flex flex-1 flex-col gap-6 p-4 lg:p-6">
            {/* Header & Overview */}
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1 font-['JetBrains_Mono'] text-xs font-medium text-neutral-600 shadow-2xs">
                Super Admin: {session.user.email} (Punjab Tech)
              </div>
              <h1 className="mt-2.5 font-['Space_Grotesk'] text-2xl font-bold tracking-tight text-neutral-900">
                Founder Lifecycle &amp; Venture Control Center
              </h1>
              <p className="font-['Inter'] text-xs text-neutral-500">
                Manage discovery calls, review executed NDAs &amp; contracts, verify token wire deposits, and track sprint delivery transparently.
              </p>
            </div>

            {/* Metric Cards (M3 Elevated) */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-3xl border border-neutral-200/80 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between text-neutral-500">
                  <span className="font-['Plus_Jakarta_Sans'] text-xs font-semibold uppercase tracking-wider text-neutral-400">Total Ventures</span>
                  <Layers className="size-4 text-neutral-400" />
                </div>
                <div className="mt-2 font-['Space_Grotesk'] text-3xl font-bold tabular-nums text-neutral-900">
                  {totalCount}
                </div>
                <div className="mt-1 font-['Inter'] text-xs text-neutral-400">Submissions received</div>
              </div>

              <div className="rounded-3xl border border-neutral-200/80 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between text-neutral-500">
                  <span className="font-['Plus_Jakarta_Sans'] text-xs font-semibold uppercase tracking-wider text-neutral-400">NDAs Executed</span>
                  <FileCheck className="size-4 text-emerald-500" />
                </div>
                <div className="mt-2 font-['Space_Grotesk'] text-3xl font-bold tabular-nums text-emerald-600">
                  {ndaActiveCount}
                </div>
                <div className="mt-1 font-['Inter'] text-xs text-neutral-400">Mutual NDAs signed</div>
              </div>

              <div className="rounded-3xl border border-neutral-200/80 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between text-neutral-500">
                  <span className="font-['Plus_Jakarta_Sans'] text-xs font-semibold uppercase tracking-wider text-neutral-400">Contracts Signed</span>
                  <ShieldCheck className="size-4 text-blue-500" />
                </div>
                <div className="mt-2 font-['Space_Grotesk'] text-3xl font-bold tabular-nums text-blue-600">
                  {contractActiveCount}
                </div>
                <div className="mt-1 font-['Inter'] text-xs text-neutral-400">Master MSAs signed</div>
              </div>

              <div className="rounded-3xl border border-neutral-200/80 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between text-neutral-500">
                  <span className="font-['Plus_Jakarta_Sans'] text-xs font-semibold uppercase tracking-wider text-neutral-400">Deposits Verified</span>
                  <CreditCard className="size-4 text-orange-500" />
                </div>
                <div className="mt-2 font-['Space_Grotesk'] text-3xl font-bold tabular-nums text-orange-600">
                  {depositActiveCount}
                </div>
                <div className="mt-1 font-['Inter'] text-xs text-neutral-400">$100 Token deposits paid</div>
              </div>
            </div>

            {/* Main Interactive Table */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-['Space_Grotesk'] text-sm font-semibold text-neutral-900">
                  Live Startups &amp; Stage Control
                </h2>
              </div>
              <StartupsTable initialStartups={formattedStartups} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
