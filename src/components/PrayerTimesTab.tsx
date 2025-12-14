import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Save, RefreshCw, Globe, Calendar, X } from 'lucide-react';
import { PrayerTimesTabProps, ScheduledIqamaChange } from '../types';
import TimeInput from './TimeInput';
import { Theme, media } from '../constants/theme';
import Card from './ui/Card';
import { usePermissions } from '../hooks/usePermissions';
import { Permission } from '../constants/roles';
import { Coordinates, CalculationMethod, PrayerTimes as AdhanPrayerTimes } from 'adhan';
import { functions } from '../firebase';
import { httpsCallable } from 'firebase/functions';
import { Timestamp } from 'firebase/firestore';

// Using shared Card component from ./ui/Card for consistent styling across tabs

const CardTitle = styled.h2`
  font-size: ${Theme.typography.h2};
  font-weight: bold;
  color: ${Theme.colors.text.strong};
  margin-bottom: ${Theme.spacing.lg};

  ${media.sm} {
    font-size: ${Theme.typography.h1};
    margin-bottom: ${Theme.spacing.xl};
  }
`;

const InfoBox = styled.div`
  margin-bottom: ${Theme.spacing.lg};
  padding: ${Theme.spacing.lg};
  background: ${Theme.colors.accent.blueSoft};
  border: 1px solid ${Theme.colors.accent.blue};
  border-radius: ${Theme.radius.md};
  font-size: ${Theme.typography.small};
  color: ${Theme.colors.brand.navy[700]};
  box-shadow: ${Theme.shadow.soft};

  ${media.sm} {
    font-size: ${Theme.typography.body};
  }
`;

const AutoFetchBanner = styled.div`
  margin-bottom: ${Theme.spacing.lg};
  padding: ${Theme.spacing.lg};
  background: #f0fdf4;
  border: 1px solid ${Theme.colors.accent.green};
  border-radius: ${Theme.radius.md};
  display: flex;
  align-items: center;
  gap: ${Theme.spacing.md};
  box-shadow: ${Theme.shadow.soft};
`;

const BannerIcon = styled.div`
  flex-shrink: 0;
`;

const BannerContent = styled.div`
  flex: 1;
`;

const BannerTitle = styled.div`
  font-size: ${Theme.typography.body};
  font-weight: 600;
  color: #15803d;
  margin-bottom: ${Theme.spacing.xs};
`;

const BannerText = styled.div`
  font-size: ${Theme.typography.small};
  color: #166534;
`;

const PrayerGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${Theme.spacing.lg};
  margin-top: ${Theme.spacing.lg};

  ${media.sm} {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }
`;

const PrayerCard = styled.div`
  border: 1px solid ${Theme.colors.border.base};
  background: ${Theme.colors.surface.card};
  border-radius: ${Theme.radius.md};
  border-left: 4px solid ${Theme.colors.brand.navy[800]};
  padding: ${Theme.spacing.lg};
  transition: all 0.2s ease;
  box-shadow: ${Theme.shadow.soft};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${Theme.shadow.card};
    border-color: ${Theme.colors.brand.navy[700]};
  }
`;

const PrayerName = styled.h3`
  font-size: ${Theme.typography.h3};
  font-weight: bold;
  color: ${Theme.colors.text.strong};
  margin-bottom: ${Theme.spacing.lg};
  text-transform: capitalize;
`;

const TimeInputGroup = styled.div`
  margin-bottom: ${Theme.spacing.md};

  &:last-child {
    margin-bottom: 0;
  }
`;

const TimeLabel = styled.label`
  display: block;
  font-size: ${Theme.typography.body};
  font-weight: 500;
  color: ${Theme.colors.text.muted};
  margin-bottom: ${Theme.spacing.xs};
`;

const ReadOnlyTimeInput = styled.input`
  width: 100%;
  padding: ${Theme.spacing.md};
  min-height: 44px;
  border: 1px solid ${Theme.colors.border.base};
  border-radius: ${Theme.radius.md};
  font-size: ${Theme.typography.body};
  outline: none;
  transition: all 0.2s;
  box-sizing: border-box;

  &:focus {
    border-color: ${Theme.colors.brand.navy[700]};
    box-shadow: 0 0 0 3px ${Theme.colors.accent.blueSoft};
  }

  &:disabled {
    background: ${Theme.colors.surface.muted};
    color: ${Theme.colors.text.muted};
    cursor: not-allowed;
    border-color: ${Theme.colors.border.soft};
  }
