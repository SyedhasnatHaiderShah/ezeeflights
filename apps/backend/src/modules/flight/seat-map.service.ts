import { Injectable } from '@nestjs/common';
import { SeatMapRepository } from './repositories/seat-map.repository';
import { SeatMapEntity, SeatMapRow, SeatSelectionEntity } from './entities/seat-map.entity';

@Injectable()
export class SeatMapService {
  private readonly memoryCache = new Map<string, { expiresAt: number; value: SeatMapEntity }>();

  constructor(private readonly repository: SeatMapRepository) {}

  async getSeatMap(flightId: string): Promise<SeatMapEntity> {
    const cached = this.memoryCache.get(flightId);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
    }

    const existing = await this.repository.findSeatMap(flightId);
    if (existing) {
      this.memoryCache.set(flightId, { expiresAt: Date.now() + 300_000, value: existing });
      return existing;
    }

    const fromGds = await this.fetchAmadeusSeatMap(flightId);
    await this.repository.upsertSeatMap(fromGds);
    this.memoryCache.set(flightId, { expiresAt: Date.now() + 300_000, value: fromGds });
    return fromGds;
  }

  reserveSeat(bookingId: string, flightId: string, row: number, col: string, passengerIndex: number): Promise<SeatSelectionEntity> {
    this.memoryCache.delete(flightId);
    return this.repository.reserveSeat(bookingId, flightId, row, col, passengerIndex);
  }

  async releaseSeat(seatSelectionId: string): Promise<void> {
    await this.repository.releaseSeat(seatSelectionId);
  }

  private async fetchAmadeusSeatMap(flightId: string): Promise<SeatMapEntity> {
    const generatedRows: SeatMapRow[] = Array.from({ length: 20 }, (_, i) => ({
      row: i + 1,
      seats: ['A', 'B', 'C', 'D', 'E', 'F'].map((col) => ({
        col,
        class: i < 4 ? 'business' : 'economy',
        position: ['A', 'F'].includes(col) ? 'window' : ['C', 'D'].includes(col) ? 'aisle' : 'middle',
        status: Math.random() > 0.84 ? 'occupied' : Math.random() > 0.94 ? 'blocked' : 'available',
        price: i < 4 ? 60 : 15,
      })),
    }));

    return {
      flightId,
      aircraftType: 'A320',
      totalRows: 20,
      columnsLayout: '3-3',
      seatMapData: generatedRows,
      lastSyncedAt: new Date().toISOString(),
    };
  }
}
