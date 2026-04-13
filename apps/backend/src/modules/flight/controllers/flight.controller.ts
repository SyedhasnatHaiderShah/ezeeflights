import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
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

@ApiTags('flights')
@Controller({ path: '', version: '1' })
export class FlightController {
  constructor(
    private readonly flightService: FlightService,
    private readonly seatMapService: SeatMapService,
    private readonly ancillariesService: AncillariesService,
  ) {}

  @Get('flights/search')
  search(@Query() query: SearchFlightsDto) {
    return this.flightService.searchFlights(query);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('flights/:id')
  getById(@Param('id') id: string) {
    return this.flightService.getFlightById(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('flights/:flightId/seat-map')
  getSeatMap(@Param('flightId') flightId: string) {
    return this.seatMapService.getSeatMap(flightId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('bookings/:bookingId/seats')
  reserveSeat(@Param('bookingId') bookingId: string, @Body() dto: ReserveSeatDto) {
    return this.seatMapService.reserveSeat(bookingId, dto.flightId, dto.row, dto.col, dto.passengerIndex);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('flights/:flightId/ancillaries')
  getAncillaries(@Param('flightId') _flightId: string, @Query('airlineCode') airlineCode?: string, @Query('type') type?: string) {
    return this.ancillariesService.getAncillaryOptions(airlineCode, type);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('bookings/:bookingId/ancillaries')
  addAncillaries(@Req() req: AuthenticatedRequest, @Param('bookingId') bookingId: string, @Body() dto: AddAncillaryDto) {
    return this.ancillariesService.addAncillaryToBooking(req.user.userId, bookingId, dto);
  }
}
