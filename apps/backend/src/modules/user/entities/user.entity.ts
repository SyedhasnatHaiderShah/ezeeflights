export interface UserEntity {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  preferredCurrency: 'USD' | 'AED' | 'EUR' | 'GBP';
  createdAt: Date;
}
