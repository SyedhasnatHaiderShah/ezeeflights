import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatePackageBookingDto, CreatePackageDto, packageQuerySchema, UpdatePackageDto, UpsertItineraryDto } from './dto/package.dto';
import { PackageBookingService } from './booking.service';
import { ItineraryService } from './itinerary.service';
import { PackageService } from './package.service';

interface AuthenticatedRequest {
  user: { userId: string; roles?: string[] };
}

@ApiTags('Packages')
@Controller({ path: '', version: '1' })
export class PackageController {
  constructor(
    private readonly service: PackageService,
    private readonly itineraryService: ItineraryService,
    private readonly bookingService: PackageBookingService,
  ) {}

  @ApiOperation({ summary: 'Create a travel package (admin)' })
  @ApiResponse({ status: 201, description: 'Package created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('admin/packages')
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreatePackageDto) {
    this.ensureAdmin(req);
    return this.service.create(req.user.userId, dto);
  }

  @ApiOperation({ summary: 'Update a travel package (admin)' })
  @ApiParam({ name: 'id', description: 'Package UUID' })
  @ApiResponse({ status: 200, description: 'Package updated' })
  @ApiResponse({ status: 404, description: 'Package not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('admin/packages/:id')
  update(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() dto: UpdatePackageDto) {
    this.ensureAdmin(req);
    return this.service.update(id, dto);
  }

  @ApiOperation({ summary: 'Delete a travel package (admin)' })
  @ApiParam({ name: 'id', description: 'Package UUID' })
  @ApiResponse({ status: 200, description: 'Package deleted' })
  @ApiResponse({ status: 404, description: 'Package not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('admin/packages/:id')
  async remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    this.ensureAdmin(req);
    await this.service.delete(id);
    return { success: true };
  }

  @ApiOperation({ summary: 'List all packages including drafts (admin)' })
  @ApiResponse({ status: 200, description: 'Paginated list of packages' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('admin/packages')
  listAdmin(@Req() req: AuthenticatedRequest, @Query() query: Record<string, unknown>) {
    this.ensureAdmin(req);
    const parsed = packageQuerySchema.parse(query);
    return this.service.list(parsed, true);
  }

  @ApiOperation({ summary: 'Add itinerary day to a package (admin)' })
  @ApiParam({ name: 'id', description: 'Package UUID' })
  @ApiResponse({ status: 201, description: 'Itinerary day added' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('admin/packages/:id/itinerary')
  addItinerary(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() dto: UpsertItineraryDto) {
    this.ensureAdmin(req);
    return this.itineraryService.create(id, dto);
  }

  @ApiOperation({ summary: 'Update itinerary day (admin)' })
  @ApiParam({ name: 'id', description: 'Itinerary day UUID' })
  @ApiResponse({ status: 200, description: 'Itinerary day updated' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('admin/itinerary/:id')
  updateItinerary(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() dto: UpsertItineraryDto) {
    this.ensureAdmin(req);
    return this.itineraryService.update(id, dto);
  }

  @ApiOperation({ summary: 'Delete itinerary day (admin)' })
  @ApiParam({ name: 'id', description: 'Itinerary day UUID' })
  @ApiResponse({ status: 200, description: 'Itinerary day deleted' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('admin/itinerary/:id')
  async deleteItinerary(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    this.ensureAdmin(req);
    await this.itineraryService.delete(id);
    return { success: true };
  }

  @ApiOperation({ summary: 'List published packages (public)' })
  @ApiResponse({ status: 200, description: 'Paginated list of published packages' })
  @Get('packages')
  listUser(@Query() query: Record<string, unknown>) {
    const parsed = packageQuerySchema.parse(query);
    return this.service.list(parsed, false);
  }

  @ApiOperation({ summary: 'Get package by slug (public)' })
  @ApiParam({ name: 'slug', description: 'Package URL slug' })
  @ApiResponse({ status: 200, description: 'Package details with itinerary' })
  @ApiResponse({ status: 404, description: 'Package not found' })
  @Get('packages/:slug')
  getBySlug(@Param('slug') slug: string) {
    return this.service.getBySlug(slug);
  }

  @ApiOperation({ summary: 'Book a package' })
  @ApiParam({ name: 'id', description: 'Package UUID' })
  @ApiResponse({ status: 201, description: 'Package booking created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
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
