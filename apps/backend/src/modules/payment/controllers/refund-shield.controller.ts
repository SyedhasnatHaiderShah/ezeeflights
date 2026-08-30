import {
  Body,
  Controller,
  Post,
  Request,
  UseGuards,
  Logger,
} from "@nestjs/common";
import { OptionalJwtAuthGuard } from "../../auth/guards/optional-jwt-auth.guard";
import { RefundShieldService } from "../services/refund-shield.service";
import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";
import { generateCrmBookingRef } from "../../notification/utils/flight-itinerary-html.util";

export class ReportRefundShieldDto {
  @IsString()
  bookingId: string;

  @IsString()
  @IsOptional()
  pnrCode?: string;

  @IsNumber()
  basketTotalUsd: number;

  @IsNumber()
  passengerCount: number;

  @IsBoolean()
  opted: boolean; // must be true — gate enforced below

  @IsString()
  userEmail: string;

  @IsString()
  @IsOptional()
  userFirstName?: string;

  @IsString()
  @IsOptional()
  userLastName?: string;

  @IsString()
  @IsOptional()
  origin?: string;

  @IsString()
  @IsOptional()
  destination?: string;

  @IsString()
  @IsOptional()
  flightDate?: string;

  @IsBoolean()
  paymentVerified: boolean; // frontend passes this after verifyAdvancePayment()

  // Per-passenger counts (sent from frontend)
  @IsNumber()
  @IsOptional()
  adultCount?: number;

  @IsNumber()
  @IsOptional()
  childCount?: number;

  @IsNumber()
  @IsOptional()
  infantCount?: number;

  // Per-passenger type prices in USD (total for all pax of that type)
  @IsNumber()
  @IsOptional()
  adultPrice?: number;

  @IsNumber()
  @IsOptional()
  childPrice?: number;

  @IsNumber()
  @IsOptional()
  infantPrice?: number;
}

export class LogRefundShieldStatusDto {
  @IsString()
  @IsOptional()
  bookingRef?: string;

  @IsString()
  @IsOptional()
  booking_ref?: string;

  @IsString()
  refundStatus: string; // 'OPTED_IN' or 'DECLINED'

  @IsNumber()
  refundPrice: number;

  @IsNumber()
  adultCount: number;

  @IsNumber()
  childCount: number;

  @IsNumber()
  infantCount: number;

  @IsNumber()
  grandTotal: number;

  // Optional individual prices per passenger type
  @IsNumber()
  @IsOptional()
  adultPrice?: number;

  @IsNumber()
  @IsOptional()
  childPrice?: number;

  @IsNumber()
  @IsOptional()
  infantPrice?: number;
}

@Controller({ path: "payments/refund-shield", version: "1" })
@UseGuards(OptionalJwtAuthGuard)
export class RefundShieldController {
  private readonly logger = new Logger(RefundShieldController.name);

  constructor(private readonly refundShieldService: RefundShieldService) {}

  @Post("report")
  async report(@Body() dto: ReportRefundShieldDto, @Request() req: any) {
    // GATE: Only report as refundable if BOTH conditions are true:
    //   1. payment was verified upstream (dto.paymentVerified === true)
    //   2. user explicitly opted in (dto.opted === true)
    if (dto.paymentVerified !== true || dto.opted !== true) {
      this.logger.log(
        `[RefundShieldController] Skipping report for booking ${dto.bookingId} - paymentVerified: ${dto.paymentVerified}, opted: ${dto.opted}`,
      );
      return {
        success: true,
        reported: false,
        reason: "Conditions not met for reporting",
      };
    }

    this.logger.log(
      `[RefundShieldController] Reporting successful payment to RS for booking ${dto.bookingId}`,
    );

    const result = await this.refundShieldService.reportSale({
      bookingReference: dto.pnrCode || dto.bookingId,
      bookingName:
        `Flight ${dto.origin || ""} → ${dto.destination || ""}`.trim() ||
        `Booking ${dto.bookingId}`,
      customerId: String(req.user?.userId || dto.userEmail),
      customerFirstName: dto.userFirstName || "Customer",
      customerLastName: dto.userLastName || "N/A",
      basketTotal: dto.basketTotalUsd,
      passengerCount: dto.passengerCount || 1,
      currency: "USD",
      departureDate: dto.flightDate
        ? new Date(dto.flightDate).toISOString()
        : new Date().toISOString(),
      purchaseDate: new Date().toISOString(),
      opted: true, // we already gated it above
    });

    // ── Always persist to tbl_refund_shield so admin can see per-pax prices ──
    const bookingRef = dto.pnrCode || dto.bookingId || generateCrmBookingRef();
    const refundShieldFee = Math.round(dto.basketTotalUsd * 0.1 * 100) / 100;
    await this.refundShieldService.logToRefundShieldTable({
      bookingRef,
      refundStatus: "YES",
      refundPrice: refundShieldFee,
      adultCount: dto.adultCount ?? dto.passengerCount ?? 1,
      childCount: dto.childCount ?? 0,
      infantCount: dto.infantCount ?? 0,
      adultPrice: dto.adultPrice,
      childPrice: dto.childPrice,
      infantPrice: dto.infantPrice,
      grandTotal: dto.basketTotalUsd,
    });

    return { success: true, reported: result.success };
  }

  @Post("log-status")
  async logStatus(@Body() dto: LogRefundShieldStatusDto) {
    const bookingRef =
      dto.bookingRef || dto.booking_ref || generateCrmBookingRef();
    const dbHost = process.env.MYSQL_SERVER || "127.0.0.1";
    const isLocal = dbHost === "127.0.0.1" || dbHost === "localhost";
    this.logger.log(
      `[RefundShieldController] Logging local status to refund_shield table (${isLocal ? "LOCAL" : "LIVE"}) for booking ${bookingRef}`,
    );

    return await this.refundShieldService.logToRefundShieldTable({
      bookingRef,
      refundStatus: dto.refundStatus,
      refundPrice: dto.refundPrice,
      adultCount: dto.adultCount || 0,
      childCount: dto.childCount || 0,
      infantCount: dto.infantCount || 0,
      adultPrice: dto.adultPrice,
      childPrice: dto.childPrice,
      infantPrice: dto.infantPrice,
      grandTotal: dto.grandTotal || 0,
    });
  }
}
