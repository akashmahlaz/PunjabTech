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
  Building,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { signContractAction } from "@/app/startup/actions";

export type ContractData = {
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

export function ContractSignView({
  startupId,
  startupName,
  founderName,
  founderEmail,
  contract,
}: {
  startupId: string;
  startupName: string;
  founderName: string;
  founderEmail: string;
  contract: ContractData;
}) {
  const router = useRouter();
  const [signerName, setSignerName] = useState(founderName || "");
  const [signerTitle, setSignerTitle] = useState("Founder & Representative");
  const [hasAgreed, setHasAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSigned = contract?.status === "signed";
  const mySignature = contract?.signatures?.find((s) => s.signerEmail === founderEmail) || contract?.signatures?.[0];

  const handleSign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract?.id) {
      toast.error("No active contract found to sign.");
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
      const res = await signContractAction({
        contractId: contract.id,
        signerName: signerName.trim(),
        signerTitle,
      });

      if (res.success) {
        toast.success("Master Services Agreement executed successfully! Advancing to Kickoff Deposit.");
        router.push(`/startup/${startupId}?tab=deposit`);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to sign contract.");
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
            <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/25 bg-indigo-50 px-3.5 py-1 font-['Plus_Jakarta_Sans'] text-xs font-semibold text-indigo-800">
              <CheckCircle2 className="size-3.5" />
              Stage 03 — Master Services Agreement (Contract)
            </div>

            <h2 className="font-['Space_Grotesk'] text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
              {isSigned ? "Master Contract Executed & Confirmed" : "Review & Execute Engineering Contract"}
            </h2>

            <p className="max-w-2xl font-['Inter'] text-sm leading-relaxed text-neutral-600">
              Your Mutual NDA is archived. This Master Services Agreement formalizes our engineering collaboration,
              100% intellectual property assignment to your enterprise, professional warranties, and initial token deposit terms.
            </p>
          </div>

          <a
            href={`/api/startup/${startupId}/contract`}
            download
            className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-neutral-50 px-5 py-2.5 font-['Plus_Jakarta_Sans'] text-xs font-semibold text-neutral-800 shadow-2xs transition hover:bg-neutral-100 sm:self-start"
          >
            <Download className="size-3.5" />
            Download Contract
          </a>
        </div>
      </div>

      {/* 2. Embedded Contract Preview */}
      <div className="rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-xs sm:p-8">
        <div className="mb-4 flex items-center justify-between border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2 font-['Plus_Jakarta_Sans'] text-xs font-semibold uppercase tracking-wider text-neutral-500">
            <FileText className="size-4 text-neutral-400" />
            Master Services Agreement • Punjab Tech (UDYAM-PB-08-0062632)
          </div>
          <span className="font-['JetBrains_Mono'] text-xs text-neutral-400">Ref: MSA-2026-PT</span>
        </div>

        {/* Legal Text Container */}
        <div className="max-h-96 space-y-4 overflow-y-auto rounded-2xl border border-neutral-100 bg-[#F9FAFB] p-6 font-['JetBrains_Mono'] text-xs leading-relaxed text-neutral-700">
          <div className="text-center font-bold tracking-tight text-neutral-900">
            MASTER SERVICES AGREEMENT (CONTRACT)
          </div>

          <p className="text-[11px] text-neutral-500">
            This Master Services Agreement is executed by and between:
          </p>

          <div className="space-y-2 rounded-xl border border-neutral-200 bg-white p-4">
            <div>
              <strong>SERVICE PROVIDER:</strong> PUNJAB TECH (Registered Micro Enterprise: UDYAM-PB-08-0062632)<br />
              <span className="text-neutral-500">Proprietor: Akashdeep Singh • Qadian, Gurdaspur, Punjab 143516 • NIC: 62011</span>
            </div>
            <div className="border-t border-neutral-100 pt-2">
              <strong>CLIENT:</strong> {startupName.toUpperCase()}<br />
              <span className="text-neutral-500">Founder: {founderName} ({founderEmail})</span>
            </div>
          </div>

          <div>
            <div className="font-semibold text-neutral-900">1. SCOPE OF SERVICES &amp; SPRINT PHASES</div>
            <p className="mt-1 text-neutral-600">
              Punjab Tech provides bespoke full-stack development, database architecture, AI integration, and production hosting setup
              for {startupName}, executed in transparent, measurable milestone sprints.
            </p>
          </div>

          <div>
            <div className="font-semibold text-neutral-900">2. 100% INTELLECTUAL PROPERTY ASSIGNMENT</div>
            <p className="mt-1 text-neutral-600">
              All code, architecture diagrams, APIs, schema definitions, and assets authored specifically for {startupName} shall be
              100% the exclusive intellectual property of the Client. Punjab Tech warrants no proprietary lock-in.
            </p>
          </div>

          <div>
            <div className="font-semibold text-neutral-900">3. INITIAL TOKEN COMMITMENT</div>
            <p className="mt-1 text-neutral-600">
              A standard $100.00 USD kickoff deposit is remitted by Client via verified payment rail (PayPal or Direct Bank Wire)
              prior to sprint commencement to reserve dedicated engineering allocation.
            </p>
          </div>

          <div>
            <div className="font-semibold text-neutral-900">4. GOVERNING LAW &amp; JURISDICTION</div>
            <p className="mt-1 text-neutral-600">
              This Agreement is governed by the commercial laws of India, with jurisdiction in Gurdaspur / Batala (Punjab).
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
                  Master Contract Digitally Signed &amp; Legally Binding
                </h3>
                <p className="font-['Inter'] text-xs text-neutral-500">
                  Contract executed by both parties. Advancing to Kickoff Token Deposit.
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
                  {contract.fullySignedAt || mySignature?.signedAt
                    ? new Date(contract.fullySignedAt || mySignature!.signedAt!).toLocaleDateString("en-US", {
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

            <div className="flex flex-col gap-3 pt-3 sm:flex-row sm:items-center sm:justify-between border-t border-emerald-200/60">
              <span className="font-['Inter'] text-xs font-medium text-emerald-900">
                Stage 03 Completed: Master Contract executed &amp; IP assigned. Next: $100 Kickoff Deposit.
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={`/api/startup/${startupId}/contract`}
                  download
                  className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-4 py-2 font-['Plus_Jakarta_Sans'] text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                >
                  <Download className="size-3.5" />
                  Download Copy
                </a>
                <Link
                  href={`/startup/${startupId}?tab=deposit`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-5 py-2.5 font-['Plus_Jakarta_Sans'] text-xs font-semibold text-white shadow-xs transition hover:bg-neutral-800"
                >
                  <span>Proceed to Stage 04: Token Deposit ($100)</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSign} className="space-y-4">
            <h3 className="font-['Space_Grotesk'] text-base font-semibold text-neutral-900">
              Digital Signature Execution
            </h3>
            <p className="font-['Inter'] text-xs text-neutral-500">
              Type your legal name to execute the Master Services Agreement for {startupName}.
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
                I confirm that I have reviewed the terms of this Master Services Agreement and that I possess legal
                authority to execute this contract on behalf of <strong>{startupName}</strong>.
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
                    Executing Contract...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="size-4" />
                    Sign &amp; Execute Master Contract
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
