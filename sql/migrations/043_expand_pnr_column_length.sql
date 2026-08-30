-- Expand PNR and Ticket number lengths to accommodate various providers
ALTER TABLE pnr_records ALTER COLUMN pnr_code TYPE VARCHAR(32);
ALTER TABLE tickets ALTER COLUMN ticket_number TYPE VARCHAR(32);
