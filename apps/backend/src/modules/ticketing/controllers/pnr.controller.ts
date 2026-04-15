import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GeneratePnrDto } from '../dto/generate-pnr.dto';
import { IssueTicketDto } from '../dto/issue-ticket.dto';
import { PnrService } from '../services/pnr.service';

interface AuthenticatedRequest {
  user: { userId: string };
}

@ApiTags('Ticketing')
@Controller({ path: '/', version: '1' })
export class PnrController {
  constructor(private readonly service: PnrService) {}

  @ApiOperation({ summary: 'Generate PNR for a booking' })
  @ApiResponse({ status: 201, description: 'PNR generated' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('pnr/generate')
  generatePnr(@Req() req: AuthenticatedRequest, @Body() dto: GeneratePnrDto) {
    return this.service.generatePnr(req.user.userId, dto);
  }

  @ApiOperation({ summary: 'Issue tickets for a booking' })
  @ApiResponse({ status: 201, description: 'Tickets issued' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('tickets/issue')
  issueTickets(@Req() req: AuthenticatedRequest, @Body() dto: IssueTicketDto) {
    return this.service.issueTickets(req.user.userId, dto);
  }

  @ApiOperation({ summary: 'Get tickets by PNR code' })
  @ApiParam({ name: 'pnrCode', description: '6-character PNR code' })
  @ApiResponse({ status: 200, description: 'Array of tickets' })
  @ApiResponse({ status: 404, description: 'PNR not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('tickets/:pnrCode')
  getByPnrCode(@Req() req: AuthenticatedRequest, @Param('pnrCode') pnrCode: string) {
    return this.service.getTicketsByPnrCode(req.user.userId, pnrCode);
  }

  @ApiOperation({ summary: 'Get tickets by booking ID' })
  @ApiParam({ name: 'bookingId', description: 'Booking UUID' })
  @ApiResponse({ status: 200, description: 'Array of tickets' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('tickets/booking/:bookingId')
  getByBookingId(@Req() req: AuthenticatedRequest, @Param('bookingId') bookingId: string) {
    return this.service.getTicketsByBookingId(req.user.userId, bookingId);
  }
}
