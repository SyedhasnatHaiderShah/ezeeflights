import { apiFetch } from "@/lib/api/client";
import { useCurrencyStore } from "@/lib/store/currency-store";
import { t } from "i18next";
import type { RazorpayLoadStage } from "@/components/shared/razorpay-loader";
import { isNative } from "@/lib/capacitor/platform";

export interface AdvancePaymentOrderResponse {
  paymentId?: string;
  key: string;
  amount: number;
  currency: string;
  razorpayOrderId: string;
}

export const createAdvancePaymentOrder = (data: {
  amount: number;
  currency: string;
  paymentType?: "refund_shield" | "affirm" | "advance";
  metadata?: Record<string, unknown>;
}) =>
  apiFetch<AdvancePaymentOrderResponse>(
    "/flights/booking/payment/create-order",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );

export const verifyAdvancePayment = (data: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) =>
  apiFetch<{ success: boolean }>("/flights/booking/payment/verify", {
    method: "POST",
    body: JSON.stringify(data),
  });

/** Records a completed Razorpay card payment to tbl_affirmpayment in the CRM MySQL DB. */
export const recordRazorpayPayment = (data: {
  bookingRef: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  amount: number;
  currency?: string;
  email?: string;
  phone?: string;
}) =>
  apiFetch<{ success: boolean }>("/payments/affirm/record-razorpay-payment", {
    method: "POST",
    body: JSON.stringify(data),
  }).catch((err) => {
    // Non-fatal — booking is already confirmed; just log the failure
    console.warn(
      "[recordRazorpayPayment] Failed to save to tbl_affirmpayment:",
      err,
    );
    return { success: false };
  });

export interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface OpenRazorpayCheckoutParams {
  orderData: {
    key: string;
    amount: number;
    currency: string;
    razorpayOrderId: string;
  };
  description: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  onSuccess: (response: RazorpaySuccessResponse) => void | Promise<void>;
  onError: (message: string) => void;
  onDismiss?: () => void;
  onOpen?: () => void;
  /** Called at each SDK lifecycle stage so the UI can show stage-specific animation. */
  onStageChange?: (stage: RazorpayLoadStage) => void;
  openSimulator: (onConfirm: () => void) => void;
}

