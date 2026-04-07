import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'events';

@Injectable()
export class AppEventBus {
  private readonly emitter = new EventEmitter();

  emit(event: string, payload: unknown): void {
    this.emitter.emit(event, payload);
  }

  on<T>(event: string, listener: (payload: T) => void | Promise<void>): void {
    this.emitter.on(event, listener);
  }
}
