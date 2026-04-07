import { Injectable } from '@nestjs/common';
import { PostgresClient } from '../../database/postgres.client';

export type InvoiceStatus = 'ISSUED' | 'PAID' | 'CANCELLED';
export type BillingPaymentMethod = 'CARD' | 'BNPL';

export interface InvoiceItemInput {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface InvoiceDetail {
  id: string;
  bookingId: string;
  userId: string;
  invoiceNumber: string;
  totalAmount: number;
  vatAmount: number;
  currency: string;
  status: InvoiceStatus;
  createdAt: Date;
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  payments: Array<{
    id: string;
    amount: number;
    method: BillingPaymentMethod;
    provider: string;
    status: string;
    transactionId: string | null;
    createdAt: Date;
  }>;
  creditNotes: Array<{
    id: string;
    amount: number;
    reason: string;
    createdAt: Date;
  }>;
}

@Injectable()
export class InvoiceRepository {
  constructor(private readonly db: PostgresClient) {}

  async findBookingInvoice(bookingId: string): Promise<{ id: string } | null> {
    return this.db.queryOne<{ id: string }>('SELECT id FROM invoices WHERE booking_id = $1 LIMIT 1', [bookingId]);
  }

  async getBookingSummary(bookingId: string): Promise<{ bookingId: string; userId: string; totalAmount: number; currency: string } | null> {
    return this.db.queryOne<{ bookingId: string; userId: string; totalAmount: number; currency: string }>(
      `SELECT id as "bookingId", user_id as "userId", total_amount::float8 as "totalAmount", currency
       FROM bookings
       WHERE id = $1
       LIMIT 1`,
      [bookingId],
    );
  }

  async createInvoice(payload: {
    bookingId: string;
    userId: string;
    invoiceNumber: string;
    totalAmount: number;
    vatAmount: number;
    currency: string;
    items: InvoiceItemInput[];
  }): Promise<{ id: string }> {
    return this.db.withTransaction(async (client) => {
      const invoiceResult = await client.query(
        `INSERT INTO invoices (booking_id, user_id, invoice_number, total_amount, vat_amount, currency, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'ISSUED')
         RETURNING id`,
        [payload.bookingId, payload.userId, payload.invoiceNumber, payload.totalAmount, payload.vatAmount, payload.currency],
      );

      const invoiceId = invoiceResult.rows[0].id as string;

      for (const item of payload.items) {
        const totalPrice = Number((item.quantity * item.unitPrice).toFixed(2));
        await client.query(
          `INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total_price)
           VALUES ($1, $2, $3, $4, $5)`,
          [invoiceId, item.description, item.quantity, item.unitPrice, totalPrice],
        );
      }

      return { id: invoiceId };
    });
  }

  async getInvoiceById(invoiceId: string): Promise<InvoiceDetail | null> {
    const invoice = await this.db.queryOne<{
      id: string;
      bookingId: string;
      userId: string;
      invoiceNumber: string;
      totalAmount: number;
      vatAmount: number;
      currency: string;
      status: InvoiceStatus;
      createdAt: Date;
    }>(
      `SELECT id, booking_id as "bookingId", user_id as "userId", invoice_number as "invoiceNumber",
          total_amount::float8 as "totalAmount", vat_amount::float8 as "vatAmount", currency, status,
          created_at as "createdAt"
       FROM invoices
       WHERE id = $1
       LIMIT 1`,
      [invoiceId],
    );

    if (!invoice) {
      return null;
    }

    const [items, payments, creditNotes] = await Promise.all([
      this.db.query<InvoiceDetail['items'][number]>(
        `SELECT id, description, quantity, unit_price::float8 as "unitPrice", total_price::float8 as "totalPrice"
         FROM invoice_items
         WHERE invoice_id = $1
         ORDER BY created_at ASC`,
        [invoiceId],
      ),
      this.db.query<InvoiceDetail['payments'][number]>(
        `SELECT id, amount::float8 as amount, method, provider, status, transaction_id as "transactionId", created_at as "createdAt"
         FROM payments
         WHERE invoice_id = $1
         ORDER BY created_at ASC`,
        [invoiceId],
      ),
      this.db.query<InvoiceDetail['creditNotes'][number]>(
        `SELECT id, amount::float8 as amount, reason, created_at as "createdAt"
         FROM credit_notes
         WHERE invoice_id = $1
         ORDER BY created_at ASC`,
        [invoiceId],
      ),
    ]);

    return { ...invoice, items, payments, creditNotes };
  }

  async getInvoiceByBookingId(bookingId: string): Promise<{ id: string } | null> {
    return this.db.queryOne<{ id: string }>('SELECT id FROM invoices WHERE booking_id = $1 LIMIT 1', [bookingId]);
  }

  async listInvoicesByUser(userId: string): Promise<InvoiceDetail[]> {
    const rows = await this.db.query<{ id: string }>(
      `SELECT id
       FROM invoices
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 200`,
      [userId],
    );

    const invoices = await Promise.all(rows.map((row) => this.getInvoiceById(row.id)));
    return invoices.filter((invoice): invoice is InvoiceDetail => !!invoice);
  }

  async createPayment(payload: {
    invoiceId: string;
    bookingId: string;
    userId: string;
    currency: string;
    amount: number;
    method: BillingPaymentMethod;
    provider: 'STRIPE' | 'PAYTABS' | 'TABBY' | 'TAMARA';
    status: 'PENDING' | 'SUCCESS' | 'FAILED';
    transactionId: string;
  }) {
    await this.db.query(
      `INSERT INTO payments (invoice_id, booking_id, user_id, amount, currency, method, provider, status, transaction_id, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, '{}'::jsonb)`,
      [payload.invoiceId, payload.bookingId, payload.userId, payload.amount, payload.currency, payload.method, payload.provider, payload.status, payload.transactionId],
    );

    const totals = await this.db.queryOne<{ paidTotal: number }>(
      `SELECT COALESCE(SUM(amount), 0)::float8 as "paidTotal"
       FROM payments
       WHERE invoice_id = $1 AND status = 'SUCCESS'`,
      [payload.invoiceId],
    );

    const invoice = await this.getInvoiceById(payload.invoiceId);
    if (invoice && totals && totals.paidTotal >= invoice.totalAmount) {
      await this.db.query(`UPDATE invoices SET status = 'PAID' WHERE id = $1`, [payload.invoiceId]);
    }
  }

  async createCreditNote(payload: { invoiceId: string; amount: number; reason: string }) {
    await this.db.query(
      `INSERT INTO credit_notes (invoice_id, amount, reason)
       VALUES ($1, $2, $3)`,
      [payload.invoiceId, payload.amount, payload.reason],
    );

    await this.db.query(
      `UPDATE invoices
       SET status = CASE WHEN $2 >= total_amount THEN 'CANCELLED' ELSE status END
       WHERE id = $1`,
      [payload.invoiceId, payload.amount],
    );
  }
}
