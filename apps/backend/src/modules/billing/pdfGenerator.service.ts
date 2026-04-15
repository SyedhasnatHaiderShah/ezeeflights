import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

interface PdfInvoiceModel {
  invoiceNumber: string;
  createdAt: Date;
  bookingId: string;
  currency: string;
  totalAmount: number;
  vatAmount: number;
  customerName: string;
  customerEmail: string;
  items: Array<{ description: string; quantity: number; unitPrice: number; totalPrice: number }>;
}

@Injectable()
export class PdfGeneratorService {
  async generateInvoicePdf(data: PdfInvoiceModel): Promise<string> {
    const storagePath = process.env.BILLING_PDF_STORAGE_PATH ?? path.join(process.cwd(), 'tmp', 'invoices');
    await fs.mkdir(storagePath, { recursive: true });

    const filePath = path.join(storagePath, `${data.invoiceNumber}.pdf`);
    const contentLines = this.buildContentLines(data);
    const pdf = this.buildPdf(contentLines.join('\n'));
    await fs.writeFile(filePath, pdf);

    return filePath;
  }

  private buildContentLines(data: PdfInvoiceModel): string[] {
    const subtotal = Number((data.totalAmount - data.vatAmount).toFixed(2));
    const lines = [
      'Tax Invoice',
      `Invoice #: ${data.invoiceNumber}`,
      `Date: ${data.createdAt.toISOString().slice(0, 10)}`,
      `Booking ID: ${data.bookingId}`,
      `Customer: ${data.customerName}`,
      `Email: ${data.customerEmail}`,
      '--- Items ---',
      ...data.items.map(
        (item) => `${item.description} x${item.quantity} @ ${item.unitPrice.toFixed(2)} = ${item.totalPrice.toFixed(2)} ${data.currency}`,
      ),
      `Subtotal: ${subtotal.toFixed(2)} ${data.currency}`,
      `VAT (5% UAE): ${data.vatAmount.toFixed(2)} ${data.currency}`,
      `Total: ${data.totalAmount.toFixed(2)} ${data.currency}`,
      `Supplier VAT TRN: ${process.env.SUPPLIER_VAT_TRN ?? 'Not Registered'}`,
    ];

    return lines.map((line) => line.replace(/[()\\]/g, ''));
  }

  private buildPdf(text: string): Buffer {
    const streamText = `BT /F1 11 Tf 50 780 Td 14 TL (${text.split('\n').join(') Tj T* (')}) Tj ET`;
    const objects = [
      '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
      '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
      '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj',
      '4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
      `5 0 obj << /Length ${Buffer.byteLength(streamText, 'utf8')} >> stream\n${streamText}\nendstream endobj`,
    ];

    let pdf = '%PDF-1.4\n';
    const offsets: number[] = [0];
    for (const obj of objects) {
      offsets.push(Buffer.byteLength(pdf, 'utf8'));
      pdf += `${obj}\n`;
    }

    const xrefStart = Buffer.byteLength(pdf, 'utf8');
    pdf += `xref\n0 ${objects.length + 1}\n`;
    pdf += '0000000000 65535 f \n';
    for (let i = 1; i <= objects.length; i += 1) {
      pdf += `${offsets[i].toString().padStart(10, '0')} 00000 n \n`;
    }
    pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

    return Buffer.from(pdf, 'utf8');
  }
}
