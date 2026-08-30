import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class FlightSearchQueryMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const query = req.query as any;

    if (!query) {
      return next();
    }

    // Map RDate / rDate -> returnDate
    if ((query.RDate || query.rDate) && !query.returnDate) {
      query.returnDate = query.RDate || query.rDate;
    }
    // Map DDate / dDate -> departureDate
    if ((query.DDate || query.dDate) && !query.departureDate) {
      query.departureDate = query.DDate || query.dDate;
    }
    // Map Org / org -> origin
    if ((query.Org || query.org) && !query.origin) {
      query.origin = query.Org || query.org;
    }
    // Map Des / des -> destination
    if ((query.Des || query.des) && !query.destination) {
      query.destination = query.Des || query.des;
    }
    // Map Adt / adt / adult / adults -> adults
    const adtVal = query.Adt || query.adt || query.adult || query.adults;
    if (adtVal !== undefined && !query.adults) {
      query.adults = adtVal;
    }
    // Map Chld / chld / chd / child / children -> children
    const chdVal = query.Chld || query.chld || query.chd || query.child || query.children;
    if (chdVal !== undefined && !query.children) {
      query.children = chdVal;
    }
    // Map Inf / inf / infant / infants -> infants
    const infVal = query.Inf || query.inf || query.infant || query.infants;
    if (infVal !== undefined && !query.infants) {
      query.infants = infVal;
    }
    // Map Cabin / cabin / cabinClass / class / prefClass -> cabinClass
    const rawCabin = query.Cabin || query.cabin || query.cabinClass || query.class || query.prefClass;
    if (rawCabin && !query.cabinClass) {
      const cabin = String(rawCabin).toUpperCase().replace(/[\s_-]+/g, "");
      if (cabin === 'ECONOMY' || cabin === 'Y') {
        query.cabinClass = 'ECONOMY';
      } else if (cabin === 'BUSINESS' || cabin === 'C') {
        query.cabinClass = 'BUSINESS';
      } else if (cabin === 'FIRST' || cabin === 'F') {
        query.cabinClass = 'FIRST';
      } else if (cabin === 'PREMIUMECONOMY' || cabin === 'PREMIUM' || cabin === 'W') {
        query.cabinClass = 'PREMIUM_ECONOMY';
      } else {
        query.cabinClass = 'ALL';
      }
    }
    // Map DirectFlightsOnly -> stops
    if (query.DirectFlightsOnly !== undefined) {
      const direct = String(query.DirectFlightsOnly).toLowerCase() === 'true';
      if (direct) {
        query.stops = '0';
      }
    }
    // Map Ref -> ref
    if (query.Ref && !query.ref) {
      query.ref = query.Ref;
    }
    // Map trip type from URL (one-way / round-trip)
    if (query.Trip && !query.trip) {
      query.trip = query.Trip;
    }
    // Map TCode -> tCode
    if (query.TCode && !query.tCode) {
      query.tCode = query.TCode;
    }
    // Map utm_source -> utmSource
    if (query.utm_source && !query.utmSource) {
      query.utmSource = query.utm_source;
    }
    // Map utm_medium -> utmMedium
    if (query.utm_medium && !query.utmMedium) {
      query.utmMedium = query.utm_medium;
    }
    // Map utm_campaign -> utmCampaign
    if (query.utm_campaign && !query.utmCampaign) {
      query.utmCampaign = query.utm_campaign;
    }

    next();
  }
}
