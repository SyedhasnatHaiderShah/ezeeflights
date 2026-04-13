import { Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateCarBookingDto, SearchCarsDto } from './cars.dto';
import { CarService } from './cars.service';

interface AuthenticatedRequest {
  user: { userId: string };
}

@ApiTags('cars')
@Controller({ path: 'cars', version: '1' })
export class CarsController {
  constructor(private readonly service: CarService) {}

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

  @Get('locations')
  getLocations() {
    return this.service.getLocations();
  }

  @Get(':id')
  getCarById(@Param('id') id: string) {
    return this.service.getCarById(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('bookings')
  createBooking(@Req() req: AuthenticatedRequest, @Body() dto: CreateCarBookingDto) {
    return this.service.createBooking(req.user.userId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('bookings/me')
  getMyBookings(@Req() req: AuthenticatedRequest) {
    return this.service.getUserBookings(req.user.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('bookings/:id')
  getBookingById(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.service.getBookingById(id, req.user.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('bookings/:id')
  cancelBooking(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.service.cancelBooking(id, req.user.userId);
  }
}
