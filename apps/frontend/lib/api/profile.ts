import { apiFetch } from './client';
export type UserProfile = {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  nationality?: string;
  passportNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  avatarUrl?: string;
  profile?: UserProfile; // In case of nested structure
  travelers?: SavedTraveler[];
  preferences?: UserPreferences;
};
export type UpdateProfileDto = Partial<UserProfile>;
export type SavedTraveler = {
  id: string;
  fullName: string;
  passportNumber: string;
  dob: string;
  nationality: string;
};
export type AddTravelerDto = Partial<SavedTraveler>;
export type UserPreferences = Record<string, unknown>;
export type UpdatePrefsDto = Record<string, unknown>;
export const getProfile=()=>apiFetch<UserProfile>('/profile/me');
export const updateProfile=(dto:UpdateProfileDto)=>apiFetch<UserProfile>('/profile/me',{method:'PATCH',body:JSON.stringify(dto)});
export const uploadAvatar=(file:File)=>apiFetch<{avatarUrl:string}>('/profile/avatar',{method:'POST',body:JSON.stringify({fileName:file.name,fileType:file.type})});
export const getTravelers=()=>apiFetch<SavedTraveler[]>('/profile/travelers');
export const addTraveler=(dto:AddTravelerDto)=>apiFetch<SavedTraveler>('/profile/travelers',{method:'POST',body:JSON.stringify(dto)});
export const updateTraveler=(id:string,dto:AddTravelerDto)=>apiFetch<SavedTraveler>(`/profile/travelers/${id}`,{method:'PATCH',body:JSON.stringify(dto)});
export const deleteTraveler=(id:string)=>apiFetch<void>(`/profile/travelers/${id}`,{method:'DELETE'});
export const getPreferences=()=>apiFetch<UserPreferences>('/profile/preferences');
export const updatePreferences=(prefs:UpdatePrefsDto)=>apiFetch<UserPreferences>('/profile/preferences',{method:'PATCH',body:JSON.stringify(prefs)});
