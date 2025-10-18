import React, { useState, useEffect } from 'react';
import { getFirestore, doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';

// Import components
import LoginForm from './components/LoginForm';
import Header from './components/Header';
import Tabs from './components/Tabs';
import SaveNotification from './components/SaveNotification';
import PrayerTimesTab from './components/PrayerTimesTab';
import JumuahTimesTab from './components/JumuahTimesTab';
import MosqueSettingsTab from './components/MosqueSettingsTab';
import EventsTab from './components/EventsTab';
import DonationSettingsTab from './components/DonationSettingsTab';

// Import custom hook
import { useFirebaseAuth } from './hooks/useFirebaseAuth';

// Import types
import { PrayerTimes, JumuahTimes, MosqueSettings, DonationSettings } from './types';

const db = getFirestore();

export default function AdminDashboard(): React.JSX.Element {
  const { isAuthenticated, loading: authLoading, error: authError, login, logout } = useFirebaseAuth();
  const [activeTab, setActiveTab] = useState<string>('prayer');
  const [saveStatus, setSaveStatus] = useState<'success' | 'error' | ''>('');
  const [saving, setSaving] = useState<boolean>(false);
  
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes>({
    fajr_adhan: '5:30 AM',
    fajr_iqama: '5:45 AM',
    fajr_iqama_type: 'fixed',
    fajr_iqama_offset: 15,
    
    dhuhr_adhan: '12:45 PM',
    dhuhr_iqama: '1:00 PM',
    dhuhr_iqama_type: 'fixed',
    dhuhr_iqama_offset: 15,
    
    asr_adhan: '4:15 PM',
    asr_iqama: '4:30 PM',
    asr_iqama_type: 'fixed',
    asr_iqama_offset: 15,
    
    maghrib_adhan: '7:20 PM',
    maghrib_iqama: '7:25 PM',
    maghrib_iqama_type: 'fixed',
    maghrib_iqama_offset: 5,
    
    isha_adhan: '8:45 PM',
    isha_iqama: '9:00 PM',
    isha_iqama_type: 'fixed',
    isha_iqama_offset: 15,
    
    last_updated: new Date().toISOString().split('T')[0]
  });
  
  const [jumuahTimes, setJumuahTimes] = useState<JumuahTimes>({
    first_khutbah: '12:30 PM',
    first_prayer: '1:00 PM',
    second_khutbah: '1:45 PM',
    second_prayer: '2:15 PM',
    last_updated: new Date().toISOString().split('T')[0]
  });
  
  const [mosqueSettings, setMosqueSettings] = useState<MosqueSettings>({
    name: 'Al Madina Masjid Yagoona',
    address: '123 Main Street, Yagoona NSW 2199',
    phone: '(02) 1234 5678',
    email: 'info@almadinamasjid.com.au',
    website: 'www.almadinamasjid.com.au',
    imam: 'Sheikh [Name]',
    latitude: -33.8688,
    longitude: 151.2093,
    calculation_method: 3,
    auto_fetch_maghrib: false,
    last_updated: new Date().toISOString().split('T')[0]
  });

  // Donation settings state
  const [donationSettings, setDonationSettings] = useState<DonationSettings | null>(null);

  // Load data from Firebase when authenticated (with delay for auth to settle)
  useEffect(() => {
    if (!isAuthenticated) return;
    
    // Small delay to ensure Firebase auth is fully initialized
    const timer = setTimeout(() => {
      loadData();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  // Load donation settings with real-time updates
  useEffect(() => {
    if (!isAuthenticated) return;

    // Small delay to ensure auth is ready
    const timer = setTimeout(() => {
      const unsubscribe = onSnapshot(
        doc(db, 'donationSettings', 'config'),
        (docSnapshot) => {
          if (docSnapshot.exists()) {
            setDonationSettings(docSnapshot.data() as DonationSettings);
            console.log('✅ Donation settings loaded');
          }
        },
        (error) => {
          // Log error but don't show notification (real-time listener can fail temporarily)
          console.warn('⚠️ Donation settings listener error (temporary):', error.message);
        }
      );

      // Cleanup function
      return () => {
        clearTimeout(timer);
        unsubscribe();
      };
    }, 300);

    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  const loadData = async (): Promise<void> => {
  // Double-check authentication
  if (!isAuthenticated) {
    console.log('⏳ Skipping loadData - not authenticated yet');
    return;
  }

  try {
    console.log('📖 Loading data from Firebase...');

    console.log('  → Loading prayer times...');
    const prayerDoc = await getDoc(doc(db, 'prayerTimes', 'current'));
    console.log('  ✅ Prayer times fetched:', prayerDoc.exists());
    
    if (prayerDoc.exists()) {
      const data = prayerDoc.data() as PrayerTimes;
      const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
      prayers.forEach(prayer => {
        if (!(data as any)[`${prayer}_iqama_type`]) {
          (data as any)[`${prayer}_iqama_type`] = 'fixed';
        }
        if (!(data as any)[`${prayer}_iqama_offset`]) {
          (data as any)[`${prayer}_iqama_offset`] = prayer === 'maghrib' ? 5 : 15;
        }
      });
      setPrayerTimes(data);
    }

    console.log('  → Loading jumuah times...');
    const jumuahDoc = await getDoc(doc(db, 'jumuahTimes', 'current'));
    console.log('  ✅ Jumuah times fetched:', jumuahDoc.exists());
    
    if (jumuahDoc.exists()) {
      setJumuahTimes(jumuahDoc.data() as JumuahTimes);
    }

    console.log('  → Loading mosque settings...');
    const settingsDoc = await getDoc(doc(db, 'mosqueSettings', 'info'));
    console.log('  ✅ Mosque settings fetched:', settingsDoc.exists());
    
    if (settingsDoc.exists()) {
      setMosqueSettings(settingsDoc.data() as MosqueSettings);
    }

    console.log('✅ Data loaded successfully');
  } catch (error) {
    console.error('❌ Error loading data (may be temporary):', error);
  }
};

  const handleLogin = async (email: string, password: string): Promise<void> => {
    await login(email, password);
  };

  const handleLogout = async (): Promise<void> => {
    await logout();
  };

  const showSaveStatus = (success: boolean): void => {
    setSaveStatus(success ? 'success' : 'error');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const savePrayerTimes = async (): Promise<void> => {
    setSaving(true);
    try {
      const updatedPrayerTimes: PrayerTimes = {
        ...prayerTimes,
        last_updated: new Date().toISOString().split('T')[0]
      };
      await setDoc(doc(db, 'prayerTimes', 'current'), updatedPrayerTimes);
      setPrayerTimes(updatedPrayerTimes);
      console.log('✅ Prayer times saved to Firebase');
      showSaveStatus(true);
    } catch (error) {
      console.error('❌ Error saving prayer times:', error);
      showSaveStatus(false);
    } finally {
      setSaving(false);
    }
  };

  const saveJumuahTimes = async (): Promise<void> => {
    setSaving(true);
    try {
      const updatedJumuah: JumuahTimes = {
        ...jumuahTimes,
        last_updated: new Date().toISOString().split('T')[0]
      };
      await setDoc(doc(db, 'jumuahTimes', 'current'), updatedJumuah);
      setJumuahTimes(updatedJumuah);
      console.log('✅ Jumuah times saved to Firebase');
      showSaveStatus(true);
    } catch (error) {
      console.error('❌ Error saving Jumuah times:', error);
      showSaveStatus(false);
    } finally {
      setSaving(false);
    }
  };

  const saveMosqueSettings = async (): Promise<void> => {
    setSaving(true);
    try {
      const updatedSettings: MosqueSettings = {
        ...mosqueSettings,
        last_updated: new Date().toISOString().split('T')[0]
      };
      await setDoc(doc(db, 'mosqueSettings', 'info'), updatedSettings);
      setMosqueSettings(updatedSettings);
      console.log('✅ Mosque settings saved to Firebase');
      showSaveStatus(true);
    } catch (error) {
      console.error('❌ Error saving mosque settings:', error);
      showSaveStatus(false);
    } finally {
      setSaving(false);
    }
  };

  const saveDonationSettings = async (): Promise<void> => {
    if (!donationSettings) return;
    
    setSaving(true);
    try {
      await setDoc(doc(db, 'donationSettings', 'config'), {
        ...donationSettings,
        updated_at: serverTimestamp(),
      });
      console.log('✅ Donation settings saved to Firebase');
      showSaveStatus(true);
    } catch (error) {
      console.error('❌ Error saving donation settings:', error);
      showSaveStatus(false);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        fontSize: '18px',
        color: '#6b7280'
      }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} error={authError} />;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6' }}>
      <Header onLogout={handleLogout} />
      
      <SaveNotification status={saveStatus} />
      
      <Tabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {activeTab === 'prayer' && (
          <PrayerTimesTab
            prayerTimes={prayerTimes}
            onChange={setPrayerTimes}
            onSave={savePrayerTimes}
            saving={saving}
            mosqueSettings={mosqueSettings}
          />
        )}

        {activeTab === 'jumuah' && (
          <JumuahTimesTab
            jumuahTimes={jumuahTimes}
            onChange={setJumuahTimes}
            onSave={saveJumuahTimes}
            saving={saving}
          />
        )}

        {activeTab === 'events' && (
          <EventsTab
            saving={saving}
            onSaveStatusChange={showSaveStatus}
          />
        )}

        {activeTab === 'donations' && (
          <DonationSettingsTab
            settings={donationSettings}
            onChange={setDonationSettings}
            onSave={saveDonationSettings}
            saving={saving}
          />
        )}

        {activeTab === 'settings' && (
          <MosqueSettingsTab
            mosqueSettings={mosqueSettings}
            onChange={setMosqueSettings}
            onSave={saveMosqueSettings}
            saving={saving}
          />
        )}
      </div>
    </div>
  );
}
