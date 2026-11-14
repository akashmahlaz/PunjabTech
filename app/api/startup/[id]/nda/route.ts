import { auth } from "@/app/auth/_lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { startup, user, startupAgreement, agreementSignature } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await params;

  // 1. Fetch startup, creator, and NDA agreement
  const startupRecord = await db.query.startup.findFirst({
    where: eq(startup.id, id),
    with: {
      createdBy: true,
      agreements: {
        where: eq(startupAgreement.type, "nda"),
        with: {
          signatures: true,
        },
      },
    },
  });

  if (!startupRecord) {
    return new NextResponse("Startup not found", { status: 404 });
  }

  const isOwner = startupRecord.createdByUserId === session.user.id;
  const isSuperAdmin = session.user.email === "akashdalla406@gmail.com";

  if (!isOwner && !isSuperAdmin) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const agreement = startupRecord.agreements?.[0];
  const signature = agreement?.signatures?.[0];
  const dateStr = agreement?.sentAt
    ? new Date(agreement.sentAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  const signedDateStr = agreement?.fullySignedAt
    ? new Date(agreement.fullySignedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "PENDING SIGNATURE";

  const ndaText = `
================================================================================
                    MUTUAL NON-DISCLOSURE AGREEMENT (NDA)
================================================================================

Effective Date: ${dateStr}

PARTIES:
1. PUNJABTECH OPERATIONS ("PunjabTech", "Disclosing / Receiving Party")
   and
2. ${startupRecord.name.toUpperCase()} ("Company", "Disclosing / Receiving Party")
   Founder / Representative: ${startupRecord.createdBy.name} (${startupRecord.createdBy.email})

--------------------------------------------------------------------------------
1. PURPOSE
The parties wish to explore a business relationship concerning software architecture,
full-stack development, AI agent integration, and startup engineering acceleration
(the "Purpose"). In connection with this Purpose, each party may disclose to the other
confidential and proprietary information.

--------------------------------------------------------------------------------
2. CONFIDENTIAL INFORMATION
"Confidential Information" means all non-public information disclosed by one party
("Disclosing Party") to the other party ("Receiving Party"), whether orally, visually,
or in writing, including without limitation technical data, trade secrets, software code,
business plans, customer lists, architectural diagrams, idea specifications, and designs.

--------------------------------------------------------------------------------
3. OBLIGATIONS OF RECEIVING PARTY
The Receiving Party agrees:
(a) To hold the Disclosing Party's Confidential Information in strict confidence;
(b) Not to disclose such Confidential Information to any third parties without prior written consent;
(c) To use such Confidential Information solely for evaluating and pursuing the Purpose;
(d) To apply the same degree of care as it treats its own proprietary information, but not less than reasonable care.

--------------------------------------------------------------------------------
4. EXCLUSIONS
Confidential Information does not include information that:
(a) Is or becomes publicly known through no breach of this Agreement;
(b) Was already known to the Receiving Party prior to disclosure;
(c) Is independently developed without reference to or reliance upon Confidential Information;
(d) Is rightfully received from a third party without confidentiality restrictions.

--------------------------------------------------------------------------------
5. TERM & SURVIVAL
This Agreement shall govern disclosures made for a period of two (2) years from the
Effective Date. The confidentiality obligations under this Agreement shall survive
for a period of two (2) years following the termination or expiration of discussions.

--------------------------------------------------------------------------------
6. GOVERNING LAW & JURISDICTION
This Agreement shall be construed and governed in accordance with the laws applicable
to commercial contracts, without regard to conflicts of law principles.

--------------------------------------------------------------------------------
EXECUTION & DIGITAL SIGNATURES:

For: PUNJABTECH OPERATIONS
Authorized Signatory: Technical Operations Directorate
Status: EXECUTED (Platform Issued)
Date: ${dateStr}

For: ${startupRecord.name.toUpperCase()}
Signer: ${signature?.signerName || startupRecord.createdBy.name}
Role / Title: Startup Founder / Representative
Email: ${signature?.signerEmail || startupRecord.createdBy.email}
Status: ${agreement?.status === "signed" ? "SIGNED & LEGALLY BINDING" : "PENDING SIGNATURE"}
Timestamp: ${signedDateStr}

================================================================================
Generated and Authenticated via PunjabTech Platform
Startup UUID: ${startupRecord.id}
Agreement UUID: ${agreement?.id || "N/A"}
================================================================================
`.trim();

  const safeName = startupRecord.name.replace(/[^a-zA-Z0-9_-]/g, "_");

  return new NextResponse(ndaText, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="PunjabTech-NDA-${safeName}.txt"`,
    },
  });
}
