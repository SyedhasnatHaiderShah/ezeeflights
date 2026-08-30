import { BadRequestException, Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AiConvertPackageDto, AiGeneratePackageDto, AiReviewDto } from './dto/ai.dto';
import { AiItineraryService } from './ai.service';

interface AuthenticatedRequest {
  user: { userId: string; roles?: string[] };
}

@ApiTags('AI Itinerary')
@Controller({ path: 'admin/ai', version: '1' })
@UseGuards(ThrottlerGuard, JwtAuthGuard)
@ApiBearerAuth()
export class AiController {
  constructor(private readonly service: AiItineraryService) {}

  @ApiOperation({ summary: 'Generate an AI travel package (admin)' })
  @ApiResponse({ status: 201, description: 'AI package draft created' })
  @ApiResponse({ status: 400, description: 'Validation error or not admin' })
  @Post('generate-package')
  generatePackage(@Req() req: AuthenticatedRequest, @Body() dto: AiGeneratePackageDto) {
    this.ensureAdmin(req);
    return this.service.generatePackage(req.user.userId, dto);
  }

  @ApiOperation({ summary: 'List AI-generated packages (admin)' })
  @ApiResponse({ status: 200, description: 'Array of AI-generated packages' })
  @Get('packages')
  listPackages(@Req() req: AuthenticatedRequest) {
    this.ensureAdmin(req);
    return this.service.list();
  }

  @ApiOperation({ summary: 'Get AI-generated package by ID (admin)' })
  @ApiParam({ name: 'id', description: 'AI Package UUID' })
  @ApiResponse({ status: 200, description: 'AI package details' })
  @ApiResponse({ status: 404, description: 'Package not found' })
  @Get('packages/:id')
  getPackageById(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    this.ensureAdmin(req);
    return this.service.getById(id);
  }

  @ApiOperation({ summary: 'Approve AI-generated package (admin)' })
  @ApiParam({ name: 'id', description: 'AI Package UUID' })
  @ApiResponse({ status: 200, description: 'Package approved' })
  @Post('packages/:id/approve')
  approve(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() dto: AiReviewDto) {
    this.ensureAdmin(req);
    return this.service.approve(id, dto.reviewerNotes);
  }

  @ApiOperation({ summary: 'Reject AI-generated package (admin)' })
  @ApiParam({ name: 'id', description: 'AI Package UUID' })
  @ApiResponse({ status: 200, description: 'Package rejected' })
  @Post('packages/:id/reject')
  reject(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() dto: AiReviewDto) {
    this.ensureAdmin(req);
    return this.service.reject(id, dto.reviewerNotes);
  }

  @ApiOperation({ summary: 'Convert AI-generated package to published package (admin)' })
  @ApiParam({ name: 'id', description: 'AI Package UUID' })
  @ApiResponse({ status: 200, description: 'Package converted and published' })
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
