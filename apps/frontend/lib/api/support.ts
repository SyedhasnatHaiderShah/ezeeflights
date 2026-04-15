import { apiFetch } from './client';
export type CreateTicketDto=Record<string,unknown>; export type SupportTicket=Record<string,unknown>; export type TicketMessage=Record<string,unknown>;
export const createTicket=(dto:CreateTicketDto)=>apiFetch<SupportTicket>('/support/tickets',{method:'POST',body:JSON.stringify(dto)});
export const getTickets=(status?:string,page=1)=>apiFetch<SupportTicket[]>(`/support/tickets?status=${status??''}&page=${page}`);
export const getTicketById=(ticketId:string)=>apiFetch<SupportTicket>(`/support/tickets/${ticketId}`);
export const addMessage=(ticketId:string,message:string)=>apiFetch<TicketMessage>(`/support/tickets/${ticketId}/messages`,{method:'POST',body:JSON.stringify({message})});
export const closeTicket=(ticketId:string)=>apiFetch<void>(`/support/tickets/${ticketId}/close`,{method:'PATCH'});
