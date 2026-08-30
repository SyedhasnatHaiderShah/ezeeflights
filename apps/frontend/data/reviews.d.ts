export interface Review {
    id?: string;
    name: string;
    location: string;
    rating: number;
    date: string;
    text: string;
    avatarUrl?: string;
    isVerified?: boolean;
    flightRating?: number;
    hotelRating?: number;
    carRating?: number;
    supplierResponse?: string | null;
    flaggedCount?: number;
    photos?: string[];
}
export declare const REVIEWS: Review[];
