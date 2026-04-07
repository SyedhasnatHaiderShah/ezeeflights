import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
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

@ApiTags('billing')
@Controller({ path: 'invoices', version: '1' })
export class InvoiceController {
  constructor(private readonly service: InvoiceService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Generate invoice for booking' })
  @Post('generate')
  generate(@Req() req: AuthenticatedRequest, @Body() dto: GenerateInvoiceDto) {
    return this.service.generateFromBooking(dto.bookingId, req.user.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('user/:userId')
  listByUser(@Req() req: AuthenticatedRequest, @Param('userId') userId: string) {
    return this.service.listByUser(userId, req.user.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getById(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.service.getInvoiceById(id, req.user.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/pay')
  pay(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() dto: RecordInvoicePaymentDto) {
    return this.service.recordPayment(id, req.user.userId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/refund')
  refund(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() dto: RefundInvoiceDto) {
    return this.service.createRefund(id, req.user.userId, dto.amount, dto.reason);
  }
}
