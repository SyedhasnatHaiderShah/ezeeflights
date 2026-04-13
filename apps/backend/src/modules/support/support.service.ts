import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { NotificationService } from '../notification/services/notification.service';
import { UserService } from '../user/services/user.service';
import { AddMessageDto, CreateTicketDto } from './dto/support.dto';
import { SupportRepository } from './support.repository';
import { SupportTicket, TicketMessage, TicketStatus } from './support.entity';

@Injectable()
export class SupportService {
  constructor(
    private readonly repository: SupportRepository,
    private readonly userService: UserService,
    private readonly notifications: NotificationService,
  ) {}

  async createTicket(userId: string, dto: CreateTicketDto): Promise<SupportTicket> {
    const user = await this.userService.findOne(userId);
    const today = new Date();
    const dateKey = `${today.getUTCFullYear()}${String(today.getUTCMonth() + 1).padStart(2, '0')}${String(today.getUTCDate()).padStart(2, '0')}`;
    const prefix = `TKT-${dateKey}`;
    const count = await this.repository.getTicketNumberCountForDate(prefix);
    const ticketNumber = `${prefix}-${String(count + 1).padStart(4, '0')}`;

    const policy = await this.repository.getSlaPolicy(dto.priority ?? 'medium');
    const slaDeadline = policy ? new Date(Date.now() + policy.resolutionHours * 3600 * 1000) : null;

    const ticket = await this.repository.createTicket(userId, dto, ticketNumber, slaDeadline);
    await this.repository.addMessage(ticket.id, userId, false, {
      body: dto.description,
      attachments: dto.attachments,
    });

    const agent = await this.repository.getLeastLoadedAgent(dto.category);
    const assigned = agent ? await this.repository.assignAgent(ticket.id, agent.id) : ticket;

    if (user.email) {
      await this.notifications.send({
        userId,
        type: 'EMAIL',
        email: user.email,
        templateName: 'support-ticket-created',
        payload: {
          email: user.email,
          ticketNumber: assigned.ticketNumber,
          subject: assigned.subject,
          status: assigned.status,
        },
      });
    }

    return assigned;
  }

  async addMessage(userId: string, ticketId: string, dto: AddMessageDto, actorIsAgent = false): Promise<TicketMessage> {
    const ticket = await this.requireTicket(ticketId);

    if (!actorIsAgent && ticket.userId !== userId) {
      throw new ForbiddenException('You do not have access to this ticket');
    }

    const message = await this.repository.addMessage(ticketId, userId, actorIsAgent, dto);

    const shouldReopen = !actorIsAgent && ticket.status === 'waiting_customer';
    const shouldSetFirstResponse = actorIsAgent && !ticket.firstResponseAt;

    await this.repository.updateTicketMeta(ticketId, {
      status: shouldReopen ? 'in_progress' : undefined,
      firstResponseAt: shouldSetFirstResponse ? new Date() : undefined,
      updatedAt: true,
    });

    const recipientUserId = actorIsAgent ? ticket.userId : null;
    if (recipientUserId) {
      const recipient = await this.userService.findOne(recipientUserId);
      if (recipient.email) {
        await this.notifications.send({
          userId: recipientUserId,
          type: 'EMAIL',
          email: recipient.email,
          templateName: 'support-ticket-updated',
          payload: {
            email: recipient.email,
            ticketNumber: ticket.ticketNumber,
            subject: ticket.subject,
            bodyPreview: dto.body.slice(0, 120),
          },
        });
      }
    }

    return message;
  }

  resolveTicket(agentId: string, ticketId: string): Promise<SupportTicket> {
    return this.repository.updateStatus(ticketId, 'resolved');
  }

  async closeTicket(userId: string, ticketId: string, rating?: number, comment?: string): Promise<SupportTicket> {
    const ticket = await this.requireTicket(ticketId);
    if (ticket.userId !== userId) {
      throw new ForbiddenException('You do not have access to this ticket');
    }
    if (ticket.status !== 'resolved' && ticket.status !== 'closed') {
      throw new BadRequestException('Only resolved tickets can be closed');
    }
    return this.repository.closeTicket(ticketId, rating, comment);
  }

  getMyTickets(userId: string, status?: TicketStatus): Promise<SupportTicket[]> {
    return this.repository.findByUser(userId, status);
  }

  async getTicketById(id: string, userId: string): Promise<SupportTicket & { messages: TicketMessage[] }> {
    const ticket = await this.requireTicket(id);
    if (ticket.userId !== userId) {
      throw new ForbiddenException('You do not have access to this ticket');
    }
    const messages = await this.repository.getMessages(id);
    return {
      ...ticket,
      messages: messages.filter((msg) => !msg.isInternalNote),
    };
  }

  getAgentTickets(agentId: string, status?: TicketStatus): Promise<SupportTicket[]> {
    return this.repository.findByAgent(agentId, status);
  }

  async escalateTicket(ticketId: string): Promise<SupportTicket> {
    const ticket = await this.requireTicket(ticketId);
    if (ticket.status === 'closed') {
      throw new BadRequestException('Closed tickets cannot be escalated');
    }
    return this.repository.updateStatus(ticketId, 'in_progress');
  }

  async proactiveTicketCreation(bookingId: string, reason: string): Promise<SupportTicket> {
    const booking = await this.repository.getUserForBooking(bookingId);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    const ticket = await this.createTicket(booking.userId, {
      bookingId,
      category: 'flight_delay',
      subject: `Proactive support: ${reason}`,
      description: `We detected an issue with your booking and created this support ticket automatically. Reason: ${reason}`,
      priority: 'high',
      channel: 'web',
    });

    const user = await this.userService.findOne(booking.userId);
    if (user.email) {
      await this.notifications.send({
        userId: booking.userId,
        type: 'EMAIL',
        email: user.email,
        templateName: 'support-ticket-proactive',
        payload: { email: user.email, reason, ticketNumber: ticket.ticketNumber },
      });
    }

    return ticket;
  }

  getUnassignedQueue(limit?: number): Promise<SupportTicket[]> {
    return this.repository.findUnassigned(limit);
  }

  assignToAgent(ticketId: string, agentId: string): Promise<SupportTicket> {
    return this.repository.assignAgent(ticketId, agentId);
  }

  updateTicketStatus(ticketId: string, status: TicketStatus): Promise<SupportTicket> {
    return this.repository.updateStatus(ticketId, status);
  }

  getCannedResponses() {
    return this.repository.listCannedResponses();
  }

  getEscalationCandidates() {
    return this.repository.findEscalationCandidates();
  }

  private async requireTicket(ticketId: string): Promise<SupportTicket> {
    const ticket = await this.repository.findById(ticketId);
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }
    return ticket;
  }
}
