import { api } from '@/lib/api';

export interface EmployeeInfo {
  employeeId: string;
  fullName: string;
}

export interface ServiceInfo {
  serviceId: string;
  serviceName: string;
  price: number;
  durationMinutes: number;
}

export interface AvailableSlot {
  startTime: string;
  endTime: string;
  durationMinutes?: number;
  available?: boolean;
}

export type AvailabilityStatus =
  | 'AVAILABLE'
  | 'PAST_DATE'
  | 'NO_WORKING_SCHEDULE'
  | 'SERVICE_TOO_LONG'
  | 'NO_TIME_LEFT_TODAY'
  | 'ALL_SLOTS_BOOKED'
  | 'NO_AVAILABLE_SLOT';

export interface AvailableSlotsData {
  employee: EmployeeInfo;
  service: ServiceInfo | null;
  date: string;
  dayOfWeek: number;
  availabilityStatus?: AvailabilityStatus;
  availabilityMessage?: string;
  slots: AvailableSlot[];
}

export interface AvailableSlotsResponse {
  success: boolean;
  message?: string;
  data: AvailableSlotsData;
}

export async function getAvailableSlots(
  employeeId: number,
  serviceId: number,
  date: string,
): Promise<AvailableSlotsResponse> {
  const params = new URLSearchParams();

  params.append('serviceId', String(serviceId));
  params.append('date', date);

  return api.get<AvailableSlotsResponse>(
    `/schedules/employee/${employeeId}/available-slots?${params.toString()}`,
  );
}
