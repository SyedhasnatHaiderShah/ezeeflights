import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { NotificationService } from '../src/modules/notification/services/notification.service';
import { UserRepository } from '../src/modules/user/repositories/user.repository';
import { InvoiceRepository } from '../src/modules/billing/invoice.repository';
import { InvoiceService } from '../src/modules/billing/invoice.service';
import { PdfGeneratorService } from '../src/modules/billing/pdfGenerator.service';

describe('Billing service', () => {
  it('calculates UAE VAT at 5% from VAT-inclusive amounts', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        InvoiceService,
        { provide: InvoiceRepository, useValue: {} },
        { provide: UserRepository, useValue: {} },
        { provide: NotificationService, useValue: {} },
        { provide: PdfGeneratorService, useValue: {} },
      ],
    }).compile();

    const service = moduleRef.get(InvoiceService);
    expect(service.calculateVat(105)).toBe(5);
    expect(service.calculateVat(210)).toBe(10);
  });

  it('generates invoice once for a booking and reuses existing invoice', async () => {
    const repository = {
      findBookingInvoice: jest
        .fn()
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: 'inv-1' }),
      getBookingSummary: jest.fn().mockResolvedValue({ bookingId: 'b1', userId: 'u1', totalAmount: 105, currency: 'AED' }),
      createInvoice: jest.fn().mockResolvedValue({ id: 'inv-1' }),
      getInvoiceById: jest.fn().mockResolvedValue({
        id: 'inv-1',
        userId: 'u1',
        bookingId: 'b1',
        invoiceNumber: 'EZF-INV-1',
        totalAmount: 105,
        vatAmount: 5,
        currency: 'AED',
        createdAt: new Date(),
        status: 'ISSUED',
        items: [{ description: 'item', quantity: 1, unitPrice: 105, totalPrice: 105 }],
        payments: [],
        creditNotes: [],
      }),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        InvoiceService,
        { provide: InvoiceRepository, useValue: repository },
        { provide: UserRepository, useValue: { findById: jest.fn().mockResolvedValue({ email: null }) } },
        { provide: NotificationService, useValue: { send: jest.fn() } },
        { provide: PdfGeneratorService, useValue: { generateInvoicePdf: jest.fn().mockResolvedValue('/tmp/a.pdf') } },
      ],
    }).compile();

    const service = moduleRef.get(InvoiceService);
    await service.generateFromBooking('b1', 'u1');
    await service.generateFromBooking('b1', 'u1');

    expect(repository.createInvoice).toHaveBeenCalledTimes(1);
  });

  it('rejects negative vat input', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        InvoiceService,
        { provide: InvoiceRepository, useValue: {} },
        { provide: UserRepository, useValue: {} },
        { provide: NotificationService, useValue: {} },
        { provide: PdfGeneratorService, useValue: {} },
      ],
    }).compile();

    const service = moduleRef.get(InvoiceService);
    expect(() => service.calculateVat(-1)).toThrow(BadRequestException);
  });
});
