import { Injectable, NotFoundException } from '@nestjs/common';
import { PostgresClient } from '../../database/postgres.client';
import { AddMessageDto, CreateTicketDto } from './dto/support.dto';
import { CannedResponse, SlaPolicy, SupportAgent, SupportTicket, TicketMessage, TicketStatus } from './support.entity';

const TICKET_COLUMNS = `id,
  ticket_number as "ticketNumber",
  user_id as "userId",
  booking_id as "bookingId",
  assigned_agent_id as "assignedAgentId",
  category,
  subject,
  status,
  priority,
  channel,
  sla_deadline as "slaDeadline",
  first_response_at as "firstResponseAt",
  resolved_at as "resolvedAt",
  closed_at as "closedAt",
  satisfaction_rating as "satisfactionRating",
  satisfaction_comment as "satisfactionComment",
  tags,
  created_at as "createdAt",
  updated_at as "updatedAt"`;

@Injectable()
export class SupportRepository {
  constructor(private readonly db: PostgresClient) {}

  async createTicket(userId: string, dto: CreateTicketDto, ticketNumber: string, slaDeadline: Date | null): Promise<SupportTicket> {
    const ticket = await this.db.queryOne<SupportTicket>(
      `INSERT INTO support_tickets
        (ticket_number, user_id, booking_id, category, subject, priority, channel, sla_deadline)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING ${TICKET_COLUMNS}`,
      [ticketNumber, userId, dto.bookingId ?? null, dto.category, dto.subject, dto.priority ?? 'medium', dto.channel ?? 'web', slaDeadline],
    );

    if (!ticket) {
      throw new NotFoundException('Unable to create ticket');
    }

    return ticket;
  }

  findByUser(userId: string, status?: TicketStatus): Promise<SupportTicket[]> {
    const values: unknown[] = [userId];
    let where = 'WHERE user_id = $1';
    if (status) {
      values.push(status);
      where += ` AND status = $${values.length}`;
    }

    return this.db.query<SupportTicket>(
      `SELECT ${TICKET_COLUMNS}
       FROM support_tickets
       ${where}
       ORDER BY updated_at DESC
       LIMIT 100`,
      values,
    );
  }

  async findById(id: string): Promise<SupportTicket | null> {
    return this.db.queryOne<SupportTicket>(`SELECT ${TICKET_COLUMNS} FROM support_tickets WHERE id = $1 LIMIT 1`, [id]);
  }

  findUnassigned(limit = 50): Promise<SupportTicket[]> {
    return this.db.query<SupportTicket>(
      `SELECT ${TICKET_COLUMNS}
       FROM support_tickets
       WHERE assigned_agent_id IS NULL
         AND status IN ('open', 'in_progress')
       ORDER BY priority DESC, created_at ASC
       LIMIT $1`,
      [limit],
    );
  }

  findByAgent(agentId: string, status?: TicketStatus): Promise<SupportTicket[]> {
    const values: unknown[] = [agentId];
    let where = 'WHERE assigned_agent_id = $1';
    if (status) {
      values.push(status);
      where += ` AND status = $${values.length}`;
    }

    return this.db.query<SupportTicket>(
      `SELECT ${TICKET_COLUMNS}
       FROM support_tickets
       ${where}
       ORDER BY updated_at DESC
       LIMIT 100`,
      values,
    );
  }

  async addMessage(ticketId: string, senderId: string, isAgent: boolean, dto: AddMessageDto): Promise<TicketMessage> {
    const row = await this.db.queryOne<TicketMessage>(
      `INSERT INTO ticket_messages
        (ticket_id, sender_id, is_agent, is_internal_note, body, attachments)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb)
       RETURNING id,
         ticket_id as "ticketId",
         sender_id as "senderId",
         is_agent as "isAgent",
         is_internal_note as "isInternalNote",
         body,
         attachments,
         created_at as "createdAt"`,
      [ticketId, senderId, isAgent, dto.isInternalNote ?? false, dto.body, JSON.stringify(dto.attachments ?? [])],
    );

    if (!row) {
      throw new NotFoundException('Unable to add message');
    }

    return row;
  }

  getMessages(ticketId: string): Promise<TicketMessage[]> {
    return this.db.query<TicketMessage>(
      `SELECT id,
          ticket_id as "ticketId",
          sender_id as "senderId",
          is_agent as "isAgent",
          is_internal_note as "isInternalNote",
          body,
          attachments,
          created_at as "createdAt"
       FROM ticket_messages
       WHERE ticket_id = $1
       ORDER BY created_at ASC`,
      [ticketId],
    );
  }

