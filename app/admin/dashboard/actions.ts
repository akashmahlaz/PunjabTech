"use server";

import { auth } from "@/app/auth/_lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { startup, meeting, startupAgreement, agreementSignature, user } from "@/drizzle/schema";
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
