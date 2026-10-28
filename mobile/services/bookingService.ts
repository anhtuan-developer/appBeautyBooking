import { api } from '@/lib/api';

/**
 * =========================
 * CREATE BOOKING
 * =========================
 */

export interface CreateBookingRequest {
  employeeId: number;
  serviceId: number;
  bookingDate: string;
  startTime: string;
  endTime: string;
  note?: string;
}

export interface CreateBookingData {
  booking: {
    BookingId: string;
    UserId: number;
    SalonId: number;
    ServiceId: number;
    EmployeeId: number;

    BookingDate: string;
    StartTime: string;
    EndTime: string;

    Status: string;
    Note?: string | null;

    CreatedAt?: string;
    UpdatedAt?: string | null;
  };

  employee: {
    employeeId: string;
    fullName: string;
  };

  service: {
    serviceId: string;
    serviceName: string;
    price: number;
    durationMinutes: number;
  };
}

export interface CreateBookingResponse {
  success: boolean;
  message: string;
  data?: CreateBookingData;
}

/**
 * =========================
 * MY BOOKINGS
 * =========================
 */

export interface Booking {
  BookingId: string;

  UserId: number;

  SalonId: number;
  SalonName: string;

  ServiceId: number;
  ServiceName: string;
  Price: number;
  DurationMinutes: number;

  EmployeeId: number;
  EmployeeName: string;

  BookingDate: string;
  StartTime: string;
  EndTime: string;

  Status: string;

  Note?: string | null;

  CreatedAt?: string;
  UpdatedAt?: string | null;
}

export interface BookingPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface MyBookingsData {
  items: Booking[];

  pagination: BookingPagination;

  status?: string;
}

export interface MyBookingsResponse {
  success: boolean;

  message?: string;

  data: MyBookingsData;
}

/**
 * =========================
 * CREATE BOOKING
 * =========================
 */

export async function createBooking(
  data: CreateBookingRequest,
): Promise<CreateBookingResponse> {
  return api.post<CreateBookingResponse>(
    '/bookings',
    data,
  );
}

/**
 * =========================
 * GET MY BOOKINGS
 * =========================
 */

export async function getMyBookings(
  page = 1,
  limit = 10,
  status?: string,
): Promise<MyBookingsResponse> {
  const params = new URLSearchParams();

  params.append(
    'page',
    String(page),
  );

  params.append(
    'limit',
    String(limit),
  );

  if (status) {
    params.append(
      'status',
      status,
    );
  }

  const endpoint =
    `/bookings/my-bookings?${params.toString()}`;

  
  
  return api.get<MyBookingsResponse>(
    endpoint,
  );
}

/**
 * =========================
 * BOOKING DETAIL
 * =========================
 */

export interface BookingDetail extends Booking {
  SalonAddress?: string | null;
  SalonPhone?: string | null;

  ServiceDescription?: string | null;
  ServiceImageUrl?: string | null;

  EmployeePhone?: string | null;
  EmployeeAvatarUrl?: string | null;
  Specialization?: string | null;
}

export interface BookingDetailResponse {
  success: boolean;
  message?: string;
  data: BookingDetail;
}

/**
 * =========================
 * CANCEL BOOKING
 * =========================
 */

export interface CancelBookingData {
  booking: {
    BookingId: string;
    UserId: number;
    SalonId: number;
    ServiceId: number;
    EmployeeId: number;
    BookingDate: string;
    StartTime: string;
    EndTime: string;
    Status: string;
    Note?: string | null;
    CreatedAt?: string;
    UpdatedAt?: string | null;
  };
}

export interface CancelBookingResponse {
  success: boolean;
  message: string;
  data?: CancelBookingData;
}

/**
 * =========================
 * GET BOOKING DETAIL
 * =========================
 */

export async function getBookingDetail(
  bookingId: number,
): Promise<BookingDetailResponse> {
  
  return api.get<BookingDetailResponse>(
    `/bookings/${bookingId}`,
  );
}

/**
 * =========================
 * CANCEL BOOKING
 * =========================
 */

export async function cancelBooking(
  bookingId: number,
): Promise<CancelBookingResponse> {
  
  return api.patch<CancelBookingResponse>(
    `/bookings/${bookingId}/cancel`,
  );
}
