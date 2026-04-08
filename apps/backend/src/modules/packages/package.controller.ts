import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatePackageBookingDto, CreatePackageDto, packageQuerySchema, UpdatePackageDto, UpsertItineraryDto } from './dto/package.dto';
import { PackageBookingService } from './booking.service';
import { ItineraryService } from './itinerary.service';
import { PackageService } from './package.service';

interface AuthenticatedRequest {
  user: { userId: string; roles?: string[] };
}

@ApiTags('packages')
@Controller({ path: '', version: '1' })
export class PackageController {
  constructor(
    private readonly service: PackageService,
    private readonly itineraryService: ItineraryService,
    private readonly bookingService: PackageBookingService,
  ) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('admin/packages')
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreatePackageDto) {
    this.ensureAdmin(req);
    return this.service.create(req.user.userId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('admin/packages/:id')
  update(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() dto: UpdatePackageDto) {
    this.ensureAdmin(req);
    return this.service.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('admin/packages/:id')
  async remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    this.ensureAdmin(req);
    await this.service.delete(id);
    return { success: true };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('admin/packages')
  listAdmin(@Req() req: AuthenticatedRequest, @Query() query: Record<string, unknown>) {
    this.ensureAdmin(req);
    const parsed = packageQuerySchema.parse(query);
    return this.service.list(parsed, true);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('admin/packages/:id/itinerary')
  addItinerary(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() dto: UpsertItineraryDto) {
    this.ensureAdmin(req);
    return this.itineraryService.create(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('admin/itinerary/:id')
  updateItinerary(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() dto: UpsertItineraryDto) {
    this.ensureAdmin(req);
    return this.itineraryService.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('admin/itinerary/:id')
  async deleteItinerary(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    this.ensureAdmin(req);
    await this.itineraryService.delete(id);
    return { success: true };
  }

  @Get('packages')
  listUser(@Query() query: Record<string, unknown>) {
    const parsed = packageQuerySchema.parse(query);
    return this.service.list(parsed, false);
  }

  @Get('packages/:slug')
  getBySlug(@Param('slug') slug: string) {
    return this.service.getBySlug(slug);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('packages/:id/book')
  book(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() dto: CreatePackageBookingDto) {
    return this.bookingService.book(req.user.userId, id, dto);
  }

  private ensureAdmin(req: AuthenticatedRequest) {
    if (!(req.user.roles ?? []).includes('admin')) {
      throw new BadRequestException('Admin access required');
    }
  }
}
