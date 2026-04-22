import { AsyncLocalStorage } from 'async_hooks';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ContextService {
  private readonly store = new AsyncLocalStorage<Map<string, string>>();

  run<T>(fn: () => T): T {
    return this.store.run(new Map(), fn);
  }

  set(key: string, value: string): void {
    this.store.getStore()?.set(key, value);
  }

  get(key: string): string | undefined {
    return this.store.getStore()?.get(key);
  }
}
