import { TourProviderService } from '../src/modules/destinations/integrations/tour-provider.service';

describe('External tour APIs', () => {
  it('returns fallback data when keys are missing', async () => {
    const service = new TourProviderService();
    const tours = await service.getTours('Burj Khalifa', 'Dubai', 'USD');
    expect(tours.length).toBeGreaterThan(0);
  });
});
