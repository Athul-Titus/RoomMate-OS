// ROOMMATE OS — Shared TypeScript types
// Used by both web app and future mobile app.
// Keep this file free of framework-specific imports.

// ── Generic API shapes ─────────────────────────────────────

export interface ApiMeta {
  request_id: string;
  timestamp: string;
  page?: number;
  page_size?: number;
  total?: number;
}

export interface ApiResponse<T> {
  data: T;
  meta: ApiMeta;
}

export interface ApiListResponse<T> {
  data: T[];
  meta: ApiMeta & { page: number; page_size: number; total: number };
}

export interface ApiError {
  code: string;
  message: string;
  request_id: string;
}

export interface ApiErrorResponse {
  error: ApiError;
}

// ── Auth ───────────────────────────────────────────────────

export type AccountStatus = 'pending' | 'active' | 'suspended' | 'deleted';

export interface AuthUser {
  id: string;
  email: string;
  account_status: AccountStatus;
  is_admin: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: 'bearer';
  expires_in: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  display_name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// ── Profiles ────────────────────────────────────────────────

export type WorkMode = 'office' | 'hybrid' | 'remote';
export type ProfileVisibility = 'public' | 'matches_only' | 'private';

export type OccupationCategory =
  | 'it_software'
  | 'design'
  | 'finance'
  | 'healthcare'
  | 'education'
  | 'sales_marketing'
  | 'operations'
  | 'other';

export interface PublicProfile {
  user_id: string;
  display_name: string;
  bio: string | null;
  occupation_category: OccupationCategory | null;
  work_mode: WorkMode | null;
  profile_visibility: ProfileVisibility;
  profile_completion: number;
  profile_photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface OwnProfile extends PublicProfile {
  employer_name: string | null;
}

export interface UpdateProfileRequest {
  display_name?: string;
  bio?: string;
  occupation_category?: OccupationCategory;
  employer_name?: string;
  work_mode?: WorkMode;
  profile_visibility?: ProfileVisibility;
}

export interface UserPreferences {
  user_id: string;
  min_budget: number | null;
  max_budget: number | null;
  currency: string;
  move_in_from: string | null;
  move_in_to: string | null;
  preferred_stay_months: number | null;
  created_at: string;
  updated_at: string;
}

export interface UpdatePreferencesRequest {
  min_budget?: number;
  max_budget?: number;
  move_in_from?: string;
  move_in_to?: string;
  preferred_stay_months?: number;
}

export interface ProfileCompletion {
  percentage: number;
  completed_fields: string[];
  missing_fields: string[];
}

// ── Location ────────────────────────────────────────────────

export interface City {
  id: string;
  name: string;
  state: string;
  timezone: string;
}

export interface Neighbourhood {
  id: string;
  city_id: string;
  name: string;
}

// ── Groups (Phase 3) ─────────────────────────────────────────

export type GroupStatus =
  | 'DRAFT'
  | 'OPEN'
  | 'FORMING'
  | 'READY_TO_SEARCH'
  | 'RENTAL_PENDING'
  | 'ACTIVE_TENANCY'
  | 'CLOSED';

export type GroupRole = 'creator' | 'admin' | 'member';

// ── Properties (Phase 3) ─────────────────────────────────────

export type ListingType =
  | 'entire_flat'
  | 'individual_room'
  | 'existing_household_replacement'
  | 'owner_listing'
  | 'manager_listing';

export type VerificationStatus =
  | 'UNVERIFIED'
  | 'PHONE_CONFIRMED'
  | 'OWNER_AUTHORITY_REVIEW_PENDING'
  | 'OWNER_AUTHORITY_REVIEWED'
  | 'PROPERTY_DETAILS_REVIEWED'
  | 'REPORTED'
  | 'SUSPENDED';

export type VoteValue = 'interested' | 'not_interested' | 'need_more_info';
