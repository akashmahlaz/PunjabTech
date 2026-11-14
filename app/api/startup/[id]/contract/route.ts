import { auth } from "@/app/auth/_lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { startup, startupAgreement } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

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

  // Fetch startup, creator, and Contract agreement
  const startupRecord = await db.query.startup.findFirst({
    where: eq(startup.id, id),
    with: {
      createdBy: true,
      agreements: {
        where: eq(startupAgreement.type, "contract"),
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

  const contractAgreement = startupRecord.agreements?.[0];
  const signature = contractAgreement?.signatures?.[0];

  const dateStr = contractAgreement?.sentAt
    ? new Date(contractAgreement.sentAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  const signedDateStr = contractAgreement?.fullySignedAt
    ? new Date(contractAgreement.fullySignedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "PENDING SIGNATURE";

  const contractText = `
================================================================================
                    MASTER SERVICES AGREEMENT (CONTRACT)
                    PUNJAB TECH (UDYAM-PB-08-0062632)
================================================================================

Effective Date: ${dateStr}

SERVICE PROVIDER:
PUNJAB TECH (Registered Micro Enterprise: UDYAM-PB-08-0062632)
Proprietor / Representative: Akashdeep Singh
Official Address: Village Dalla, Qadian, Gurdaspur, Punjab 143516, India
NIC Code: 62011 (Computer programming, custom software & system development)
Contact: akashdalla406@gmail.com | +91 7814002784

CLIENT / STARTUP:
Enterprise / Project Name: ${startupRecord.name.toUpperCase()}
Founder / Authorized Representative: ${startupRecord.createdBy.name} (${startupRecord.createdBy.email})

--------------------------------------------------------------------------------
1. SCOPE OF SERVICES & SPRINTS
Punjab Tech agrees to provide custom software architecture, full-stack engineering,
database modeling, automated AI agent workflows, and technical deployment services
for ${startupRecord.name} (the "Services"), governed by milestone-based sprint phases.

--------------------------------------------------------------------------------
2. INTELLECTUAL PROPERTY OWNERSHIP
Upon receipt of the initial token commitment and milestone fees:
(a) All deliverables, bespoke source code, schema definitions, documentation, and assets
    created specifically for ${startupRecord.name} shall become the sole and exclusive
    property of the Client.
(b) Punjab Tech assigns all rights, title, and intellectual property interest in the deliverables to Client.

--------------------------------------------------------------------------------
3. INITIAL TOKEN KICKOFF COMMITMENT
Client agrees to remit an initial non-refundable engineering commitment deposit of
$100.00 USD (One Hundred US Dollars) prior to sprint commencement. This token deposit
reserves dedicated engineering allocation, private repository initialization, and architectural setup.

--------------------------------------------------------------------------------
4. WARRANTIES & PROFESSIONAL STANDARDS
Punjab Tech warrants that all code produced will be written in a professional, maintainable,
and industry-standard manner, adhering to clean architecture, strict database normalization,
and modern secure development practices.

--------------------------------------------------------------------------------
5. GOVERNING LAW & JURISDICTION
This Agreement shall be governed and interpreted in accordance with commercial laws of India,
with jurisdiction in Gurdaspur / Batala (Punjab).

--------------------------------------------------------------------------------
EXECUTION & DIGITAL SIGNATURES:

For: PUNJAB TECH
Authorized Signatory: Akashdeep Singh (Proprietor)
Enterprise: PUNJAB TECH (UDYAM-PB-08-0062632)
Status: EXECUTED & ISSUED
Date: ${dateStr}

For: ${startupRecord.name.toUpperCase()}
Signer: ${signature?.signerName || startupRecord.createdBy.name}
Role / Authority: Founder & Representative
Email: ${signature?.signerEmail || startupRecord.createdBy.email}
Status: ${contractAgreement?.status === "signed" ? "EXECUTED & LEGALLY BINDING" : "PENDING SIGNATURE"}
Timestamp: ${signedDateStr}

================================================================================
Generated and Authenticated via Punjab Tech Engineering Platform
Startup UUID: ${startupRecord.id}
Contract UUID: ${contractAgreement?.id || "N/A"}
================================================================================
`.trim();

  const safeName = startupRecord.name.replace(/[^a-zA-Z0-9_-]/g, "_");

  return new NextResponse(contractText, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="PunjabTech-Contract-${safeName}.txt"`,
    },
  });
}
