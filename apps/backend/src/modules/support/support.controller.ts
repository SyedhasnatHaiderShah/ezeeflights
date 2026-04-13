import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AddMessageDto, CloseTicketDto, CreateTicketDto, UpdateTicketStatusDto } from './dto/support.dto';
import { SupportService } from './support.service';

interface AuthenticatedRequest {
  user: { userId: string; roles?: string[] };
}

@ApiTags('support')
@Controller({ path: 'support', version: '1' })
export class SupportController {
  constructor(private readonly service: SupportService) {}

  @ApiOperation({ summary: 'Create support ticket' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('tickets')
  createTicket(@Req() req: AuthenticatedRequest, @Body() dto: CreateTicketDto) {
    return this.service.createTicket(req.user.userId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('tickets/me')
  getMyTickets(@Req() req: AuthenticatedRequest, @Query('status') status?: UpdateTicketStatusDto['status']) {
    return this.service.getMyTickets(req.user.userId, status);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('AGENT', 'SENIOR_AGENT', 'SUPERVISOR', 'ADMIN')
  @Get('tickets/queue')
  getUnassignedQueue(@Query('limit') limit?: string) {
    return this.service.getUnassignedQueue(limit ? Number(limit) : undefined);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('AGENT', 'SENIOR_AGENT', 'SUPERVISOR', 'ADMIN')
  @Get('tickets/assigned')
  getAssignedTickets(@Req() req: AuthenticatedRequest, @Query('status') status?: UpdateTicketStatusDto['status']) {
    return this.service.getAgentTickets(req.user.userId, status);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('AGENT', 'SENIOR_AGENT', 'SUPERVISOR', 'ADMIN')
  @Patch('tickets/:id/assign')
  assignToSelf(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.service.assignToAgent(id, req.user.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('AGENT', 'SENIOR_AGENT', 'SUPERVISOR', 'ADMIN')
  @Patch('tickets/:id/status')
  updateStatus(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() dto: UpdateTicketStatusDto) {
    if (dto.status === 'resolved') {
      return this.service.resolveTicket(req.user.userId, id);
    }
    return this.service.updateTicketStatus(id, dto.status);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('AGENT', 'SENIOR_AGENT', 'SUPERVISOR', 'ADMIN')
  @Get('canned-responses')
  getCannedResponses() {
    return this.service.getCannedResponses();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('tickets/:id')
  getTicketById(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.service.getTicketById(id, req.user.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('tickets/:id/messages')
  addMessage(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() dto: AddMessageDto) {
    const actorIsAgent = (req.user.roles ?? []).some((role) => ['AGENT', 'SENIOR_AGENT', 'SUPERVISOR', 'ADMIN'].includes(role));
    return this.service.addMessage(req.user.userId, id, dto, actorIsAgent);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('tickets/:id/close')
  closeTicket(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() dto: CloseTicketDto) {
    return this.service.closeTicket(req.user.userId, id, dto.rating, dto.comment);
  }
}
