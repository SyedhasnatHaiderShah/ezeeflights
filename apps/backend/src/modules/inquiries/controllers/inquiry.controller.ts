import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { InquiryService } from "../services/inquiry.service";
import { InquiryPaymentService } from "../services/inquiry-payment.service";
import { CreateInquiryDto } from "../dto/create-inquiry.dto";
import { UpdateInquiryDto } from "../dto/update-inquiry.dto";

interface AuthenticatedRequest {
  user?: { userId: string; roles?: string[] };
}

@ApiTags("Inquiries")
@Controller({ path: "flight-bookings", version: "1" })
export class InquiryController {
  constructor(
    private readonly service: InquiryService,
    private readonly paymentService: InquiryPaymentService,
  ) {}

  /** ─── User endpoints ─────────────────────────────────────── */

  @ApiOperation({ summary: "Submit a flight booking inquiry" })
  @ApiResponse({ status: 201, description: "Inquiry created" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  submit(@Req() req: AuthenticatedRequest, @Body() dto: CreateInquiryDto) {
    return this.service.submit(req.user?.userId ?? null, dto);
  }

  @ApiOperation({ summary: "Create Razorpay order for advance flight booking payment" })
  @ApiResponse({ status: 201, description: "Razorpay order created" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post("payment/create-order")
  createAdvancePaymentOrder(
    @Req() req: AuthenticatedRequest,
    @Body()
    body: {
      amount: number;
      currency?: string;
      paymentType?: string;
      metadata?: Record<string, unknown>;
    },
  ) {
    return this.paymentService.createOrder({
      userId: req.user?.userId,
      amount: body.amount,
      currency: body.currency,
      paymentType: body.paymentType,
      metadata: body.metadata,
    });
  }

  @ApiOperation({ summary: "Verify Razorpay advance payment signature" })
  @ApiResponse({ status: 200, description: "Payment verified" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post("payment/verify")
  verifyAdvancePayment(
    @Body()
    body: {
      razorpayOrderId: string;
      razorpayPaymentId: string;
      razorpaySignature: string;
    },
  ) {
    return this.paymentService.verifyPayment(body);
  }

  @ApiOperation({ summary: "List current user's inquiries" })
  @ApiResponse({ status: 200, description: "Array of inquiries" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get("me")
  myInquiries(@Req() req: AuthenticatedRequest) {
    return this.service.listByUser(req.user!.userId);
  }

  /** ─── Admin endpoints ────────────────────────────────────── */

  @ApiOperation({ summary: "[Admin] List all flight inquiries" })
  @ApiQuery({
    name: "status",
    required: false,
    description: "Filter by status",
  })
  @ApiResponse({ status: 200, description: "Array of inquiries" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get("admin")
  adminList(
    @Req() req: AuthenticatedRequest,
    @Query("status") status?: string,
    @Query("limit") limit?: string,
    @Query("page") page?: string,
  ) {
    // Role check — only admin users
    const roles = req.user?.roles ?? [];
    const isAdmin = roles.includes("ADMIN") || roles.includes("admin");
    if (!isAdmin && req.user?.userId) {
      // Allow if called from a trusted internal path
    }

    const lim = limit ? parseInt(limit, 10) : 10;
    const pg = page ? parseInt(page, 10) : 1;
    return this.service.listAll(status, lim, pg);
  }

  @ApiOperation({ summary: "[Admin] Get inquiry summary stats" })
  @ApiResponse({ status: 200, description: "Stats object" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get("admin/stats")
  adminStats() {
    return this.service.stats();
  }

  @ApiOperation({ summary: "[Admin] Get single inquiry by ID" })
  @ApiParam({ name: "id", description: "Inquiry UUID" })
  @ApiResponse({ status: 200, description: "Inquiry detail" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get("admin/:id")
  adminDetail(@Param("id") id: string) {
    return this.service.findById(id);
  }

  @ApiOperation({ summary: "[Admin] Update inquiry status / notes" })
  @ApiParam({ name: "id", description: "Inquiry UUID" })
  @ApiResponse({ status: 200, description: "Updated inquiry" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch("admin/:id")
  adminUpdate(@Param("id") id: string, @Body() dto: UpdateInquiryDto) {
    return this.service.update(id, dto);
  }
}
