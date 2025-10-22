// Firebase Data Types

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
  
  last_updated?: string;
}

export interface JumuahTimes {
  first_khutbah: string;
  first_prayer: string;
  second_khutbah: string;
  second_prayer: string;
  last_updated?: string;
}

export interface MosqueSettings {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  imam?: string;
  latitude?: number;
  longitude?: number;
  calculation_method?: number;
  auto_fetch_maghrib?: boolean;
  last_updated?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // ISO date string (YYYY-MM-DD)
  time: string; // e.g., "7:00 PM"
  location?: string;
  category: string;
  speaker?: string;
  image_url?: string;
  rsvp_enabled?: boolean;
  rsvp_limit?: number;
  rsvp_count?: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
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
  updated_at: string;
}

// Component Props Types

export interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>;
  error: string;
}

export interface HeaderProps {
  onLogout: () => void;
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
  jumuahTimes: JumuahTimes;
  onChange: (times: JumuahTimes) => void;
  onSave: () => void;
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

  updated_at: any;
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
  date: string; // YYYY-MM-DD (Sydney timezone)
  created_at: any;
  completed_at?: any;
  updated_at: any;
}

// Campaign
export interface Campaign {
  id: string;
  title: string;
  description: string;
  goal_amount: number; // In cents
  current_amount: number; // In cents
  currency: string;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  status: CampaignStatus;
  image_url?: string;
  is_visible_in_app: boolean;
  created_at: any;
  updated_at: any;
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
  next_payment_date: string; // YYYY-MM-DD

  // Donation details
  donation_type_id: string;
  donation_type_label: string;
  campaign_id?: string;

  // Timestamps
  created_at: any;
  started_at: any;
  cancelled_at?: any;
  last_payment_at?: any;
  last_payment_donation_id?: string;
}