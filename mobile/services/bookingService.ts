import { api } from '@/lib/api';

export interface CreateBookingRequest {
  employeeId: number;
  serviceId: number;
  bookingDate: string;
  startTime: string;
  endTime: string;
}

export interface Booking {
  bookingId: number;
  userId?: number;
  salonId?: number;
  serviceId: number;
  employeeId: number;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: string;
  createdAt?: string;
}

export interface CreateBookingResponse {
  success: boolean;
  message: string;
  data?: Booking;
}

/**
 * Tạo booking.
 *
 * userId không gửi từ mobile.
 * Backend lấy userId từ JWT.
 */
export async function createBooking(
  data: CreateBookingRequest,
): Promise<CreateBookingResponse> {
  console.log(
    '📤 POST /api/bookings',
  );

  console.log(
    '📦 Booking body:',
    JSON.stringify(data, null, 2),
  );

  return api.post<CreateBookingResponse>(
    '/bookings',
    data,
  );
}