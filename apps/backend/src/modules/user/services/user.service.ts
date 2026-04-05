import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class UserService {
  constructor(private readonly repository: UserRepository) {}

  async getProfile(userId: string) {
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    return user;
  }
}
