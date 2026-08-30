import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, Post, Query, Req, UseGuards, Headers, UnauthorizedException } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateCarBookingDto, SearchCarsDto, SelectCarDto } from './cars.dto';
import { CarService } from './cars.service';

interface AuthenticatedRequest {
  user: { userId: string; email: string };
}

@ApiTags('Cars')
@Controller({ path: ['cars', 'v1/cars'], version: '1' })
export class CarsController {
  constructor(private readonly service: CarService) {}

  @ApiOperation({ summary: 'Search available rental cars' })
  @ApiQuery({ name: 'pickup_location', description: 'Pickup location IATA code or UUID' })
  @ApiQuery({ name: 'dropoff_location', required: false, description: 'Dropoff location IATA code or UUID' })
  @ApiQuery({ name: 'pickup_date', description: 'Pickup datetime ISO string' })
  @ApiQuery({ name: 'dropoff_date', description: 'Dropoff datetime ISO string' })
  @ApiQuery({ name: 'category', required: false, description: 'Car category filter' })
  @ApiQuery({ name: 'max_price', required: false, description: 'Maximum price per day' })
  @ApiQuery({ name: 'unlimited_mileage', required: false, description: 'Filter for unlimited mileage' })
  @ApiQuery({ name: 'transmission', required: false, description: 'Transmission type (automatic/manual)' })
  @ApiResponse({ status: 200, description: 'List of available cars' })
  @Get('search')
  searchCars(
    @Query('pickup_location') pickupLocationId: string,
    @Query('dropoff_location') dropoffLocationId: string | undefined,
    @Query('pickup_date') pickupDate: string,
    @Query('dropoff_date') dropoffDate: string,
    @Query('category') category?: string,
    @Query('max_price') maxPricePerDay?: string,
    @Query('unlimited_mileage') unlimitedMileage?: string,
    @Query('transmission') transmission?: string,
  ) {
    return this.service.searchCars({
      pickupLocationId,
      dropoffLocationId,
      pickupDate,
      dropoffDate,
      category,
      maxPricePerDay: maxPricePerDay ? Number(maxPricePerDay) : undefined,
      unlimitedMileage: unlimitedMileage ? unlimitedMileage === 'true' : undefined,
      transmission,
    });
  }

  @ApiOperation({
    summary: 'Proxy search for Cars',
    description: 'Accepts car search request and returns results.',
  })
  @Post('travelport-proxy/search')
  async travelportProxySearch(@Headers('x-api-key') apiKey: string, @Body() body: any) {
    const expectedKey = process.env.EZEEFLIGHTS_API_KEY;
    if (!apiKey || apiKey !== expectedKey) {
      throw new UnauthorizedException('Firewall Blocked: Invalid or missing X-API-KEY header.');
    }
    
    return this.service.searchCars(body);
  }

  @ApiOperation({ summary: 'List pickup/dropoff locations' })
  @ApiResponse({ status: 200, description: 'Array of car rental locations' })
  @Get('locations')
  getLocations(@Query('q') query?: string) {
    return this.service.getLocations(query);
  }

  @ApiOperation({ summary: 'Get car details by ID' })
  @ApiParam({ name: 'id', description: 'Car UUID or Travelport car ID' })
  @ApiResponse({ status: 200, description: 'Car details' })
  @ApiResponse({ status: 404, description: 'Car not found' })
  @Get(':id([\\w\\-]+)')
  getCarById(@Param('id') id: string) {
    // Guard against reserved path segments that should never reach this handler
    const RESERVED = ['select', 'search', 'bookings', 'locations', 'keywords', 'media-links', 'rules', 'location-details', 'travelport-proxy'];
    if (RESERVED.includes(id)) {
      throw new NotFoundException(`No car found with id: ${id}`);
    }
    return this.service.getCarById(id);
  }

  @ApiOperation({ summary: 'Verify car price from cache (called by booking page on load)' })
  @ApiQuery({ name: 'carId', description: 'Car ID to verify' })
  @ApiQuery({ name: 'pickupLocationId', description: 'Pickup location IATA code' })
  @ApiQuery({ name: 'dropoffLocationId', required: false, description: 'Dropoff location IATA code' })
  @ApiQuery({ name: 'pickupDate', description: 'Pickup date ISO string' })
  @ApiQuery({ name: 'dropoffDate', description: 'Dropoff date ISO string' })
  @ApiResponse({ status: 200, description: 'Verified car with price from cache' })
  @Get('select')
  async verifyCar(
    @Query('carId') carId: string,
    @Query('pickupLocationId') pickupLocationId: string,
    @Query('dropoffLocationId') dropoffLocationId: string | undefined,
    @Query('pickupDate') pickupDate: string,
    @Query('dropoffDate') dropoffDate: string,
  ) {
    return this.service.selectCar({
      carId,
      pickupLocationId,
      dropoffLocationId,
      pickupDate,
      dropoffDate,
    });
  }

  @ApiOperation({ summary: 'Select a car before proceeding to booking' })
  @ApiResponse({ status: 201, description: 'Select response with sessionId and verified details' })
  @Post('select')
  selectCar(@Body() dto: SelectCarDto) {
    return this.service.selectCar(dto);
  }

