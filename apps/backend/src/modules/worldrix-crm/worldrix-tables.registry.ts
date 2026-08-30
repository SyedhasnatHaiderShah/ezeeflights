/**
 * Central whitelist of every Worldrix CRM table exposed through the generic
 * admin CRUD endpoints. Nothing outside this registry can be queried/mutated,
 * so column and table names are always trusted (values stay parameterized).
 */
export interface WorldrixTableDef {
  /** URL slug used in /admin/worldrix/:resource */
  resource: string;
  /** Human-friendly label for the dashboard */
  label: string;
  /** Actual SQL table name */
  table: string;
  /** Primary-key column */
  pk: string;
  /** Whether the PK is AUTO_INCREMENT (false → we generate a UUID on insert) */
  pkAuto: boolean;
  /** All selectable columns (in display order) */
  columns: string[];
  /** Columns the client is allowed to set on create/update */
  writable: string[];
  /** Columns never returned to the client (e.g. passwords) */
  hidden: string[];
  /** Columns set to NOW() on insert when the client doesn't provide them */
  nowOnInsert: string[];
  /** updated_at-style column auto-bumped on update (optional) */
  updatedAtColumn?: string;
}

export const WORLDRIX_TABLES: WorldrixTableDef[] = [
  {
    resource: "agent-lead-details",
    label: "Agent Lead Details",
    table: "agent_lead_details",
    pk: "id",
    pkAuto: true,
    columns: ["id", "co_agent_id", "lead_id", "status", "comment", "created_at", "updated_at"],
    writable: ["co_agent_id", "lead_id", "status", "comment"],
    hidden: [],
    nowOnInsert: [],
    updatedAtColumn: "updated_at",
  },
  {
    resource: "agent-whatsapp-lead-details",
    label: "Agent WhatsApp Lead Details",
    table: "agent_whatsapp_lead_details",
    pk: "id",
    pkAuto: true,
    columns: ["id", "co_agent_id", "whatsapp_lead_id", "status", "comment", "created_at", "updated_at"],
    writable: ["co_agent_id", "whatsapp_lead_id", "status", "comment"],
    hidden: [],
    nowOnInsert: ["created_at"],
    updatedAtColumn: "updated_at",
  },
  {
    resource: "click-detail",
    label: "Click Detail",
    table: "click_detail",
    pk: "Id",
    pkAuto: false,
    columns: ["Id", "log", "CreatedOn", "Ip", "sitesource"],
    writable: ["log", "Ip", "sitesource"],
    hidden: [],
    nowOnInsert: [],
  },
  {
    resource: "click-impression",
    label: "Click Impression",
    table: "clickimpression",
    pk: "Id",
    pkAuto: true,
    columns: ["Id", "Log", "CreatedOn", "Ip", "utm_source", "source", "destination", "DepartDate", "Records"],
    writable: ["Log", "Ip", "utm_source", "source", "destination", "DepartDate", "Records"],
    hidden: [],
    nowOnInsert: [],
  },
  {
    resource: "co-agent",
    label: "Co Agent",
    table: "co_agent",
    pk: "id",
    pkAuto: true,
    columns: ["id", "username", "email", "password", "agentStatus", "time_in", "time_out", "created_at", "updated_at", "metastatus"],
    writable: ["username", "email", "password", "agentStatus", "time_in", "time_out", "metastatus"],
    hidden: ["password"],
    nowOnInsert: [],
    updatedAtColumn: "updated_at",
  },
  {
    resource: "co-agent-assign",
    label: "Co Agent Assign",
    table: "co_agent_assign",
    pk: "aid",
    pkAuto: true,
    columns: ["aid", "agent_id", "agent_code"],
    writable: ["agent_id", "agent_code"],
    hidden: [],
    nowOnInsert: [],
  },
  {
    resource: "co-agent-booking-detail",
    label: "Co Agent Booking Detail",
    table: "co_agent_booking_detail",
    pk: "id",
    pkAuto: true,
    columns: ["id", "co_agent_id", "co_booking_details_id", "status", "comment", "created_at", "updaed_at"],
    writable: ["co_agent_id", "co_booking_details_id", "status", "comment"],
    hidden: [],
    nowOnInsert: [],
    updatedAtColumn: "updaed_at",
  },
  {
    resource: "co-agent-booking-details",
    label: "Co Agent Booking Details",
    table: "co_agent_booking_details",
    pk: "id",
    pkAuto: true,
    columns: ["id", "co_agent_id", "co_booking_details_id", "status", "comment", "created_at", "updaed_at"],
    writable: ["co_agent_id", "co_booking_details_id", "status", "comment"],
    hidden: [],
    nowOnInsert: [],
    updatedAtColumn: "updaed_at",
  },
  {
    resource: "co-booking-admin",
    label: "Co Booking Admin",
    table: "co_booking_admin",
    pk: "id",
    pkAuto: true,
    columns: ["id", "username", "email", "password", "genereated_key", "genereated_otp", "created_at", "metastatus"],
    writable: ["username", "email", "password", "genereated_key", "genereated_otp", "metastatus"],
    hidden: ["password", "genereated_otp"],
    nowOnInsert: [],
  },
  {
    resource: "co-marketing",
    label: "Co Marketing",
    table: "co_marcketing",
    pk: "id",
    pkAuto: true,
    columns: ["id", "username", "email", "password", "agentStatus", "time_in", "time_out", "created_at", "updated_at"],
    writable: ["username", "email", "password", "agentStatus", "time_in", "time_out"],
    hidden: ["password"],
    nowOnInsert: [],
    updatedAtColumn: "updated_at",
  },
  {
    resource: "leads",
    label: "Leads",
    table: "leads",
    pk: "id",
    pkAuto: true,
    columns: ["id", "bookingRef", "created_time", "full_name", "email", "phone", "platform", "adset_name", "status", "received_at"],
    writable: ["bookingRef", "created_time", "full_name", "email", "phone", "platform", "adset_name", "status"],
    hidden: [],
    nowOnInsert: [],
  },
  {
    resource: "whatsapp-leads",
    label: "WhatsApp Leads",
    table: "whatsapp_leads",
    pk: "id",
    pkAuto: true,
    columns: ["id", "bookingRef", "phone", "customer_name", "source", "summary", "status", "requested_at", "created_at"],
    writable: ["bookingRef", "phone", "customer_name", "source", "summary", "status", "requested_at"],
    hidden: [],
    nowOnInsert: ["created_at"],
  },
  {
    resource: "hotel-booking-details",
    label: "Hotel Bookings",
    table: "tbl_hotel_booking_details",
    pk: "id",
    pkAuto: true,
    columns: [
      "id", "bookingRef", "hotelChain", "hotelCode", "hotelName", "locationCode",
      "city", "country", "address", "distance", "referencePoint", "reserveRequirement",
      "availability", "checkInDate", "checkOutDate", "contactPhone", "contactEmail",
      "pricePerNight", "totalAmount", "status", "work_status", "source", "created_at"
    ],
    writable: [
      "bookingRef", "hotelChain", "hotelCode", "hotelName", "locationCode",
      "city", "country", "address", "distance", "referencePoint", "reserveRequirement",
      "availability", "checkInDate", "checkOutDate", "contactPhone", "contactEmail",
      "pricePerNight", "totalAmount", "status", "work_status", "source"
    ],
    hidden: [],
    nowOnInsert: ["created_at"],
  },
  {
    resource: "car-booking-details",
    label: "Car Bookings",
    table: "tbl_car_booking_details",
    pk: "id",
    pkAuto: true,
    columns: [
      "id", "bookingRef", "vendorCode", "vehicleClass", "acrissCode",
      "pickupLocation", "pickupDateTime", "returnLocation", "returnDateTime",
      "ratePerDay", "estimatedTotalAmount", "contactPhone", "contactEmail",
      "status", "work_status", "source", "created_at"
    ],
    writable: [
      "bookingRef", "vendorCode", "vehicleClass", "acrissCode",
      "pickupLocation", "pickupDateTime", "returnLocation", "returnDateTime",
      "ratePerDay", "estimatedTotalAmount", "contactPhone", "contactEmail",
      "status", "work_status", "source"
    ],
    hidden: [],
    nowOnInsert: ["created_at"],
  },
];

const BY_RESOURCE = new Map(WORLDRIX_TABLES.map((t) => [t.resource, t]));

export function getWorldrixTable(resource: string): WorldrixTableDef | undefined {
  return BY_RESOURCE.get(resource);
}

/** Public metadata for the frontend (hidden columns excluded from display). */
export function worldrixMeta() {
  return WORLDRIX_TABLES.map((t) => ({
    resource: t.resource,
    label: t.label,
    pk: t.pk,
    pkAuto: t.pkAuto,
    columns: t.columns.filter((c) => !t.hidden.includes(c)),
    writable: t.writable,
  }));
}
