export type TicketStatus = 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketCategory =
  | 'flight_delay'
  | 'refund'
  | 'hotel_issue'
  | 'car_issue'
  | 'payment_problem'
  | 'booking_modification'
  | 'account_issue'
  | 'complaint'
  | 'general';
export type TicketChannel = 'web' | 'email' | 'whatsapp' | 'phone';

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId: string;
  bookingId: string | null;
  assignedAgentId: string | null;
  category: TicketCategory;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  channel: TicketChannel;
  slaDeadline: Date | null;
  firstResponseAt: Date | null;
  resolvedAt: Date | null;
  closedAt: Date | null;
  satisfactionRating: number | null;
  satisfactionComment: string | null;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  isAgent: boolean;
  isInternalNote: boolean;
  body: string;
  attachments: Array<Record<string, unknown>>;
  createdAt: Date;
}

export interface SupportAgent {
  id: string;
  userId: string;
  agentRole: 'agent' | 'senior_agent' | 'supervisor';
  isAvailable: boolean;
  currentTicketCount: number;
  maxTickets: number;
  specializations: string[];
  createdAt: Date;
}

export interface SlaPolicy {
  id: string;
  name: string;
  priority: TicketPriority;
  firstResponseHours: number;
  resolutionHours: number;
  isActive: boolean;
}

export interface CannedResponse {
  id: string;
  title: string;
  body: string;
  category: TicketCategory | null;
  isActive: boolean;
}
