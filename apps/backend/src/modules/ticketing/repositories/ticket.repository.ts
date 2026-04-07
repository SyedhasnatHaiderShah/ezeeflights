import { Injectable } from '@nestjs/common';
import { PostgresClient } from '../../../database/postgres.client';
import { PnrWithTicketsEntity, TicketDocumentEntity, TicketEntity, TicketViewEntity } from '../entities/ticketing.entity';

@Injectable()
export class TicketRepository {
  constructor(private readonly db: PostgresClient) {}

  createTicket(params: {
    pnrId: string;
    ticketNumber: string;
    passengerId: string;
    flightId: string;
    issueDate: Date;
  }): Promise<TicketEntity | null> {
    return this.db.queryOne<TicketEntity>(
      `INSERT INTO tickets (pnr_id, ticket_number, passenger_id, flight_id, issue_date, status)
       VALUES ($1, $2, $3, $4, $5, 'ISSUED')
       RETURNING id, pnr_id as "pnrId", ticket_number as "ticketNumber", passenger_id as "passengerId",
         flight_id as "flightId", issue_date as "issueDate", status, created_at as "createdAt", updated_at as "updatedAt"`,
      [params.pnrId, params.ticketNumber, params.passengerId, params.flightId, params.issueDate],
    );
  }

  addDocument(ticketId: string, fileUrl: string): Promise<TicketDocumentEntity | null> {
    return this.db.queryOne<TicketDocumentEntity>(
      `INSERT INTO ticket_documents (ticket_id, file_url)
       VALUES ($1, $2)
       RETURNING id, ticket_id as "ticketId", file_url as "fileUrl", created_at as "createdAt", updated_at as "updatedAt"`,
      [ticketId, fileUrl],
    );
  }

  findTicketsByPnrCode(pnrCode: string): Promise<PnrWithTicketsEntity | null> {
    return this.db.withTransaction(async (client) => {
      const pnrRows = await client.query(
        `SELECT p.id, p.booking_id as "bookingId", p.pnr_code as "pnrCode", p.provider, p.status,
            p.created_at as "createdAt", p.updated_at as "updatedAt", b.user_id as "bookingUserId"
         FROM pnr_records p
         JOIN bookings b ON b.id = p.booking_id
         WHERE p.pnr_code = $1
         LIMIT 1`,
        [pnrCode],
      );

      if (pnrRows.rows.length === 0) {
        return null;
      }

      const pnr = pnrRows.rows[0] as PnrWithTicketsEntity;
      const ticketRows = await client.query(
        `SELECT t.id, t.pnr_id as "pnrId", t.ticket_number as "ticketNumber", t.passenger_id as "passengerId",
            t.flight_id as "flightId", t.issue_date as "issueDate", t.status,
            t.created_at as "createdAt", t.updated_at as "updatedAt",
            bp.full_name as "passengerName", bp.passport_number as "passportNumber", bp.seat_number as "seatNumber"
         FROM tickets t
         JOIN booking_passengers bp ON bp.id = t.passenger_id
         WHERE t.pnr_id = $1
         ORDER BY t.created_at ASC`,
        [pnr.id],
      );

      pnr.tickets = ticketRows.rows as TicketViewEntity[];
      return pnr;
    });
  }

  async hasTicketsForPnr(pnrId: string): Promise<boolean> {
    const row = await this.db.queryOne<{ id: string }>('SELECT id FROM tickets WHERE pnr_id = $1 LIMIT 1', [pnrId]);
    return !!row;
  }
}
