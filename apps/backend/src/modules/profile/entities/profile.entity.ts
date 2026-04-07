export interface UserProfileEntity {
  id: string;
  userId: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | 'UNSPECIFIED' | null;
  passportNumber: string | null;
  nationality: string | null;
  preferences: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface SavedTravelerEntity {
  id: string;
  userId: string;
  fullName: string;
  passportNumber: string;
  dob: string;
  nationality: string;
  createdAt: Date;
  updatedAt: Date;
}
