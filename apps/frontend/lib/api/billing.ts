import { apiFetch } from './client';
export type Invoice=Record<string,unknown>; export type Receipt=Record<string,unknown>;
export const getInvoices=(page=1,limit=20)=>apiFetch<Invoice[]>(`/billing/invoices?page=${page}&limit=${limit}`);
export const getInvoiceById=(invoiceId:string)=>apiFetch<Invoice>(`/billing/invoices/${invoiceId}`);
export const downloadInvoice=(invoiceId:string)=>apiFetch<Blob>(`/billing/invoices/${invoiceId}/download`);
export const getReceipts=()=>apiFetch<Receipt[]>('/billing/receipts');
