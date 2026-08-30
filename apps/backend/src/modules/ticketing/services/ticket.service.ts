import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as QRCode from 'qrcode';
import { BookingService } from '../../booking/services/booking.service';
import { NotificationService } from '../../notification/services/notification.service';
import { UserService } from '../../user/services/user.service';
import { PnrRecordEntity, PnrWithTicketsEntity, TicketEntity } from '../entities/ticketing.entity';
import { GdsProviderService } from '../providers/gds-provider.service';
import { PnrRepository } from '../repositories/pnr.repository';
import { TicketRepository } from '../repositories/ticket.repository';

@Injectable()
export class TicketService {
  constructor(
    private readonly bookingService: BookingService,
    private readonly pnrRepository: PnrRepository,
    private readonly ticketRepository: TicketRepository,
    private readonly providerService: GdsProviderService,
    private readonly notificationService: NotificationService,
    private readonly userService: UserService,
  ) {}

  async issueTickets(userId: string, bookingId: string, pnr: PnrRecordEntity): Promise<{ pnrCode: string; tickets: TicketEntity[] }> {
    const booking = await this.bookingService.getById(bookingId, userId);
    if (booking.paymentStatus !== 'PAID' || booking.status !== 'CONFIRMED') {
      throw new BadRequestException('Tickets can only be issued for paid and confirmed bookings');
    }

    const duplicate = await this.ticketRepository.hasTicketsForPnr(pnr.id);
    if (duplicate) {
      throw new BadRequestException('Tickets already issued for this PNR');
    }

    const driver = this.providerService.getDriver(pnr.provider);
    const created: TicketEntity[] = [];

    for (const passenger of booking.passengers) {
      for (const flight of booking.flights) {
        const preferredTicketNumber = this.generateTicketNumber();
        const gdsTicket = await driver.issueTicket({
          pnrCode: pnr.pnrCode,
          booking,
          passengerId: passenger.id,
          flightId: flight.flightId,
          preferredTicketNumber,
        });

        const ticket = await this.ticketRepository.createTicket({
          pnrId: pnr.id,
          ticketNumber: gdsTicket.ticketNumber,
          passengerId: passenger.id,
          flightId: flight.flightId,
          issueDate: new Date(),
        });

        if (!ticket) {
          throw new BadRequestException('Failed to persist ticket');
        }

        const pdf = await this.createTicketPdf({ pnrCode: pnr.pnrCode, ticketNumber: ticket.ticketNumber, passengerName: passenger.fullName, flightId: flight.flightId });
        await this.ticketRepository.addDocument(ticket.id, `data:application/pdf;base64,${pdf.toString('base64')}`);
        created.push(ticket);
      }
    }

    await this.pnrRepository.updateStatus(pnr.id, 'TICKETED');

    const user = await this.userService.findOne(userId);
    if (user.email) {
      await this.notificationService.send({
        userId,
        type: 'EMAIL',
        email: user.email,
        templateName: 'ticket-issued',
        payload: { pnrCode: pnr.pnrCode, ticketCount: created.length },
      });
    }

    return { pnrCode: pnr.pnrCode, tickets: created };
  }

  async getByPnrCode(userId: string, pnrCode: string): Promise<PnrWithTicketsEntity> {
    const record = await this.ticketRepository.findTicketsByPnrCode(pnrCode);
    if (!record) {
      throw new NotFoundException('PNR not found');
    }
    if (record.bookingUserId !== userId) {
      throw new UnauthorizedException('Access denied');
    }
    return record;
  }

  async getByBookingId(userId: string, bookingId: string): Promise<PnrWithTicketsEntity> {
    const pnr = await this.pnrRepository.findByBookingId(bookingId);
    if (!pnr) {
      throw new NotFoundException('PNR not found for booking');
    }
    return this.getByPnrCode(userId, pnr.pnrCode);
  }

  private generateTicketNumber(): string {
    const airlinePrefix = '176';
    const serial = `${Math.floor(Math.random() * 10 ** 10)}`.padStart(10, '0');
    return `${airlinePrefix}${serial}`;
  }

  private async createTicketPdf(data: {
    pnrCode: string;
    ticketNumber: string;
    passengerName: string;
    flightId: string;
  }): Promise<Buffer> {
    const qrCodeDataUrl = await QRCode.toDataURL(`${data.pnrCode}|${data.ticketNumber}`);
    const lines = [
      '%PDF-1.1',
      '1 0 obj<<>>endobj',
      '2 0 obj<<>>endobj',
      '3 0 obj<</Type/Page/Parent 2 0 R/Resources<<>>/Contents 4 0 R>>endobj',
      `4 0 obj<</Length 220>>stream\nBT /F1 12 Tf 50 750 Td (ezeeFlight E-Ticket) Tj T* (PNR: ${data.pnrCode}) Tj T* (Ticket: ${data.ticketNumber}) Tj T* (Passenger: ${data.passengerName}) Tj T* (Flight: ${data.flightId}) Tj T* (QR: ${qrCodeDataUrl.slice(0, 32)}...) Tj ET\nendstream endobj`,
      '5 0 obj<</Type/Catalog/Pages 2 0 R>>endobj',
      'xref',
      '0 6',
      '0000000000 65535 f ',
      '0000000010 00000 n ',
      '0000000050 00000 n ',
      '0000000090 00000 n ',
      '0000000160 00000 n ',
      '0000000430 00000 n ',
      'trailer<</Root 5 0 R/Size 6>>',
      'startxref',
      '480',
      '%%EOF',
    ];
    return Buffer.from(lines.join('\n'));
  }
}
