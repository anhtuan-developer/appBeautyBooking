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
  console.log(
    '📤 POST /api/bookings',
  );

  console.log(
    '📦 Booking body:',
    JSON.stringify(
      data,
      null,
      2,
    ),
  );

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

  console.log(
    '📋 GET /api/bookings/my-bookings',
  );

  console.log(
    '🌐 Endpoint:',
    endpoint,
  );

  return api.get<MyBookingsResponse>(
    endpoint,
  );
}