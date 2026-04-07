import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GeneratePnrDto } from '../dto/generate-pnr.dto';
import { IssueTicketDto } from '../dto/issue-ticket.dto';
import { PnrService } from '../services/pnr.service';

interface AuthenticatedRequest {
  user: { userId: string };
}

@ApiTags('ticketing')
@Controller({ path: '/', version: '1' })
export class PnrController {
  constructor(private readonly service: PnrService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('pnr/generate')
  generatePnr(@Req() req: AuthenticatedRequest, @Body() dto: GeneratePnrDto) {
    return this.service.generatePnr(req.user.userId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('tickets/issue')
  issueTickets(@Req() req: AuthenticatedRequest, @Body() dto: IssueTicketDto) {
    return this.service.issueTickets(req.user.userId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('tickets/:pnrCode')
  getByPnrCode(@Req() req: AuthenticatedRequest, @Param('pnrCode') pnrCode: string) {
    return this.service.getTicketsByPnrCode(req.user.userId, pnrCode);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('tickets/booking/:bookingId')
  getByBookingId(@Req() req: AuthenticatedRequest, @Param('bookingId') bookingId: string) {
    return this.service.getTicketsByBookingId(req.user.userId, bookingId);
  }
}
