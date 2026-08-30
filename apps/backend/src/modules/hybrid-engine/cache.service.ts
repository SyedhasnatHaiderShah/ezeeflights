import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";

type CacheRecord = { value: unknown; expiresAt: number };

@Injectable()
export class HybridCacheService implements OnModuleDestroy {
  private readonly logger = new Logger(HybridCacheService.name);
  private readonly memory = new Map<string, CacheRecord>();
  private redisClient: any | null = null;
  private redisFallbackLogged = false;

  constructor() {
    this.initializeRedis();
  }

  async get<T>(key: string): Promise<T | null> {
    if (this.redisClient) {
      const raw = await this.redisClient.get(key);
      // debug level: only visible when LOG_LEVEL=debug, not in prod stdout
      this.logger.debug(
        `Cache GET [Redis] key "${key}" -> ${raw ? "HIT" : "MISS"}`,
      );
      return raw ? (JSON.parse(raw) as T) : null;
    }

    const hit = this.memory.get(key);
    if (!hit) {
      this.logger.debug(`Cache GET [Memory] key "${key}" -> MISS`);
      return null;
    }
    if (Date.now() > hit.expiresAt) {
      this.memory.delete(key);
      this.logger.debug(`Cache GET [Memory] key "${key}" -> EXPIRED`);
      return null;
    }
    this.logger.debug(`Cache GET [Memory] key "${key}" -> HIT`);
    return hit.value as T;
  }

  async set(
    key: string,
    value: unknown,
    ttlSeconds: number,
    options?: { quiet?: boolean },
  ): Promise<void> {
    if (this.redisClient) {
      await this.redisClient.set(key, JSON.stringify(value), "EX", ttlSeconds);
      if (!options?.quiet) {
        this.logger.debug(`Cache SET [Redis] key "${key}" (TTL: ${ttlSeconds}s)`);
      }
      return;
    }

    this.memory.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
    if (!options?.quiet) {
      this.logger.debug(`Cache SET [Memory] key "${key}" (TTL: ${ttlSeconds}s)`);
    }
  }

  async del(key: string): Promise<void> {
    if (this.redisClient) {
      await this.redisClient.del(key);
      this.logger.debug(`Cache DEL [Redis] key "${key}"`);
      return;
    }
    this.memory.delete(key);
    this.logger.debug(`Cache DEL [Memory] key "${key}"`);
  }

  async clearByPrefix(prefix: string): Promise<void> {
    if (this.redisClient) {
      try {
        const keys = await this.redisClient.keys(`${prefix}*`);
        if (keys.length > 0) {
          await this.redisClient.del(...keys);
          this.logger.log(`Cache CLEAR [Redis] prefix "${prefix}" -> deleted ${keys.length} keys`);
        }
      } catch (err) {
        this.logger.warn(`Failed to clear Redis keys for prefix ${prefix}: ${err}`);
      }
      return;
    }

    let count = 0;
    for (const key of this.memory.keys()) {
      if (key.startsWith(prefix)) {
        this.memory.delete(key);
        count++;
      }
    }
    this.logger.log(`Cache CLEAR [Memory] prefix "${prefix}" -> deleted ${count} keys`);
  }

  async getKeysByPattern(pattern: string): Promise<string[]> {
    if (this.redisClient) {
      try {
        return await this.redisClient.keys(pattern);
      } catch (err) {
        this.logger.warn(`Failed to scan Redis keys for pattern ${pattern}: ${err}`);
        return [];
      }
    }

    const matched: string[] = [];
    const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
    for (const key of this.memory.keys()) {
      if (regex.test(key)) {
        matched.push(key);
      }
    }
    return matched;
  }

  async onModuleDestroy(): Promise<void> {
    if (this.redisClient) {
      await this.redisClient.quit();
    }
  }

  private initializeRedis(): void {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      this.logger.warn("REDIS_URL not configured — using in-memory cache.");
      return;
    }

    this.logger.log(`Initializing Redis connection to: ${redisUrl}`);

    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const RedisCtor = require("ioredis");
      this.redisClient = new RedisCtor(redisUrl, {
        maxRetriesPerRequest: 1,
        enableReadyCheck: true,
        // Suppress ioredis's own verbose connection logs
        showFriendlyErrorStack: false,
      });

      this.redisClient.on("connect", () => {
        this.logger.log("Redis connected");
      });

      this.redisClient.on("ready", () => {
        this.logger.log("✅ Redis is successfully connected and ready for caching");
      });

      this.redisClient.on("error", (error: Error) => {
        if (!this.redisFallbackLogged) {
          this.redisFallbackLogged = true;
          this.logger.warn(
            `Redis unavailable — falling back to in-memory cache: ${error.message}`,
          );
        }
        try {
          this.redisClient?.disconnect();
        } catch {
          // ignore
        }
        this.redisClient = null;
      });
    } catch (error) {
      this.logger.error(
        `ioredis module missing — using in-memory cache: ${(error as Error).message}`,
      );
      this.redisClient = null;
    }
  }
}
