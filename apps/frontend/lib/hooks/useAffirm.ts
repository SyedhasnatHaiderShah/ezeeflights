"use client";

import { useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { getActiveHostname } from "@/lib/utils/domain";

declare global {
  interface Window {
    affirm: any;
    _affirm_config: any;
  }
}

export interface AffirmCheckoutItem {
  display_name: string;
  unit_price: number; // in USD cents or CAD cents
  qty: number;
  sku?: string;
  item_url?: string;
  item_image_url?: string;
}

export interface AffirmCheckoutParams {
  /** Total amount in cents (e.g. $145.00 = 14500) */
  totalAmountUsdCents: number;
  items: AffirmCheckoutItem[];
  billing: {
    name: { first: string; last: string } | { full: string };
    email: string;
    phone_number?: string;
  };
  onSuccess: (checkoutToken: string, vcnData?: any) => void;
  onDecline: () => void;
  onOpen?: () => void;
}

export function useAffirm({ active = true }: { active?: boolean } = {}) {
  const { t } = useTranslation();
  const scriptLoaded = useRef(false);

  const hostname = typeof window !== "undefined" ? getActiveHostname() : "";

  const isProd = process.env.NODE_ENV === "production";
  const isCanada = hostname.includes("ezeeflights.ca");

  // Determine Affirm credentials dynamically from environment variables
  const publicApiKey = isProd
    ? (isCanada
        ? process.env.NEXT_PUBLIC_AFFIRM_PUBLIC_KEY_CA
        : process.env.NEXT_PUBLIC_AFFIRM_PUBLIC_KEY_US)
    : process.env.NEXT_PUBLIC_AFFIRM_PUBLIC_KEY;

  const scriptUrl = isProd
    ? (isCanada
        ? process.env.NEXT_PUBLIC_AFFIRM_SCRIPT_URL_CA
        : process.env.NEXT_PUBLIC_AFFIRM_SCRIPT_URL_US)
    : process.env.NEXT_PUBLIC_AFFIRM_SCRIPT_URL;

  const currency = isCanada ? "CAD" : "USD";
  const locale = isCanada ? "en_CA" : "en_US";
  const countryCode = isCanada ? "CAN" : "USA";

  useEffect(() => {
    if (!active || scriptLoaded.current || typeof window === "undefined")
      return;
    if (!publicApiKey) {
      console.warn("[Affirm] publicApiKey is not configured in the environment.");
      return;
    }

    const resolvedScriptUrl = scriptUrl || "https://cdn1-sandbox.affirm.com/js/v2/affirm.js";

    // Configure Affirm config before injecting script
    window._affirm_config = {
      public_api_key: publicApiKey,
      script: resolvedScriptUrl,
      locale,
      country_code: countryCode,
    };

    // Inject Affirm JS SDK using the official stub injection snippet to ensure proper loading & queue initialization
    try {
      (function(l: any, g: any, m: string, e: string, a: any, y: any, b: any) {
        var d, c = l[m], k: any = {}, f = window.document, gScript: any = f.createElement("script"), h = f.getElementsByTagName("script")[0];
        k.svg = "https://www.affirm.com/api/v2/cookie/check";
        k.check_vcn = function() { return "CHECK_VCN" };
        gScript.type = "text/javascript";
        gScript.async = true;
        gScript.src = e;
        gScript.onload = function() {
          console.log(`[Affirm] SDK loaded successfully (${isProd ? "Production" : "Sandbox"} - ${isCanada ? "CA" : "US"}).`);
          try { l[m].open_vcn(null); } catch (e) {}
        };
        gScript.onerror = function() {
          console.error("[Affirm] Failed to load SDK script.");
        };
        
        if (h && h.parentNode) {
          h.parentNode.insertBefore(gScript, h);
        } else {
          document.head.appendChild(gScript);
        }

        l[m] = c || {};
        l[m]._q = [];
        l[m]._check_vcn = k;
        l[m]._vcn_data = null;
        l[m].open_vcn = function(val: any) { l[m]._vcn_data = val; };
        l[m].checkout = function(val: any) { l[m]._q.push({ a: val, t: new Date() }); };
        l[m].ui = function() { l[m]._ui_q.push({ a: arguments, t: new Date() }); };
        l[m]._ui_q = [];
        var stubActions = ["show", "show_error"];
        for (d = 0; d < stubActions.length; d++) {
          l[m].ui[stubActions[d]] = (function(act) {
            return function() { l[m].ui.apply(null, [act].concat(Array.prototype.slice.call(arguments))); };
          })(stubActions[d]);
        }
      })(window, 0, "affirm", resolvedScriptUrl, null, null, null);
    } catch (err) {
      console.error("[Affirm] Error injecting Affirm loader script:", err);
    }

    scriptLoaded.current = true;
  }, [active, publicApiKey, scriptUrl, locale, countryCode, isProd, isCanada]);

  /**
   * Opens the Affirm VCN checkout modal.
   * Affirm dynamically determines installment plans based on the user's details.
   */
  const openAffirmCheckout = useCallback((params: AffirmCheckoutParams) => {
    const runCheckout = () => {
      // Sanitize fields for sandbox testing to avoid invalid email/phone validation errors
      let sanitizedEmail = params.billing.email;
      if (!isProd) {
        const emailParts = (params.billing.email || "").split("@");
        const hasValidTld = emailParts.length === 2 && emailParts[1].includes(".") && emailParts[1].split(".")[1].length >= 2;
        if (!hasValidTld) {
          sanitizedEmail = "test@ezeeflights.com";
        }
      }

      let sanitizedPhone = undefined;
      const rawPhone = params.billing.phone_number || "";
      if (rawPhone.trim().startsWith("+1") || rawPhone.trim().startsWith("1")) {
        const cleanDigits = rawPhone.replace(/\D/g, "");
        // Area code 123 is invalid in North America, replace with valid sandbox test area code 650
        if (cleanDigits.includes("1234567")) {
          sanitizedPhone = rawPhone.replace("123", "650");
        } else {
          sanitizedPhone = rawPhone;
        }
      }

      const checkoutObject = {
        merchant: {
          public_api_key: publicApiKey,
          use_vcn: true,
          user_confirmation_url: `${window.location.origin}/flights/booking/affirm-return`,
          user_cancel_url: window.location.href,
          user_confirmation_url_action: "POST",
          name: "EzeeFlights",
        },
        locale,
        country_code: countryCode,
        items: params.items.map((item) => ({
          display_name: item.display_name,
          unit_price: item.unit_price,
          qty: item.qty,
          sku: item.sku || "FLIGHT-TICKET",
          item_url: item.item_url || window.location.href,
          item_image_url: item.item_image_url || "",
        })),
        billing: {
          name: params.billing.name,
          ...(sanitizedEmail ? { email: sanitizedEmail } : {}),
          ...(sanitizedPhone ? { phone_number: sanitizedPhone } : {}),
        },
        shipping_amount: 0,
        tax_amount: 0,
        total: Math.round(params.totalAmountUsdCents),
        currency,
      };

      try {
        console.log(
          `[Affirm Frontend] Launching VCN checkout modal. Total Amount: ${checkoutObject.total} cents ($${(checkoutObject.total / 100).toFixed(2)} ${currency})`,
          {
            total: checkoutObject.total,
            email: sanitizedEmail || params.billing.email || "N/A",
            phone: sanitizedPhone || params.billing.phone_number || "N/A",
          }
        );
        window.affirm.checkout(checkoutObject);

        let onOpenFired = false;
        const handleOpen = () => {
          if (!onOpenFired && params.onOpen) {
            onOpenFired = true;
            params.onOpen();
          }
        };

        window.affirm.checkout.open_vcn({
          success: (vcnData: any) => {
            params.onSuccess(vcnData.checkout_token, vcnData);
          },
          error: (err: any) => {
            console.error("[Affirm] Checkout declined or cancelled.", err);
            params.onDecline();
          },
        });

        // Poll the DOM to detect when the Affirm modal/iframe is injected
        const pollForAffirmModal = () => {
          const hasAffirmElement = () => {
            const iframe = document.querySelector(
              'iframe[src*="affirm"], iframe[id*="affirm"], #affirm-checkout-iframe'
            );
            if (iframe) return true;
            const container = document.querySelector(
              'div[class*="affirm"], div[id*="affirm"]'
            );
            if (container) return true;
            return false;
          };

          let attempts = 0;
          const interval = setInterval(() => {
            attempts++;
            if (hasAffirmElement()) {
              clearInterval(interval);
              console.log(
                `[Affirm] Modal element detected in DOM after ${attempts * 100}ms. Waiting 1.5s for iframe content...`
              );
              setTimeout(handleOpen, 1500);
            } else if (attempts > 50) {
              clearInterval(interval);
              console.warn("[Affirm] Modal detection timed out. Dismissing loader.");
              handleOpen();
            }
          }, 100);
        };

        pollForAffirmModal();
      } catch (err) {
        console.error("[Affirm] Critical error launching Affirm checkout:", err);
        alert(
          t("Affirm failed to launch: ") +
            (err instanceof Error ? err.message : JSON.stringify(err))
        );
        if (params.onOpen) params.onOpen();
        params.onDecline();
      }
    };

    const isAffirmFullyLoaded = () => {
      return (
        typeof window !== "undefined" &&
        window.affirm &&
        window.affirm.checkout &&
        typeof window.affirm.checkout.open_vcn === "function"
      );
    };

    if (isAffirmFullyLoaded()) {
      runCheckout();
    } else {
      console.log("[Affirm] SDK not loaded yet. Waiting for window.affirm to initialize...");
      let attempts = 0;
      const sdkInterval = setInterval(() => {
        attempts++;
        if (isAffirmFullyLoaded()) {
          clearInterval(sdkInterval);
          console.log("[Affirm] SDK loaded successfully after waiting.");
          runCheckout();
        } else if (attempts > 150) {
          clearInterval(sdkInterval);
          console.error("[Affirm] SDK load timed out.");
          alert(
            t("[Affirm Error] SDK not loaded. If you are on localhost, please enable Third-Party Cookies in your browser settings to view the Affirm checkout modal.")
          );
          if (params.onOpen) params.onOpen();
          params.onDecline();
        }
      }, 100);
    }
  }, [publicApiKey, locale, countryCode, currency]);

  return { openAffirmCheckout };
}
