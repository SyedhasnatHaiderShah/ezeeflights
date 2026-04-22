export interface PublicReviewRow {
  id: string;
  authorName: string;
  authorAvatar: string | null;
  authorLocation: string;
  rating: number;
  text: string;
  isVerified: boolean;
  category: string | null;
  createdAt: string;
}

export interface ReviewsListResponse {
  data: PublicReviewRow[];
  total: number;
  page: number;
  limit: number;
}
