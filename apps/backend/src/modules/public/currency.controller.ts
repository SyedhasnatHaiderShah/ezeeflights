import { Controller, Get, Query, Req, Logger } from "@nestjs/common";
import { Request } from "express";
import { CurrencyService } from "./currency.service";
import { ApiTags, ApiOperation, ApiQuery } from "@nestjs/swagger";

@ApiTags("Public")
@Controller("public/currency")
export class CurrencyController {
  private readonly logger = new Logger(CurrencyController.name);

  constructor(private readonly currencyService: CurrencyService) {}

  @Get("rates")
  @ApiOperation({ summary: "Get latest exchange rates relative to USD" })
  async getRates() {
    return this.currencyService.getRates();
  }

  @Get("detect")
  @ApiOperation({
    summary:
      "Detect currency from client country hint, CDN headers, browser locale, or public client IP",
  })
  @ApiQuery({
    name: "countryCode",
    required: false,
    description:
      "ISO 3166-1 alpha-2 from browser locale (e.g. PK for Pakistan)",
  })
  @ApiQuery({
    name: "debug",
    required: false,
    description: "Set to 1 for verbose _debug payload and server logs",
  })
  async detect(
    @Req() req: Request,
    @Query("countryCode") queryCountryCode?: string,
    @Query("debug") debug?: string,
  ) {
    const ip = this.extractClientIp(req);
    const ipDebug = this.extractClientIpDebug(req);

    const cfCountry = req.headers["cf-ipcountry"] as string;
    const cfCountryCode = Array.isArray(cfCountry) ? cfCountry[0] : cfCountry;
    const cfViewerCountry = req.headers["cloudfront-viewer-country"] as string;
    const cfViewerCountryCode = Array.isArray(cfViewerCountry)
      ? cfViewerCountry[0]
      : cfViewerCountry;
    const localeCountry = this.parseAcceptLanguageCountry(req);
    const headerCountry = ((req.headers["x-client-country"] as string) || "")
      .trim()
      .toUpperCase();
    const clientHint = (queryCountryCode || headerCountry || "")
      .trim()
      .toUpperCase();

    // High priority hints from CDN, explicit query hint, or client country header
    const countryCode =
      clientHint || cfCountryCode || cfViewerCountryCode || "";

    const debugEnabled = this.isCurrencyDebugEnabled(debug);
    const hints = {
      resolvedIp: ip || null,
      ipCandidates: ipDebug,
      queryCountryCode: queryCountryCode ?? null,
      headerXClientCountry: headerCountry || null,
      headerCfIpCountry: cfCountryCode || null,
      headerCloudFrontViewerCountry: cfViewerCountryCode || null,
      acceptLanguage: req.headers["accept-language"] ?? null,
      parsedAcceptLanguageCountry: localeCountry || null,
      effectiveCountryCode: countryCode || null,
    };

    const result = await this.currencyService.detectCurrency(
      ip,
      countryCode,
      localeCountry,
    );

    // this.logger.log(
    //   `[Currency][Backend] detect - Client IP: ${ip}, Country Hint: ${countryCode || "(none)"}, Fallback Hint (Locale): ${localeCountry || "(none)"}, Resolved: ${result.currency} (${result.source})`
    // );

    if (debugEnabled) {
      const payload = {
        phase: "detect",
        hints,
        backend: {
          currency: result.currency ?? null,
          countryCode: result.countryCode ?? null,
          country: result.country ?? null,
          source: result.source ?? null,
          ip: result.ip ?? null,
          city: result.city ?? null,
          error: result.error ?? null,
        },
      };
      // this.logger.log({ msg: "[Currency][Backend] verbose", ...payload });
      return {
        ...result,
        _debug: { hints, result },
      };
    }

    return result;
  }

  private isCurrencyDebugEnabled(debugQuery?: string): boolean {
    if (debugQuery === "1" || debugQuery === "true") return true;
    if (process.env.CURRENCY_DEBUG === "true") return true;
    if (process.env.CURRENCY_DEBUG === "false") return false;
    return process.env.NODE_ENV !== "production";
  }

  private extractClientIpDebug(req: Request): Record<string, string | null> {
    const xff = req.headers["x-forwarded-for"];
    const firstForwarded =
      typeof xff === "string" ? xff.split(",")[0]?.trim() : null;
    return {
      "cf-connecting-ip": (req.headers["cf-connecting-ip"] as string) ?? null,
      "x-forwarded-for": (typeof xff === "string" ? xff : null) ?? null,
      "x-forwarded-for-first": firstForwarded,
      "x-real-ip": (req.headers["x-real-ip"] as string) ?? null,
      "req.ip": req.ip ?? null,
      "socket.remoteAddress": req.socket?.remoteAddress ?? null,
    };
  }

  /** Parses en-PK, ur-PK, etc. from Accept-Language */
  private parseAcceptLanguageCountry(req: Request): string {
    const raw = req.headers["accept-language"];
    const header = Array.isArray(raw) ? raw[0] : raw;
    if (!header) return "";

    for (const part of header.split(",")) {
      const tag = part.split(";")[0]?.trim();
      const region = tag?.split("-")[1]?.toUpperCase();
      if (region && /^[A-Z]{2}$/.test(region)) return region;
    }
    return "";
  }

  /**
   * Extracts the real client IP using a priority chain.
   * Handles Cloudflare, standard reverse proxies (Nginx/ALB), and raw socket fallbacks.
   * Trust proxy MUST be enabled in main.ts for req.ip to work correctly.
   */
  private extractClientIp(req: Request): string {
    // X-Forwarded-For may be a comma-separated list: "client, proxy1, proxy2"
    // We always want the first (leftmost) entry — the original client.
    const xff = req.headers["x-forwarded-for"];
    const firstForwarded =
      typeof xff === "string" ? xff.split(",")[0]?.trim() : undefined;

    const candidates = [
      // Cloudflare injects this — most reliable when behind CF
      req.headers["cf-connecting-ip"] as string,
      // Standard proxy header (first hop = real client)
      firstForwarded,
      // Nginx proxy_pass alternative
      req.headers["x-real-ip"] as string,
      // Express built-in — accurate only after trust proxy is set
      req.ip,
      // Last resort raw socket
      req.socket?.remoteAddress,
    ];

    for (const candidate of candidates) {
      if (!candidate) continue;
      const ip = candidate.trim();
      if (!ip) continue;

      // Strip IPv6-mapped IPv4 prefix (::ffff:1.2.3.4 → 1.2.3.4)
      const normalized = ip.replace(/^::ffff:/, "");

      // Skip loopback — let the service handle local fallback
      if (normalized === "::1" || normalized === "127.0.0.1") continue;

      return normalized;
    }

    return "";
  }
}
