import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';

type BreakerState = {
  failures: number;
  successes: number;
  openedAt: number | null;
};

const TIMEOUT_MS = 5000;
const ERROR_THRESHOLD_PERCENTAGE = 50;
const RESET_TIMEOUT_MS = 30000;

@Injectable()
export class CircuitBreakerService {
  private readonly logger = new Logger(CircuitBreakerService.name);
  private readonly states = new Map<string, BreakerState>();

  private getState(name: string): BreakerState {
    const existing = this.states.get(name);
    if (existing) {
      return existing;
    }
    const created: BreakerState = { failures: 0, successes: 0, openedAt: null };
    this.states.set(name, created);
    return created;
  }

  private isOpen(state: BreakerState): boolean {
    if (!state.openedAt) {
      return false;
    }
    if (Date.now() - state.openedAt > RESET_TIMEOUT_MS) {
      state.openedAt = null;
      state.failures = 0;
      state.successes = 0;
      return false;
    }
    return true;
  }

  private shouldOpen(state: BreakerState): boolean {
    const attempts = state.failures + state.successes;
    if (attempts < 2) {
      return false;
    }
    return (state.failures / attempts) * 100 >= ERROR_THRESHOLD_PERCENTAGE;
  }

  async execute<T>(name: string, operation: () => Promise<T>, fallback: () => Promise<T>): Promise<T> {
    const state = this.getState(name);

    if (this.isOpen(state)) {
      this.logger.warn(`Circuit ${name} is open; serving fallback`);
      return fallback();
    }

    const timeoutPromise = new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error('Circuit breaker timeout')), TIMEOUT_MS);
    });

    try {
      const result = await Promise.race([operation(), timeoutPromise]);
      state.successes += 1;
      return result;
    } catch (error) {
      state.failures += 1;
      if (this.shouldOpen(state)) {
        state.openedAt = Date.now();
        this.logger.error(`Circuit ${name} opened due to failures`);
      }

      try {
        return await fallback();
      } catch {
        throw new ServiceUnavailableException(`${name} provider unavailable`);
      }
    }
  }
}
