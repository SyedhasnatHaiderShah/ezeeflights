export interface UserRecord {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  preferredCurrency: 'USD' | 'AED' | 'EUR' | 'GBP';
  phone: string | null;
  role: string;
  nationality: string | null;
  passportNumber: string | null;
  passportExpiry: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPublicView {
  id: string;
  email: string;
  name: string;
  firstName: string | null;
  lastName: string | null;
  preferredCurrency: 'USD' | 'AED' | 'EUR' | 'GBP';
  phone: string | null;
  role: string;
  nationality: string | null;
  passportNumber: string | null;
  passportExpiry: string | null;
  createdAt: Date;
  updatedAt: Date;
}