  async updateStatus(id: string, status: TicketStatus): Promise<SupportTicket> {
    const row = await this.db.queryOne<SupportTicket>(
      `UPDATE support_tickets
       SET status = $2,
           resolved_at = CASE WHEN $2 = 'resolved' THEN NOW() ELSE resolved_at END,
           closed_at = CASE WHEN $2 = 'closed' THEN NOW() ELSE closed_at END,
           updated_at = NOW()
       WHERE id = $1
       RETURNING ${TICKET_COLUMNS}`,
      [id, status],
    );

    if (!row) {
      throw new NotFoundException('Ticket not found');
    }

    return row;
  }

  async assignAgent(ticketId: string, agentId: string): Promise<SupportTicket> {
    return this.db.withTransaction(async (client) => {
      const ticketRes = await client.query(
        `UPDATE support_tickets
         SET assigned_agent_id = $2,
             status = CASE WHEN status = 'open' THEN 'in_progress' ELSE status END,
             updated_at = NOW()
         WHERE id = $1
         RETURNING ${TICKET_COLUMNS}`,
        [ticketId, agentId],
      );

      if (ticketRes.rows.length === 0) {
        throw new NotFoundException('Ticket not found');
      }

      await client.query(
        `UPDATE support_agents
         SET current_ticket_count = current_ticket_count + 1
         WHERE id = $1`,
        [agentId],
      );

      return ticketRes.rows[0] as SupportTicket;
    });
  }

  findEscalationCandidates(): Promise<SupportTicket[]> {
    return this.db.query<SupportTicket>(
      `SELECT ${TICKET_COLUMNS}
       FROM support_tickets
       WHERE sla_deadline IS NOT NULL
         AND sla_deadline < NOW()
         AND status NOT IN ('resolved', 'closed')
       ORDER BY sla_deadline ASC`,
    );
  }

  getSlaPolicy(priority: string): Promise<SlaPolicy | null> {
    return this.db.queryOne<SlaPolicy>(
      `SELECT id, name, priority, first_response_hours as "firstResponseHours", resolution_hours as "resolutionHours", is_active as "isActive"
       FROM sla_policies
       WHERE priority = $1
         AND is_active = true
       LIMIT 1`,
      [priority],
    );
  }

  getLeastLoadedAgent(category: string): Promise<SupportAgent | null> {
    return this.db.queryOne<SupportAgent>(
      `SELECT id,
          user_id as "userId",
          agent_role as "agentRole",
          is_available as "isAvailable",
          current_ticket_count as "currentTicketCount",
          max_tickets as "maxTickets",
          specializations,
          created_at as "createdAt"
       FROM support_agents
       WHERE is_available = true
         AND current_ticket_count < max_tickets
         AND (specializations = '[]'::jsonb OR specializations ? $1)
       ORDER BY current_ticket_count ASC, created_at ASC
       LIMIT 1`,
      [category],
    );
  }

  async updateTicketMeta(ticketId: string, values: { firstResponseAt?: Date; status?: TicketStatus; updatedAt?: boolean }): Promise<void> {
    const sets: string[] = [];
    const params: unknown[] = [ticketId];

    if (values.firstResponseAt) {
      params.push(values.firstResponseAt);
      sets.push(`first_response_at = $${params.length}`);
    }
    if (values.status) {
      params.push(values.status);
      sets.push(`status = $${params.length}`);
    }

    if (values.updatedAt !== false) {
      sets.push('updated_at = NOW()');
    }

    if (!sets.length) {
      return;
    }

    await this.db.query(`UPDATE support_tickets SET ${sets.join(', ')} WHERE id = $1`, params);
  }

  async closeTicket(id: string, rating?: number, comment?: string): Promise<SupportTicket> {
    const row = await this.db.queryOne<SupportTicket>(
      `UPDATE support_tickets
       SET status = 'closed',
           closed_at = NOW(),
           satisfaction_rating = COALESCE($2, satisfaction_rating),
           satisfaction_comment = COALESCE($3, satisfaction_comment),
           updated_at = NOW()
       WHERE id = $1
       RETURNING ${TICKET_COLUMNS}`,
      [id, rating ?? null, comment ?? null],
    );
    if (!row) {
      throw new NotFoundException('Ticket not found');
    }
    return row;
  }

  listCannedResponses(): Promise<CannedResponse[]> {
    return this.db.query<CannedResponse>(
      `SELECT id, title, body, category, is_active as "isActive"
       FROM canned_responses
       WHERE is_active = true
       ORDER BY title ASC`,
    );
  }

  async getTicketNumberCountForDate(prefix: string): Promise<number> {
    const row = await this.db.queryOne<{ count: string }>(
      `SELECT COUNT(*)::text as count
       FROM support_tickets
       WHERE ticket_number LIKE $1`,
      [`${prefix}-%`],
    );
    return Number(row?.count ?? 0);
  }

  async getUserForBooking(bookingId: string): Promise<{ userId: string } | null> {
    return this.db.queryOne<{ userId: string }>(
      `SELECT user_id as "userId"
       FROM bookings
       WHERE id = $1
       LIMIT 1`,
      [bookingId],
    );
  }
}
