import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { NotificationService } from '../services/notification.service';
import { CreateTemplateDto, SendNotificationDto } from '../dto/send-notification.dto';
import { AdminGuard } from '../guards/admin.guard';
import { PriceAlertService } from '../price-alerts/price-alert.service';
import { PriceAlertType } from '../price-alerts/price-alert.entity';

interface AuthenticatedRequest {
  user: { userId: string };
}

@ApiTags('notifications')
@Controller({ path: 'notifications', version: '1' })
export class NotificationController {
  constructor(
    private readonly service: NotificationService,
    private readonly priceAlertService: PriceAlertService,
  ) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('send')
  send(@Body() dto: SendNotificationDto) {
    return this.service.send(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('price-alerts')
  createPriceAlert(
    @Req() req: AuthenticatedRequest,
    @Body() body: { type: PriceAlertType; searchParams: Record<string, unknown>; targetPrice: number; channels?: string[] },
  ) {
    return this.priceAlertService.create(req.user.userId, body.type, body.searchParams, body.targetPrice, body.channels);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('price-alerts/:id')
  async deletePriceAlert(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    await this.priceAlertService.delete(id, req.user.userId);
    return { ok: true };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('logs')
  logs() {
    return this.service.getLogs();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('templates')
  createTemplate(@Body() dto: CreateTemplateDto) {
    return this.service.createTemplate(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('templates')
  listTemplates() {
    return this.service.listTemplates();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getById(@Param('id') id: string) {
    return this.service.getById(id);
  }
}
