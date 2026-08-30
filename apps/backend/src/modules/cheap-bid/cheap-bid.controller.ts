import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { CheapBidService } from "./cheap-bid.service";

@ApiTags("Cheap Bid")
@Controller({ path: "cheap-bid", version: "1" })
export class CheapBidController {
  constructor(private readonly service: CheapBidService) {}

  @ApiOperation({ summary: "Search active cheap bid for a route" })
  @Get("search")
  async searchDeal(
    @Query("origin") origin: string,
    @Query("destination") destination: string,
  ) {
    return this.service.searchActiveDeal(origin, destination);
  }

  @ApiOperation({ summary: "Resolve cheap bid by shareable token" })
  @Get("token")
  async getByToken(@Query("token") token: string) {
    const offer = await this.service.findByToken(token);
    return this.service.toPublicView(offer);
  }

  @ApiOperation({ summary: "Create Razorpay deposit for a cheap bid" })
  @Post("deposit/create-order")
  async createDepositOrder(
    @Body()
    body: {
      userId?: string;
      dealId: string;
      departureDate: string;
      passengers: unknown[];
      origin?: string;
      destination?: string;
      currency?: string;
      depositAmount?: number;
    },
  ) {
    try {
      return await this.service.createDepositOrder(body);
    } catch (error: unknown) {
      if (error instanceof HttpException) throw error;
      const err = error as Error;
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: "INTERNAL_SERVER_ERROR",
          message: err.message || "Internal server error",
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: "Verify Razorpay payment for cheap bid deposit" })
  @Post("deposit/verify")
  async verifyPayment(
    @Body()
    body: {
      razorpayOrderId: string;
      razorpayPaymentId: string;
      razorpaySignature: string;
    },
  ) {
    return this.service.verifyPayment(body);
  }
}

/** @deprecated Use CheapBidController — kept for existing frontend routes */
@ApiTags("Bid Deals (legacy)")
@Controller({ path: "bid-deals", version: "1" })
export class CheapBidLegacyController {
  constructor(private readonly service: CheapBidService) {}

  @Get("search")
  searchDeal(
    @Query("origin") origin: string,
    @Query("destination") destination: string,
  ) {
    return this.service.searchActiveDeal(origin, destination);
  }

  @Post("deposit/create-order")
  createDepositOrder(
    @Body()
    body: {
      userId?: string;
      dealId: string;
      departureDate: string;
      passengers: unknown[];
      origin?: string;
      destination?: string;
      currency?: string;
      depositAmount?: number;
    },
  ) {
    return this.service.createDepositOrder(body);
  }

  @Post("deposit/verify")
  verifyPayment(
    @Body()
    body: {
      razorpayOrderId: string;
      razorpayPaymentId: string;
      razorpaySignature: string;
    },
  ) {
    return this.service.verifyPayment(body);
  }
}
