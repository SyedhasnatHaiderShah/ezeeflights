import { apiFetch } from "./client";

export type CurrencyCode = "USD" | "AED" | "EUR" | "GBP";
export type SeatPreference = "WINDOW" | "AISLE" | "MIDDLE";
export type CabinClass = "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST";
export type MealPreference =
  | "VEG"
  | "NON_VEG"
  | "VEGAN"
  | "HALAL"
  | "KOSHER"
  | "GLUTEN_FREE"
  | string;

export type NotificationPreferences = {
  email?: boolean;
  sms?: boolean;
  whatsapp?: boolean;
  push?: boolean;
};

export type SavedGuest = {
  id: string;
  fullName: string;
  age: number;
  type: "ADULT" | "CHILD";
  gender?: string;
  email?: string;
  phone?: string;
};

export type TravelPreferences = {
  seatPreference?: SeatPreference | string;
  mealPreference?: MealPreference;
  cabinClass?: CabinClass | string;
  language?: string;
  currency?: CurrencyCode | string;
  accessibilityNeeds?: string[];
  notificationPreferences?: NotificationPreferences;
  savedGuests?: SavedGuest[];
};

export type UserPreferences = TravelPreferences | Record<string, unknown>;
export type UpdatePrefsDto =
  | Partial<TravelPreferences>
  | Record<string, unknown>;

export type UserProfileRecord = {
  id?: string;
  userId?: string;
  email?: string;
  firstName?: string;
  middleName?: string;
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
  gender?: string;
};

export type ProfileOverview = {
  id: string;
  email: string;
  name: string;
  hasPassword?: boolean;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  dateOfBirth?: string | null;
  gender?: string | null;
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
  id?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  firstName?: string;
  middleName?: string;
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
  gender?: string;
};

export const getProfile = (options?: { suppressErrorLog?: boolean }) =>
  apiFetch<ProfileOverview>("/user/profile", undefined, options);

export const updateProfile = (dto: UpdateProfileDto) => {
  const {
    id: _id,
    userId: _userId,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    avatarUrl: _avatarUrl,
    ...body
  } = dto;
  return apiFetch<ProfileOverview>("/user/profile", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
};

export const uploadAvatar = (file: File) =>
  apiFetch<{ avatarUrl: string }>("/profile/avatar", {
    method: "POST",
    body: JSON.stringify({ fileName: file.name, fileType: file.type }),
  });

export const changePassword = (currentPassword: string | undefined, newPassword: string) =>
  apiFetch<{ message?: string }>("/user/password", {
    method: "PATCH",
    body: JSON.stringify({ currentPassword, newPassword }),
  });

export const getTravelers = () =>
  apiFetch<SavedTraveler[]>("/profile/travelers");

export const addTraveler = (dto: AddTravelerDto) =>
  apiFetch<SavedTraveler>("/profile/travelers", {
    method: "POST",
    body: JSON.stringify(dto),
  });

export const updateTraveler = (id: string, dto: AddTravelerDto) =>
  apiFetch<SavedTraveler>(`/profile/travelers/${id}`, {
    method: "PATCH",
    body: JSON.stringify(dto),
  });

export const deleteTraveler = (id: string) =>
  apiFetch<void>(`/profile/travelers/${id}`, { method: "DELETE" });

export const getLoyaltyAccount = () => apiFetch<LoyaltyAccount>("/loyalty/me");

export const getLoyaltyTransactions = () =>
  apiFetch<unknown[]>("/loyalty/transactions");

export const getPreferences = async () => {
  const profile = await getProfile();
  return profile.preferences ?? profile.profile?.preferences ?? {};
};

export const updatePreferences = (prefs: TravelPreferences) =>
  updateProfile({ preferences: prefs });
