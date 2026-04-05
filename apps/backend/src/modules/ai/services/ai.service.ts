import { Injectable } from '@nestjs/common';

@Injectable()
export class AiService {
  health() {
    return { module: 'ai', status: 'ok' };
  }
}
