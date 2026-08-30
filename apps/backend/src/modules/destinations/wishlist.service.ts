import { Injectable } from '@nestjs/common';
import { NotificationService } from '../notification/services/notification.service';
import { DestinationRepository } from './destination.repository';

@Injectable()
export class WishlistService {
  constructor(
    private readonly repository: DestinationRepository,
    private readonly notificationService: NotificationService,
  ) {}

  async add(userId: string, attractionId: string) {
    const added = await this.repository.addWishlist(userId, attractionId);
    await this.notificationService.triggerBookingConfirmed(userId, {
      module: 'DESTINATIONS_WISHLIST',
      message: 'New attraction added to your bucket list',
      attractionId,
    });
    return added;
  }

  remove(userId: string, attractionId: string) {
    return this.repository.removeWishlist(userId, attractionId);
  }

  list(userId: string) {
    return this.repository.getWishlist(userId);
  }
}
