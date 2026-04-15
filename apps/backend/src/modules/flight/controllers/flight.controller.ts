import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FlightService } from '../services/flight.service';
import { SearchFlightsDto } from '../dto/search-flights.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SeatMapService } from '../seat-map.service';
import { ReserveSeatDto } from '../dto/reserve-seat.dto';
import { AncillariesService } from '../ancillaries.service';
import { AddAncillaryDto } from '../dto/add-ancillary.dto';

interface AuthenticatedRequest {
  user: { userId: string; roles?: string[] };
}

@ApiTags('Flights')
@Controller({ path: '', version: '1' })
export class FlightController {
  constructor(
    private readonly flightService: FlightService,
    private readonly seatMapService: SeatMapService,
    private readonly ancillariesService: AncillariesService,
  ) {}

  @ApiOperation({ summary: 'Search available flights' })
  @ApiResponse({ status: 200, description: 'List of matching flights' })
  @Get('flights/search')
  search(@Query() query: SearchFlightsDto) {
    return this.flightService.searchFlights(query);
  }

  @ApiOperation({ summary: 'Get flight details by ID' })
  @ApiParam({ name: 'id', description: 'Flight UUID' })
  @ApiResponse({ status: 200, description: 'Flight details' })
  @ApiResponse({ status: 404, description: 'Flight not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('flights/:id')
  getById(@Param('id') id: string) {
    return this.flightService.getFlightById(id);
  }

  @ApiOperation({ summary: 'Get seat map for a flight' })
  @ApiParam({ name: 'flightId', description: 'Flight UUID' })
  @ApiResponse({ status: 200, description: 'Seat map with availability' })
  @ApiResponse({ status: 404, description: 'Flight not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('flights/:flightId/seat-map')
  getSeatMap(@Param('flightId') flightId: string) {
    return this.seatMapService.getSeatMap(flightId);
  }

  @ApiOperation({ summary: 'Reserve a seat for a passenger on a booking' })
  @ApiParam({ name: 'bookingId', description: 'Booking UUID' })
  @ApiResponse({ status: 200, description: 'Seat reserved' })
  @ApiResponse({ status: 400, description: 'Seat already taken or invalid' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('bookings/:bookingId/seats')
  reserveSeat(@Param('bookingId') bookingId: string, @Body() dto: ReserveSeatDto) {
    return this.seatMapService.reserveSeat(bookingId, dto.flightId, dto.row, dto.col, dto.passengerIndex);
  }

  @ApiOperation({ summary: 'Get ancillary options for a flight' })
  @ApiParam({ name: 'flightId', description: 'Flight UUID' })
  @ApiQuery({ name: 'airlineCode', required: false, description: 'Filter by airline code' })
  @ApiQuery({ name: 'type', required: false, description: 'Ancillary type (e.g. baggage, meal)' })
  @ApiResponse({ status: 200, description: 'List of ancillary options' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('flights/:flightId/ancillaries')
  getAncillaries(@Param('flightId') _flightId: string, @Query('airlineCode') airlineCode?: string, @Query('type') type?: string) {
    return this.ancillariesService.getAncillaryOptions(airlineCode, type);
  }

  @ApiOperation({ summary: 'Add ancillary items to a booking' })
  @ApiParam({ name: 'bookingId', description: 'Booking UUID' })
  @ApiResponse({ status: 200, description: 'Ancillaries added' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('bookings/:bookingId/ancillaries')
  addAncillaries(@Req() req: AuthenticatedRequest, @Param('bookingId') bookingId: string, @Body() dto: AddAncillaryDto) {
    return this.ancillariesService.addAncillaryToBooking(req.user.userId, bookingId, dto);
  }
}
