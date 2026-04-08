import { BadRequestException, Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AiConvertPackageDto, AiGeneratePackageDto, AiReviewDto } from './dto/ai.dto';
import { AiItineraryService } from './ai.service';

interface AuthenticatedRequest {
  user: { userId: string; roles?: string[] };
}

@ApiTags('ai-itinerary')
@Controller({ path: 'admin/ai', version: '1' })
@UseGuards(ThrottlerGuard, JwtAuthGuard)
@ApiBearerAuth()
export class AiController {
  constructor(private readonly service: AiItineraryService) {}

  @Post('generate-package')
  generatePackage(@Req() req: AuthenticatedRequest, @Body() dto: AiGeneratePackageDto) {
    this.ensureAdmin(req);
    return this.service.generatePackage(req.user.userId, dto);
  }

  @Get('packages')
  listPackages(@Req() req: AuthenticatedRequest) {
    this.ensureAdmin(req);
    return this.service.list();
  }

  @Get('packages/:id')
  getPackageById(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    this.ensureAdmin(req);
    return this.service.getById(id);
  }

  @Post('packages/:id/approve')
  approve(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() dto: AiReviewDto) {
    this.ensureAdmin(req);
    return this.service.approve(id, dto.reviewerNotes);
  }

  @Post('packages/:id/reject')
  reject(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() dto: AiReviewDto) {
    this.ensureAdmin(req);
    return this.service.reject(id, dto.reviewerNotes);
  }

  @Post('packages/:id/convert')
  convert(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() dto: AiConvertPackageDto) {
    this.ensureAdmin(req);
    return this.service.convert(id, req.user.userId, dto);
  }

  private ensureAdmin(req: AuthenticatedRequest) {
    if (!(req.user.roles ?? []).includes('admin')) {
      throw new BadRequestException('Admin access required');
    }
  }
}
