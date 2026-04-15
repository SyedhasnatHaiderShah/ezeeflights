import { Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateCarBookingDto, SearchCarsDto } from './cars.dto';
import { CarService } from './cars.service';

interface AuthenticatedRequest {
  user: { userId: string };
}

@ApiTags('Cars')
@Controller({ path: 'cars', version: '1' })
export class CarsController {
  constructor(private readonly service: CarService) {}

  @ApiOperation({ summary: 'Search available rental cars' })
  @ApiQuery({ name: 'pickup_location', description: 'Pickup location UUID' })
  @ApiQuery({ name: 'dropoff_location', required: false, description: 'Dropoff location UUID (defaults to pickup)' })
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
    @Query('category') category?: SearchCarsDto['category'],
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

  @ApiOperation({ summary: 'List pickup/dropoff locations' })
  @ApiResponse({ status: 200, description: 'Array of car rental locations' })
  @Get('locations')
  getLocations() {
    return this.service.getLocations();
  }

  @ApiOperation({ summary: 'Get car details by ID' })
  @ApiParam({ name: 'id', description: 'Car UUID' })
  @ApiResponse({ status: 200, description: 'Car details' })
  @ApiResponse({ status: 404, description: 'Car not found' })
  @Get(':id')
  getCarById(@Param('id') id: string) {
    return this.service.getCarById(id);
  }

  @ApiOperation({ summary: 'Create a car booking' })
  @ApiResponse({ status: 201, description: 'Car booking created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('bookings')
  createBooking(@Req() req: AuthenticatedRequest, @Body() dto: CreateCarBookingDto) {
    return this.service.createBooking(req.user.userId, dto);
  }

  @ApiOperation({ summary: 'Get my car bookings' })
  @ApiResponse({ status: 200, description: 'Array of car bookings' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('bookings/me')
  getMyBookings(@Req() req: AuthenticatedRequest) {
    return this.service.getUserBookings(req.user.userId);
  }

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
}
