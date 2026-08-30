import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InvoiceService } from './invoice.service';

class GenerateInvoiceDto {
  @IsUUID()
  bookingId!: string;
}

class RecordInvoicePaymentDto {
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsIn(['CARD', 'BNPL'])
  method!: 'CARD' | 'BNPL';

  @IsString()
  @IsNotEmpty()
  provider!: "STRIPE" | "PAYTABS" | "TABBY" | "TAMARA";

  @IsString()
  @IsNotEmpty()
  transactionId!: string;

  @IsIn(['PENDING', 'SUCCESS', 'FAILED'])
  status!: 'PENDING' | 'SUCCESS' | 'FAILED';
}

class RefundInvoiceDto {
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsString()
  @IsOptional()
  reason = 'Customer refund request';
}

interface AuthenticatedRequest {
  user: { userId: string };
}

@ApiTags('Billing')
@Controller({ path: 'invoices', version: '1' })
export class InvoiceController {
  constructor(private readonly service: InvoiceService) {}

  @ApiOperation({ summary: 'Generate invoice for booking' })
  @ApiResponse({ status: 201, description: 'Invoice generated' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('generate')
  generate(@Req() req: AuthenticatedRequest, @Body() dto: GenerateInvoiceDto) {
    return this.service.generateFromBooking(dto.bookingId, req.user.userId);
  }

  @ApiOperation({ summary: 'List invoices for a user' })
  @ApiParam({ name: 'userId', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'Array of invoices' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('user/:userId')
  listByUser(@Req() req: AuthenticatedRequest, @Param('userId') userId: string) {
    return this.service.listByUser(userId, req.user.userId);
  }

  @ApiOperation({ summary: 'Get invoice by ID' })
  @ApiParam({ name: 'id', description: 'Invoice UUID' })
  @ApiResponse({ status: 200, description: 'Invoice details' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getById(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.service.getInvoiceById(id, req.user.userId);
  }

  @ApiOperation({ summary: 'Record payment against an invoice' })
  @ApiParam({ name: 'id', description: 'Invoice UUID' })
  @ApiResponse({ status: 200, description: 'Payment recorded' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/pay')
  pay(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() dto: RecordInvoicePaymentDto) {
    return this.service.recordPayment(id, req.user.userId, dto);
  }

  @ApiOperation({ summary: 'Create refund for an invoice' })
  @ApiParam({ name: 'id', description: 'Invoice UUID' })
  @ApiResponse({ status: 200, description: 'Refund created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/refund')
  refund(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() dto: RefundInvoiceDto) {
    return this.service.createRefund(id, req.user.userId, dto.amount, dto.reason);
  }
}
