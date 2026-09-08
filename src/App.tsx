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
import AdminActivityTab from './components/AdminActivityTab';
import Loading from './components/ui/Loading';
import ToastContainer from './components/ui/ToastContainer';
// Import custom hook
import { useFirebaseAuth } from "./hooks/useFirebaseAuth";
import { useToast } from "./hooks/useToast";
import { PermissionsContext, createPermissionsValue } from "./hooks/usePermissions";
import { applyOffsetIqamasToPrayerTimes } from "./utils/prayerTimeHelpers";

// Import types
import {
  PrayerTimes,
  JumuahData,
  MosqueSettings,
  DonationSettings,
  ScheduledIqamaChange,
} from "./types";
import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";

const db = getFirestore();

export default function AdminDashboard(): React.JSX.Element {
  const {
    isAuthenticated,
    hasAccess,
    loading: authLoading,
    error: authError,
    login,
    logout,
    userRoles,
    permissions,
  } = useFirebaseAuth();
  const { toasts, removeToast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("prayer");
  const [saveStatus, setSaveStatus] = useState<"success" | "error" | "">("");
  const [saving, setSaving] = useState<boolean>(false);
  const [initialDataLoaded, setInitialDataLoaded] = useState<boolean>(false);

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
  });

  // New Jumuah data structure (times array). Start as null until loaded or edited.
  const [jumuahTimes, setJumuahTimes] = useState<JumuahData | null>(null);

  // Scheduled iqama changes
  const [scheduledChanges, setScheduledChanges] = useState<Record<string, ScheduledIqamaChange>>({});

  const [mosqueSettings, setMosqueSettings] = useState<MosqueSettings>({
    name: "Al Madina Masjid Yagoona",
    address: "123 Main Street, Yagoona NSW 2199",
    phone: "(02) 1234 5678",
    email: "info@almadinamasjid.com.au",
    website: "www.almadinamasjid.com.au",
    imam: "Sheikh [Name]",
    latitude: -33.8688,
    longitude: 151.2093,
    calculation_method: "MuslimWorldLeague",
    auto_fetch_maghrib: false,
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

      // Load scheduled iqama changes
      const getScheduledIqamaChanges = httpsCallable(functions, 'getScheduledIqamaChanges');
      const scheduledResult = await getScheduledIqamaChanges({ includeApplied: false });
      const scheduledData = scheduledResult.data as { success: boolean; schedules: ScheduledIqamaChange[] };
      
      if (scheduledData.success && scheduledData.schedules) {
        const changesMap: Record<string, ScheduledIqamaChange> = {};
        scheduledData.schedules.forEach(schedule => {
          changesMap[schedule.prayer] = schedule;
        });
        setScheduledChanges(changesMap);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Load immediately when authenticated; avoid artificial delays
    setInitialDataLoaded(false);
    let isCancelled = false;
    (async () => {
      try {
        await loadData();
      } finally {
        if (!isCancelled) setInitialDataLoaded(true);
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [isAuthenticated, loadData]);

  // Load donation settings with real-time updates
  useEffect(() => {
    if (!isAuthenticated) return;

    // Start real-time listener immediately after auth
    const unsubscribe = onSnapshot(
      doc(db, "donationSettings", "config"),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          setDonationSettings(docSnapshot.data() as DonationSettings);
        } else {
          setDonationSettings(null);
        }
      },
      (error) => {
        // Log error but don't show notification (real-time listener can fail temporarily)
        console.error("Donation settings listener error:", error);
      }
    );

    // Cleanup function
    return () => {
      unsubscribe();
    };
  }, [isAuthenticated]);

  // Quick splash after auth for a smooth branded entry
  // Removed post-auth splash to avoid double loading states/flicker

  const handleLogin = async (
    email: string,
    password: string
  ): Promise<void> => {
    await login(email, password);
  };

  const handleLogout = async (): Promise<void> => {
    await logout();
  };

  // Block access if authenticated but no roles assigned
  if (!authLoading && isAuthenticated && !hasAccess) {
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
          <h2 style={{ color: '#dc3545', marginBottom: '1rem' }}>⛔ No Access Assigned</h2>
          <p style={{ marginBottom: '1.5rem', color: '#666' }}>
            Your account has no roles or permissions assigned. Please contact your administrator to request access.
          </p>
          <p style={{ fontSize: '0.9rem', color: '#999', marginBottom: '2rem' }}>
            If you believe this is an error, please contact your system administrator.
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
      // Ensure offset-based Iqama clock times match current Adhan + offset before persist
      const withOffsetIqamas = applyOffsetIqamasToPrayerTimes(prayerTimes);
      const updatedPrayerTimes: PrayerTimes = {
        ...withOffsetIqamas,
        last_updated: serverTimestamp(),
      };
      await setDoc(doc(db, "prayerTimes", "current"), updatedPrayerTimes);
      // Keep local state in sync with recomputed offset Iqama values
      setPrayerTimes(withOffsetIqamas);
      // Don't set serverTimestamp() sentinel in local state - it will be updated via snapshot listener
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
        last_updated: serverTimestamp(),
      };
      await setDoc(doc(db, "jumuahTimes", "current"), updatedJumuah);
      // Don't set serverTimestamp() sentinel in local state - it will be updated via snapshot listener
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
        last_updated: serverTimestamp(),
      };
      await setDoc(doc(db, "mosqueSettings", "info"), updatedSettings);
      // Don't set serverTimestamp() sentinel in local state - keep current state
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

  if (authLoading || (isAuthenticated && !initialDataLoaded)) {
    return <Loading fullPage useLogo text="Loading dashboard..." />;
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} error={authError} />;
  }

  // Removed secondary splash screen ("Preparing dashboard...") to prevent flicker

  // Create permissions context value
  const permissionsValue = createPermissionsValue(userRoles, permissions);

  return (
    <ErrorBoundary>
      <PermissionsContext.Provider value={permissionsValue}>
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
                scheduledChanges={scheduledChanges}
                onScheduledChangesUpdate={setScheduledChanges}
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

            {activeTab === 'activity' && (
              <AdminActivityTab />
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
      </PermissionsContext.Provider>
    </ErrorBoundary>
  );
}
