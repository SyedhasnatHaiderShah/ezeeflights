import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '../user/repositories/user.repository';
import { NotificationService } from '../notification/services/notification.service';
import { InvoiceRepository } from './invoice.repository';
import { PdfGeneratorService } from './pdfGenerator.service';

@Injectable()
export class InvoiceService {
  constructor(
    private readonly repository: InvoiceRepository,
    private readonly userRepository: UserRepository,
    private readonly notificationService: NotificationService,
    private readonly pdfGenerator: PdfGeneratorService,
  ) {}

  calculateVat(amount: number, vatRatePercent = Number(process.env.UAE_VAT_PERCENT ?? 5)): number {
    if (!Number.isFinite(amount) || amount < 0) {
      throw new BadRequestException('Amount must be a non-negative number');
    }
    const value = (amount * vatRatePercent) / (100 + vatRatePercent);
    return Number(value.toFixed(2));
  }

  async generateFromBooking(bookingId: string, requestUserId?: string) {
    const existing = await this.repository.findBookingInvoice(bookingId);
    if (existing) {
      return this.getInvoiceById(existing.id);
    }

    const booking = await this.repository.getBookingSummary(bookingId);
    if (requestUserId && booking && booking.userId !== requestUserId) {
      throw new UnauthorizedException('Cannot generate invoice for another user booking');
    }
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    const vatAmount = this.calculateVat(booking.totalAmount);
    const invoice = await this.repository.createInvoice({
      bookingId,
      userId: booking.userId,
      invoiceNumber: this.generateInvoiceNumber(),
      totalAmount: Number(booking.totalAmount.toFixed(2)),
      vatAmount,
      currency: booking.currency,
      items: [
        {
          description: `Flight booking ${booking.bookingId}`,
          quantity: 1,
          unitPrice: Number(booking.totalAmount.toFixed(2)),
        },
      ],
    });

    const detailed = await this.getInvoiceById(invoice.id);
    await this.generatePdfAndNotify(detailed.id);
    return detailed;
  }

  async getInvoiceById(invoiceId: string, requestUserId?: string) {
    const invoice = await this.repository.getInvoiceById(invoiceId);
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (requestUserId && invoice.userId !== requestUserId) {
      throw new UnauthorizedException('Access denied to requested invoice');
    }

    return invoice;
  }

  async listByUser(userId: string, requestUserId: string) {
    if (userId !== requestUserId) {
      throw new UnauthorizedException('Cannot access another user invoices');
    }

    return this.repository.listInvoicesByUser(userId);
  }

  async recordPayment(
    invoiceId: string,
    userId: string,
    payload: {
      amount: number;
      method: 'CARD' | 'BNPL';
      provider: 'STRIPE' | 'PAYTABS' | 'TABBY' | 'TAMARA';
      transactionId: string;
      status: 'PENDING' | 'SUCCESS' | 'FAILED';
    },
  ) {
    const invoice = await this.getInvoiceById(invoiceId, userId);

    if (payload.amount <= 0) {
      throw new BadRequestException('Payment amount must be positive');
    }

    await this.repository.createPayment({
      invoiceId: invoice.id,
      amount: Number(payload.amount.toFixed(2)),
      method: payload.method,
      bookingId: invoice.bookingId,
      userId: invoice.userId,
      currency: invoice.currency,
      provider: payload.provider,
      transactionId: payload.transactionId,
      status: payload.status,
    });

    return this.getInvoiceById(invoiceId, userId);
  }

  async createRefund(invoiceId: string, userId: string, amount: number, reason: string) {
    const invoice = await this.getInvoiceById(invoiceId, userId);
    if (amount <= 0 || amount > invoice.totalAmount) {
      throw new BadRequestException('Invalid refund amount');
    }

    await this.repository.createCreditNote({
      invoiceId: invoice.id,
      amount: Number(amount.toFixed(2)),
      reason,
    });

    return this.getInvoiceById(invoice.id, userId);
  }

  async generatePdfAndNotify(invoiceId: string) {
    const invoice = await this.getInvoiceById(invoiceId);
    const user = await this.userRepository.findById(invoice.userId);
    if (!user?.email) {
      return null;
    }

    const pdfPath = await this.pdfGenerator.generateInvoicePdf({
      invoiceNumber: invoice.invoiceNumber,
      createdAt: invoice.createdAt,
      bookingId: invoice.bookingId,
      currency: invoice.currency,
      totalAmount: invoice.totalAmount,
      vatAmount: invoice.vatAmount,
      customerName: `${user.firstName} ${user.lastName ?? ''}`.trim() || user.email,
      customerEmail: user.email,
      items: invoice.items,
    });

    await this.notificationService.send({
      userId: invoice.userId,
      type: 'EMAIL',
      email: user.email,
      templateName: 'invoice-generated',
      payload: { invoiceNumber: invoice.invoiceNumber, pdfPath, totalAmount: invoice.totalAmount, currency: invoice.currency, email: user.email },
    });

    return { pdfPath };
  }

  private generateInvoiceNumber(): string {
    return `EZF-INV-${Date.now()}`;
  }
}
