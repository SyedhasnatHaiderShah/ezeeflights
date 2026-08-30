import { Controller, Get } from '@nestjs/common';

@Controller({ path: 'hybrid', version: '1' })
export class HybridRoutesController {
  @Get('health')
  health() {
    return {
      module: 'hybrid-engine',
      status: 'ok',
      providers: ['amadeus', 'duffel', 'skyscanner', 'booking', 'expedia'],
    };
  }
}
