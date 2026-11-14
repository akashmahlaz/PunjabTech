"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Download,
  CheckCircle2,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { signNDAAction } from "@/app/startup/actions";

export type AgreementData = {
  id: string;
  title: string;
  status: string;
  sentAt: Date | string | null;
  fullySignedAt: Date | string | null;
  signatures: Array<{
    id: string;
    signerName: string;
    signerEmail: string;
    status: string;
    signedAt: Date | string | null;
  }>;
} | null;

export function NdaSignView({
  startupId,
  startupName,
  founderName,
  founderEmail,
  agreement,
}: {
  startupId: string;
  startupName: string;
  founderName: string;
  founderEmail: string;
  agreement: AgreementData;
}) {
  const router = useRouter();
  const [signerName, setSignerName] = useState(founderName || "");
  const [signerTitle, setSignerTitle] = useState("Founder & Representative");
  const [hasAgreed, setHasAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSigned = agreement?.status === "signed";
  const mySignature = agreement?.signatures?.find((s) => s.signerEmail === founderEmail) || agreement?.signatures?.[0];

  const handleSign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreement?.id) {
      toast.error("No active agreement found to sign.");
      return;
    }

    if (!signerName.trim()) {
      toast.error("Please enter your legal name as signature.");
      return;
    }

    if (!hasAgreed) {
      toast.error("Please confirm your acknowledgment to continue.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await signNDAAction({
        agreementId: agreement.id,
        signerName: signerName.trim(),
        signerTitle,
      });

      if (res.success) {
        toast.success("Mutual NDA executed successfully!");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to sign NDA.");
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-xs sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-50 px-3.5 py-1 font-['Plus_Jakarta_Sans'] text-xs font-semibold text-emerald-800">
              <CheckCircle2 className="size-3.5" />
              Stage 02 — Mutual Non-Disclosure Agreement
            </div>

            <h2 className="font-['Space_Grotesk'] text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
              {isSigned ? "Mutual NDA Executed & Confirmed" : "Review & Execute Mutual NDA"}
            </h2>

            <p className="max-w-2xl font-['Inter'] text-sm leading-relaxed text-neutral-600">
              Your discovery meeting with PunjabTech was completed successfully. Before we initiate technical sprint
              architecture, milestone specifications, and repository setups, both parties execute this Mutual NDA to protect
              your intellectual property.
            </p>
          </div>

          <a
            href={`/api/startup/${startupId}/nda`}
            download
            className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-neutral-50 px-5 py-2.5 font-['Plus_Jakarta_Sans'] text-xs font-semibold text-neutral-800 shadow-2xs transition hover:bg-neutral-100 sm:self-start"
          >
            <Download className="size-3.5" />
            Download NDA Document
          </a>
        </div>
      </div>

      {/* 2. Embedded NDA Document Template Viewer */}
      <div className="rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-xs sm:p-8">
        <div className="mb-4 flex items-center justify-between border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2 font-['Plus_Jakarta_Sans'] text-xs font-semibold uppercase tracking-wider text-neutral-500">
            <FileText className="size-4 text-neutral-400" />
            Legal Agreement Document Preview
          </div>
          <span className="font-['JetBrains_Mono'] text-xs text-neutral-400">Ref: NDA-2026-PT</span>
        </div>

        {/* Legal Text Container */}
        <div className="max-h-96 space-y-4 overflow-y-auto rounded-2xl border border-neutral-100 bg-[#F9FAFB] p-6 font-['JetBrains_Mono'] text-xs leading-relaxed text-neutral-700">
          <div className="text-center font-bold tracking-tight text-neutral-900">
            MUTUAL NON-DISCLOSURE AGREEMENT (NDA)
          </div>

          <p className="text-[11px] text-neutral-500">
            This Mutual Non-Disclosure Agreement (&ldquo;Agreement&rdquo;) is entered into by and between:
          </p>

          <div className="rounded-xl border border-neutral-200 bg-white p-3.5">
            <div><strong>Party 1:</strong> PUNJABTECH OPERATIONS (&ldquo;PunjabTech&rdquo;)</div>
            <div><strong>Party 2:</strong> {startupName.toUpperCase()} (&ldquo;Company&rdquo;), represented by {founderName} ({founderEmail})</div>
          </div>

          <div>
            <div className="font-semibold text-neutral-900">1. PURPOSE</div>
            <p className="mt-1 text-neutral-600">
              The parties intend to explore a cooperative software development, architectural scoping, and sprint execution relationship
              (the &ldquo;Purpose&rdquo;). In the course of evaluating this Purpose, either party may disclose confidential, proprietary
              technical information, trade secrets, software designs, or business data.
            </p>
          </div>

          <div>
            <div className="font-semibold text-neutral-900">2. CONFIDENTIAL INFORMATION</div>
            <p className="mt-1 text-neutral-600">
              &ldquo;Confidential Information&rdquo; encompasses all proprietary data disclosed verbally, visually, or in written/electronic format,
              including but not limited to source code, database architectures, algorithmic logic, product specifications, customer details,
              and design schematics.
            </p>
          </div>

          <div>
            <div className="font-semibold text-neutral-900">3. NON-DISCLOSURE &amp; STANDARD OF CARE</div>
            <p className="mt-1 text-neutral-600">
              The receiving party shall hold all Confidential Information in strict confidence, exercising at least the same standard of care
              it applies to its own trade secrets (and in no case less than reasonable care). The receiving party shall not disclose, replicate,
              or reverse engineer any Confidential Information without prior written authorization.
            </p>
          </div>

          <div>
            <div className="font-semibold text-neutral-900">4. TERM &amp; SURVIVAL</div>
            <p className="mt-1 text-neutral-600">
              This Agreement governs disclosures made within two (2) years of the execution date. The obligations of non-disclosure shall survive
              for two (2) years after formal conclusion of any discussions.
            </p>
          </div>

          <div>
            <div className="font-semibold text-neutral-900">5. GOVERNING LAW</div>
            <p className="mt-1 text-neutral-600">
              This Agreement shall be governed and interpreted according to the commercial laws applicable to technology service agreements.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Electronic Signature Section */}
      <div className="rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-xs sm:p-8">
        {isSigned ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-emerald-700">
              <ShieldCheck className="size-6" />
              <div>
                <h3 className="font-['Space_Grotesk'] text-base font-semibold text-neutral-900">
                  Agreement Digitally Signed &amp; Recorded
                </h3>
                <p className="font-['Inter'] text-xs text-neutral-500">
                  This document has been legally executed by both parties and is active.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-50/40 p-4 text-xs sm:grid-cols-3">
              <div>
                <span className="font-['Plus_Jakarta_Sans'] text-neutral-500">Signer Name:</span>
                <div className="font-['Space_Grotesk'] font-semibold text-neutral-900">
                  {mySignature?.signerName || founderName}
                </div>
              </div>
              <div>
                <span className="font-['Plus_Jakarta_Sans'] text-neutral-500">Signer Email:</span>
                <div className="font-['Inter'] font-semibold text-neutral-900">
                  {mySignature?.signerEmail || founderEmail}
                </div>
              </div>
              <div>
                <span className="font-['Plus_Jakarta_Sans'] text-neutral-500">Execution Timestamp:</span>
                <div className="font-['JetBrains_Mono'] tabular-nums text-neutral-900">
                  {agreement.fullySignedAt || mySignature?.signedAt
                    ? new Date(agreement.fullySignedAt || mySignature!.signedAt!).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Confirmed"}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="font-['Inter'] text-xs text-neutral-500">
                Next Stage: Milestone sprint planning &amp; architectural blueprint delivery.
              </span>
              <a
                href={`/api/startup/${startupId}/nda`}
                download
                className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-5 py-2.5 font-['Plus_Jakarta_Sans'] text-xs font-semibold text-white hover:bg-neutral-800"
              >
                <Download className="size-3.5" />
                Download Signed Copy
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSign} className="space-y-4">
            <h3 className="font-['Space_Grotesk'] text-base font-semibold text-neutral-900">
              Electronic Signature Execution
            </h3>
            <p className="font-['Inter'] text-xs text-neutral-500">
              Type your legal name to apply your digital signature. By clicking sign, you bind {startupName} to this Mutual NDA.
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="font-['Plus_Jakarta_Sans'] text-xs font-semibold text-neutral-700">
                  Legal Signer Name
                </label>
                <input
                  type="text"
                  required
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  placeholder="e.g. Akashdeep Singh"
                  className="w-full rounded-2xl border border-neutral-200 bg-neutral-50/50 px-4 py-3 font-['Inter'] text-sm outline-none focus:border-neutral-900 focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-['Plus_Jakarta_Sans'] text-xs font-semibold text-neutral-700">
                  Signer Title / Authority
                </label>
                <input
                  type="text"
                  required
                  value={signerTitle}
                  onChange={(e) => setSignerTitle(e.target.value)}
                  placeholder="e.g. Founder & CEO"
                  className="w-full rounded-2xl border border-neutral-200 bg-neutral-50/50 px-4 py-3 font-['Inter'] text-sm outline-none focus:border-neutral-900 focus:bg-white"
                />
              </div>
            </div>

            <label className="flex items-start gap-2.5 pt-2 font-['Inter'] text-xs text-neutral-600">
              <input
                type="checkbox"
                required
                checked={hasAgreed}
                onChange={(e) => setHasAgreed(e.target.checked)}
                className="mt-0.5 rounded border-neutral-300 text-neutral-900 focus:ring-0"
              />
              <span>
                I confirm that I have reviewed the terms of this Mutual Non-Disclosure Agreement and that I possess legal
                authority to execute this document on behalf of <strong>{startupName}</strong>.
              </span>
            </label>

            <div className="flex items-center justify-end pt-3">
              <button
                type="submit"
                disabled={isSubmitting || !hasAgreed}
                className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-7 py-3.5 font-['Plus_Jakarta_Sans'] text-sm font-semibold text-white shadow-xs transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Executing Agreement...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="size-4" />
                    Sign &amp; Execute Mutual NDA
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
