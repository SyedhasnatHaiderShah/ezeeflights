import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class CurrencyService {
  private readonly logger = new Logger(CurrencyService.name);
  private cachedRates: any = null;
  private lastUpdate: number = 0;
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

  async getRates() {
    const now = Date.now();
    if (this.cachedRates && now - this.lastUpdate < this.CACHE_TTL) {
      return this.cachedRates;
    }

    try {
      this.logger.log("Fetching fresh exchange rates...");
      const response = await fetch("https://open.er-api.com/v6/latest/USD");
      const data = await response.json();
      if (data.result === "success") {
        this.cachedRates = data.rates;
        this.lastUpdate = now;
        return this.cachedRates;
      }
      throw new Error("Failed to fetch rates from API");
    } catch (error) {
      this.logger.error("Error fetching rates:", error.message);
      return this.cachedRates || {}; // Return stale cache if available
    }
  }

  async detectCurrency(ip: string) {
    this.logger.log(`Detecting currency for IP: ${ip}`);

    // Handle local/private IPs
    if (
      !ip ||
      ip === "::1" ||
      ip === "127.0.0.1" ||
      ip.startsWith("192.168.")
    ) {
      return { currency: "USD", ip: ip || "unknown", country: "Local" };
    }

    try {
      const response = await fetch(`https://ipapi.co/${ip}/json/`);
      const data = await response.json();

      if (data.error) {
        this.logger.warn(`IP detection error for ${ip}: ${data.reason}`);
        return { currency: "USD", ip, error: data.reason };
      }

      return {
        currency: data.currency || "USD",
        ip: data.ip || ip,
        country: data.country_name,
        city: data.city,
      };
    } catch (error) {
      this.logger.error(`Error detecting currency for ${ip}:`, error.message);
      return { currency: "USD", ip, error: error.message };
    }
  }
}
