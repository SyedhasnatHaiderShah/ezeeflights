import { apiFetch } from './client';

export type CurrencyCode = 'USD' | 'AED' | 'EUR' | 'GBP';
export type SeatPreference = 'WINDOW' | 'AISLE' | 'MIDDLE';
export type CabinClass = 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
export type MealPreference = 'VEG' | 'NON_VEG' | 'VEGAN' | 'HALAL' | 'KOSHER' | 'GLUTEN_FREE' | string;

export type NotificationPreferences = {
  email?: boolean;
  sms?: boolean;
  whatsapp?: boolean;
  push?: boolean;
};

export type TravelPreferences = {
  seatPreference?: SeatPreference | string;
  mealPreference?: MealPreference;
  cabinClass?: CabinClass | string;
  language?: string;
  currency?: CurrencyCode | string;
  accessibilityNeeds?: string[];
  notificationPreferences?: NotificationPreferences;
};

export type UserPreferences = TravelPreferences | Record<string, unknown>;
export type UpdatePrefsDto = Partial<TravelPreferences> | Record<string, unknown>;

export type UserProfileRecord = {
  id?: string;
  userId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  nationality?: string;
  passportNumber?: string;
  passportExpiry?: string;
  dateOfBirth?: string;
  gender?: string;
  avatarUrl?: string;
  preferences?: TravelPreferences;
  createdAt?: string;
  updatedAt?: string;
};

export type LoyaltyAccount = {
  id: string;
  userId: string;
  pointsBalance: number;
  lifetimePoints: number;
  tier: string;
  referralCode: string | null;
};

export type SavedTraveler = {
  id: string;
  fullName: string;
  passportNumber: string;
  dob: string;
  nationality: string;
};

export type ProfileOverview = {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  preferredCurrency?: CurrencyCode;
  phone?: string;
  role?: string;
  avatarUrl?: string;
  nationality?: string;
  passportNumber?: string;
  passportExpiry?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  profile?: UserProfileRecord | null;
  preferences?: TravelPreferences;
  loyaltyAccount?: LoyaltyAccount | null;
  travelers?: SavedTraveler[];
  travelHistory?: unknown[];
};

export type UserProfile = ProfileOverview;

export type UpdateProfileDto = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  nationality?: string;
  passportNumber?: string;
  passportExpiry?: string;
  dateOfBirth?: string;
  gender?: string;
  avatarUrl?: string;
  preferences?: TravelPreferences;
};

export type AddTravelerDto = {
  fullName: string;
  passportNumber: string;
  dob: string;
  nationality: string;
};

export const getProfile = () => apiFetch<ProfileOverview>('/profile/me');

export const updateProfile = (dto: UpdateProfileDto) =>
  apiFetch<ProfileOverview>('/profile/me', { method: 'PATCH', body: JSON.stringify(dto) });

export const uploadAvatar = (file: File) =>
  apiFetch<{ avatarUrl: string }>('/profile/avatar', {
    method: 'POST',
    body: JSON.stringify({ fileName: file.name, fileType: file.type }),
  });

export const getTravelers = () => apiFetch<SavedTraveler[]>('/profile/travelers');

export const addTraveler = (dto: AddTravelerDto) =>
  apiFetch<SavedTraveler>('/profile/travelers', { method: 'POST', body: JSON.stringify(dto) });

export const updateTraveler = (id: string, dto: AddTravelerDto) =>
  apiFetch<SavedTraveler>(`/profile/travelers/${id}`, { method: 'PATCH', body: JSON.stringify(dto) });

export const deleteTraveler = (id: string) => apiFetch<void>(`/profile/travelers/${id}`, { method: 'DELETE' });

export const getLoyaltyAccount = () => apiFetch<LoyaltyAccount>('/loyalty/me');

export const getLoyaltyTransactions = () => apiFetch<unknown[]>('/loyalty/transactions');

export const getPreferences = async () => {
  const profile = await getProfile();
  return profile.preferences ?? profile.profile?.preferences ?? {};
};

export const updatePreferences = (prefs: TravelPreferences) => updateProfile({ preferences: prefs });
