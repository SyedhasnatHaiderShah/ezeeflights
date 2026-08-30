describe('resolveApiSource', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    delete process.env.FLIGHTS_API_SOURCE;
    delete process.env.HOTELS_API_SOURCE;
    delete process.env.CARS_API_SOURCE;
    delete process.env.TRAVELPORT_API;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  async function loadUtil() {
    return import('../src/common/utils/api-source.util');
  }

  it('uses explicit per-service vars when set', async () => {
    process.env.FLIGHTS_API_SOURCE = 'external';
    process.env.HOTELS_API_SOURCE = 'proxy';
    process.env.CARS_API_SOURCE = 'travelport';
    const { resolveApiSource } = await loadUtil();
    expect(resolveApiSource('flights')).toBe('external');
    expect(resolveApiSource('hotels')).toBe('proxy');
    expect(resolveApiSource('cars')).toBe('travelport');
  });

  it('falls back to TRAVELPORT_API=true for all services', async () => {
    process.env.TRAVELPORT_API = 'true';
    const { resolveApiSource } = await loadUtil();
    expect(resolveApiSource('flights')).toBe('travelport');
    expect(resolveApiSource('hotels')).toBe('travelport');
    expect(resolveApiSource('cars')).toBe('travelport');
  });

  it('falls back to TRAVELPORT_API=false legacy split', async () => {
    process.env.TRAVELPORT_API = 'false';
    const { resolveApiSource } = await loadUtil();
    expect(resolveApiSource('flights')).toBe('external');
    expect(resolveApiSource('hotels')).toBe('proxy');
    expect(resolveApiSource('cars')).toBe('proxy');
  });
});
