import { api } from '@/lib/api';

export interface SalonReview {
  ReviewId: number;
  BookingId: number;
  UserId: number;
  SalonId: number;
  Rating: number;
  Comment: string | null;
  CreatedAt: string;
  UserName?: string;
}

export interface ReviewResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

export async function createReview(bookingId: number, rating: number, comment?: string) {
  return api.post<ReviewResponse>('/reviews', {
    bookingId,
    rating,
    comment: comment?.trim() || undefined,
  });
}

export async function getSalonReviews(salonId: number) {
  return api.get<{ success: boolean; data: { total: number; items: SalonReview[] } }>(`/reviews/salon/${salonId}`);
}

export async function getMyReviews() {
  return api.get<{ success: boolean; data: { total: number; items: SalonReview[] } }>('/reviews/my-reviews');
}