`;

const IqamaTypeSelector = styled.div`
  display: flex;
  gap: ${Theme.spacing.sm};
  margin-bottom: ${Theme.spacing.md};
`;

const TypeButton = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: ${Theme.spacing.md};
  min-height: 44px;
  border: 1px solid ${props => props.$active ? Theme.colors.brand.navy[700] : Theme.colors.border.base};
  background: ${props => props.$active ? Theme.colors.brand.navy[700] : Theme.colors.surface.card};
  color: ${props => props.$active ? 'white' : Theme.colors.text.muted};
  border-radius: ${Theme.radius.sm};
  font-size: ${Theme.typography.small};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  ${media.sm} {
    font-size: ${Theme.typography.body};
  }

  &:hover {
    border-color: ${Theme.colors.brand.navy[700]};
    color: ${props => props.$active ? 'white' : Theme.colors.brand.navy[700]};
  }
`;

const OffsetInputContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${Theme.spacing.sm};
`;

const OffsetInput = styled.input`
  width: 4rem;
  padding: ${Theme.spacing.md};
  min-height: 44px;
  border: 1px solid ${Theme.colors.border.base};
  border-radius: ${Theme.radius.md};
  font-size: ${Theme.typography.body};
  outline: none;
  transition: all 0.2s;
  box-sizing: border-box;
  text-align: center;

  &:focus {
    border-color: ${Theme.colors.brand.navy[700]};
    box-shadow: 0 0 0 3px ${Theme.colors.accent.blueSoft};
  }
`;

const OffsetLabel = styled.span`
  font-size: ${Theme.typography.body};
  color: ${Theme.colors.text.muted};
`;

const CalculatedTime = styled.div`
  margin-top: ${Theme.spacing.sm};
  padding: ${Theme.spacing.sm};
  background: #f0fdf4;
  border: 1px solid ${Theme.colors.accent.green};
  border-radius: ${Theme.radius.sm};
  font-size: ${Theme.typography.small};
  color: #15803d;
  text-align: center;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${Theme.spacing.md};
  margin-top: ${Theme.spacing.xl};

  ${media.sm} {
    flex-direction: row;
  }
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${Theme.spacing.sm};
  background: ${Theme.colors.surface.card};
  color: ${Theme.colors.brand.navy[700]};
  border: 2px solid ${Theme.colors.brand.navy[700]};
  padding: ${Theme.spacing.md} ${Theme.spacing.xl};
  min-height: 48px;
  border-radius: ${Theme.radius.md};
  font-weight: 600;
  font-size: ${Theme.typography.body};
  cursor: pointer;
  transition: all 0.2s;

  ${media.sm} {
    flex: 1;
  }

  &:hover {
    background: ${Theme.colors.brand.navy[700]};
    color: white;
    transform: translateY(-1px);
    box-shadow: ${Theme.shadow.soft};
  }

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    background: ${Theme.colors.surface.muted};
    color: ${Theme.colors.text.subtle};
    border-color: ${Theme.colors.border.base};
    cursor: not-allowed;
    transform: none;
  }
`;

// Pulse animation
const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.6); }
  70% { box-shadow: 0 0 0 10px rgba(245, 158, 11, 0); }
  100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
`;

const SaveButton = styled.button<{ $dirty?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${Theme.spacing.sm};
  background: ${props => props.$dirty ? Theme.colors.status.warning : Theme.colors.brand.navy[700]};
  color: white;
  padding: ${Theme.spacing.md} ${Theme.spacing.xl};
  min-height: 48px;
  border-radius: ${Theme.radius.md};
  font-weight: 600;
  font-size: ${Theme.typography.body};
  border: none;
  cursor: pointer;
  transition: all 0.2s;

  ${media.sm} {
    flex: 1;
  }

  &:hover {
    background: ${props => props.$dirty ? Theme.colors.brand.gold[600] : Theme.colors.brand.navy[600]};
    transform: translateY(-1px);
    box-shadow: ${Theme.shadow.soft};
  }

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    background: ${Theme.colors.border.medium};
    cursor: not-allowed;
    transform: none;
  }

  ${props => props.$dirty && css`animation: ${pulse} 2s infinite;`}
