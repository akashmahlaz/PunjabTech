"use server";

import { auth } from "@/app/auth/_lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import {
  startup,
  meeting,
  startupAgreement,
  agreementSignature,
  user,
  payment,
  startupMilestone,
  startupActivityLog,
} from "@/drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const AUTHORIZED_ADMIN_EMAIL = "akashdalla406@gmail.com";

async function verifySuperAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { authorized: false, session: null };
  }

  const role = (session.user as { role?: string }).role;
  const isAuthorized = session.user.email === AUTHORIZED_ADMIN_EMAIL && role === "admin";

  return { authorized: isAuthorized, session };
}

const scheduleSchema = z.object({
  startupId: z.string().uuid("Invalid startup ID"),
  scheduledAt: z.string().min(1, "Please select a meeting date and time"),
  meetingLink: z.string().min(3, "Please enter a valid meeting link"),
  notes: z.string().optional(),
  durationMinutes: z.number().int().positive().default(30),
});

export type ScheduleMeetingInput = {
  startupId: string;
  scheduledAt: string;
  meetingLink: string;
  notes?: string;
  durationMinutes?: number;
};

export async function approveStartupAndScheduleMeeting(input: ScheduleMeetingInput) {
  const { authorized, session } = await verifySuperAdmin();

  if (!authorized || !session) {
    return { success: false, error: "Unauthorized. Admin access required." };
  }

  const parsed = scheduleSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid input data",
    };
  }

  const { startupId, scheduledAt, meetingLink, notes, durationMinutes } = parsed.data;

  try {
    const scheduledDate = new Date(scheduledAt);
    if (isNaN(scheduledDate.getTime())) {
      return { success: false, error: "Invalid date selected." };
    }

    // 1. Update startup status to 'approved'
    await db
      .update(startup)
      .set({
        status: "approved",
        updatedAt: new Date(),
      })
      .where(eq(startup.id, startupId));

    // 2. Check if a scheduled meeting already exists
    const [existing] = await db
      .select({ id: meeting.id })
      .from(meeting)
      .where(and(eq(meeting.startupId, startupId), eq(meeting.status, "scheduled")))
      .limit(1);

    if (existing) {
      await db
        .update(meeting)
        .set({
          scheduledAt: scheduledDate,
          durationMinutes,
          meetingLink,
          notes: notes || null,
          adminId: session.user.id,
          updatedAt: new Date(),
        })
        .where(eq(meeting.id, existing.id));
    } else {
      await db.insert(meeting).values({
        startupId,
        adminId: session.user.id,
        scheduledAt: scheduledDate,
        durationMinutes,
        meetingLink,
        notes: notes || null,
        status: "scheduled",
      });
    }

    revalidatePath("/admin/dashboard");
    revalidatePath(`/startup/${startupId}`);
    return { success: true };
  } catch (error) {
    console.error("Error approving startup and scheduling meeting:", error);
    return {
      success: false,
      error: "Failed to approve startup and save meeting. Please try again.",
    };
  }
}

