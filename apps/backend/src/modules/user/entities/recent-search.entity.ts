export interface RecentSearchEntity {
  id: string;
  userId: string;
  origin: string;
  destination: string;
  searchType: string;
  searchDate: Date | null;
  metadata: any;
  createdAt: Date;
}