`;

const APIStatusBox = styled.div<{ $success: boolean }>`
  margin-top: ${Theme.spacing.lg};
  padding: ${Theme.spacing.md};
  background: ${props => props.$success ? Theme.colors.status.successLight : Theme.colors.status.errorLight};
  border: 1px solid ${props => props.$success ? Theme.colors.status.success : Theme.colors.status.error};
  border-radius: ${Theme.radius.md};
  font-size: ${Theme.typography.body};
  color: ${props => props.$success ? Theme.colors.status.successDark : Theme.colors.status.errorDark};
  text-align: center;

  ${media.sm} {
    padding: ${Theme.spacing.lg};
  }
`;

const ScheduleSection = styled.div`
  margin-top: ${Theme.spacing.md};
  padding-top: ${Theme.spacing.md};
  border-top: 1px solid ${Theme.colors.border.soft};
`;

const ScheduleButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${Theme.spacing.xs};
  width: 100%;
  padding: ${Theme.spacing.sm} ${Theme.spacing.md};
  background: ${Theme.colors.surface.muted};
  color: ${Theme.colors.brand.navy[700]};
  border: 1px solid ${Theme.colors.border.base};
  border-radius: ${Theme.radius.sm};
  font-size: ${Theme.typography.small};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${Theme.colors.brand.navy[50]};
    border-color: ${Theme.colors.brand.navy[700]};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ScheduleInputGroup = styled.div`
  margin-top: ${Theme.spacing.sm};
  display: flex;
  flex-direction: column;
  gap: ${Theme.spacing.sm};
`;

const DateInput = styled.input`
  width: 100%;
  max-width: 100%;
  padding: ${Theme.spacing.sm};
  border: 1px solid ${Theme.colors.border.base};
  border-radius: ${Theme.radius.sm};
  font-size: ${Theme.typography.small};
  outline: none;
  transition: all 0.2s;
  box-sizing: border-box;

  &:focus {
    border-color: ${Theme.colors.brand.navy[700]};
    box-shadow: 0 0 0 3px ${Theme.colors.accent.blueSoft};
  }
`;

const ScheduleActions = styled.div`
  display: flex;
  gap: ${Theme.spacing.xs};
`;

const ScheduleSaveButton = styled.button`
  flex: 1;
  padding: ${Theme.spacing.sm};
  background: ${Theme.colors.brand.navy[700]};
  color: white;
  border: none;
  border-radius: ${Theme.radius.sm};
  font-size: ${Theme.typography.small};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${Theme.colors.brand.navy[600]};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ScheduleCancelButton = styled.button`
  flex: 1;
  padding: ${Theme.spacing.sm};
  background: transparent;
  color: ${Theme.colors.text.muted};
  border: 1px solid ${Theme.colors.border.base};
  border-radius: ${Theme.radius.sm};
  font-size: ${Theme.typography.small};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${Theme.colors.surface.muted};
  }
`;

const ScheduledChangeBox = styled.div`
  margin-top: ${Theme.spacing.sm};
  padding: ${Theme.spacing.sm};
  background: #fff7ed;
  border: 1px solid ${Theme.colors.status.warning};
  border-radius: ${Theme.radius.sm};
  font-size: ${Theme.typography.small};
`;

const ScheduledChangeHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: ${Theme.spacing.xs};
`;

const ScheduledChangeTitle = styled.div`
  font-weight: 600;
  color: ${Theme.colors.status.warningDark};
  display: flex;
  align-items: center;
  gap: ${Theme.spacing.xs};
`;

const DeleteScheduleButton = styled.button`
  background: none;
  border: none;
  color: ${Theme.colors.status.error};
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.7;
  }
`;

const ScheduledChangeDetails = styled.div`
  color: ${Theme.colors.text.muted};
  line-height: 1.4;
