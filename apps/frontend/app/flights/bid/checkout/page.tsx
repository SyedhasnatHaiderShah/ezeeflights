"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createBidDepositOrder, verifyBidDeposit } from "@/lib/api/bid-deals";
import { useCurrencyStore } from "@/lib/store/currency-store";
import { useTranslation } from "react-i18next";

function CheckoutForm() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { baseCurrency } = useCurrencyStore();
  const dealId = searchParams.get("dealId");
  const dDate = searchParams.get("dDate");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [passenger, setPassenger] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    // Dynamically load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealId) {
      setError(t("Deal ID is missing."));
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1. Create Order on Backend
      const orderData = await createBidDepositOrder({
        dealId,
        departureDate: dDate || new Date().toISOString().split("T")[0],
        currency: baseCurrency,
        passengers: [passenger],
      });

      if (!orderData || !orderData.razorpayOrderId) {
        throw new Error("Failed to initialize payment order.");
      }

      // 2. Open Razorpay Checkout
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "EzeeFlights Deals",
        description: "Bid Deal Deposit",
        order_id: orderData.razorpayOrderId,
        handler: async function (response: any) {
          try {
            // 3. Verify Payment
            await verifyBidDeposit({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature:
                response.razorpay_signature || "mock_signature",
            });
            setSuccess(true);
            // Optionally redirect after a few seconds
            setTimeout(() => {
              router.push("/my-trips" as any);
            }, 3000);
          } catch (err: any) {
            setError(err.message || "Payment verification failed.");
          }
        },
        prefill: {
          name: `${passenger.firstName} ${passenger.lastName}`,
          email: passenger.email,
          contact: passenger.phone,
        },
        theme: {
          color: "#ff4b2b",
        },
      };

      const rzp = (window as any).Razorpay
        ? new (window as any).Razorpay(options)
        : null;

      if (orderData.razorpayOrderId.startsWith("order_mock_")) {
        // PAYMENT SIMULATOR
        const confirmPayment = window.confirm(
          "PAYMENT SIMULATOR\n\nReal Razorpay is blocked (406 error). \nSimulate a SUCCESSFUL payment?"
        );
        if (confirmPayment) {
          options.handler({
            razorpay_order_id: orderData.razorpayOrderId,
            razorpay_payment_id: "pay_mock_" + Math.random().toString(36).substring(7),
            razorpay_signature: "mock_signature_valid"
          });
        } else {
          setLoading(false);
          setError("Payment cancelled (Simulator)");
        }
        return;
      }

      if (rzp) {
        rzp.on("payment.failed", function (response: any) {
          setError(response.error.description || "Payment failed.");
        });
        rzp.open();
      } else {
        throw new Error(t("Razorpay SDK not loaded."));
      }
    } catch (err: any) {
      setError(err.message || t("Something went wrong during checkout."));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card max-w-md w-full p-8 rounded-3xl shadow-xl text-center space-y-4 border border-border"
        >
          <div className="mx-auto w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-foreground">
            {t("Deposit Secured!")}
          </h2>
          <p className="text-muted-foreground">
            {t("We've received your request and deposit. Our team will now work to secure your discounted ticket within the next 24 hours.")}
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            {t("Redirecting to your trips...")}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> {t("Back to Results")}
        </button>

        <div className="bg-card rounded-3xl shadow-sm border border-border overflow-hidden">
          <div className="bg-redmix/5 p-6 border-b border-border/50">
            <h1 className="text-2xl font-black text-foreground">
              {t("Secure Bid Deal")}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t("Complete your deposit to lock in this request.")}
            </p>
          </div>

          <div className="p-6 md:p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleCheckout} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-bold">{t("Passenger Details")}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("First Name")}</Label>
                    <Input
                      required
                      value={passenger.firstName}
                      onChange={(e) =>
                        setPassenger({
                          ...passenger,
                          firstName: e.target.value,
                        })
                      }
                      placeholder={t("John")}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("Last Name")}</Label>
                    <Input
                      required
                      value={passenger.lastName}
                      onChange={(e) =>
                        setPassenger({ ...passenger, lastName: e.target.value })
                      }
                      placeholder={t("Doe")}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("Email Address")}</Label>
                    <Input
                      required
                      type="email"
                      value={passenger.email}
                      onChange={(e) =>
                        setPassenger({ ...passenger, email: e.target.value })
                      }
                      placeholder="john@example.com"
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("Phone Number")}</Label>
                    <Input
                      required
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={passenger.phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setPassenger({ ...passenger, phone: val });
                      }}
                      placeholder={t("Enter phone number")}
                      className="rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-muted/50 rounded-2xl p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-500 mt-0.5" />
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t("By proceeding, you agree to pay a fully refundable deposit. If we cannot secure your ticket at the requested price within 24 hours, this deposit will be automatically refunded to your original payment method.")}
                  </p>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 rounded-xl text-lg font-bold bg-redmix hover:bg-redmix/90 text-white shadow-lg"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  t("Proceed to Payment")
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BidDealCheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-muted/30 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-redmix" />
        </div>
      }
    >
      <CheckoutForm />
    </Suspense>
  );
}
