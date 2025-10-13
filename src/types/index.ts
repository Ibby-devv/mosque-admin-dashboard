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