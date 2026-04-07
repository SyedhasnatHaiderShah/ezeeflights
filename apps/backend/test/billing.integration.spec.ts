import { Test } from '@nestjs/testing';
import { NotificationService } from '../src/modules/notification/services/notification.service';
import { UserRepository } from '../src/modules/user/repositories/user.repository';
import { InvoiceRepository } from '../src/modules/billing/invoice.repository';
import { InvoiceService } from '../src/modules/billing/invoice.service';
import { PdfGeneratorService } from '../src/modules/billing/pdfGenerator.service';

describe('Billing integration flow', () => {
  it('booking -> invoice -> payment -> refund flow', async () => {
    const state: { invoice: { id: string; userId: string; bookingId: string; invoiceNumber: string; totalAmount: number; vatAmount: number; currency: string; status: string; createdAt: Date; items: Array<{ id: string; description: string; quantity: number; unitPrice: number; totalPrice: number }>; payments: Array<{ id: string; invoiceId: string; amount: number; method: "CARD" | "BNPL"; provider: string; status: "PENDING" | "SUCCESS" | "FAILED"; transactionId: string; createdAt: Date }>; creditNotes: Array<{ id: string; invoiceId: string; amount: number; reason: string; createdAt: Date }> } } = {
      invoice: {
        id: 'inv-1',
        userId: 'u1',
        bookingId: 'b1',
        invoiceNumber: 'EZF-INV-1',
        totalAmount: 105,
        vatAmount: 5,
        currency: 'AED',
        status: 'ISSUED',
        createdAt: new Date(),
        items: [{ id: 'ii-1', description: 'Flight', quantity: 1, unitPrice: 105, totalPrice: 105 }],
        payments: [],
        creditNotes: [],
      },
    };

    const repo = {
      findBookingInvoice: jest.fn().mockResolvedValue(null),
      getBookingSummary: jest.fn().mockResolvedValue({ bookingId: 'b1', userId: 'u1', totalAmount: 105, currency: 'AED' }),
      createInvoice: jest.fn().mockResolvedValue({ id: 'inv-1' }),
      getInvoiceById: jest.fn(async () => state.invoice),
      createPayment: jest.fn(async (p: { invoiceId: string; amount: number; method: "CARD" | "BNPL"; provider: string; status: "PENDING" | "SUCCESS" | "FAILED"; transactionId: string }) => {
        state.invoice.payments.push({ ...p, id: 'pay-1', createdAt: new Date() });
        if (p.status === 'SUCCESS' && p.amount >= state.invoice.totalAmount) {
          state.invoice.status = 'PAID';
        }
      }),
      createCreditNote: jest.fn(async (c: { invoiceId: string; amount: number; reason: string }) => {
        state.invoice.creditNotes.push({ ...c, id: 'cn-1', createdAt: new Date() });
      }),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        InvoiceService,
        { provide: InvoiceRepository, useValue: repo },
        { provide: UserRepository, useValue: { findById: jest.fn().mockResolvedValue({ firstName: 'A', lastName: 'B', email: 'user@test.com' }) } },
        { provide: NotificationService, useValue: { send: jest.fn() } },
        { provide: PdfGeneratorService, useValue: { generateInvoicePdf: jest.fn().mockResolvedValue('/tmp/inv.pdf') } },
      ],
    }).compile();

    const service = moduleRef.get(InvoiceService);

    const generated = await service.generateFromBooking('b1', 'u1');
    expect(generated.id).toBe('inv-1');

    const paid = await service.recordPayment('inv-1', 'u1', {
      amount: 105,
      method: 'CARD',
      provider: 'STRIPE',
      transactionId: 'txn-1',
      status: 'SUCCESS',
    });
    expect(paid.status).toBe('PAID');

    const refunded = await service.createRefund('inv-1', 'u1', 25, 'schedule change');
    expect(refunded.creditNotes).toHaveLength(1);
  });
});