export function openRazorpayCheckout(params: OpenRazorpayCheckoutParams) {
  const {
    orderData,
    description,
    prefill,
    onSuccess,
    onError,
    onDismiss,
    onOpen,
    onStageChange,
    openSimulator,
  } = params;

  const stage = (s: RazorpayLoadStage) => onStageChange?.(s);

  const logPrefix = `[RazorpayCheckout][${orderData.razorpayOrderId}]`;
  console.log(`${logPrefix} openRazorpayCheckout called`, {
    orderId: orderData.razorpayOrderId,
    currency: orderData.currency,
    amount: orderData.amount,
    hasKey: !!orderData.key,
    userAgent: navigator.userAgent,
  });

  // NOTE: We intentionally do NOT set config.display with UPI-only blocks.
  // The previous config forced show_default_blocks:false + UPI instruments,
  // Check if we are on a mobile device or running native app
  const isMobileOrNative =
    typeof window !== "undefined" &&
    (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    ) ||
      isNative());

  // NOTE: We restrict payment options to Card only on desktop.
  // On mobile/native, we omit custom config display blocks to prevent Razorpay SDK white screen crash.
  const options: any = {
    key: orderData.key,
    amount: orderData.amount,
    currency: orderData.currency,
    name: "EzeeFlights",
    description,
    order_id: orderData.razorpayOrderId,
    handler: async function (response: RazorpaySuccessResponse) {
      console.log(`${logPrefix} onSuccess handler called`, {
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        signatureLength: response.razorpay_signature?.length,
      });
      try {
        await onSuccess(response);
      } catch (err: any) {
        console.error(`${logPrefix} onSuccess callback threw:`, err);
        onError(err.message || t("Payment verification failed."));
      }
    },
    modal: {
      ondismiss: function () {
        console.log(`${logPrefix} modal dismissed by user`);
        if (onDismiss) {
          onDismiss();
        }
      },
    },
    prefill,
    theme: { color: "#0d2353" },
  };

  if (!isMobileOrNative) {
    options.config = {
      display: {
        blocks: {
          card: {
            name: t("Pay with Card"),
            instruments: [
              {
                method: "card",
              },
            ],
          },
        },
        sequence: ["block.card"],
        preferences: {
          show_default_blocks: false,
        },
      },
    };
  }

  if (orderData.razorpayOrderId.startsWith("order_mock_")) {
    console.log(
      `${logPrefix} Mock order detected — launching payment simulator`,
    );
    stage("opening");
    openSimulator(() => {
      void options.handler({
        razorpay_order_id: orderData.razorpayOrderId,
        razorpay_payment_id:
          "pay_mock_" + Math.random().toString(36).substring(7),
        razorpay_signature: "mock_signature_valid",
      });
    });
    return;
  }

  // Timeout guard: if Razorpay silently fails to open the modal within 45 s
  // (common for geo-restricted regions like Pakistan), surface a real error
  // instead of leaving the button in an infinite "Processing…" state.
  // Timeout guard: if Razorpay silently fails to open the modal within 45 s
  // (common for geo-restricted regions like Pakistan), surface a real error
  // instead of leaving the button in an infinite "Processing…" state.
  let checkoutResolved = false;
  let checkIframeInterval: any;

  const timeoutId = setTimeout(() => {
    if (!checkoutResolved) {
      checkoutResolved = true;
      if (checkIframeInterval) clearInterval(checkIframeInterval);
      stage("idle");
      console.error(
        `${logPrefix} TIMEOUT — Razorpay modal did not open within 45 s. ` +
          `This usually means the checkout.js SDK is geo-restricted or the ` +
          `Razorpay account does not support international payments. ` +
          `Check: 1) Razorpay dashboard → Settings → International Payments, ` +
          `2) No UPI-only config.display is forcing an Indian-only modal.`,
      );
      onError(
        t(
          "Payment gateway timed out. If you are outside India, please contact support or try a different payment method.",
        ),
      );
    }
  }, 45_000);

  const openRzp = () => {
    console.log(`${logPrefix} Razorpay SDK available — calling rzp.open()`);
    stage("securing");
    // brief pause so user sees the "Securing" stage before the modal pops
    setTimeout(() => {
      stage("opening");
      if (onOpen) {
        onOpen();
      }

      // Check for Razorpay iframe in the DOM to clear the timeout safely
      checkIframeInterval = setInterval(() => {
        const iframe = document.querySelector("iframe.razorpay-checkout-frame");
        if (iframe) {
          console.log(
            `${logPrefix} Razorpay iframe detected in DOM — clearing timeout guard`,
          );
          checkoutResolved = true;
          clearTimeout(timeoutId);
          clearInterval(checkIframeInterval);
        }
      }, 500);

      if ((window as any).Razorpay) {
        try {
          const rzp = new (window as any).Razorpay(options);
          rzp.on("payment.failed", (response: any) => {
            checkoutResolved = true;
            clearTimeout(timeoutId);
            if (checkIframeInterval) clearInterval(checkIframeInterval);
            console.error(
              `${logPrefix} payment.failed event from Razorpay SDK:`,
              response?.error,
            );
            onError(
              response?.error?.description ||
                response?.error?.reason ||
                t("Payment failed. Please try again."),
            );
          });
          rzp.open();
          console.log(`${logPrefix} rzp.open() called successfully`);
        } catch (sdkErr: any) {
          checkoutResolved = true;
          clearTimeout(timeoutId);
          if (checkIframeInterval) clearInterval(checkIframeInterval);
          console.error(`${logPrefix} rzp.open() threw an exception:`, sdkErr);
          stage("idle");
          onError(
            t("Razorpay failed to open: {{error}}", {
              error: sdkErr?.message || String(sdkErr),
            }),
          );
        }
      } else {
        checkoutResolved = true;
        clearTimeout(timeoutId);
        if (checkIframeInterval) clearInterval(checkIframeInterval);
        console.error(`${logPrefix} window.Razorpay not found after SDK load`);
        stage("idle");
        onError(t("Razorpay SDK not loaded after injection."));
      }
    }, 500); // end setTimeout for "securing" → "opening" transition
  };

  // Restricting payment options to Card only in options:
  options.handler = (function (originalHandler) {
    return async function (response: RazorpaySuccessResponse) {
      if (checkIframeInterval) clearInterval(checkIframeInterval);
      return originalHandler(response);
    };
  })(options.handler);

  options.modal.ondismiss = (function (originalDismiss) {
    return function () {
      if (checkIframeInterval) clearInterval(checkIframeInterval);
      if (originalDismiss) originalDismiss();
    };
  })(options.modal.ondismiss);

  if ((window as any).Razorpay) {
    console.log(`${logPrefix} Razorpay already on window — opening directly`);
    openRzp();
  } else {
    // Remove any stale script tag to avoid duplicate injection
    const existing = document.getElementById("razorpay-sdk");
    if (existing) existing.remove();

    stage("loading-sdk");
    console.log(`${logPrefix} Injecting Razorpay checkout.js script…`);
    const script = document.createElement("script");
    script.id = "razorpay-sdk";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      console.log(
        `${logPrefix} checkout.js onload fired — window.Razorpay exists:`,
        !!(window as any).Razorpay,
      );
      openRzp();
    };
    script.onerror = (event) => {
      checkoutResolved = true;
      clearTimeout(timeoutId);
      if (checkIframeInterval) clearInterval(checkIframeInterval);
      console.error(`${logPrefix} checkout.js script failed to load:`, event);
      stage("idle");
      onError(
        t(
          "Failed to load Razorpay SDK. Please check your internet connection and try again.",
        ),
      );
    };
    document.body.appendChild(script);
    console.log(`${logPrefix} Razorpay script tag appended to body`);
  }
}

export function convertToUsdCents(
  amount: number,
  baseCurrency: string,
  explicitUsdRate?: number,
): number {
  if (baseCurrency === "USD") return Math.round(amount * 100);

  if (explicitUsdRate) {
    return Math.round((amount / explicitUsdRate) * 100);
  }

  // Dynamically fetch the current real-time exchange rate from the store
  const store = useCurrencyStore.getState();
  const dynamicUsdAmount = store.getConvertedAmount(
    amount,
    baseCurrency,
    "USD",
  );
  return Math.round(dynamicUsdAmount * 100);
}

export function computeAffirmFee(
  subtotalWithShield: number,
  paymentMethod: "standard" | "affirm",
  isBid: boolean,
): number {
  if (isBid || paymentMethod !== "affirm") return 0;
  return subtotalWithShield * 0.08;
}
