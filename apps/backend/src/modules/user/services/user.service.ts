import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  health() {
    return { module: 'user', status: 'ok' };
  }
}
