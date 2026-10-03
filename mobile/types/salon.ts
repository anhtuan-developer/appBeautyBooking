// types/salon.ts

/**
 * =========================
 * SALON
 * =========================
 */

export interface Salon {
  SalonId: number;

  SalonName: string;

  Address: string;

  Phone?: string | null;

  Description?: string | null;

  ImageUrl?: string | null;

  Latitude?: number | null;

  Longitude?: number | null;

  CreatedAt: string;

  ServiceCount: number;

  EmployeeCount: number;

  ReviewCount: number;

  AverageRating: number;
}

/**
 * =========================
 * PAGINATION
 * =========================
 */

export interface SalonPagination {
  page: number;

  limit: number;

  total: number;

  totalPages: number;
}

/**
 * =========================
 * GET SALONS
 * =========================
 */

export interface GetSalonsData {
  items: Salon[];

  pagination: SalonPagination;
}

export interface GetSalonsResponse {
  success: boolean;

  data: GetSalonsData;
}

/**
 * =========================
 * GET SALON DETAIL
 * =========================
 */

export interface SalonService {
  ServiceId: number;

  SalonId: number;

  ServiceName: string;

  Description?: string | null;

  Price: number;

  DurationMinutes: number;

  ImageUrl?: string | null;

  CreatedAt: string;
}

export interface SalonEmployee {
  EmployeeId: number;

  SalonId: number;

  FullName: string;

  Phone?: string | null;

  AvatarUrl?: string | null;

  Specialization?: string | null;

  CreatedAt: string;
}

export interface SalonDetail extends Salon {
  IsActive: boolean;

  services: SalonService[];

  employees: SalonEmployee[];
}

export interface GetSalonDetailResponse {
  success: boolean;

  data: SalonDetail;
}