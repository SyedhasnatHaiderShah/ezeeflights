import { Injectable, Logger, BadRequestException } from "@nestjs/common";
import axios, { AxiosError } from "axios";

export interface AffirmVCN {
  checkoutId: string;
  card: {
    number: string;
    cvv: string;
    expiry: string;
    cardholderName: string;
  };
}

@Injectable()
export class AffirmProvider {
  private readonly logger = new Logger(AffirmProvider.name);

  private get apiUrl(): string {
    return process.env.AFFIRM_API_URL || "https://sandbox.affirm.com";
  }

  private get auth() {
    return {
      username: process.env.AFFIRM_PUBLIC_KEY || "",
      password: process.env.AFFIRM_PRIVATE_KEY || "",
    };
  }

  /**
   * Exchange a client-side checkout_token for an Affirm Virtual Credit Card (VCN).
   *
   * Flow (per docs/affirm/affirm-integration-plan.md §7.2):
   *   1. POST /api/v2/charges  →  authorizes the loan, returns a checkout/charge ID
   *   2. GET  /api/v2/charges/{id}/card  →  retrieves the Virtual Card (number, CVV, expiry)
   *
   * Affirm only works in USD. The checkout_token comes from the frontend
   * affirm.checkout.open_vcn() success callback.
   */
  async authorizeAndGetVCN(checkoutToken: string): Promise<AffirmVCN> {
    // Guard: private key must be configured
    if (
      !process.env.AFFIRM_PRIVATE_KEY ||
      process.env.AFFIRM_PRIVATE_KEY === "your_affirm_private_key"
    ) {
      throw new BadRequestException(
        "[Affirm] AFFIRM_PRIVATE_KEY is not configured. " +
          "Add your sandbox private key from https://sandbox.affirm.com/dashboard → API Keys " +
          "to apps/backend/.env as AFFIRM_PRIVATE_KEY=<key>",
      );
    }

    try {
      // Step 1: Retrieve Virtual Card details
      // Note: For VCN, the loan is already approved by the time the token is issued.
      // We do not need to POST to /transactions to authorize it.
      // We just read the card details from Affirm's backend.
      this.logger.log(
        `[Affirm] Fetching VCN for checkout_token: ${checkoutToken.slice(0, 8)}...`,
      );

      // Try the newer /api/v2/cards endpoint first
      let cardRes;
      try {
        cardRes = await axios.get(
          `${this.apiUrl}/api/v2/cards/${checkoutToken}`,
          { auth: this.auth },
        );
      } catch (err: any) {
        if (err.response?.status === 404) {
          this.logger.warn(`[Affirm] /api/v2/cards 404, falling back to older endpoint...`);
          cardRes = await axios.get(
            `${this.apiUrl}/api/v2/charges/${checkoutToken}/card`,
            { auth: this.auth },
          );
        } else {
          throw err;
        }
      }

      const checkoutId: string = checkoutToken;

      const { number, cvv, expiration, cardholder_name } = cardRes.data;

      this.logger.log(
        `[Affirm] VCN retrieved successfully. Last 4: ****${String(number).slice(-4)}`,
      );

      return {
        checkoutId,
        card: {
          number,
          cvv,
          expiry: expiration, // format: "MMYYYY"
          cardholderName: cardholder_name || "Affirm Customer",
        },
      };
    } catch (err: any) {
      const axiosErr = err as AxiosError<any>;
      const status = axiosErr.response?.status;
      const rawData = axiosErr.response?.data;
      const detail =
        (rawData && typeof rawData === "object" ? rawData.message || rawData.error : null) ||
        err.message;

      this.logger.error(
        `[Affirm] Authorization failed (HTTP ${status ?? "N/A"}): ${detail}`,
      );
      
      let loggedError = rawData || err;
      if (typeof loggedError === "string" && (loggedError.includes("<!DOCTYPE") || loggedError.includes("<html"))) {
        loggedError = "[HTML Response Hidden]";
      }
      console.error("[Affirm] Full backend error object:", loggedError);

      throw new BadRequestException(
        `Affirm payment authorization failed: ${detail}`,
      );
    }
  }

  /**
   * Void an authorized Affirm loan.
   * Call this if the downstream flight booking fails after Affirm approval,
   * so the user is not charged for a booking that didn't complete.
   */
  async voidCharge(checkoutId: string): Promise<void> {
    try {
      await axios.post(
        `${this.apiUrl}/api/v2/charges/${checkoutId}/void`,
        {},
        { auth: this.auth },
      );
      this.logger.log(`[Affirm] Charge voided successfully: ${checkoutId}`);
    } catch (err: any) {
      // Best-effort void — log but don't throw (booking already failed)
      this.logger.error(
        `[Affirm] Failed to void charge ${checkoutId}: ${err.message}`,
      );
    }
  }
}
