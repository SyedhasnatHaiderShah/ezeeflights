import { apiFetch } from './client';
export type PaymentIntent = Record<string, unknown>; export type PaymentResult = Record<string, unknown>; export type WalletBalance={balance:number};
export type WalletTransaction=Record<string, unknown>; export type PaymentMethod=Record<string, unknown>; export type Transaction=Record<string, unknown>;
export const initiatePayment=(payload:{bookingId:string;amount:number;currency:string;provider?:string;useWalletAmount?:number;paymentMethodId?:string;successUrl?:string;failureUrl?:string})=>apiFetch<PaymentIntent>('/payments/initiate',{method:'POST',body:JSON.stringify(payload)});
export const confirmPayment=(paymentIntentId:string)=>apiFetch<PaymentResult>('/payments/confirm',{method:'POST',body:JSON.stringify({paymentIntentId})});
export const getWalletBalance=()=>apiFetch<WalletBalance>('/payments/wallet/me');
export const addWalletFunds=(amount:number,currency:string)=>apiFetch<WalletTransaction>('/payments/wallet/add',{method:'POST',body:JSON.stringify({amount,currency})});
export const getPaymentMethods=()=>apiFetch<PaymentMethod[]>('/payments/methods');
export const getTransactionHistory=()=>apiFetch<Transaction[]>('/payments/transactions');
