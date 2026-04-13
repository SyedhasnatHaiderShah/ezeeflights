export type TicketStatus = 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';

export interface SupportMessage {
  id: string;
  senderId: string;
  isAgent: boolean;
  isInternalNote: boolean;
  body: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  category: string;
  subject: string;
  status: TicketStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  updatedAt: string;
  createdAt: string;
  slaDeadline?: string | null;
  messages?: SupportMessage[];
}
