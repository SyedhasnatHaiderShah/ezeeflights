import { apiFetchAuth } from '@/lib/api/client';

export interface UserDto {
  id: string;
  email: string;
  name: string;
  firstName: string | null;
  lastName: string | null;
  preferredCurrency: string;
  phone: string | null;
  role: string;
  nationality: string | null;
  passportNumber: string | null;
  passportExpiry: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: string;
  nationality?: string;
  passportNumber?: string;
  passportExpiry?: string;
}

export interface UpdateUserPayload {
  name?: string;
  phone?: string;
  nationality?: string;
  passportNumber?: string;
  passportExpiry?: string;
}

export function getUsers() {
  return apiFetchAuth<UserDto[]>('/users');
}

export function getUser(id: string) {
  return apiFetchAuth<UserDto>(`/users/${id}`);
}

export function createUser(data: CreateUserPayload) {
  return apiFetchAuth<UserDto>('/users', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateUser(id: string, data: UpdateUserPayload) {
  return apiFetchAuth<UserDto>(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteUser(id: string) {
  return apiFetchAuth<{ message: string }>(`/users/${id}`, {
    method: 'DELETE',
  });
}
