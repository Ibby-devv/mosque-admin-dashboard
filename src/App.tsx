import React, { useState, useEffect, useCallback } from "react";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

// Import components
import ErrorBoundary from "./components/ErrorBoundary";
import LoginForm from "./components/LoginForm";
import Header from "./components/Header";
import Tabs from "./components/Tabs";
import SaveNotification from "./components/SaveNotification";
import PrayerTimesTab from "./components/PrayerTimesTab";
import JumuahTimesTab from "./components/JumuahTimesTab";
import MosqueSettingsTab from "./components/MosqueSettingsTab";
import EventsTab from "./components/EventsTab";
import DonationsTab from './components/DonationsTab';
import NotificationsTab from './components/NotificationsTab';
import AdminManagementTab from './components/AdminManagementTab';
import Loading from './components/ui/Loading';
import ToastContainer from './components/ui/ToastContainer';
// Import custom hook
import { useFirebaseAuth } from "./hooks/useFirebaseAuth";
import { useToast } from "./hooks/useToast";

// Import types
import {
  PrayerTimes,
  JumuahData,
  MosqueSettings,
  DonationSettings,
} from "./types";

const db = getFirestore();

export default function AdminDashboard(): React.JSX.Element {
  const {
    isAuthenticated,
    isAdmin,
    loading: authLoading,
    error: authError,
    login,
    logout,
  } = useFirebaseAuth();
  const { toasts, removeToast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("prayer");
  const [saveStatus, setSaveStatus] = useState<"success" | "error" | "">("");
  const [saving, setSaving] = useState<boolean>(false);

  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes>({
    fajr_adhan: "5:30 AM",
    fajr_iqama: "5:45 AM",
    fajr_iqama_type: "fixed",
    fajr_iqama_offset: 15,

    dhuhr_adhan: "12:45 PM",
    dhuhr_iqama: "1:00 PM",
    dhuhr_iqama_type: "fixed",
    dhuhr_iqama_offset: 15,

    asr_adhan: "4:15 PM",
    asr_iqama: "4:30 PM",
    asr_iqama_type: "fixed",
    asr_iqama_offset: 15,

    maghrib_adhan: "7:20 PM",
    maghrib_iqama: "7:25 PM",
    maghrib_iqama_type: "fixed",
    maghrib_iqama_offset: 5,

    isha_adhan: "8:45 PM",
    isha_iqama: "9:00 PM",
    isha_iqama_type: "fixed",
    isha_iqama_offset: 15,

    last_updated: new Date().toISOString().split("T")[0],
  });

  // New Jumuah data structure (times array). Start as null until loaded or edited.
  const [jumuahTimes, setJumuahTimes] = useState<JumuahData | null>(null);

  const [mosqueSettings, setMosqueSettings] = useState<MosqueSettings>({
    name: "Al Madina Masjid Yagoona",
    address: "123 Main Street, Yagoona NSW 2199",
    phone: "(02) 1234 5678",
    email: "info@almadinamasjid.com.au",
    website: "www.almadinamasjid.com.au",
    imam: "Sheikh [Name]",
    latitude: -33.8688,
    longitude: 151.2093,
    calculation_method: 3,
    auto_fetch_maghrib: false,
    last_updated: new Date().toISOString().split("T")[0],
  });

  // Donation settings state
  const [donationSettings, setDonationSettings] =
    useState<DonationSettings | null>(null);

  // Load data from Firebase when authenticated (with delay for auth to settle)
  const loadData = useCallback(async (): Promise<void> => {
    // Double-check authentication
    if (!isAuthenticated) {
      return;
    }

    try {
      const prayerDoc = await getDoc(doc(db, "prayerTimes", "current"));

      if (prayerDoc.exists()) {
        const data = prayerDoc.data() as PrayerTimes;
        const prayers = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
        prayers.forEach((prayer) => {
          if (!(data as any)[`${prayer}_iqama_type`]) {
            (data as any)[`${prayer}_iqama_type`] = "fixed";
          }
          if (!(data as any)[`${prayer}_iqama_offset`]) {
            (data as any)[`${prayer}_iqama_offset`] =
              prayer === "maghrib" ? 5 : 15;
          }
        });
        setPrayerTimes(data);
      }

      const jumuahDoc = await getDoc(doc(db, "jumuahTimes", "current"));

      if (jumuahDoc.exists()) {
        setJumuahTimes(jumuahDoc.data() as JumuahData);
      }

      const settingsDoc = await getDoc(doc(db, "mosqueSettings", "info"));

      if (settingsDoc.exists()) {
        setMosqueSettings(settingsDoc.data() as MosqueSettings);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Small delay to ensure Firebase auth is fully initialized
    const timer = setTimeout(() => {
      loadData();
    }, 500);

    return () => clearTimeout(timer);
  }, [isAuthenticated, loadData]);

  // Load donation settings with real-time updates
  useEffect(() => {
    if (!isAuthenticated) return;

    // Small delay to ensure auth is ready
    const timer = setTimeout(() => {
      const unsubscribe = onSnapshot(
        doc(db, "donationSettings", "config"),
        (docSnapshot) => {
          if (docSnapshot.exists()) {
            setDonationSettings(docSnapshot.data() as DonationSettings);
          }
        },
        (error) => {
          // Log error but don't show notification (real-time listener can fail temporarily)
          console.error("Donation settings listener error:", error);
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

  // Quick splash after auth for a smooth branded entry
  const [showSplash, setShowSplash] = useState<boolean>(false);
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      setShowSplash(true);
      const t = setTimeout(() => setShowSplash(false), 700);
      return () => clearTimeout(t);
    }
  }, [authLoading, isAuthenticated]);

  const handleLogin = async (
    email: string,
    password: string
  ): Promise<void> => {
    await login(email, password);
  };

  const handleLogout = async (): Promise<void> => {
    await logout();
  };

  // Block access if authenticated but not admin
  if (!authLoading && isAuthenticated && !isAdmin) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        padding: '2rem',
        textAlign: 'center',
        background: '#f5f5f5'
      }}>
        <div style={{ 
          background: 'white', 
          padding: '3rem', 
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          maxWidth: '500px'
        }}>
          <h2 style={{ color: '#dc3545', marginBottom: '1rem' }}>⛔ Unauthorized Access</h2>
          <p style={{ marginBottom: '1.5rem', color: '#666' }}>
            This dashboard is restricted to administrators only.
          </p>
          <p style={{ fontSize: '0.9rem', color: '#999', marginBottom: '2rem' }}>
            If you believe this is an error, please contact your administrator.
          </p>
          <button 
            onClick={handleLogout}
            style={{ 
              padding: '0.75rem 2rem',
              background: '#0f172a',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600'
            }}
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  const showSaveStatus = (success: boolean): void => {
    setSaveStatus(success ? "success" : "error");
    setTimeout(() => setSaveStatus(""), 3000);
  };

  const savePrayerTimes = async (): Promise<void> => {
    setSaving(true);
    try {
      const updatedPrayerTimes: PrayerTimes = {
        ...prayerTimes,
        last_updated: new Date().toISOString().split("T")[0],
      };
      await setDoc(doc(db, "prayerTimes", "current"), updatedPrayerTimes);
      setPrayerTimes(updatedPrayerTimes);
      showSaveStatus(true);
    } catch (error) {
      console.error("Error saving prayer times:", error);
      showSaveStatus(false);
    } finally {
      setSaving(false);
    }
  };

  const saveJumuahTimes = async (): Promise<void> => {
    setSaving(true);
    try {
      if (!jumuahTimes) {
        setSaving(false);
        return;
      }

      const updatedJumuah: JumuahData = {
        ...jumuahTimes,
        last_updated: new Date().toISOString().split("T")[0],
      };
      await setDoc(doc(db, "jumuahTimes", "current"), updatedJumuah);
      setJumuahTimes(updatedJumuah);
      showSaveStatus(true);
    } catch (error) {
      console.error("Error saving Jumuah times:", error);
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
        last_updated: new Date().toISOString().split("T")[0],
      };
      await setDoc(doc(db, "mosqueSettings", "info"), updatedSettings);
      setMosqueSettings(updatedSettings);
      showSaveStatus(true);
    } catch (error) {
      console.error("Error saving mosque settings:", error);
      showSaveStatus(false);
    } finally {
      setSaving(false);
    }
  };

  const saveDonationSettings = async (): Promise<void> => {
    if (!donationSettings) return;

    setSaving(true);
    try {
      await setDoc(doc(db, "donationSettings", "config"), {
        ...donationSettings,
        updated_at: serverTimestamp(),
      });
      showSaveStatus(true);
    } catch (error) {
      console.error("Error saving donation settings:", error);
      showSaveStatus(false);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return <Loading fullPage useLogo text="Loading dashboard..." />;
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} error={authError} />;
  }

  // Show a short splash right after authentication before rendering main UI
  if (showSplash) {
    return <Loading fullPage useLogo text="Preparing dashboard..." />;
  }

  return (
    <ErrorBoundary>
      <div style={{ minHeight: "100vh", background: "#f3f4f6" }}>
    <Header onLogout={handleLogout} onHome={() => setActiveTab('prayer')} />

        <SaveNotification status={saveStatus} />
        
        <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

        <Tabs activeTab={activeTab} onTabChange={setActiveTab} />

        <div
          style={{ maxWidth: "72rem", margin: "0 auto", padding: "2rem 1.5rem" }}
        >
        {activeTab === "prayer" && (
          <PrayerTimesTab
            prayerTimes={prayerTimes}
            onChange={setPrayerTimes}
            onSave={savePrayerTimes}
            saving={saving}
            mosqueSettings={mosqueSettings}
          />
        )}

        {activeTab === "jumuah" && (
          <JumuahTimesTab
            jumuahTimes={jumuahTimes}
            onChange={setJumuahTimes}
            onSave={saveJumuahTimes}
            saving={saving}
          />
        )}

        {activeTab === "events" && (
          <EventsTab saving={saving} onSaveStatusChange={showSaveStatus} />
        )}

        {activeTab === 'donations' && (
          <DonationsTab
            donationSettings={donationSettings}
            onSettingsChange={setDonationSettings}
            onSaveSettings={saveDonationSettings}
            saving={saving}
            onSaveStatusChange={showSaveStatus}
          />
        )}

        {activeTab === 'notifications' && (
          <NotificationsTab
            saving={saving}
            onSaveStatusChange={showSaveStatus}
          />
        )}

        {activeTab === 'admin' && (
          <AdminManagementTab />
        )}

        {activeTab === "settings" && (
          <MosqueSettingsTab
            mosqueSettings={mosqueSettings}
            onChange={setMosqueSettings}
            onSave={saveMosqueSettings}
            saving={saving}
          />
        )}
      </div>
    </div>
    </ErrorBoundary>
  );
}
