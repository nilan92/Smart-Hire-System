export type BookingStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface Booking {
  id: number;
  customer_id: number;
  customer_name: string;
  provider_id: number;
  provider_name: string;
  service_id: number;
  service_name: string;
  booking_date: string;
  status: BookingStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookingCreateRequest {
  service_id: number;
  booking_date: string;
  notes?: string | null;
}

export interface Review {
  id: number;
  booking_id: number;
  customer_id: number;
  provider_id: number;
  service_id: number;
  rating: number;
  comment: string | null;
  created_at: string;
}

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Payment {
  id: number;
  booking_id: number;
  customer_id: number;
  amount: number;
  status: PaymentStatus;
  payment_method: string | null;
  transaction_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  is_read: boolean;
  booking_id: number | null;
  created_at: string;
}

export interface AvailabilitySlot {
  id: number;
  provider_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export interface AvailabilitySlotCreateRequest {
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;
