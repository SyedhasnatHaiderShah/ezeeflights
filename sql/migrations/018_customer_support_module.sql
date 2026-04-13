CREATE TYPE ticket_status AS ENUM ('open','in_progress','waiting_customer','resolved','closed');
CREATE TYPE ticket_priority AS ENUM ('low','medium','high','urgent');
CREATE TYPE ticket_category AS ENUM (
  'flight_delay','refund','hotel_issue','car_issue','payment_problem',
  'booking_modification','account_issue','complaint','general'
);
CREATE TYPE ticket_channel AS ENUM ('web','email','whatsapp','phone');
CREATE TYPE agent_role AS ENUM ('agent','senior_agent','supervisor');

CREATE TABLE support_agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  agent_role agent_role DEFAULT 'agent',
  is_available BOOLEAN DEFAULT true,
  current_ticket_count INTEGER DEFAULT 0,
  max_tickets INTEGER DEFAULT 10,
  specializations JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_number VARCHAR(30) UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id),
  booking_id UUID,
  assigned_agent_id UUID REFERENCES support_agents(id),
  category ticket_category NOT NULL,
  subject VARCHAR(300) NOT NULL,
  status ticket_status DEFAULT 'open',
  priority ticket_priority DEFAULT 'medium',
  channel ticket_channel DEFAULT 'web',
  sla_deadline TIMESTAMPTZ,
  first_response_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  satisfaction_rating SMALLINT CHECK (satisfaction_rating BETWEEN 1 AND 5),
  satisfaction_comment TEXT,
  tags JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ticket_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id),
  is_agent BOOLEAN DEFAULT false,
  is_internal_note BOOLEAN DEFAULT false,
  body TEXT NOT NULL,
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sla_policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  priority ticket_priority NOT NULL,
  first_response_hours INTEGER NOT NULL,
  resolution_hours INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true
);

INSERT INTO sla_policies (name, priority, first_response_hours, resolution_hours) VALUES
  ('Urgent SLA', 'urgent', 1, 4),
  ('High SLA', 'high', 4, 24),
  ('Medium SLA', 'medium', 8, 48),
  ('Low SLA', 'low', 24, 72);

CREATE TABLE canned_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,
  category ticket_category,
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_tickets_user ON support_tickets(user_id);
CREATE INDEX idx_tickets_status ON support_tickets(status);
CREATE INDEX idx_tickets_agent ON support_tickets(assigned_agent_id);
CREATE INDEX idx_ticket_messages_ticket ON ticket_messages(ticket_id);
