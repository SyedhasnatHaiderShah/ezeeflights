import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { NotificationService } from '../services/notification.service';
import { CreateTemplateDto, SendNotificationDto } from '../dto/send-notification.dto';
import { AdminGuard } from '../guards/admin.guard';
import { PriceAlertService } from '../price-alerts/price-alert.service';
import { PriceAlertType } from '../price-alerts/price-alert.entity';

interface AuthenticatedRequest {
  user: { userId: string };
}

@ApiTags('Notifications')
@Controller({ path: 'notifications', version: '1' })
export class NotificationController {
  constructor(
    private readonly service: NotificationService,
    private readonly priceAlertService: PriceAlertService,
  ) {}

  @ApiOperation({ summary: 'Send a notification to a user' })
  @ApiResponse({ status: 200, description: 'Notification sent' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('send')
  send(@Body() dto: SendNotificationDto) {
    return this.service.send(dto);
  }

  @ApiOperation({ summary: 'Create a price alert for flights or hotels' })
  @ApiResponse({ status: 201, description: 'Price alert created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('price-alerts')
  createPriceAlert(
    @Req() req: AuthenticatedRequest,
    @Body() body: { type: PriceAlertType; searchParams: Record<string, unknown>; targetPrice: number; channels?: string[] },
  ) {
    return this.priceAlertService.create(req.user.userId, body.type, body.searchParams, body.targetPrice, body.channels);
  }

  @ApiOperation({ summary: 'Delete a price alert' })
  @ApiParam({ name: 'id', description: 'Price alert UUID' })
  @ApiResponse({ status: 200, description: 'Price alert deleted' })
  @ApiResponse({ status: 404, description: 'Alert not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('price-alerts/:id')
  async deletePriceAlert(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    await this.priceAlertService.delete(id, req.user.userId);
    return { ok: true };
  }

  @ApiOperation({ summary: 'Get notification logs (admin)' })
  @ApiResponse({ status: 200, description: 'Notification log entries' })
  @ApiResponse({ status: 403, description: 'Forbidden — admin only' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('logs')
  logs() {
    return this.service.getLogs();
  }

  @ApiOperation({ summary: 'Create a notification template (admin)' })
  @ApiResponse({ status: 201, description: 'Template created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('templates')
  createTemplate(@Body() dto: CreateTemplateDto) {
    return this.service.createTemplate(dto);
  }

  @ApiOperation({ summary: 'List notification templates (admin)' })
  @ApiResponse({ status: 200, description: 'Array of templates' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('templates')
  listTemplates() {
    return this.service.listTemplates();
  }

  @ApiOperation({ summary: 'Get notification by ID' })
  @ApiParam({ name: 'id', description: 'Notification UUID' })
  @ApiResponse({ status: 200, description: 'Notification data' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getById(@Param('id') id: string) {
    return this.service.getById(id);
  }
}
