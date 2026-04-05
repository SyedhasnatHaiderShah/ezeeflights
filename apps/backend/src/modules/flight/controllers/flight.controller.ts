import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FlightService } from '../services/flight.service';
import { SearchFlightsDto } from '../dto/search-flights.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('flights')
@Controller({ path: 'flights', version: '1' })
export class FlightController {
  constructor(private readonly flightService: FlightService) {}

  @Get('search')
  search(@Query() query: SearchFlightsDto) {
    return this.flightService.searchFlights(query);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getById(@Param('id') id: string) {
    return this.flightService.getFlightById(id);
  }
}
