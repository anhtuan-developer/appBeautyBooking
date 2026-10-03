import { api } from '@/lib/api';

import {
  GetSalonDetailResponse,
  GetSalonsResponse,
  SalonEmployee,
} from '@/types/salon';

/**
 * =========================
 * GET SALON LIST
 * =========================
 */
export async function getSalons(
  search = '',
  page = 1,
  limit = 10,
): Promise<GetSalonsResponse> {
  const params = new URLSearchParams();

  params.append('page', String(page));
  params.append('limit', String(limit));

  if (search.trim()) {
    params.append(
      'search',
      search.trim(),
    );
  }

  return api.get<GetSalonsResponse>(
    `/salons?${params.toString()}`,
  );
}

/**
 * =========================
 * GET SALON DETAIL
 * =========================
 */
export async function getSalonById(
  salonId: number,
): Promise<GetSalonDetailResponse> {
  return api.get<GetSalonDetailResponse>(
    `/salons/${salonId}`,
  );
}

/**
 * =========================
 * GET SALON EMPLOYEES
 * =========================
 */
export async function getSalonEmployees(
  salonId: number,
): Promise<{
  success: boolean;
  data: SalonEmployee[];
}> {
  return api.get<{
    success: boolean;
    data: SalonEmployee[];
  }>(
    `/salons/${salonId}/employees`,
  );
}