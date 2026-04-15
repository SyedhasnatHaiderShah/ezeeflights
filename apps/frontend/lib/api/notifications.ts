import { apiFetch } from './client';
export type Notification=Record<string,unknown>; export type NotificationPrefs=Record<string,unknown>;
export const listNotifications=(page=1,limit=20)=>apiFetch<Notification[]>(`/notifications?page=${page}&limit=${limit}`);
export const getUnreadCount=()=>apiFetch<{count:number}>('/notifications/unread-count');
export const markAsRead=(notificationId:string)=>apiFetch<void>(`/notifications/${notificationId}/read`,{method:'PATCH'});
export const markAllAsRead=()=>apiFetch<void>('/notifications/read-all',{method:'PATCH'});
export const updatePreferences=(prefs:NotificationPrefs)=>apiFetch<void>('/notifications/preferences',{method:'PUT',body:JSON.stringify(prefs)});
