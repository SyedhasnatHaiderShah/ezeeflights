import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { BookingService } from '../../booking/services/booking.service';
import { GeneratePnrDto } from '../dto/generate-pnr.dto';
import { IssueTicketDto } from '../dto/issue-ticket.dto';
import { PnrRecordEntity } from '../entities/ticketing.entity';
import { GdsProviderService } from '../providers/gds-provider.service';
import { PnrRepository } from '../repositories/pnr.repository';
import { TicketService } from './ticket.service';

@Injectable()
export class PnrService {
  constructor(
    private readonly bookingService: BookingService,
    private readonly pnrRepository: PnrRepository,
    private readonly ticketService: TicketService,
    private readonly providerService: GdsProviderService,
  ) {}

  async generatePnr(userId: string, dto: GeneratePnrDto): Promise<PnrRecordEntity> {
    const booking = await this.bookingService.getById(dto.bookingId, userId);
    if (booking.status !== 'CONFIRMED') {
      throw new BadRequestException('PNR can only be generated for confirmed bookings');
    }

    const existing = await this.pnrRepository.findByBookingId(dto.bookingId);
    if (existing) {
      return existing;
    }

    const provider = dto.provider ?? 'INTERNAL';
    const preferredCode = this.generatePnrCode();
    const driver = this.providerService.getDriver(provider);
    const providerPnr = await driver.createPNR(booking, preferredCode);

    const created = await this.pnrRepository.create(dto.bookingId, providerPnr.pnrCode, provider);
    if (!created) {
      throw new BadRequestException('Unable to create PNR');
    }

    return created;
  }

  async issueTickets(userId: string, dto: IssueTicketDto) {
    let pnr = dto.pnrCode ? await this.pnrRepository.findByCode(dto.pnrCode) : await this.pnrRepository.findByBookingId(dto.bookingId);
    if (!pnr) {
      pnr = await this.generatePnr(userId, { bookingId: dto.bookingId, provider: 'INTERNAL' });
    }

    if (!pnr) {
      throw new NotFoundException('PNR not found');
    }

    if (pnr.bookingId !== dto.bookingId) {
      throw new BadRequestException('PNR does not belong to the provided booking');
    }

    return this.ticketService.issueTickets(userId, dto.bookingId, pnr);
  }

  getTicketsByPnrCode(userId: string, pnrCode: string) {
    return this.ticketService.getByPnrCode(userId, pnrCode);
  }

  getTicketsByBookingId(userId: string, bookingId: string) {
    return this.ticketService.getByBookingId(userId, bookingId);
  }

  private generatePnrCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i += 1) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }
}
