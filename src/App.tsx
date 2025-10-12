import React, { useState, useEffect } from 'react';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

// Import components
import LoginForm from './components/LoginForm';
import Header from './components/Header';
import Tabs from './components/Tabs';
import SaveNotification from './components/SaveNotification';
import PrayerTimesTab from './components/PrayerTimesTab';
import JumuahTimesTab from './components/JumuahTimesTab';
import MosqueSettingsTab from './components/MosqueSettingsTab';

// Import custom hook
import { useFirebaseAuth } from './hooks/useFirebaseAuth';

// Import types
import { PrayerTimes, JumuahTimes, MosqueSettings } from './types';

const db = getFirestore();

export default function AdminDashboard(): React.JSX.Element {
  const { isAuthenticated, loading: authLoading, error: authError, login, logout } = useFirebaseAuth();
  const [activeTab, setActiveTab] = useState<string>('prayer');
  const [saveStatus, setSaveStatus] = useState<'success' | 'error' | ''>('');
  const [saving, setSaving] = useState<boolean>(false);
  
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes>({
    fajr_adhan: '5:30 AM',
    fajr_iqama: '5:45 AM',
    dhuhr_adhan: '12:45 PM',
    dhuhr_iqama: '1:00 PM',
    asr_adhan: '4:15 PM',
    asr_iqama: '4:30 PM',
    maghrib_adhan: '7:20 PM',
    maghrib_iqama: '7:25 PM',
    isha_adhan: '8:45 PM',
    isha_iqama: '9:00 PM',
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
    last_updated: new Date().toISOString().split('T')[0]
  });

  // Load data from Firebase when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async (): Promise<void> => {
    try {
      const prayerDoc = await getDoc(doc(db, 'prayerTimes', 'current'));
      if (prayerDoc.exists()) {
        setPrayerTimes(prayerDoc.data() as PrayerTimes);
      }

      const jumuahDoc = await getDoc(doc(db, 'jumuahTimes', 'current'));
      if (jumuahDoc.exists()) {
        setJumuahTimes(jumuahDoc.data() as JumuahTimes);
      }

      const settingsDoc = await getDoc(doc(db, 'mosqueSettings', 'info'));
      if (settingsDoc.exists()) {
        setMosqueSettings(settingsDoc.data() as MosqueSettings);
      }

      console.log('Data loaded from Firebase successfully');
    } catch (error) {
      console.error('Error loading data:', error);
      showSaveStatus(false);
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
      console.log('Prayer times saved to Firebase:', updatedPrayerTimes);
      showSaveStatus(true);
    } catch (error) {
      console.error('Error saving prayer times:', error);
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
      console.log('Jumuah times saved to Firebase:', updatedJumuah);
      showSaveStatus(true);
    } catch (error) {
      console.error('Error saving Jumuah times:', error);
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
      console.log('Mosque settings saved to Firebase:', updatedSettings);
      showSaveStatus(true);
    } catch (error) {
      console.error('Error saving mosque settings:', error);
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