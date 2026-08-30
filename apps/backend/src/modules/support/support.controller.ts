import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AddMessageDto, CloseTicketDto, CreateTicketDto, UpdateTicketStatusDto } from './dto/support.dto';
import { SupportService } from './support.service';

interface AuthenticatedRequest {
  user: { userId: string; roles?: string[] };
}

@ApiTags('Support')
@Controller({ path: 'support', version: '1' })
export class SupportController {
  constructor(private readonly service: SupportService) {}

  @ApiOperation({ summary: 'Create support ticket' })
  @ApiResponse({ status: 201, description: 'Ticket created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('tickets')
  createTicket(@Req() req: AuthenticatedRequest, @Body() dto: CreateTicketDto) {
    return this.service.createTicket(req.user.userId, dto);
  }

  @ApiOperation({ summary: 'Get my support tickets' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by ticket status' })
  @ApiResponse({ status: 200, description: 'Array of tickets' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('tickets/me')
  getMyTickets(@Req() req: AuthenticatedRequest, @Query('status') status?: UpdateTicketStatusDto['status']) {
    return this.service.getMyTickets(req.user.userId, status);
  }

  @ApiOperation({ summary: 'Get unassigned ticket queue (agent)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Max tickets to return' })
  @ApiResponse({ status: 200, description: 'Queue of unassigned tickets' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('AGENT', 'SENIOR_AGENT', 'SUPERVISOR', 'ADMIN')
  @Get('tickets/queue')
  getUnassignedQueue(@Query('limit') limit?: string) {
    return this.service.getUnassignedQueue(limit ? Number(limit) : undefined);
  }

  @ApiOperation({ summary: 'Get tickets assigned to the current agent' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by ticket status' })
  @ApiResponse({ status: 200, description: 'Array of assigned tickets' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('AGENT', 'SENIOR_AGENT', 'SUPERVISOR', 'ADMIN')
  @Get('tickets/assigned')
  getAssignedTickets(@Req() req: AuthenticatedRequest, @Query('status') status?: UpdateTicketStatusDto['status']) {
    return this.service.getAgentTickets(req.user.userId, status);
  }

  @ApiOperation({ summary: 'Assign ticket to current agent' })
  @ApiParam({ name: 'id', description: 'Ticket UUID' })
  @ApiResponse({ status: 200, description: 'Ticket assigned' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('AGENT', 'SENIOR_AGENT', 'SUPERVISOR', 'ADMIN')
  @Patch('tickets/:id/assign')
  assignToSelf(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.service.assignToAgent(id, req.user.userId);
  }

  @ApiOperation({ summary: 'Update ticket status (agent)' })
  @ApiParam({ name: 'id', description: 'Ticket UUID' })
  @ApiResponse({ status: 200, description: 'Status updated' })
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

  @ApiOperation({ summary: 'Get canned responses list (agent)' })
  @ApiResponse({ status: 200, description: 'Array of canned responses' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('AGENT', 'SENIOR_AGENT', 'SUPERVISOR', 'ADMIN')
  @Get('canned-responses')
  getCannedResponses() {
    return this.service.getCannedResponses();
  }

  @ApiOperation({ summary: 'Get ticket by ID' })
  @ApiParam({ name: 'id', description: 'Ticket UUID' })
  @ApiResponse({ status: 200, description: 'Ticket detail' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('tickets/:id')
  getTicketById(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.service.getTicketById(id, req.user.userId);
  }

  @ApiOperation({ summary: 'Add message to a ticket' })
  @ApiParam({ name: 'id', description: 'Ticket UUID' })
  @ApiResponse({ status: 201, description: 'Message added' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('tickets/:id/messages')
  addMessage(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() dto: AddMessageDto) {
    const actorIsAgent = (req.user.roles ?? []).some((role) => ['AGENT', 'SENIOR_AGENT', 'SUPERVISOR', 'ADMIN'].includes(role));
    return this.service.addMessage(req.user.userId, id, dto, actorIsAgent);
  }

  @ApiOperation({ summary: 'Close ticket with optional rating' })
  @ApiParam({ name: 'id', description: 'Ticket UUID' })
  @ApiResponse({ status: 200, description: 'Ticket closed' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('tickets/:id/close')
  closeTicket(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() dto: CloseTicketDto) {
    return this.service.closeTicket(req.user.userId, id, dto.rating, dto.comment);
  }
}
