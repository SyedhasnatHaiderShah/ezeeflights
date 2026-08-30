export type BookingModificationChangeType = 'DATE_CHANGE' | 'PASSENGER_UPDATE';
export type BookingRefundStatus = 'PENDING' | 'PROCESSED' | 'FAILED';
export type BookingActionActor = 'USER' | 'ADMIN' | 'SYSTEM';

export interface BookingModificationEntity {
  id: string;
  bookingId: string;
  changeType: BookingModificationChangeType;
  oldValue: Record<string, unknown>;
  newValue: Record<string, unknown>;
  changedAt: Date;
}

export interface BookingRefundEntity {
  id: string;
  bookingId: string;
  amount: number;
  status: BookingRefundStatus;
  paymentReference: string | null;
  createdAt: Date;
}

export interface BookingLogEntity {
  id: string;
  bookingId: string;
  action: string;
  performedBy: BookingActionActor;
  createdAt: Date;
}

export interface BookingHistoryEntity {
  bookingId: string;
  status: string;
  modifications: BookingModificationEntity[];
  refunds: BookingRefundEntity[];
  logs: BookingLogEntity[];
}
