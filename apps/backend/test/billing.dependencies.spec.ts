import { Test } from '@nestjs/testing';
import { NotificationService } from '../src/modules/notification/services/notification.service';
import { UserRepository } from '../src/modules/user/repositories/user.repository';
import { InvoiceRepository } from '../src/modules/billing/invoice.repository';
import { InvoiceService } from '../src/modules/billing/invoice.service';
import { PdfGeneratorService } from '../src/modules/billing/pdfGenerator.service';

describe('Billing dependency tests', () => {
  it('notification dependency: sends invoice notice with PDF payload', async () => {
    const send = jest.fn().mockResolvedValue({ id: 'n1' });
    const moduleRef = await Test.createTestingModule({
      providers: [
        InvoiceService,
        {
          provide: InvoiceRepository,
          useValue: {
            getInvoiceById: jest.fn().mockResolvedValue({
              id: 'inv1',
              userId: 'u1',
              bookingId: 'b1',
              invoiceNumber: 'EZF-INV-1',
              totalAmount: 105,
              vatAmount: 5,
              currency: 'AED',
              createdAt: new Date(),
              items: [{ description: 'Flight', quantity: 1, unitPrice: 105, totalPrice: 105 }],
              payments: [],
              creditNotes: [],
            }),
          },
        },
        { provide: UserRepository, useValue: { findById: jest.fn().mockResolvedValue({ firstName: 'A', lastName: 'B', email: 'a@b.com' }) } },
        { provide: NotificationService, useValue: { send } },
        { provide: PdfGeneratorService, useValue: { generateInvoicePdf: jest.fn().mockResolvedValue('/tmp/inv.pdf') } },
      ],
    }).compile();

    await moduleRef.get(InvoiceService).generatePdfAndNotify('inv1');

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'u1',
        type: 'EMAIL',
        templateName: 'invoice-generated',
      }),
    );
  });
});
