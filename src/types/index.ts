// Firebase Data Types

import { FieldValue, Timestamp } from 'firebase/firestore';

// ============================================================================
// ROLE & PERMISSION TYPES
// ============================================================================

import { RoleId, Permission } from '../constants/roles';

/**
 * User with roles and permissions
 */
export interface UserWithRoles {
  uid: string;
  email: string;
  displayName: string | null;
  roles: RoleId[];
  permissions: Permission[];
  isSuperAdmin: boolean;
  createdAt: string;
  lastSignIn: string;
  photoURL?: string | null;
}

/**
 * Firebase Auth custom claims structure
 */
export interface CustomClaims {
  roles?: RoleId[];
  permissions?: Permission[];
  isSuperAdmin?: boolean;
  admin?: boolean; // Legacy support
  role?: string; // Legacy support
  superAdmin?: boolean; // Legacy support
}

// ============================================================================
// FIREBASE DATA TYPES
// ============================================================================

export interface PrayerTimes {
  fajr_adhan: string;
  fajr_iqama: string;
  fajr_iqama_type: 'fixed' | 'offset';
  fajr_iqama_offset?: number;
  
  dhuhr_adhan: string;
  dhuhr_iqama: string;
  dhuhr_iqama_type: 'fixed' | 'offset';
  dhuhr_iqama_offset?: number;
  
  asr_adhan: string;
  asr_iqama: string;
  asr_iqama_type: 'fixed' | 'offset';
  asr_iqama_offset?: number;
  
  maghrib_adhan: string;
  maghrib_iqama: string;
  maghrib_iqama_type: 'fixed' | 'offset';
  maghrib_iqama_offset?: number;
  
  isha_adhan: string;
  isha_iqama: string;
  isha_iqama_type: 'fixed' | 'offset';
  isha_iqama_offset?: number;
  
  last_updated?: Timestamp | FieldValue;
}

export interface JumuahTime {
  id: string;
  khutbah: string;
}

export interface JumuahData {
  times: JumuahTime[];
  last_updated?: Timestamp | FieldValue;
}

export interface MosqueSettings {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  imam?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string; // IANA timezone identifier (e.g., 'Australia/Sydney')
  calculation_method?: 'MuslimWorldLeague' | 'Egyptian' | 'Karachi' | 'UmmAlQura' | 'Dubai' | 'MoonsightingCommittee' | 'NorthAmerica' | 'Kuwait' | 'Qatar' | 'Singapore' | 'Tehran' | 'Turkey';
  auto_fetch_maghrib?: boolean;
  last_updated?: Timestamp | FieldValue;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: Timestamp;
  time: string; // e.g., "7:00 PM"
  location?: string;
  category: string;
  speaker?: string;
  image_url?: string;
  rsvp_enabled?: boolean;
  rsvp_limit?: number;
  rsvp_count?: number;
  is_active: boolean;
  created_at?: Timestamp;
  updated_at?: Timestamp;
}

export interface EventCategory {
  id: string;
  label: string;
  color_bg: string;
  color_text: string;
  order: number;
  is_active: boolean;
}

// NEW: Event Categories Config (for Firestore document)
export interface EventCategoriesConfig {
  categories: EventCategory[];
  updated_at: Timestamp;
}

// Component Props Types

export interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>;
  error: string;
}

export interface HeaderProps {
  onLogout: () => void;
  onHome?: () => void;
}

export interface TabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export interface SaveNotificationProps {
  status: 'success' | 'error' | '';
  message?: string;
}

export interface PrayerTimesTabProps {
  prayerTimes: PrayerTimes;
  onChange: (times: PrayerTimes) => void;
  onSave: () => void;
  saving: boolean;
  mosqueSettings?: MosqueSettings;
}

export interface JumuahTimesTabProps {
  jumuahTimes: JumuahData | null;
  onChange: (data: JumuahData) => void;
  onSave: () => Promise<void>;
  saving: boolean;
}

export interface MosqueSettingsTabProps {
  mosqueSettings: MosqueSettings;
  onChange: (settings: MosqueSettings) => void;
  onSave: () => void;
  saving: boolean;
}

export interface EventsTabProps {
  saving: boolean;
  onSaveStatusChange: (success: boolean) => void;
}
// ============================================================================
// DONATION TYPES
// ============================================================================

// Payment & Status Types
export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded';
export type PaymentMethodType = 'card' | 'apple_pay' | 'google_pay' | 'bank_transfer';
export type RecurringFrequency = 'weekly' | 'fortnightly' | 'monthly' | 'yearly';
export type CampaignStatus = 'active' | 'completed' | 'paused';
export type RecurringDonationStatus = 'active' | 'paused' | 'cancelled';

// Donation Type Configuration (admin-configurable)
export interface DonationType {
  id: string;
  label: string;
  enabled: boolean;
}

// Recurring Frequency Configuration
export interface RecurringFrequencyOption {
  id: RecurringFrequency;
  label: string;
  enabled: boolean;
}

// Donation Settings (admin-configurable)
export interface DonationSettings {
  // Donation types
  donation_types: DonationType[];

  // Preset amounts
  preset_amounts: number[];
  allow_custom_amount: boolean;
  minimum_amount: number;
  currency: string;

  // Recurring frequencies
  recurring_frequencies: RecurringFrequencyOption[];

  // Receipt settings
  auto_send_receipt: boolean;
  receipt_prefix: string;

  // Tax settings
  is_dgr_registered: boolean;

  updated_at: Timestamp;
}

// Main Donation Record
export interface Donation {
  id: string;
  receipt_number: string;

  // Donor info
  donor_name: string;
  donor_email: string;
  donor_phone?: string;

  // Payment info
  amount: number; // In cents
  currency: string;

  // Stripe details
  stripe_payment_intent_id?: string;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  payment_method_type: PaymentMethodType;
  card_last4?: string;
  card_brand?: string;

  // Status
  payment_status: PaymentStatus;

  // Donation details
  donation_type_id: string;
  donation_type_label: string;
  campaign_id?: string;
  is_recurring: boolean;
  recurring_frequency?: RecurringFrequency;

  // Metadata
  donor_message?: string;
  admin_notes?: string;

  // Timestamps
  date: Timestamp;
  created_at: Timestamp;
  completed_at?: Timestamp;
  updated_at: Timestamp;
}

// Campaign
export interface Campaign {
  id: string;
  title: string;
  description: string;
  goal_amount: number; // In cents
  current_amount: number; // In cents
  currency: string;
  start_date: Timestamp;
  end_date: Timestamp;
  status: CampaignStatus;
  image_url?: string;
  is_visible_in_app: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}

// Recurring Donation
export interface RecurringDonation {
  id: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;

  // Donor info
  donor_name: string;
  donor_email: string;

  // Subscription details
  amount: number; // In cents
  currency: string;
  frequency: RecurringFrequency;

  // Status
  status: RecurringDonationStatus;
  next_payment_date: Timestamp;

  // Donation details
  donation_type_id: string;
  donation_type_label: string;
  campaign_id?: string;

  // Timestamps
  created_at: Timestamp;
  started_at: Timestamp;
  cancelled_at?: Timestamp;
  last_payment_at?: Timestamp;
  last_payment_donation_id?: string;
}