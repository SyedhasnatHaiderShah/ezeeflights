import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { NotificationService } from '../services/notification.service';
import { CreateTemplateDto, SendNotificationDto } from '../dto/send-notification.dto';
import { AdminGuard } from '../guards/admin.guard';

@ApiTags('notifications')
@Controller({ path: 'notifications', version: '1' })
export class NotificationController {
  constructor(private readonly service: NotificationService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('send')
  send(@Body() dto: SendNotificationDto) {
    return this.service.send(dto);
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
