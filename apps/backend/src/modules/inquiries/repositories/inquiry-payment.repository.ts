import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { DataSource } from "typeorm";

export interface InquiryPaymentRecord {
  id: string;
  userId: string | null;
  amount: number;
  currency: string;
  paymentType: string;
  razorpayOrderId: string;
  razorpayPaymentId: string | null;
  status: string;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class InquiryPaymentRepository {
  constructor(private readonly dataSource: DataSource) {}

  private mapRow(row: Record<string, unknown>): InquiryPaymentRecord {
    const metadata =
      typeof row.metadata === "string"
        ? (JSON.parse(row.metadata) as Record<string, unknown>)
        : ((row.metadata as Record<string, unknown> | null) ?? null);

    return {
      id: String(row.id),
      userId: row.userId ? String(row.userId) : null,
      amount: Number(row.amount),
      currency: String(row.currency),
      paymentType: String(row.paymentType),
      razorpayOrderId: String(row.razorpayOrderId),
      razorpayPaymentId: row.razorpayPaymentId
        ? String(row.razorpayPaymentId)
        : null,
      status: String(row.status),
      metadata,
      createdAt: new Date(String(row.createdAt)),
      updatedAt: new Date(String(row.updatedAt)),
    };
  }

  async createPayment(data: {
    userId?: string;
    amount: number;
    currency: string;
    paymentType: string;
    razorpayOrderId: string;
    metadata?: Record<string, unknown>;
  }): Promise<InquiryPaymentRecord | null> {
    const id = randomUUID();
    await this.dataSource.query(
      `INSERT INTO tbl_flight_inquiry_payment
        (id, user_id, amount, currency, payment_type, razorpay_order_id, metadata)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.userId ?? null,
        data.amount,
        data.currency,
        data.paymentType,
        data.razorpayOrderId,
        JSON.stringify(data.metadata ?? {}),
      ],
    );

    return this.getByOrderId(data.razorpayOrderId);
  }

  async getByOrderId(orderId: string): Promise<InquiryPaymentRecord | null> {
    const rows: Record<string, unknown>[] = await this.dataSource.query(
      `SELECT
         id,
         user_id AS userId,
         amount,
         currency,
         payment_type AS paymentType,
         razorpay_order_id AS razorpayOrderId,
         razorpay_payment_id AS razorpayPaymentId,
         status,
         metadata,
         created_at AS createdAt,
         updated_at AS updatedAt
       FROM tbl_flight_inquiry_payment
       WHERE razorpay_order_id = ?
       LIMIT 1`,
      [orderId],
    );
    return rows.length ? this.mapRow(rows[0]) : null;
  }

  async markPaid(
    id: string,
    razorpayPaymentId: string,
  ): Promise<InquiryPaymentRecord | null> {
    await this.dataSource.query(
      `UPDATE tbl_flight_inquiry_payment
       SET status = 'successful',
           razorpay_payment_id = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [razorpayPaymentId, id],
    );

    const rows: Record<string, unknown>[] = await this.dataSource.query(
      `SELECT
         id,
         user_id AS userId,
         amount,
         currency,
         payment_type AS paymentType,
         razorpay_order_id AS razorpayOrderId,
         razorpay_payment_id AS razorpayPaymentId,
         status,
         metadata,
         created_at AS createdAt,
         updated_at AS updatedAt
       FROM tbl_flight_inquiry_payment
       WHERE id = ?
       LIMIT 1`,
      [id],
    );
    return rows.length ? this.mapRow(rows[0]) : null;
  }
}