export async function markMeetingSuccessfulAndIssueNDA(startupId: string) {
  const { authorized, session } = await verifySuperAdmin();

  if (!authorized || !session) {
    return { success: false, error: "Unauthorized. Admin access required." };
  }

  try {
    // 1. Mark latest meeting for this startup as completed
    const [latestMeeting] = await db
      .select()
      .from(meeting)
      .where(eq(meeting.startupId, startupId))
      .orderBy(desc(meeting.createdAt))
      .limit(1);

    if (latestMeeting) {
      await db
        .update(meeting)
        .set({
          status: "completed",
          completedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(meeting.id, latestMeeting.id));
    }

    // 2. Fetch startup & founder information
    const [startupRecord] = await db
      .select({
        id: startup.id,
        createdByUserId: startup.createdByUserId,
        founderName: user.name,
        founderEmail: user.email,
      })
      .from(startup)
      .leftJoin(user, eq(startup.createdByUserId, user.id))
      .where(eq(startup.id, startupId))
      .limit(1);

    if (!startupRecord) {
      return { success: false, error: "Startup not found." };
    }

    // 3. Check if an NDA agreement already exists for this startup
    const [existingAgreement] = await db
      .select()
      .from(startupAgreement)
      .where(and(eq(startupAgreement.startupId, startupId), eq(startupAgreement.type, "nda")))
      .limit(1);

    let agreementId = existingAgreement?.id;

    if (!existingAgreement) {
      const [newAgreement] = await db
        .insert(startupAgreement)
        .values({
          startupId,
          createdByUserId: session.user.id,
          type: "nda",
          title: "Mutual Non-Disclosure Agreement (NDA)",
          version: 1,
          status: "sent",
          sentAt: new Date(),
        })
        .returning({ id: startupAgreement.id });

      agreementId = newAgreement.id;

      // Create pending signature entry for founder
      await db.insert(agreementSignature).values({
        agreementId,
        signerUserId: startupRecord.createdByUserId,
        signerName: startupRecord.founderName || "Founder",
        signerEmail: startupRecord.founderEmail || "",
        signerRole: "startup_representative",
        status: "pending",
        isRequired: true,
      });
    } else if (existingAgreement.status === "draft") {
      await db
        .update(startupAgreement)
        .set({
          status: "sent",
          sentAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(startupAgreement.id, existingAgreement.id));
    }

    revalidatePath("/admin/dashboard");
    revalidatePath(`/startup/${startupId}`);
    return { success: true };
  } catch (error) {
    console.error("Error marking meeting successful and issuing NDA:", error);
    return {
      success: false,
      error: "Failed to mark meeting as successful and issue NDA. Please try again.",
    };
  }
}

export async function issueContractAction(startupId: string) {
  const { authorized, session } = await verifySuperAdmin();

  if (!authorized || !session) {
    return { success: false, error: "Unauthorized. Admin access required." };
  }

  try {
    const [startupRecord] = await db
      .select({
        id: startup.id,
        createdByUserId: startup.createdByUserId,
        founderName: user.name,
        founderEmail: user.email,
      })
      .from(startup)
      .leftJoin(user, eq(startup.createdByUserId, user.id))
      .where(eq(startup.id, startupId))
      .limit(1);

    if (!startupRecord) {
      return { success: false, error: "Startup not found." };
    }

    const [existingContract] = await db
      .select()
      .from(startupAgreement)
      .where(and(eq(startupAgreement.startupId, startupId), eq(startupAgreement.type, "contract")))
      .limit(1);

    if (!existingContract) {
      const [newContract] = await db
        .insert(startupAgreement)
        .values({
          startupId,
          createdByUserId: session.user.id,
          type: "contract",
          title: "Master Services Agreement (MSA) & IP Assignment",
          version: 1,
          status: "sent",
          sentAt: new Date(),
        })
        .returning({ id: startupAgreement.id });

      await db.insert(agreementSignature).values({
        agreementId: newContract.id,
        signerUserId: startupRecord.createdByUserId,
        signerName: startupRecord.founderName || "Founder",
        signerEmail: startupRecord.founderEmail || "",
        signerRole: "startup_representative",
        status: "pending",
        isRequired: true,
      });
    } else if (existingContract.status === "draft") {
      await db
        .update(startupAgreement)
        .set({
          status: "sent",
          sentAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(startupAgreement.id, existingContract.id));
    }

    revalidatePath("/admin/dashboard");
    revalidatePath(`/startup/${startupId}`);
    return { success: true };
  } catch (error) {
    console.error("Error issuing contract:", error);
    return { success: false, error: "Failed to issue Master Services Agreement." };
  }
}

export async function markDepositCompletedManual(startupId: string) {
  const { authorized, session } = await verifySuperAdmin();

  if (!authorized || !session) {
    return { success: false, error: "Unauthorized. Admin access required." };
  }

  try {
    const [existingPayment] = await db
      .select()
      .from(payment)
      .where(eq(payment.startupId, startupId))
      .orderBy(desc(payment.createdAt))
      .limit(1);

    if (existingPayment) {
      await db
        .update(payment)
        .set({
          status: "completed",
          paidAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(payment.id, existingPayment.id));
    } else {
      const [startupRecord] = await db
        .select({ createdByUserId: startup.createdByUserId })
        .from(startup)
        .where(eq(startup.id, startupId))
        .limit(1);

      await db.insert(payment).values({
        startupId,
        userId: startupRecord?.createdByUserId || session.user.id,
        amountCents: 10000,
        currency: "usd",
        status: "completed",
        paymentMethod: "bank_wire",
        referenceNumber: `ADMIN-VERIFIED-${Date.now().toString().slice(-6)}`,
        description: "Direct bank wire deposit verified manually by Admin Akashdeep Singh",
        paidAt: new Date(),
      });
    }

    // Ensure sprint milestones exist in PostgreSQL
    const existingMilestones = await db
      .select({ id: startupMilestone.id })
      .from(startupMilestone)
      .where(eq(startupMilestone.startupId, startupId));

    if (existingMilestones.length === 0) {
      const now = new Date();
      const day = 24 * 60 * 60 * 1000;

      await db.insert(startupMilestone).values([
        {
          startupId,
          phaseNumber: 1,
          title: "Sprint 01: Architecture, Data Modeling & API Specs",
          description: "Database normalization, relational schema design, auth policies, and core API interface design.",
          status: "completed",
          progressPercentage: 100,
          targetDate: new Date(now.getTime() + 7 * day),
          completedAt: now,
        },
        {
          startupId,
          phaseNumber: 2,
          title: "Sprint 02: Core Engine & Transactional Workflows",
          description: "Relational business logic, secure state machines, and real-time backend integrations.",
          status: "in_progress",
          progressPercentage: 35,
          targetDate: new Date(now.getTime() + 14 * day),
        },
        {
          startupId,
          phaseNumber: 3,
          title: "Sprint 03: High-Density UI & Production Integration",
          description: "Material 3 Expressive UI components, responsive layout density, and third-party service hooks.",
          status: "upcoming",
          progressPercentage: 0,
          targetDate: new Date(now.getTime() + 21 * day),
        },
        {
          startupId,
          phaseNumber: 4,
          title: "Sprint 04: Security Hardening, Audit & Go-Live Launch",
          description: "OWASP vulnerability audit, rate limiting, domain cutover, and production deployment.",
          status: "upcoming",
          progressPercentage: 0,
          targetDate: new Date(now.getTime() + 28 * day),
        },
      ]);
    }

    await db.insert(startupActivityLog).values({
      startupId,
      adminId: session.user.id,
      title: "Kickoff Deposit Verified ($100.00 USD)",
      details: "Confirmed payment received into State Bank of India account. Full founder cockpit and development sprint activated.",
      category: "financial",
    });

    revalidatePath("/admin/dashboard");
    revalidatePath(`/startup/${startupId}`);
    return { success: true };
  } catch (error) {
    console.error("Error marking deposit completed:", error);
    return { success: false, error: "Failed to mark deposit as completed." };
  }
}

export async function verifyBankWirePayment(paymentId: string, startupId: string) {
  const { authorized, session } = await verifySuperAdmin();

  if (!authorized || !session) {
    return { success: false, error: "Unauthorized. Admin access required." };
  }

  try {
    // 1. Mark payment as completed
    await db
      .update(payment)
      .set({
        status: "completed",
        paidAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(payment.id, paymentId));

    // 2. Ensure sprint milestones exist in PostgreSQL
    const existingMilestones = await db
      .select({ id: startupMilestone.id })
      .from(startupMilestone)
      .where(eq(startupMilestone.startupId, startupId));

    if (existingMilestones.length === 0) {
      const now = new Date();
      const day = 24 * 60 * 60 * 1000;

      await db.insert(startupMilestone).values([
        {
          startupId,
          phaseNumber: 1,
          title: "Sprint 01: Architecture, Data Modeling & API Specs",
          description: "Database normalization, relational schema design, auth policies, and core API interface design.",
          status: "completed",
          progressPercentage: 100,
          targetDate: new Date(now.getTime() + 7 * day),
          completedAt: now,
        },
        {
          startupId,
          phaseNumber: 2,
          title: "Sprint 02: Core Engine & Transactional Workflows",
          description: "Relational business logic, secure state machines, and real-time backend integrations.",
          status: "in_progress",
          progressPercentage: 35,
          targetDate: new Date(now.getTime() + 14 * day),
        },
        {
          startupId,
          phaseNumber: 3,
          title: "Sprint 03: High-Density UI & Production Integration",
          description: "Material 3 Expressive UI components, responsive layout density, and third-party service hooks.",
          status: "upcoming",
          progressPercentage: 0,
          targetDate: new Date(now.getTime() + 21 * day),
        },
        {
          startupId,
          phaseNumber: 4,
          title: "Sprint 04: Security Hardening, Audit & Go-Live Launch",
          description: "OWASP vulnerability audit, rate limiting, domain cutover, and production deployment.",
          status: "upcoming",
          progressPercentage: 0,
          targetDate: new Date(now.getTime() + 28 * day),
        },
      ]);
    }

    // 3. Post verification activity log
    await db.insert(startupActivityLog).values({
      startupId,
      adminId: session.user.id,
      title: "Bank Wire Transfer Verified ($100.00 USD)",
      details: "State Bank of India wire payment verified by Admin Akashdeep Singh. Full transparent cockpit activated.",
      category: "financial",
    });

    revalidatePath("/admin/dashboard");
    revalidatePath(`/startup/${startupId}`);
    return { success: true };
  } catch (error) {
    console.error("Error verifying bank wire payment:", error);
    return {
      success: false,
      error: "Failed to verify bank wire payment.",
    };
  }
}

export async function postActivityLog(input: {
  startupId: string;
  title: string;
  details: string;
  category: string;
}) {
  const { authorized, session } = await verifySuperAdmin();

  if (!authorized || !session) {
    return { success: false, error: "Unauthorized. Admin access required." };
  }

  const { startupId, title, details, category } = input;

  if (!title || title.trim().length < 3) {
    return { success: false, error: "Please provide a valid activity title." };
  }

  try {
    await db.insert(startupActivityLog).values({
      startupId,
      adminId: session.user.id,
      title: title.trim(),
      details: details.trim(),
      category: category || "engineering",
    });

    revalidatePath("/admin/dashboard");
    revalidatePath(`/startup/${startupId}`);
    return { success: true };
  } catch (error) {
    console.error("Error posting activity log:", error);
    return { success: false, error: "Failed to publish activity log." };
  }
}

export async function updateMilestoneProgress(input: {
  milestoneId: string;
  startupId: string;
  progressPercentage: number;
  status: "upcoming" | "in_progress" | "completed";
}) {
  const { authorized, session } = await verifySuperAdmin();

  if (!authorized || !session) {
    return { success: false, error: "Unauthorized. Admin access required." };
  }

  const { milestoneId, startupId, progressPercentage, status } = input;

  try {
    await db
      .update(startupMilestone)
      .set({
        progressPercentage,
        status,
        completedAt: status === "completed" ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(startupMilestone.id, milestoneId));

    revalidatePath("/admin/dashboard");
    revalidatePath(`/startup/${startupId}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating milestone progress:", error);
    return { success: false, error: "Failed to update milestone." };
  }
}
