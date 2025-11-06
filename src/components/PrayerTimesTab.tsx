import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Save, RefreshCw, Globe } from 'lucide-react';
import { PrayerTimesTabProps } from '../types';
import TimeInput from './TimeInput';
import { Theme, media } from '../constants/theme';
import Card from './ui/Card';
import { usePermissions } from '../hooks/usePermissions';
import { Permission } from '../constants/roles';

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

export default function PrayerTimesTab({ prayerTimes, onChange, onSave, saving, mosqueSettings }: PrayerTimesTabProps): React.JSX.Element {
  const { hasPermission } = usePermissions();
  const canEdit = hasPermission(Permission.EDIT_PRAYER_TIMES);
  
  const prayers: string[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  const [fetchingPrayerTimes, setFetchingPrayerTimes] = useState(false);
  const [fetchStatus, setFetchStatus] = useState<{ success: boolean; message: string } | null>(null);
  // Keep a snapshot of the last-saved prayerTimes to detect unsaved changes
  const initialSnapshotRef = useRef<string>(JSON.stringify(prayerTimes));

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
      const timestamp = Math.floor(Date.now() / 1000);
      const method = mosqueSettings.calculation_method || 3;

      console.log('Fetching all prayer times from API...');

      const response = await fetch(
        `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${mosqueSettings.latitude}&longitude=${mosqueSettings.longitude}&method=${method}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch prayer times');
      }

      const data = await response.json();
      
      console.log('API Response:', data);

      if (data.code !== 200 || !data.data?.timings) {
        throw new Error('Invalid API response');
      }

      // Convert all prayer times from 24-hour to 12-hour format
      const timings = data.data.timings;
      const convertTo12Hour = (time24: string): string => {
        const [hours24, minutes] = time24.split(':');
        let hours = parseInt(hours24);
        const period = hours >= 12 ? 'PM' : 'AM';
        
        if (hours > 12) {
          hours -= 12;
        } else if (hours === 0) {
          hours = 12;
        }

        return `${hours}:${minutes} ${period}`;
      };

      // Update all Adhan times
      const updatedPrayerTimes = {
        ...prayerTimes,
        fajr_adhan: convertTo12Hour(timings.Fajr),
        dhuhr_adhan: convertTo12Hour(timings.Dhuhr),
        asr_adhan: convertTo12Hour(timings.Asr),
        maghrib_adhan: convertTo12Hour(timings.Maghrib),
        isha_adhan: convertTo12Hour(timings.Isha),
      };

      onChange(updatedPrayerTimes);

      console.log('All prayer times updated:', {
        Fajr: convertTo12Hour(timings.Fajr),
        Dhuhr: convertTo12Hour(timings.Dhuhr),
        Asr: convertTo12Hour(timings.Asr),
        Maghrib: convertTo12Hour(timings.Maghrib),
        Isha: convertTo12Hour(timings.Isha),
      });

      setFetchStatus({
        success: true,
        message: 'All prayer times updated successfully! Click "Save Prayer Times" to save changes.'
      });
    } catch (error) {
      console.error('Error fetching prayer times:', error);
      setFetchStatus({
        success: false,
        message: 'Failed to fetch prayer times. Please check your internet connection.'
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
              Adhan times are automatically calculated from Aladhan API based on your mosque location.
              {prayerTimes?.last_updated && ` Last updated: ${new Date(prayerTimes.last_updated).toLocaleDateString('en-AU', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}`}
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
                  >
                    Fixed Time
                  </TypeButton>
                  <TypeButton
                    type="button"
                    $active={iqamaType === 'offset'}
                    onClick={() => handleIqamaTypeChange(prayer, 'offset')}
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