export interface WishlistRecord {
  id: string;
  userId: string | null;
  sessionId: string | null;
  entityType: string;
  entityId: string;
  data: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface WishlistPublicView {
  id: string;
  entityType: string;
  entityId: string;
  data: any;
  createdAt: Date;
}
