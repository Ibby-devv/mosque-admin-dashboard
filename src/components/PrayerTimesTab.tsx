import React, { useState } from 'react';
import styled from 'styled-components';
import { Save, RefreshCw, Globe } from 'lucide-react';
import { PrayerTimesTabProps } from '../types';

const Card = styled.div`
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
`;

const CardTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 1.5rem;
`;

const InfoBox = styled.div`
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #dbeafe;
  border: 1px solid #93c5fd;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: #1e40af;
`;

const AutoFetchBanner = styled.div`
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const BannerIcon = styled.div`
  flex-shrink: 0;
`;

const BannerContent = styled.div`
  flex: 1;
`;

const BannerTitle = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #15803d;
  margin-bottom: 0.25rem;
`;

const BannerText = styled.div`
  font-size: 0.75rem;
  color: #166534;
`;

const PrayerGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
`;

const PrayerCard = styled.div`
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 0.5rem;
  padding: 1rem;
`;

const PrayerName = styled.h3`
  font-size: 1.125rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 1rem;
  text-transform: capitalize;
`;

const TimeInputGroup = styled.div`
  margin-bottom: 0.75rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const TimeLabel = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 0.25rem;
`;

const TimeInput = styled.input`
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  outline: none;
  transition: all 0.2s;
  box-sizing: border-box;

  &:focus {
    border-color: #1e3a8a;
    box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1);
  }

  &:disabled {
    background: #f9fafb;
    color: #6b7280;
    cursor: not-allowed;
    border-color: #e5e7eb;
  }
`;

const IqamaTypeSelector = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
`;

const TypeButton = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 0.5rem;
  border: 1px solid ${props => props.$active ? '#1e3a8a' : '#d1d5db'};
  background: ${props => props.$active ? '#1e3a8a' : 'white'};
  color: ${props => props.$active ? 'white' : '#6b7280'};
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #1e3a8a;
    color: ${props => props.$active ? 'white' : '#1e3a8a'};
  }
`;

const OffsetInputContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const OffsetInput = styled.input`
  width: 4rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  outline: none;
  transition: all 0.2s;
  box-sizing: border-box;
  text-align: center;

  &:focus {
    border-color: #1e3a8a;
    box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1);
  }
`;

const OffsetLabel = styled.span`
  font-size: 0.875rem;
  color: #6b7280;
`;

const CalculatedTime = styled.div`
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  color: #15803d;
  text-align: center;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #3b82f6;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #2563eb;
  }

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
`;

const SaveButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #1e3a8a;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
  

  &:hover {
    background: #1e40af;
  }

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
`;

const APIStatusBox = styled.div<{ $success: boolean }>`
  margin-top: 1rem;
  padding: 0.75rem;
  background: ${props => props.$success ? '#f0fdf4' : '#fef2f2'};
  border: 1px solid ${props => props.$success ? '#86efac' : '#fca5a5'};
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: ${props => props.$success ? '#15803d' : '#991b1b'};
  text-align: center;
`;

export default function PrayerTimesTab({ prayerTimes, onChange, onSave, saving, mosqueSettings }: PrayerTimesTabProps): React.JSX.Element {
  const prayers: string[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  const [fetchingPrayerTimes, setFetchingPrayerTimes] = useState(false);
  const [fetchStatus, setFetchStatus] = useState<{ success: boolean; message: string } | null>(null);

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
                <TimeInput
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
                    type="text"
                    value={(prayerTimes as any)[`${prayer}_iqama`] || ''}
                    onChange={(e) => handleTimeChange(prayer, 'iqama', e.target.value)}
                    placeholder="e.g., 5:45 AM"
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
          disabled={fetchingPrayerTimes || !hasLocationSettings}
        >
          <RefreshCw size={20} />
          {fetchingPrayerTimes ? 'Fetching...' : 'Refresh Prayer Times Now'}
        </RefreshButton>
        
        <SaveButton onClick={onSave} disabled={saving}>
          <Save size={20} />
          {saving ? 'Saving...' : 'Save Prayer Times'}
        </SaveButton>
      </ButtonContainer>
    </Card>
  );
}