export type UserRole = 'customer' | 'provider' | 'admin';
export type AccountStatus = 'pending' | 'active' | 'suspended' | 'deactivated';
export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export interface ProviderProfile {
  user_id: number;
  bio: string | null;
  years_experience: number;
  verification_status: VerificationStatus;
  avg_rating: string;
  total_reviews: number;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  status: AccountStatus;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
  provider_profile?: ProviderProfile | null;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirm_password: string;
  full_name: string;
  phone?: string | null;
  role: Exclude<UserRole, 'admin'>;
  provider_profile?: {
    bio?: string | null;
    years_experience: number;
  } | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface UserProfileUpdate {
  full_name?: string | null;
  phone?: string | null;
  password?: string | null;
}

export interface ProviderProfileUpdate {
  bio?: string | null;
  years_experience?: number | null;
}
