"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Building,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  Loader2,
  ArrowRight,
  ExternalLink,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { recordPayPalPaymentAction, recordBankWirePaymentAction } from "@/app/startup/actions";

export type PaymentRecord = {
  id: string;
  amountCents: number;
  currency: string;
  status: string;
  paymentMethod: string | null;
  referenceNumber: string | null;
  paidAt: Date | string | null;
} | null;

export function DepositPaymentView({
  startupId,
  startupName,
  founderName,
  founderEmail,
  payment,
  paypalClientId,
}: {
  startupId: string;
  startupName: string;
  founderName: string;
  founderEmail: string;
  payment: PaymentRecord;
  paypalClientId: string;
}) {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<"paypal" | "bank_wire">("paypal");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Bank wire form state
  const [utrNumber, setUtrNumber] = useState("");
  const [senderAccountName, setSenderAccountName] = useState(founderName || "");
  const [isSubmittingWire, setIsSubmittingWire] = useState(false);

  const isPaid = payment?.status === "completed";
  const isWirePending = payment?.status === "pending" && payment?.paymentMethod === "bank_wire";

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`${fieldName} copied to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleWireSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrNumber.trim()) {
      toast.error("Please enter the Bank UTR / Reference Transaction Number.");
      return;
    }

    setIsSubmittingWire(true);
    try {
      const res = await recordBankWirePaymentAction({
        startupId,
        referenceNumber: utrNumber.trim(),
        senderName: senderAccountName,
        amountCents: 10000,
      });

      if (res.success) {
        toast.success("Bank Wire reference recorded! Advancing to Founder Dashboard.");
        router.push("/dashboard");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to record payment reference.");
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmittingWire(false);
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
              Stage 04 — Engineering Kickoff Deposit
            </div>

            <h2 className="font-['Space_Grotesk'] text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
              {isPaid
                ? "Token Deposit Confirmed • Sprints Unlocked"
                : "Initial Token Kickoff Commitment ($100 USD)"}
            </h2>

            <p className="max-w-2xl font-['Inter'] text-sm leading-relaxed text-neutral-600">
              Both the Mutual NDA and Master Services Agreement have been executed. Remit the $100.00 USD engineering deposit
              via PayPal Checkout or Direct Bank Wire to unlock your live startup cockpit and begin Phase 1 sprint execution.
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-[#F9FAFB] p-4 text-center sm:self-start">
            <div className="font-['Plus_Jakarta_Sans'] text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              Kickoff Deposit
            </div>
            <div className="font-['Space_Grotesk'] text-2xl font-bold tabular-nums text-neutral-900">
              $100.00 <span className="text-xs font-normal text-neutral-400">USD</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Paid / Verified State */}
      {isPaid ? (
        <div className="rounded-3xl border border-emerald-500/30 bg-white p-8 shadow-xs">
          <div className="flex items-center gap-3 text-emerald-700">
            <ShieldCheck className="size-7" />
            <div>
              <h3 className="font-['Space_Grotesk'] text-lg font-bold text-neutral-900">
                Payment Confirmed &amp; Engineering Allocated
              </h3>
              <p className="font-['Inter'] text-xs text-neutral-500">
                Verified deposit of $100.00 USD. Your private repository and sprint cockpit are live.
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-50/40 p-5 text-xs sm:grid-cols-3">
            <div>
              <span className="font-['Plus_Jakarta_Sans'] text-neutral-500">Payment Rail:</span>
              <div className="font-['Space_Grotesk'] font-semibold text-neutral-900 uppercase">
                {payment?.paymentMethod || "PayPal / Verified"}
              </div>
            </div>
            <div>
              <span className="font-['Plus_Jakarta_Sans'] text-neutral-500">Reference / Order ID:</span>
              <div className="font-['JetBrains_Mono'] font-medium text-neutral-900 truncate">
                {payment?.referenceNumber || "Captured"}
              </div>
            </div>
            <div>
              <span className="font-['Plus_Jakarta_Sans'] text-neutral-500">Receipt Timestamp:</span>
              <div className="font-['JetBrains_Mono'] tabular-nums text-neutral-900">
                {payment?.paidAt
                  ? new Date(payment.paidAt).toLocaleDateString("en-US", {
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

          <div className="mt-6 flex items-center justify-end">
            <button
              onClick={() => router.push("/dashboard")}
              className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-7 py-3.5 font-['Plus_Jakarta_Sans'] text-sm font-semibold text-white shadow-xs transition hover:bg-neutral-800"
            >
              Enter Founder Dashboard
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      ) : isWirePending ? (
        /* Wire Submitted & Awaiting Verification */
        <div className="rounded-3xl border border-amber-500/30 bg-white p-8 shadow-xs">
          <div className="flex items-center gap-3 text-amber-700">
            <CheckCircle2 className="size-6" />
            <div>
              <h3 className="font-['Space_Grotesk'] text-base font-bold text-neutral-900">
                Bank Wire Reference Submitted &amp; Pending Verification
              </h3>
              <p className="font-['Inter'] text-xs text-neutral-500">
                UTR / Reference: <span className="font-['JetBrains_Mono'] font-semibold text-neutral-800">{payment.referenceNumber}</span>
              </p>
            </div>
          </div>

          <p className="mt-4 font-['Inter'] text-xs leading-relaxed text-neutral-600">
            Our finance team is reconciling your bank wire. Once verified, your sprint dashboard unlocks automatically.
            You can refresh below to check verification status.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-neutral-100 pt-4">
            <button
              onClick={() => router.refresh()}
              className="rounded-full border border-neutral-300 px-5 py-2 font-['Plus_Jakarta_Sans'] text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
            >
              Refresh Verification Status
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-5 py-2 font-['Plus_Jakarta_Sans'] text-xs font-semibold text-white hover:bg-neutral-800"
            >
              <span>Go to Founder Dashboard</span>
              <ArrowRight className="size-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* Payment Selection: PayPal vs Bank Wire */
        <div className="rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-xs sm:p-8">
          {/* M3 Expressive Segmented Tabs */}
          <div className="mb-6 flex items-center gap-2 rounded-2xl bg-neutral-100 p-1.5">
            <button
              type="button"
              onClick={() => setSelectedMethod("paypal")}
              className={`flex-1 rounded-xl py-2.5 font-['Plus_Jakarta_Sans'] text-xs font-semibold transition ${
                selectedMethod === "paypal"
                  ? "bg-white text-neutral-900 shadow-2xs"
                  : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              PayPal Instant Checkout
            </button>

            <button
              type="button"
              onClick={() => setSelectedMethod("bank_wire")}
              className={`flex-1 rounded-xl py-2.5 font-['Plus_Jakarta_Sans'] text-xs font-semibold transition ${
                selectedMethod === "bank_wire"
                  ? "bg-white text-neutral-900 shadow-2xs"
                  : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              Direct Bank Wire (SBI Account)
            </button>
          </div>

          {/* METHOD A: PAYPAL CHECKOUT */}
          {selectedMethod === "paypal" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-neutral-200 bg-[#F9FAFB] p-5">
                <div className="flex items-center justify-between font-['Plus_Jakarta_Sans'] text-xs">
                  <span className="font-semibold text-neutral-800">PayPal Express Checkout</span>
                  <span className="font-['JetBrains_Mono'] text-neutral-500">Amount: $100.00 USD</span>
                </div>
                <p className="mt-1 font-['Inter'] text-xs text-neutral-500">
                  Secure checkout via PayPal. Pay using your PayPal account balance, connected cards, or credit card.
                </p>
              </div>

              <div className="mx-auto max-w-md pt-2">
                <PayPalScriptProvider options={{ clientId: paypalClientId, currency: "USD" }}>
                  <PayPalButtons
                    style={{ layout: "vertical", shape: "pill", color: "gold" }}
                    createOrder={(data, actions) => {
                      return actions.order.create({
                        intent: "CAPTURE",
                        purchase_units: [
                          {
                            description: `Kickoff Token Deposit for ${startupName}`,
                            amount: {
                              currency_code: "USD",
                              value: "100.00",
                            },
                          },
                        ],
                      });
                    }}
                    onApprove={async (data, actions) => {
                      if (!actions.order) return;
                      const order = await actions.order.capture();
                      const res = await recordPayPalPaymentAction({
                        startupId,
                        orderId: order.id || data.orderID,
                        amountCents: 10000,
                      });

                      if (res.success) {
                        toast.success("PayPal payment confirmed! Advancing to Founder Dashboard.");
                        router.push("/dashboard");
                        router.refresh();
                      } else {
                        toast.error(res.error || "Failed to record payment in database.");
                      }
                    }}
                    onError={(err) => {
                      console.error("PayPal checkout error:", err);
                      toast.error("PayPal transaction failed or was cancelled.");
                    }}
                  />
                </PayPalScriptProvider>
              </div>
            </div>
          )}

          {/* METHOD B: SBI DIRECT BANK WIRE */}
          {selectedMethod === "bank_wire" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-neutral-200 bg-[#F9FAFB] p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-200/60 pb-3">
                  <div className="flex items-center gap-2 font-['Space_Grotesk'] text-sm font-bold text-neutral-900">
                    <Building className="size-4 text-orange-600" />
                    Official State Bank of India (SBI) Credentials
                  </div>
                  <span className="font-['Plus_Jakarta_Sans'] text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-0.5 rounded-full border border-emerald-200">
                    Verified Enterprise
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 font-['Inter'] text-xs sm:grid-cols-2">
                  <div className="rounded-xl border border-neutral-200 bg-white p-3.5">
                    <span className="font-['Plus_Jakarta_Sans'] text-[11px] text-neutral-400 uppercase tracking-wider">
                      Enterprise &amp; Beneficiary
                    </span>
                    <div className="mt-1 font-['Space_Grotesk'] font-bold text-neutral-900">
                      Akashdeep Singh / PUNJAB TECH
                    </div>
                    <div className="mt-0.5 text-[11px] text-neutral-400">
                      Udyam Registration: UDYAM-PB-08-0062632
                    </div>
                  </div>

                  <div className="rounded-xl border border-neutral-200 bg-white p-3.5 flex items-center justify-between">
                    <div>
                      <span className="font-['Plus_Jakarta_Sans'] text-[11px] text-neutral-400 uppercase tracking-wider">
                        Bank &amp; Branch
                      </span>
                      <div className="mt-1 font-['Space_Grotesk'] font-bold text-neutral-900">
                        State Bank of India (SBI)
                      </div>
                      <div className="mt-0.5 text-[11px] text-neutral-400">
                        Branch: Qadian, Punjab
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-neutral-200 bg-white p-3.5 flex items-center justify-between">
                    <div>
                      <span className="font-['Plus_Jakarta_Sans'] text-[11px] text-neutral-400 uppercase tracking-wider">
                        Account Number
                      </span>
                      <div className="mt-1 font-['JetBrains_Mono'] text-sm font-bold tabular-nums text-neutral-900">
                        32314713340
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy("32314713340", "Account Number")}
                      className="rounded-lg border border-neutral-200 p-2 text-neutral-600 hover:bg-neutral-50"
                      title="Copy Account Number"
                    >
                      {copiedField === "Account Number" ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
                    </button>
                  </div>

                  <div className="rounded-xl border border-neutral-200 bg-white p-3.5 flex items-center justify-between">
                    <div>
                      <span className="font-['Plus_Jakarta_Sans'] text-[11px] text-neutral-400 uppercase tracking-wider">
                        IFSC Code
                      </span>
                      <div className="mt-1 font-['JetBrains_Mono'] text-sm font-bold tabular-nums text-neutral-900">
                        SBIN0001571
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy("SBIN0001571", "IFSC Code")}
                      className="rounded-lg border border-neutral-200 p-2 text-neutral-600 hover:bg-neutral-50"
                      title="Copy IFSC Code"
                    >
                      {copiedField === "IFSC Code" ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-neutral-500 font-['Inter']">
                  * Official Registered Address: Village Dalla, Qadian, Gurdaspur, Punjab 143516 • Mobile: +91 7814002784
                </div>
              </div>

              {/* UTR Submission Form */}
              <form onSubmit={handleWireSubmit} className="space-y-4">
                <h4 className="font-['Space_Grotesk'] text-sm font-bold text-neutral-900">
                  Submit Wire Reference for Instant Verification
                </h4>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="font-['Plus_Jakarta_Sans'] text-xs font-semibold text-neutral-700">
                      Bank Reference Number / UTR / IMPS ID
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. UTR384910284719"
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value)}
                      className="w-full rounded-2xl border border-neutral-200 bg-neutral-50/50 px-4 py-3 font-['JetBrains_Mono'] text-sm outline-none focus:border-neutral-900 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-['Plus_Jakarta_Sans'] text-xs font-semibold text-neutral-700">
                      Remitter Account Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Akashdeep Singh"
                      value={senderAccountName}
                      onChange={(e) => setSenderAccountName(e.target.value)}
                      className="w-full rounded-2xl border border-neutral-200 bg-neutral-50/50 px-4 py-3 font-['Inter'] text-sm outline-none focus:border-neutral-900 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSubmittingWire}
                    className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-7 py-3.5 font-['Plus_Jakarta_Sans'] text-sm font-semibold text-white shadow-xs transition hover:bg-neutral-800 disabled:opacity-50"
                  >
                    {isSubmittingWire ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Verifying Wire...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="size-4" />
                        Submit Wire Reference ($100 USD)
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
