import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UsaMarkupRepository, UsaMarkupRow } from './usa-markup.repository';
import { CreateUsaMarkupDto } from './dto/create-usa-markup.dto';
import { UpdateUsaMarkupDto } from './dto/update-usa-markup.dto';
import { FlightEntity } from '../flight/entities/flight.entity';

@Injectable()
export class UsaMarkupService {
  private readonly logger = new Logger(UsaMarkupService.name);

  constructor(private readonly repo: UsaMarkupRepository) {}

  async findAll(page = 1, limit = 10) {
    try {
      return await this.repo.findAll(page, limit);
    } catch (error: any) {
      this.logger.error(`[findAll] Service error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async create(dto: CreateUsaMarkupDto) {
    try {
      const { insertId } = await this.repo.create(dto);
      return await this.repo.findById(insertId);
    } catch (error: any) {
      this.logger.error(`[create] Service error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async update(id: number, dto: UpdateUsaMarkupDto) {
    try {
      const existing = await this.repo.findById(id);
      if (!existing) throw new NotFoundException(`Markup rule #${id} not found`);
      await this.repo.update(id, dto);
      return await this.repo.findById(id);
    } catch (error: any) {
      this.logger.error(`[update] Service error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async remove(id: number) {
    try {
      const existing = await this.repo.findById(id);
      if (!existing) throw new NotFoundException(`Markup rule #${id} not found`);
      await this.repo.softDelete(id);
      return { success: true, id };
    } catch (error: any) {
      this.logger.error(`[remove] Service error: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Resolves a trip/journeyType string from the search DTO to the stored journeyType value.
   * SearchFlightsDto.trip values: "one-way", "round-trip", "multi-city"
   * usa_table journeyType values: "OneWay", "Return"
   */
  private resolveJourneyType(trip?: string, flightWay?: number): string {
    if (trip === 'round-trip' || flightWay === 2) return 'Return';
    if (trip === 'one-way' || flightWay === 1) return 'OneWay';
    return 'OneWay';
  }

  /**
   * Apply matching markup/discount rules from usa_table to an array of mapped flight results.
   * Called inside FlightService.searchFlights() after mapProviderOffersToFlights().
   */
  async applyMarkupsToFlights(
    flights: FlightEntity[],
    origin: string,
    destination: string,
    cabinClass: string | undefined,
    trip: string | undefined,
    flightWay: number | undefined,
    departureDate: string,
  ): Promise<FlightEntity[]> {
    try {
      const status = await this.repo.getRunningStatus();
      if (status !== 'Start') {
        this.logger.log(`[UsaMarkup] Skip applying markups: running status is '${status}'`);
        return flights;
      }

      const journeyType = this.resolveJourneyType(trip, flightWay);
      const normalizedCabin = this.normalizeCabinForLookup(cabinClass);
      const searchDate = departureDate.slice(0, 10); // ensure "YYYY-MM-DD"

      this.logger.log(
        `[UsaMarkup] Lookup: ${origin}→${destination} cabin=${normalizedCabin} journey=${journeyType} date=${searchDate}`,
      );

      const rules = await this.repo.findMatchingRules(
        origin,
        destination,
        normalizedCabin,
        journeyType,
        searchDate,
      );

      if (rules.length === 0) return flights;

      this.logger.log(
        `[UsaMarkup] ${rules.length} rule(s) found for ${origin}→${destination} ${searchDate}`,
      );

      return flights.map((flight) => {
        const matchingRule = this.findBestRule(rules, flight.airlineCode);
        if (!matchingRule) return flight;

        const adjusted = this.applyRule(flight, matchingRule);
        this.logger.debug(
          `[UsaMarkup] Applied rule #${matchingRule.Id} to flight ${flight.flightId}: ` +
          `baseFare ${flight.baseFare} → ${adjusted.baseFare}`,
        );
        return adjusted;
      });
    } catch (error: any) {
      this.logger.error(`[applyMarkupsToFlights] Service error: ${error.message}`, error.stack);
      // Fallback: return original flights if markup application fails so the search doesn't crash completely
      return flights;
    }
  }

  private findBestRule(rules: UsaMarkupRow[], airlineCode: string): UsaMarkupRow | null {
    // Prefer an exact airline match, fall back to wildcard/empty airline rules
    const exact = rules.find(
      (r) => r.airline && r.airline !== '*' && r.airline !== '' &&
             r.airline.toUpperCase() === airlineCode.toUpperCase(),
    );
    if (exact) return exact;

    const wildcard = rules.find((r) => !r.airline || r.airline === '*' || r.airline === '');
    return wildcard ?? null;
  }

  async applyMarkupToLivePrice(
    liveBaseFare: number,
    liveTax: number,
    flight: FlightEntity,
    origin: string,
    destination: string,
    cabinClass: string | undefined,
    trip: string | undefined,
    flightWay: number | undefined,
    departureDate: string,
  ): Promise<{ baseFare: number; tax: number; totalFare: number; ruleId: number | null }> {
    try {
      const status = await this.repo.getRunningStatus();
      if (status !== 'Start') {
        return { baseFare: liveBaseFare, tax: liveTax, totalFare: liveBaseFare + liveTax, ruleId: null };
      }

      const journeyType = this.resolveJourneyType(trip, flightWay);
      const normalizedCabin = this.normalizeCabinForLookup(cabinClass);
      const searchDate = departureDate.slice(0, 10);

      const rules = await this.repo.findMatchingRules(
        origin,
        destination,
        normalizedCabin,
        journeyType,
        searchDate,
      );

      if (rules.length === 0) {
        return { baseFare: liveBaseFare, tax: liveTax, totalFare: liveBaseFare + liveTax, ruleId: null };
      }

      const matchingRule = this.findBestRule(rules, flight.airlineCode);
      if (!matchingRule) {
        return { baseFare: liveBaseFare, tax: liveTax, totalFare: liveBaseFare + liveTax, ruleId: null };
      }

      const { markupType, adultAmount } = matchingRule;
      const originalTotal = liveBaseFare + liveTax;
      const abs = Math.abs(adultAmount);

      let newBaseFare = liveBaseFare;
      let newTotalFare = originalTotal;

      switch (markupType) {
        case 'replace':
          newTotalFare = Math.max(0, abs);
          newBaseFare = Math.max(0, newTotalFare - liveTax);
          break;
        case 'percentage':
          newBaseFare = Math.max(0, liveBaseFare - (liveBaseFare * abs) / 100);
          newTotalFare = newBaseFare + liveTax;
          break;
        case 'fixed':
        default:
          newBaseFare = Math.max(0, liveBaseFare - abs);
          newTotalFare = newBaseFare + liveTax;
          break;
      }

      this.logger.log(
        `[UsaMarkup] applyMarkupToLivePrice rule #${matchingRule.Id} type=${markupType} amount=${adultAmount} | ` +
        `liveBaseFare ${liveBaseFare.toFixed(2)} → ${newBaseFare.toFixed(2)} | ` +
        `total ${originalTotal.toFixed(2)} → ${newTotalFare.toFixed(2)}`,
      );

      return {
        baseFare: parseFloat(newBaseFare.toFixed(2)),
        tax: parseFloat(liveTax.toFixed(2)),
        totalFare: parseFloat(newTotalFare.toFixed(2)),
        ruleId: matchingRule.Id,
      };
    } catch (error: any) {
      this.logger.error(`[applyMarkupToLivePrice] Service error: ${error.message}`, error.stack);
      return { baseFare: liveBaseFare, tax: liveTax, totalFare: liveBaseFare + liveTax, ruleId: null };
    }
  }

  /**
   * Applies a usa_table rule to a single flight.
   *
   * Semantics (amount is always treated as a positive magnitude):
   *   fixed      → baseFare - abs(adultAmount)          (deduct fixed $)
   *   percentage → baseFare - baseFare * abs(adultAmount) / 100  (deduct %)
   *   replace    → baseFare = abs(adultAmount)           (override price entirely)
   *
   * The sign stored in the DB is ignored — positive values are stored by
   * convention. The service always subtracts for fixed/percentage.
   */
  private applyRule(flight: FlightEntity, rule: UsaMarkupRow): FlightEntity {
    const { markupType, adultAmount, childAmount, infantAmount } = rule;

    const originalBase = flight.baseFare ?? 0;
    const tax = flight.tax ?? 0;
    const originalTotal = originalBase + tax;
    const abs = Math.abs(adultAmount);

    let newBaseFare = originalBase;
    let newTotalFare = originalTotal;

    switch (markupType) {
      case 'replace':
        newTotalFare = Math.max(0, abs);
        newBaseFare = Math.max(0, newTotalFare - tax);
        break;
      case 'percentage':
        newBaseFare = Math.max(0, originalBase - (originalBase * abs) / 100);
        newTotalFare = newBaseFare + tax;
        break;
      case 'fixed':
      default:
        newBaseFare = Math.max(0, originalBase - abs);
        newTotalFare = newBaseFare + tax;
        break;
    }

    this.logger.log(
      `[UsaMarkup] rule #${rule.Id} type=${markupType} amount=${adultAmount} | ` +
      `baseFare ${originalBase.toFixed(2)} → ${newBaseFare.toFixed(2)} | ` +
      `total ${originalTotal.toFixed(2)} → ${newTotalFare.toFixed(2)}`,
    );

    return {
      ...flight,
      baseFare: parseFloat(newBaseFare.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      totalFare: parseFloat(newTotalFare.toFixed(2)),
      markupApplied: {
        ruleId: rule.Id,
        markupType,
        adultAmount,
        childAmount,
        infantAmount,
      },
    };
  }

  private normalizeCabinForLookup(cabinClass?: string): string {
    if (!cabinClass) return '';
    const map: Record<string, string> = {
      ECONOMY: 'Economy',
      PREMIUM_ECONOMY: 'Premium Economy',
      BUSINESS: 'Business',
      FIRST: 'First',
      ALL: '',
    };
    return map[cabinClass.toUpperCase()] ?? cabinClass;
  }

  async getRunningStatus(): Promise<string> {
    return this.repo.getRunningStatus();
  }

  async updateRunningStatus(status: string): Promise<void> {
    return this.repo.updateRunningStatus(status);
  }
}
