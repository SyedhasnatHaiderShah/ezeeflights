import { apiFetch } from './client';
export type Transfer=Record<string,unknown>; export type TransferBooking=Record<string,unknown>; export type TransferSearchParams=Record<string,string|number|boolean|undefined>; export type BookTransferDto=Record<string,unknown>;
const qs=(p:Record<string,unknown>)=>new URLSearchParams(Object.entries(p).filter(([,v])=>v!==undefined).map(([k,v])=>[k,String(v)])).toString();
export const searchTransfers=(params:TransferSearchParams)=>apiFetch<Transfer[]>(`/transfers/search?${qs(params)}`);
export const getTransferDetails=(transferId:string)=>apiFetch<Transfer>(`/transfers/${transferId}`);
export const bookTransfer=(dto:BookTransferDto)=>apiFetch<TransferBooking>('/transfers/book',{method:'POST',body:JSON.stringify(dto)});
export const getMyTransfers=()=>apiFetch<TransferBooking[]>('/transfers/me');
export const cancelTransfer=(bookingId:string)=>apiFetch<void>(`/transfers/${bookingId}/cancel`,{method:'PATCH'});
