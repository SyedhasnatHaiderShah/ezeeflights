"use client";
import { Suspense } from "react";
import { useTranslation } from "react-i18next";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BNPLSelector } from "@/components/payment/BNPLSelector";
import { CheckoutSummary } from "@/components/payment/CheckoutSummary";
import { PaymentMethods } from "@/components/payment/PaymentMethods";
import { StripeCheckout } from "@/components/payment/StripeCheckout";
import { PaymentProvider } from "@/components/payment/types";
import { apiFetch } from "@/lib/api/client";
import { initiatePayment } from "@/lib/api/payments";
import { getActiveCampaigns, validatePromotion } from "@/lib/api/promotions";
import { useSearchParams } from "next/navigation";
import { getActiveHostname } from "@/lib/utils/domain";

function useDebouncedValue<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

function currencySymbol(currency: string) {
  const code = currency.toUpperCase();
  if (code === "AED") return "AED ";
  if (code === "EUR") return "€";
  if (code === "GBP") return "£";
  if (code === "CAD") return "C$";
  if (code === "TRY") return "₺";
  if (code === "INR") return "₹";
  return "$";
}

function formatCountdown(ms: number) {
  if (ms <= 0) return "00:00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(
    2,
    "0",
  );
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

function CheckoutPageContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const partnerCode = searchParams.get("partnerCode") ?? undefined;

  const [provider, setProvider] = useState<PaymentProvider>("STRIPE");
  const [loading, setLoading] = useState(false);
  const [useWallet, setUseWallet] = useState(false);
  const [promoCode, setPromoCode] = useState(
    searchParams.get("promo") ?? searchParams.get("code") ?? "",
  );
  const debouncedPromoCode = useDebouncedValue(
    promoCode.trim().toUpperCase(),
    450,
  );
  const [flashCountdown, setFlashCountdown] = useState("");

  const walletQuery = useQuery<{ balance: number }>({
    queryKey: ["wallet-balance"],
    queryFn: () => apiFetch("/payments/wallet/me"),
  });

  const bookingQuery = useQuery<{
    totalAmount: number;
    totalPrice?: number;
    currency: string;
  }>({
    queryKey: ["booking", bookingId],
    queryFn: () => apiFetch(`/bookings/me/${bookingId}`),
    enabled: Boolean(bookingId),
  });

  const promoQuery = useQuery({
    queryKey: ["promo-validation", bookingId, debouncedPromoCode, partnerCode],
    queryFn: () =>
      validatePromotion({
        bookingId: String(bookingId),
        code: debouncedPromoCode || undefined,
        partnerCode,
      }),
    enabled: Boolean(bookingId),
    staleTime: 0,
  });

  const campaignsQuery = useQuery({
    queryKey: ["active-campaigns"],
    queryFn: getActiveCampaigns,
  });

  const total =
    bookingQuery.data?.totalPrice ?? bookingQuery.data?.totalAmount ?? 0;
  const currency = bookingQuery.data?.currency ?? "AED";
  const walletBalance = walletQuery.data?.balance ?? 0;
  const discountAmount = promoQuery.data?.totalDiscount ?? 0;
  const discountedSubtotal = Math.max(0, total - discountAmount);
  const walletApplied = useWallet
    ? Math.min(discountedSubtotal, walletBalance)
    : 0;
  const payableAmount = Math.max(0, discountedSubtotal - walletApplied);
  const discountLabel = promoQuery.data?.appliedDiscounts?.length
    ? promoQuery.data.appliedDiscounts.map((item) => item.title).join(" • ")
    : undefined;

  useEffect(() => {
    const endsAt = promoQuery.data?.flashSaleEndsAt;
    if (!endsAt) {
      setFlashCountdown("");
      return;
    }

    const update = () =>
      setFlashCountdown(
        formatCountdown(new Date(endsAt).getTime() - Date.now()),
      );
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [promoQuery.data?.flashSaleEndsAt]);

  const activeCampaigns =
    campaignsQuery.data ?? promoQuery.data?.recommendations ?? [];

  const startPayment = async () => {
    if (!bookingId) return;
    console.log(`[Checkout Payment] Amount: ${payableAmount}, Currency: ${currency}`);

    if (payableAmount <= 0) {
      window.location.href = "/payment/success";
      return;
    }

    setLoading(true);
    try {
      const data = (await initiatePayment({
        bookingId: String(bookingId),
        provider,
        amount: payableAmount,
        currency,
        useWalletAmount: walletApplied,
        paymentMethodId: "pm_card_visa",
        successUrl: `${window.location.origin}/payment/success`,
        failureUrl: `${window.location.origin}/payment/failed`,
        metadata: {
          promoCode: promoQuery.data?.promoCode ?? null,
          promoStatus: promoQuery.data?.promoStatus ?? "NOT_PROVIDED",
          discountAmount,
          appliedPromotions:
            promoQuery.data?.appliedDiscounts?.map((item) => item.code) ?? [],
          partnerCode: partnerCode ?? null,
          test_host: typeof window !== "undefined" ? getActiveHostname() : null,
        },
      })) as {
        redirectUrl?: string;
        requiresAction?: boolean;
        paymentId: string;
      };

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        window.location.href = `/payment/complete?payment_id=${data.paymentId}`;
      }
    } catch (_error) {
      window.location.href = "/payment/failed";
    } finally {
      setLoading(false);
    }
  };

  const validationTone =
    promoQuery.data?.promoStatus === "VALID"
      ? "text-emerald-700 bg-emerald-50 border-emerald-200"
      : promoQuery.data?.promoStatus === "NOT_ELIGIBLE"
        ? "text-amber-700 bg-amber-50 border-amber-200"
        : promoQuery.data?.promoStatus === "INVALID"
          ? "text-rose-700 bg-rose-50 border-rose-200"
          : "text-slate-600 bg-slate-50 border-slate-200";

  return (
    <main className="mx-auto grid max-w-7xl gap-4 p-6 lg:grid-cols-[5fr_3fr_2fr]">
      <section className="space-y-4 rounded-2xl border p-5">
        <div>
          <h1 className="text-2xl font-semibold">{t("Payment Methods")}</h1>
          <p className="text-sm text-slate-500">
            {t("Cards, wallets, BNPL, and discount-aware checkout.")}
          </p>
        </div>

        <PaymentMethods value={provider} onChange={setProvider} />

        <div className="rounded-xl border p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-medium">{t("Promo code")}</p>
            <span
              className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${validationTone}`}
            >
              {promoQuery.isFetching
                ? t("Validating…")
                : (promoQuery.data?.promoStatus ? t(promoQuery.data.promoStatus) : t("Waiting"))}
            </span>
          </div>
          <input
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            placeholder={t("Enter promo code")}
            className="w-full rounded-xl border px-3 py-2 text-sm uppercase tracking-wide"
          />
          <p className="mt-2 text-xs text-slate-500">
            {promoQuery.data?.promoMessage ??
              t("Discounts update in real time as you type.")}
          </p>
          {flashCountdown ? (
            <p className="mt-2 inline-flex rounded-full bg-brand-red/10 px-3 py-1 text-xs font-semibold text-brand-red">
              {t("Flash sale ends in")} {flashCountdown}
            </p>
          ) : null}
          {activeCampaigns.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {activeCampaigns.map((campaign) => (
                <span
                  key={campaign.code}
                  className="rounded-full border bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600"
                >
                  {campaign.title}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="rounded-xl border p-3">
          <p className="mb-2 text-sm font-medium">
            {t("Credit / Debit Card (Stripe)")}
          </p>
          <StripeCheckout onPay={startPayment} loading={loading} />
        </div>

        <div className="rounded-xl border p-3">
          <p className="mb-2 text-sm font-medium">{t("PayPal")}</p>
          <button className="rounded bg-[#0070ba] px-4 py-2 text-white">
            {t("Pay with PayPal")}
          </button>
        </div>

        <div className="rounded-xl border p-3">
          <p className="mb-2 text-sm font-medium">{t("Wallet Balance")}</p>
          <CheckoutSummary
            subtotal={total}
            currency={currency}
            discountAmount={discountAmount}
            discountLabel={discountLabel}
            walletBalance={walletBalance}
            useWallet={useWallet}
            onToggleWallet={setUseWallet}
          />
        </div>

        <BNPLSelector provider={provider} />
      </section>

      <section className="space-y-4 rounded-2xl border p-5">
        <h2 className="text-xl font-bold">{t("Order Summary")}</h2>
        <div className="rounded-xl border p-3 text-sm">
          <p>{t("Flight + Hotel")}</p>
          <p className="text-slate-500">{t("Booking #")}{bookingId || "N/A"}</p>
        </div>

        <div className="space-y-2 text-sm">
          <p className="flex justify-between">
            <span>{t("Subtotal")}</span>
            <span>
              {currency} {total.toFixed(2)}
            </span>
          </p>
          <p className="flex justify-between">
            <span>{t("Promo discount")}</span>
            <span>
              - {currency} {discountAmount.toFixed(2)}
            </span>
          </p>
          <p className="flex justify-between">
            <span>{t("Wallet")}</span>
            <span>
              - {currency} {walletApplied.toFixed(2)}
            </span>
          </p>
          <p className="flex justify-between font-bold">
            <span>{t("Total")}</span>
            <span>
              {currency} {payableAmount.toFixed(2)}
            </span>
          </p>
        </div>

        <div className="rounded-xl border bg-slate-50 p-3 text-xs text-slate-600">
          <p className="font-semibold text-slate-800">{t("Automatic discounts")}</p>
          <ul className="mt-2 space-y-1">
            {promoQuery.data?.appliedDiscounts?.length ? (
              promoQuery.data.appliedDiscounts.map((item) => (
                <li key={item.code}>
                  {item.title} — {currencySymbol(currency)}
                  {item.amount.toFixed(2)}
                </li>
              ))
            ) : (
              <li>{t("No automatic discounts applied yet.")}</li>
            )}
          </ul>
        </div>
      </section>

      <aside className="space-y-3 rounded-2xl border p-5 text-sm">
        <p>{t("🔒 Secure checkout")}</p>
        <p>{t("256-bit SSL encryption")}</p>
        <p>{t("Money-back guarantee")}</p>
        <p>{t("Support: support@ezeeflights.com")}</p>
      </aside>
    </main>
  );
}

// Suspense-wrapped
export default function CheckoutPage(props: any) {
  return (
    <Suspense fallback={null}>
      <CheckoutPageContent {...props} />
    </Suspense>
  );
}
