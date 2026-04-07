export type PnrProvider = 'AMADEUS' | 'SABRE' | 'TRAVELPORT' | 'INTERNAL';
export type PnrStatus = 'CREATED' | 'TICKETED' | 'CANCELLED';
export type TicketStatus = 'ISSUED' | 'CANCELLED';

export interface PnrRecordEntity {
  id: string;
  bookingId: string;
  pnrCode: string;
  provider: PnrProvider;
  status: PnrStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface TicketEntity {
  id: string;
  pnrId: string;
  ticketNumber: string;
  passengerId: string;
  flightId: string;
  issueDate: Date;
  status: TicketStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface TicketDocumentEntity {
  id: string;
  ticketId: string;
  fileUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TicketViewEntity extends TicketEntity {
  passengerName: string;
  passportNumber: string;
  seatNumber: string;
}

export interface PnrWithTicketsEntity extends PnrRecordEntity {
  bookingUserId: string;
  tickets: TicketViewEntity[];
}
