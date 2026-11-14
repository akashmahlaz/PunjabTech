import { auth } from "@/app/auth/_lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { startup, meeting, startupAgreement, payment, startupMilestone, startupActivityLog, agreementSignature } from "@/drizzle/schema";
import { eq, desc, and } from "drizzle-orm";
import Link from "next/link";
import { MeetingStatusView } from "./_components/meeting-status-view";
import { NdaSignView } from "./_components/nda-sign-view";
import { ContractSignView } from "./_components/contract-sign-view";
import { DepositPaymentView } from "./_components/deposit-payment-view";
import { CockpitDashboardView } from "./_components/cockpit-dashboard-view";
import {
  Building2,
  Calendar,
  FileText,
  FileCheck2,
  CreditCard,
  LayoutDashboard,
} from "lucide-react";

export default async function StartupPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ tab?: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/sign-up");
  }

  // 1. Strict Role Isolation: Admins can ONLY access /admin/dashboard, never founder screens
  const userRole = (session.user as { role?: string }).role;
  if (userRole === "admin") {
    redirect("/admin/dashboard");
  }

  const { id } = await params;
  const query = searchParams ? await searchParams : {};

  // 2. Fetch startup with live relational data from PostgreSQL (0 mock data)
  const startupData = await db.query.startup.findFirst({
    where: eq(startup.id, id),
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
      },
    },
  });

  if (!startupData) {
    notFound();
  }

  // 3. Founder Ownership Check: Only the founder who created this startup can access their page
  const isOwner = startupData.createdByUserId === session.user.id;
  if (!isOwner) {
    redirect("/startup/new");
  }

  const latestMeeting = startupData.meetings?.[0] || null;
  const ndaAgreement = startupData.agreements?.find((a) => a.type === "nda") || null;
  let contractAgreement = startupData.agreements?.find((a) => a.type === "contract") || null;

  const isMeetingCompleted = latestMeeting?.status === "completed" || !!ndaAgreement;
  const isNdaSigned = ndaAgreement?.status === "signed";

  // If NDA is signed but contract row doesn't exist yet, provision it on the fly
  if (isNdaSigned && !contractAgreement) {
    const [newContract] = await db
      .insert(startupAgreement)
      .values({
        startupId: startupData.id,
        type: "contract",
        title: "Master Services Agreement (MSA) & IP Assignment",
        version: 1,
        status: "sent",
        sentAt: new Date(),
      })
      .returning({ id: startupAgreement.id });

    if (newContract) {
      await db.insert(agreementSignature).values({
        agreementId: newContract.id,
        signerUserId: session.user.id,
        signerName: session.user.name || "Founder",
        signerEmail: session.user.email || "",
        signerRole: "startup_representative",
        status: "pending",
        isRequired: true,
      });

      contractAgreement = await db.query.startupAgreement.findFirst({
        where: eq(startupAgreement.id, newContract.id),
        with: { signatures: true },
      }) || null;
    }
  }

  const isContractSigned = contractAgreement?.status === "signed";
  const completedPayment = startupData.payments?.find((p) => p.status === "completed") || null;
  const pendingPayment = startupData.payments?.find((p) => p.status === "pending") || null;
  const activePayment = completedPayment || pendingPayment;
  const isDepositCompleted = !!completedPayment;
  const isDepositPending = !completedPayment && !!pendingPayment;
  const isCockpitAccessible = isDepositCompleted || isDepositPending;

  // 4. Deterministic Active Stage Routing:
  // Cockpit (05) > Deposit (04) > Contract (03) > NDA (02) > Meeting (01)
  let defaultTab = "meeting";
  if (isCockpitAccessible) {
    defaultTab = "cockpit";
  } else if (isContractSigned) {
    defaultTab = "deposit";
  } else if (isNdaSigned) {
    defaultTab = "contract";
  } else if (isMeetingCompleted) {
    defaultTab = "nda";
  }

  const activeTab = query.tab || defaultTab;

  return (
    <main className="min-h-screen bg-[#F9FAFB] text-neutral-900">
      {/* Top Header */}
      <header className="border-b border-neutral-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
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
              <span>{startupData.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-['Inter']">
            <span className="text-neutral-500">
              Founder: <span className="font-medium text-neutral-800">{session.user.name}</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* Stage Navigation Pills (Material 3 Expressive Tonal Pills) */}
        {isMeetingCompleted && (
          <div className="mb-8 flex items-center gap-2 overflow-x-auto border-b border-neutral-200/60 pb-3">
            {/* Stage 05: Cockpit */}
            {isCockpitAccessible && (
              <Link
                href={`/startup/${id}?tab=cockpit`}
                className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 font-['Plus_Jakarta_Sans'] text-xs font-semibold transition ${
                  activeTab === "cockpit"
                    ? "bg-neutral-900 text-white shadow-xs"
                    : "bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100"
                }`}
              >
                <LayoutDashboard className="size-3.5" />
                Stage 05: Cockpit Dashboard
              </Link>
            )}

            {/* Stage 04: Deposit */}
            {isContractSigned && (
              <Link
                href={`/startup/${id}?tab=deposit`}
                className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 font-['Plus_Jakarta_Sans'] text-xs font-semibold transition ${
                  activeTab === "deposit"
                    ? "bg-neutral-900 text-white shadow-xs"
                    : "bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100"
                }`}
              >
                <CreditCard className="size-3.5" />
                Stage 04: Token Deposit ($100) {isDepositCompleted && "✓"}
              </Link>
            )}

            {/* Stage 03: Contract */}
            {isNdaSigned && (
              <Link
                href={`/startup/${id}?tab=contract`}
                className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 font-['Plus_Jakarta_Sans'] text-xs font-semibold transition ${
                  activeTab === "contract"
                    ? "bg-neutral-900 text-white shadow-xs"
                    : "bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100"
                }`}
              >
                <FileCheck2 className="size-3.5" />
                Stage 03: Master Contract {isContractSigned && "✓"}
              </Link>
            )}

            {/* Stage 02: NDA */}
            <Link
              href={`/startup/${id}?tab=nda`}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 font-['Plus_Jakarta_Sans'] text-xs font-semibold transition ${
                activeTab === "nda"
                  ? "bg-neutral-900 text-white shadow-xs"
                  : "bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100"
              }`}
            >
              <FileText className="size-3.5" />
              Stage 02: Mutual NDA {isNdaSigned && "✓"}
            </Link>

            {/* Stage 01: Meeting */}
            <Link
              href={`/startup/${id}?tab=meeting`}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 font-['Plus_Jakarta_Sans'] text-xs font-semibold transition ${
                activeTab === "meeting"
                  ? "bg-neutral-900 text-white shadow-xs"
                  : "bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100"
              }`}
            >
              <Calendar className="size-3.5" />
              Stage 01: Discovery Call ✓
            </Link>
          </div>
        )}

        {/* View Selection */}
        {activeTab === "cockpit" && isCockpitAccessible ? (
          <CockpitDashboardView
            startupId={startupData.id}
            startupName={startupData.name}
            founderName={startupData.createdBy.name}
            founderEmail={startupData.createdBy.email}
            milestones={startupData.milestones.map((m) => ({
              id: m.id,
              phaseNumber: m.phaseNumber,
              title: m.title,
              description: m.description,
              status: m.status,
              progressPercentage: m.progressPercentage,
              targetDate: m.targetDate,
              completedAt: m.completedAt,
            }))}
            activityLogs={startupData.activityLogs.map((l) => ({
              id: l.id,
              title: l.title,
              details: l.details,
              category: l.category,
              createdAt: l.createdAt,
            }))}
            depositPaidAt={completedPayment?.paidAt || null}
          />
        ) : activeTab === "deposit" && isContractSigned ? (
          <DepositPaymentView
            startupId={startupData.id}
            startupName={startupData.name}
            founderName={startupData.createdBy.name}
            founderEmail={startupData.createdBy.email}
            payment={activePayment}
            paypalClientId={process.env.PAYPAL_CLIENT_ID || "sb"}
          />
        ) : activeTab === "contract" && isNdaSigned ? (
          <ContractSignView
            startupId={startupData.id}
            startupName={startupData.name}
            founderName={startupData.createdBy.name}
            founderEmail={startupData.createdBy.email}
            contract={contractAgreement}
          />
        ) : activeTab === "nda" && isMeetingCompleted ? (
          <NdaSignView
            startupId={startupData.id}
            startupName={startupData.name}
            founderName={startupData.createdBy.name}
            founderEmail={startupData.createdBy.email}
            agreement={ndaAgreement}
          />
        ) : (
          <MeetingStatusView
            startupId={startupData.id}
            startupName={startupData.name}
            startupIdea={startupData.description}
            submittedAt={startupData.submittedAt || startupData.createdAt}
            status={startupData.status}
            meeting={latestMeeting}
          />
        )}
      </div>
    </main>
  );
}
