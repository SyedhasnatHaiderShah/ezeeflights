import { Injectable } from '@nestjs/common';

interface BuildParams {
  partner: 'SELF' | 'KIWI' | 'WEGO' | 'AVIASALES' | 'TRAVELPAYOUTS';
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults?: number;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  ref?: string;
  tCode?: string;
  flightId?: string;
  cabinClass?: string;
}

@Injectable()
export class AffiliateUrlBuilder {
  build(params: BuildParams): string {
    switch (params.partner) {
      case 'KIWI':       return this.buildKiwi(params);
      case 'WEGO':       return this.buildWego(params);
      case 'AVIASALES':  return this.buildAviasales(params);
      default:           return this.buildSelf(params);  // your own booking page
    }
  }

  private getFrontendUrl(): string {
    if (process.env.FRONTEND_URL) return process.env.FRONTEND_URL;
    if (process.env.FRONTEND_ORIGIN) {
      const origins = process.env.FRONTEND_ORIGIN.split(',');
      if (origins.length > 0) return origins[0];
    }
    return 'http://localhost:3000';
  }

  /** Redirect back to YOUR booking page (Strategy A — no 3rd party) */
  private buildSelf(p: BuildParams): string {
    const base = this.getFrontendUrl();
    const q = new URLSearchParams({
      id: p.flightId ?? '',
      org: p.origin,
      des: p.destination,
      dDate: p.departureDate,
      ...(p.returnDate && { rDate: p.returnDate }),
      adt: String(p.adults ?? 1),
      chd: '0',
      inf: '0',
      trip: p.returnDate ? 'round-trip' : 'one-way',
      ...(p.cabinClass && { class: p.cabinClass }),
      utm_source: p.utmSource ?? 'ad',
      utm_medium: p.utmMedium ?? 'banner',
      utm_campaign: p.utmCampaign ?? 'flight-deal',
      ...(p.ref && { ref: p.ref }),
      ...(p.tCode && { tCode: p.tCode }),
    });
    return `${base}/flights/booking?${q.toString()}`;
  }

  /** Kiwi.com affiliate deep link */
  private buildKiwi(p: BuildParams): string {
    const affiliateId = process.env.KIWI_AFFILIATE_ID ?? '';
    const q = new URLSearchParams({
      from: p.origin,
      to: p.destination,
      departure: p.departureDate,
      ...(p.returnDate && { return: p.returnDate }),
      adults: String(p.adults ?? 1),
      lang: 'en',
      currency: 'USD',
      affilid: affiliateId,
      utm_source: p.utmSource ?? 'yoursite',
      utm_medium: p.utmMedium ?? 'metasearch',
      utm_campaign: p.utmCampaign ?? 'flights',
    });
    return `https://www.kiwi.com/en/search/results/${p.origin}/${p.destination}/${p.departureDate}?${q.toString()}`;
  }

  /** Wego.com affiliate */
  private buildWego(p: BuildParams): string {
    const siteCode = process.env.WEGO_SITE_CODE ?? '';
    const q = new URLSearchParams({
      tt: 'B2F',
      sl: p.origin,
      tl: p.destination,
      dd: p.departureDate,
      ...(p.returnDate && { rd: p.returnDate }),
      pa: String(p.adults ?? 1),
      s: siteCode,
      utm_source: p.utmSource ?? 'yoursite',
      utm_medium: p.utmMedium ?? 'cpc',
      utm_campaign: p.utmCampaign ?? 'flights',
    });
    return `https://www.wego.com/flights/${p.origin}-${p.destination}/${p.departureDate}?${q.toString()}`;
  }

  /** Aviasales (Travelpayouts) affiliate */
  private buildAviasales(p: BuildParams): string {
    const marker = process.env.TRAVELPAYOUTS_MARKER ?? '';
    const q = new URLSearchParams({
      origin: p.origin,
      destination: p.destination,
      depart_date: p.departureDate.replace(/-/g, ''),
      ...(p.returnDate && { return_date: p.returnDate.replace(/-/g, '') }),
      adults: String(p.adults ?? 1),
      marker,
      utm_source: p.utmSource ?? 'yoursite',
      utm_medium: p.utmMedium ?? 'affiliate',
      utm_campaign: p.utmCampaign ?? 'flights',
    });
    return `https://www.aviasales.com/search/${p.origin}${p.departureDate.replace(/-/g, '')}${p.destination}1?${q.toString()}`;
  }
}
