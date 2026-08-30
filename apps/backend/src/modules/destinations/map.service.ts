import { Injectable } from '@nestjs/common';
import { MapNearbyQueryDto } from './dto/destination.dto';
import { DestinationRepository } from './destination.repository';

@Injectable()
export class MapService {
  constructor(private readonly repository: DestinationRepository) {}

  getClusters(query: MapNearbyQueryDto) {
    return this.repository.nearbyByGeo(query);
  }
}
