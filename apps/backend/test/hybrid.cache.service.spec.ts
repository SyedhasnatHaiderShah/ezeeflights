import { HybridCacheService } from '../src/modules/hybrid-engine/cache.service';

describe('HybridCacheService', () => {
  it('stores and retrieves values from fallback cache', async () => {
    const cache = new HybridCacheService();
    await cache.set('k1', { ok: true }, 60);
    const value = await cache.get<{ ok: boolean }>('k1');
    expect(value?.ok).toBe(true);
  });

  it('returns null after delete', async () => {
    const cache = new HybridCacheService();
    await cache.set('k2', { ok: true }, 60);
    await cache.del('k2');
    const value = await cache.get('k2');
    expect(value).toBeNull();
  });
});