  @ApiOperation({ summary: 'Create a car booking' })
  @ApiResponse({ status: 201, description: 'Car booking created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @Post('bookings')
  createBooking(@Req() req: any, @Body() dto: CreateCarBookingDto) {
    const userId = req.user?.userId || 'guest';
    return this.service.createBooking(userId, dto);
  }

  // Disabled — CRM list by email; re-enable when My Car Bookings page is needed.
  // @ApiOperation({ summary: 'Get my car bookings' })
  // @ApiResponse({ status: 200, description: 'Array of car bookings' })
  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard)
  // @Get('bookings/me')
  // getMyBookings(@Req() req: AuthenticatedRequest) {
  //   return this.service.getUserBookings(req.user.email);
  // }

  @ApiOperation({ summary: 'Get car booking by ID' })
  @ApiParam({ name: 'id', description: 'Car booking UUID' })
  @ApiResponse({ status: 200, description: 'Car booking details' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('bookings/:id')
  getBookingById(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.service.getBookingById(id, req.user.userId);
  }

  @ApiOperation({ summary: 'Cancel car booking' })
  @ApiParam({ name: 'id', description: 'Car booking UUID' })
  @ApiResponse({ status: 200, description: 'Booking cancelled' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('bookings/:id')
  cancelBooking(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.service.cancelBooking(id, req.user.userId);
  }

  @ApiOperation({ summary: 'Get car location details from Travelport' })
  @ApiQuery({ name: 'vendor_code', description: 'Vendor/Supplier code (e.g. SX)' })
  @ApiQuery({ name: 'pickup_location', description: 'Pickup location code' })
  @ApiQuery({ name: 'pickup_date', description: 'Pickup date ISO string' })
  @ApiQuery({ name: 'dropoff_date', description: 'Dropoff date ISO string' })
  @Get('location-details')
  getCarLocationDetail(
    @Query('vendor_code') vendorCode: string,
    @Query('pickup_location') pickupLocation: string,
    @Query('pickup_date') pickupDate: string,
    @Query('dropoff_date') dropoffDate: string,
  ) {
    return this.service.getCarLocationDetail(vendorCode, pickupLocation, pickupDate, dropoffDate);
  }

  @ApiOperation({ summary: 'Get car keywords policy details from Travelport' })
  @ApiQuery({ name: 'vendor_code', description: 'Vendor/Supplier code' })
  @ApiQuery({ name: 'pickup_date', description: 'Pickup date string' })
  @ApiQuery({ name: 'pickup_location', required: false, description: 'Pickup location code' })
  @Get('keywords')
  getCarKeywords(
    @Query('vendor_code') vendorCode: string,
    @Query('pickup_date') pickupDate: string,
    @Query('pickup_location') pickupLocation?: string,
  ) {
    return this.service.getCarKeywords(vendorCode, pickupDate, pickupLocation);
  }

  @ApiOperation({ summary: 'Get car media links/images from Travelport' })
  @ApiQuery({ name: 'vendor_code', description: 'Vendor/Supplier code' })
  @ApiQuery({ name: 'pickup_location', description: 'Pickup location code' })
  @ApiQuery({ name: 'vehicle_class', required: false, description: 'Vehicle class (e.g. Economy)' })
  @ApiQuery({ name: 'category', required: false, description: 'Vehicle category (e.g. Car)' })
  @Get('media-links')
  getCarMediaLinks(
    @Query('vendor_code') vendorCode: string,
    @Query('pickup_location') pickupLocation: string,
    @Query('vehicle_class') vehicleClass?: string,
    @Query('category') category?: string,
  ) {
    return this.service.getCarMediaLinks(vendorCode, pickupLocation, vehicleClass, category);
  }

  @ApiOperation({ summary: 'Get car rate rules from Travelport' })
  @ApiQuery({ name: 'pickup_location', description: 'Pickup location code' })
  @ApiQuery({ name: 'dropoff_location', description: 'Dropoff location code' })
  @ApiQuery({ name: 'pickup_date', description: 'Pickup date ISO string' })
  @ApiQuery({ name: 'dropoff_date', description: 'Dropoff date ISO string' })
  @ApiQuery({ name: 'rate_code', description: 'Rate code (e.g. 5IU)' })
  @ApiQuery({ name: 'vendor_code', description: 'Vendor code (e.g. SX)' })
  @ApiQuery({ name: 'rate_token', required: false, description: 'Rate host indicator token' })
  @Get('rules')
  getCarRules(
    @Query('pickup_location') pickupLocation: string,
    @Query('dropoff_location') dropoffLocation: string,
    @Query('pickup_date') pickupDate: string,
    @Query('dropoff_date') dropoffDate: string,
    @Query('rate_code') rateCode: string,
    @Query('vendor_code') vendorCode: string,
    @Query('rate_token') rateToken?: string,
  ) {
    return this.service.getCarRules(pickupLocation, dropoffLocation, pickupDate, dropoffDate, rateCode, vendorCode, rateToken);
  }
}