`;

export default function PrayerTimesTab({ prayerTimes, onChange, onSave, saving, mosqueSettings }: PrayerTimesTabProps): React.JSX.Element {
  const { hasPermission } = usePermissions();
  const canEdit = hasPermission(Permission.EDIT_PRAYER_TIMES);
  
  const prayers: string[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  const [fetchingPrayerTimes, setFetchingPrayerTimes] = useState(false);
  const [fetchStatus, setFetchStatus] = useState<{ success: boolean; message: string } | null>(null);
  // Keep a snapshot of the last-saved prayerTimes to detect unsaved changes
  const initialSnapshotRef = useRef<string>(JSON.stringify(prayerTimes));
  
  // Scheduling state
  const [scheduledChanges, setScheduledChanges] = useState<Record<string, ScheduledIqamaChange>>({});
  const [schedulingPrayer, setSchedulingPrayer] = useState<string | null>(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);

  // Ensure initial snapshot is set on mount
  useEffect(() => {
    initialSnapshotRef.current = JSON.stringify(prayerTimes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When saving completes, update the snapshot to reflect the saved state
  useEffect(() => {
    if (!saving) {
      initialSnapshotRef.current = JSON.stringify(prayerTimes);
    }
  }, [saving, prayerTimes]);

  // Load scheduled changes
  useEffect(() => {
    loadScheduledChanges();
  }, []);

  const loadScheduledChanges = async () => {
    try {
      const getScheduledIqamaChanges = httpsCallable(functions, 'getScheduledIqamaChanges');
      const result = await getScheduledIqamaChanges({ includeApplied: false });
      const data = result.data as { success: boolean; schedules: ScheduledIqamaChange[] };
      
      if (data.success && data.schedules) {
        const changesMap: Record<string, ScheduledIqamaChange> = {};
        data.schedules.forEach(schedule => {
          changesMap[schedule.prayer] = schedule;
        });
        setScheduledChanges(changesMap);
      }
    } catch (error) {
      console.error('Error loading scheduled changes:', error);
    }
  };

  const handleScheduleClick = (prayer: string) => {
    setSchedulingPrayer(prayer);
    // Set minimum date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setScheduleDate(tomorrow.toISOString().split('T')[0]);
  };

  const handleCancelSchedule = () => {
    setSchedulingPrayer(null);
    setScheduleDate('');
  };

  const handleSaveSchedule = async () => {
    if (!schedulingPrayer || !scheduleDate) return;

    setIsScheduling(true);
    try {
      const prayer = schedulingPrayer;
      const iqamaType = (prayerTimes as any)[`${prayer}_iqama_type`] || 'fixed';
      const iqamaValue = iqamaType === 'fixed' 
        ? (prayerTimes as any)[`${prayer}_iqama`]
        : (prayerTimes as any)[`${prayer}_iqama_offset`] || 15;

      // Convert date to timestamp (midnight)
      const dateObj = new Date(scheduleDate);
      dateObj.setHours(0, 0, 0, 0);

      const createScheduledIqamaChange = httpsCallable(functions, 'createScheduledIqamaChange');
      const result = await createScheduledIqamaChange({
        prayer: prayer,
        effectiveDate: dateObj.getTime(),
        iqama_type: iqamaType,
        iqama_value: iqamaValue
      });

      const data = result.data as { success: boolean; id: string; message: string };
      
      if (data.success) {
        setFetchStatus({ success: true, message: data.message });
        await loadScheduledChanges();
        setSchedulingPrayer(null);
        setScheduleDate('');
      }
    } catch (error: any) {
      console.error('Error scheduling change:', error);
      setFetchStatus({ 
        success: false, 
        message: error.message || 'Failed to schedule change' 
      });
    } finally {
      setIsScheduling(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId: string, prayer: string) => {
    if (!window.confirm('Are you sure you want to delete this scheduled change?')) {
      return;
    }

    try {
      const deleteScheduledIqamaChange = httpsCallable(functions, 'deleteScheduledIqamaChange');
      const result = await deleteScheduledIqamaChange({ id: scheduleId });
      const data = result.data as { success: boolean; message: string };
      
      if (data.success) {
        setFetchStatus({ success: true, message: 'Scheduled change deleted' });
        await loadScheduledChanges();
      }
    } catch (error: any) {
      console.error('Error deleting scheduled change:', error);
      setFetchStatus({ 
        success: false, 
        message: error.message || 'Failed to delete scheduled change' 
      });
    }
  };

  const isDirty = JSON.stringify(prayerTimes) !== initialSnapshotRef.current;

  const handleSave = async () => {
    try {
      const maybePromise: any = (onSave as any)();
      if (maybePromise && typeof maybePromise.then === 'function') {
        await maybePromise;
      }
      // update snapshot after save (or immediately if onSave is not async)
      initialSnapshotRef.current = JSON.stringify(prayerTimes);
    } catch (err) {
      // If save failed, keep dirty state so user knows changes weren't saved
      console.error('Save failed', err);
    }
  };

  const handleTimeChange = (prayer: string, type: 'adhan' | 'iqama', value: string): void => {
    onChange({
      ...prayerTimes,
      [`${prayer}_${type}`]: value
    } as any);
  };

  const handleIqamaTypeChange = (prayer: string, type: 'fixed' | 'offset'): void => {
    const updates: any = {
      ...prayerTimes,
      [`${prayer}_iqama_type`]: type
    };

    if (type === 'offset' && !prayerTimes[`${prayer}_iqama_offset` as keyof typeof prayerTimes]) {
      updates[`${prayer}_iqama_offset`] = prayer === 'maghrib' ? 5 : 15;
    }

    onChange(updates);
  };

  const handleOffsetChange = (prayer: string, value: string): void => {
    const offset = parseInt(value) || 0;
    onChange({
      ...prayerTimes,
      [`${prayer}_iqama_offset`]: offset
    } as any);
  };

  const calculateIqamaTime = (adhanTime: string | undefined, offset: number | undefined): string => {
    if (!adhanTime || !offset) return '--:--';

    try {
      const timeMatch = adhanTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!timeMatch) return '--:--';

      let hours = parseInt(timeMatch[1]);
      const minutes = parseInt(timeMatch[2]);
      const period = timeMatch[3].toUpperCase();

      if (period === 'PM' && hours !== 12) {
        hours += 12;
      } else if (period === 'AM' && hours === 12) {
        hours = 0;
      }

      let totalMinutes = hours * 60 + minutes + offset;
      let newHours = Math.floor(totalMinutes / 60) % 24;
      const newMinutes = totalMinutes % 60;

      const newPeriod = newHours >= 12 ? 'PM' : 'AM';
      if (newHours > 12) {
        newHours -= 12;
      } else if (newHours === 0) {
        newHours = 12;
      }

      return `${newHours}:${newMinutes.toString().padStart(2, '0')} ${newPeriod}`;
    } catch (error) {
      return '--:--';
    }
  };

  const fetchAllPrayerTimes = async (): Promise<void> => {
    if (!mosqueSettings?.latitude || !mosqueSettings?.longitude) {
      setFetchStatus({
        success: false,
        message: 'Please set mosque location in Settings tab first'
      });
      return;
    }

    setFetchingPrayerTimes(true);
    setFetchStatus(null);

    try {
      console.log('Calculating prayer times using Adhan package...', {
        latitude: mosqueSettings.latitude,
        longitude: mosqueSettings.longitude,
        method: mosqueSettings.calculation_method,
      });

      // Set up coordinates
      const coordinates = new Coordinates(
        mosqueSettings.latitude,
        mosqueSettings.longitude
      );

      // Get calculation method (default to MuslimWorldLeague if not specified)
      const methodName = mosqueSettings.calculation_method || 'MuslimWorldLeague';
      const params = CalculationMethod[methodName as keyof typeof CalculationMethod]();

      // Calculate prayer times for today IN THE MOSQUE'S TIMEZONE
      // This ensures we calculate for the same day as the cloud function
      const mosqueTimezone = mosqueSettings.timezone || 'Australia/Sydney';
      
      // Get today's date in the mosque's timezone
      const now = new Date();
      const dateString = now.toLocaleDateString('en-US', { timeZone: mosqueTimezone });
      const date = new Date(dateString); // This creates a Date at midnight in the mosque's timezone
      
      const adhanPrayerTimes = new AdhanPrayerTimes(coordinates, date, params);

      // Convert Date objects to 12-hour format strings in mosque timezone
      const formatTime = (date: Date): string => {
        return date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
          timeZone: mosqueTimezone,
        });
      };

      // Update all Adhan times
      const updatedPrayerTimes = {
        ...prayerTimes,
        fajr_adhan: formatTime(adhanPrayerTimes.fajr),
        dhuhr_adhan: formatTime(adhanPrayerTimes.dhuhr),
        asr_adhan: formatTime(adhanPrayerTimes.asr),
        maghrib_adhan: formatTime(adhanPrayerTimes.maghrib),
        isha_adhan: formatTime(adhanPrayerTimes.isha),
      };

      onChange(updatedPrayerTimes);

      console.log('Prayer times calculated successfully:', {
        method: methodName,
        fajr: formatTime(adhanPrayerTimes.fajr),
        dhuhr: formatTime(adhanPrayerTimes.dhuhr),
        asr: formatTime(adhanPrayerTimes.asr),
        maghrib: formatTime(adhanPrayerTimes.maghrib),
        isha: formatTime(adhanPrayerTimes.isha),
      });

      setFetchStatus({
        success: true,
        message: 'Prayer times calculated successfully! Click "Save Prayer Times" to save changes.'
      });
    } catch (error: any) {
      console.error('Error calculating prayer times:', error);
      setFetchStatus({
        success: false,
        message: 'Failed to calculate prayer times. Please check mosque settings.'
      });
    } finally {
      setFetchingPrayerTimes(false);
    }
  };

  const hasLocationSettings = mosqueSettings?.latitude && mosqueSettings?.longitude;

  return (
    <Card>
      <CardTitle>Daily Prayer Times</CardTitle>
      
      {hasLocationSettings ? (
        <AutoFetchBanner>
          <BannerIcon>
            <Globe size={24} color="#15803d" />
          </BannerIcon>
          <BannerContent>
            <BannerTitle>🌍 Prayer Times Auto-Calculated</BannerTitle>
            <BannerText>
              Adhan times are automatically calculated using the Adhan package based on your mosque location.
              {prayerTimes?.last_updated && ` Last updated: ${(() => {
                const timestamp = prayerTimes.last_updated as any;
                const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
                return date.toLocaleDateString('en-AU', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                });
              })()}`}
            </BannerText>
          </BannerContent>
        </AutoFetchBanner>
      ) : (
        <InfoBox>
          <strong>⚠️ Location Not Set</strong>
          <div style={{ marginTop: '0.5rem' }}>
            Please go to Settings tab and configure your mosque location to enable automatic prayer time calculation.
          </div>
        </InfoBox>
      )}

      <InfoBox>
        <strong>How It Works:</strong>
        <ul style={{ marginTop: '0.5rem', marginBottom: 0, paddingLeft: '1.5rem' }}>
          <li><strong>Adhan times:</strong> Automatically calculated (read-only)</li>
          <li><strong>Iqama times:</strong> You control these - set as fixed time or offset from Adhan</li>
          <li><strong>Updates:</strong> Prayer times auto-update daily when users open the mobile app</li>
        </ul>
      </InfoBox>

      <PrayerGrid>
        {prayers.map(prayer => {
          const iqamaType = (prayerTimes as any)[`${prayer}_iqama_type`] || 'fixed';
          const iqamaOffset = (prayerTimes as any)[`${prayer}_iqama_offset`] || (prayer === 'maghrib' ? 5 : 15);
          const adhanTime = (prayerTimes as any)[`${prayer}_adhan`];
          const calculatedIqama = calculateIqamaTime(adhanTime, iqamaOffset);
          const scheduledChange = scheduledChanges[prayer];
          const isSchedulingThis = schedulingPrayer === prayer;

          return (
            <PrayerCard key={prayer}>
              <PrayerName>{prayer}</PrayerName>
              
              <TimeInputGroup>
                <TimeLabel>Adhan (Auto-calculated)</TimeLabel>
                <ReadOnlyTimeInput
                  type="text"
                  value={(prayerTimes as any)[`${prayer}_adhan`] || '--:--'}
                  disabled
                  placeholder="Will be auto-fetched"
                />
              </TimeInputGroup>

              <TimeInputGroup>
                <TimeLabel>Iqama Type</TimeLabel>
                <IqamaTypeSelector>
                  <TypeButton
                    type="button"
                    $active={iqamaType === 'fixed'}
                    onClick={() => handleIqamaTypeChange(prayer, 'fixed')}
                    disabled={!canEdit}
                  >
                    Fixed Time
                  </TypeButton>
                  <TypeButton
                    type="button"
                    $active={iqamaType === 'offset'}
                    onClick={() => handleIqamaTypeChange(prayer, 'offset')}
                    disabled={!canEdit}
                  >
                    Offset
                  </TypeButton>
                </IqamaTypeSelector>
              </TimeInputGroup>

              {iqamaType === 'fixed' ? (
                <TimeInputGroup>
                  <TimeLabel>Iqama</TimeLabel>
                  <TimeInput
                    value={(prayerTimes as any)[`${prayer}_iqama`] || ''}
                    onChange={(value) => handleTimeChange(prayer, 'iqama', value)}
                    placeholder="Select time"
                    disabled={!canEdit}
                  />
                </TimeInputGroup>
              ) : (
                <TimeInputGroup>
                  <TimeLabel>Minutes After Adhan</TimeLabel>
                  <OffsetInputContainer>
                    <OffsetInput
                      type="number"
                      min="0"
                      max="120"
                      value={iqamaOffset}
                      onChange={(e) => handleOffsetChange(prayer, e.target.value)}
                      disabled={!canEdit}
                    />
                    <OffsetLabel>minutes</OffsetLabel>
                  </OffsetInputContainer>
                  {adhanTime && (
                    <CalculatedTime>
                      Iqama will be at {calculatedIqama}
                    </CalculatedTime>
                  )}
                </TimeInputGroup>
              )}

              {canEdit && (
                <ScheduleSection>
                  {!scheduledChange && !isSchedulingThis && (
                    <ScheduleButton onClick={() => handleScheduleClick(prayer)}>
                      <Calendar size={16} />
                      Schedule for Future Date
                    </ScheduleButton>
                  )}

                  {isSchedulingThis && (
                    <ScheduleInputGroup>
                      <TimeLabel>Effective Date</TimeLabel>
                      <DateInput
                        type="date"
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                      />
                      <div style={{ fontSize: Theme.typography.small, color: Theme.colors.text.muted }}>
                        Change will apply at {prayer} time on the day before this date
                      </div>
                      <ScheduleActions>
                        <ScheduleSaveButton 
                          onClick={handleSaveSchedule}
                          disabled={isScheduling || !scheduleDate}
                        >
                          {isScheduling ? 'Scheduling...' : 'Schedule'}
                        </ScheduleSaveButton>
                        <ScheduleCancelButton onClick={handleCancelSchedule}>
                          Cancel
                        </ScheduleCancelButton>
                      </ScheduleActions>
                    </ScheduleInputGroup>
                  )}

                  {scheduledChange && (
                    <ScheduledChangeBox>
                      <ScheduledChangeHeader>
                        <ScheduledChangeTitle>
                          <Calendar size={14} />
                          Scheduled Change
                        </ScheduledChangeTitle>
                        <DeleteScheduleButton 
                          onClick={() => handleDeleteSchedule(scheduledChange.id, prayer)}
                          title="Delete scheduled change"
                        >
                          <X size={16} />
                        </DeleteScheduleButton>
                      </ScheduledChangeHeader>
                      <ScheduledChangeDetails>
                        <div>
                          <strong>Effective:</strong> {new Date(scheduledChange.effectiveDate.seconds * 1000).toLocaleDateString()}
                        </div>
                        <div>
                          <strong>New iqama:</strong>{' '}
                          {scheduledChange.iqama_type === 'fixed' 
                            ? scheduledChange.iqama_value 
                            : `${scheduledChange.iqama_value} min after adhan`}
                        </div>
                        <div style={{ marginTop: '0.25rem', fontSize: '0.85em' }}>
                          Will apply at {prayer} time on {new Date(scheduledChange.effectiveDate.seconds * 1000 - 86400000).toLocaleDateString()}
                        </div>
                      </ScheduledChangeDetails>
                    </ScheduledChangeBox>
                  )}
                </ScheduleSection>
              )}
            </PrayerCard>
          );
        })}
      </PrayerGrid>

      {fetchStatus && (
        <APIStatusBox $success={fetchStatus.success}>
          {fetchStatus.message}
        </APIStatusBox>
      )}

      <ButtonContainer>
        <RefreshButton 
          onClick={fetchAllPrayerTimes} 
          disabled={fetchingPrayerTimes || !hasLocationSettings || !canEdit}
        >
          <RefreshCw size={20} />
          {fetchingPrayerTimes ? 'Fetching...' : 'Refresh Prayer Times Now'}
        </RefreshButton>
        
        <SaveButton onClick={handleSave} disabled={saving || !canEdit} $dirty={isDirty}>
          <Save size={20} />
          {saving ? 'Saving...' : 'Save Prayer Times'}
        </SaveButton>
      </ButtonContainer>
    </Card>
  );
}