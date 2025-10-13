import React, { useState } from 'react';
import styled from 'styled-components';
import { Save, RefreshCw } from 'lucide-react';
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

const MaghribInfoBox = styled.div`
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #fef3c7;
  border: 1px solid #fbbf24;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: #92400e;
`;

const PrayerGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
`;

const PrayerCard = styled.div<{ $highlighted?: boolean }>`
  border: 1px solid ${props => props.$highlighted ? '#fbbf24' : '#e5e7eb'};
  background: ${props => props.$highlighted ? '#fffbeb' : 'white'};
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
    background: #f3f4f6;
    cursor: not-allowed;
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

const FetchButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f59e0b;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  margin-top: 0.5rem;
  width: 100%;
  justify-content: center;
  font-size: 0.875rem;
  transition: background 0.2s;

  &:hover {
    background: #d97706;
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
  margin-top: 1.5rem;
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
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: ${props => props.$success ? '#f0fdf4' : '#fef2f2'};
  border: 1px solid ${props => props.$success ? '#86efac' : '#fca5a5'};
  border-radius: 0.375rem;
  font-size: 0.75rem;
  color: ${props => props.$success ? '#15803d' : '#991b1b'};
  text-align: center;
`;

export default function PrayerTimesTab({ prayerTimes, onChange, onSave, saving, mosqueSettings }: PrayerTimesTabProps): React.JSX.Element {
  const prayers: string[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  const [fetchingMaghrib, setFetchingMaghrib] = useState(false);
  const [maghribFetchStatus, setMaghribFetchStatus] = useState<{ success: boolean; message: string } | null>(null);

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

  const fetchMaghribTime = async (): Promise<void> => {
    if (!mosqueSettings?.latitude || !mosqueSettings?.longitude) {
      setMaghribFetchStatus({
        success: false,
        message: 'Please set mosque location in Settings tab first'
      });
      return;
    }

    setFetchingMaghrib(true);
    setMaghribFetchStatus(null);

    try {
      const today = new Date();
      const timestamp = Math.floor(today.getTime() / 1000);
      const method = mosqueSettings.calculation_method || 3;

      console.log('Fetching from API with:', { latitude: mosqueSettings.latitude, longitude: mosqueSettings.longitude, method });

      const response = await fetch(
        `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${mosqueSettings.latitude}&longitude=${mosqueSettings.longitude}&method=${method}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch prayer times');
      }

      const data = await response.json();
      
      console.log('API Response:', data);

      if (data.code !== 200 || !data.data?.timings?.Maghrib) {
        throw new Error('Invalid API response');
      }

      // Convert 24-hour format to 12-hour format
      const maghribTime24 = data.data.timings.Maghrib;
      const [hours24, minutes] = maghribTime24.split(':');
      let hours = parseInt(hours24);
      const period = hours >= 12 ? 'PM' : 'AM';
      
      if (hours > 12) {
        hours -= 12;
      } else if (hours === 0) {
        hours = 12;
      }

      const maghribTime12 = `${hours}:${minutes} ${period}`;

      console.log('Converted Maghrib time:', maghribTime12);

      // Update maghrib adhan time
      onChange({
        ...prayerTimes,
        maghrib_adhan: maghribTime12
      } as any);

      setMaghribFetchStatus({
        success: true,
        message: `Maghrib Adhan updated to ${maghribTime12}`
      });
    } catch (error) {
      console.error('Error fetching Maghrib time:', error);
      setMaghribFetchStatus({
        success: false,
        message: 'Failed to fetch Maghrib time. Please check your internet connection.'
      });
    } finally {
      setFetchingMaghrib(false);
    }
  };

  const autoFetchEnabled = mosqueSettings?.auto_fetch_maghrib;
  const hasLocationSettings = mosqueSettings?.latitude && mosqueSettings?.longitude;

  return (
    <Card>
      <CardTitle>Daily Prayer Times</CardTitle>
      
      <InfoBox>
        <strong>Iqama Time Options:</strong>
        <ul style={{ marginTop: '0.5rem', marginBottom: 0, paddingLeft: '1.5rem' }}>
          <li><strong>Fixed Time:</strong> Set a specific time for Iqama (e.g., 5:45 AM)</li>
          <li><strong>Offset:</strong> Set Iqama as minutes after Adhan (e.g., 15 minutes after)</li>
        </ul>
        {prayerTimes?.last_updated && (
          <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #93c5fd' }}>
            Last updated: {new Date(prayerTimes.last_updated).toLocaleDateString('en-AU', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        )}
      </InfoBox>

      {autoFetchEnabled && (
        <MaghribInfoBox>
          <strong>🌅 Auto-Fetch Maghrib Enabled</strong>
          <div style={{ marginTop: '0.5rem' }}>
            Maghrib Adhan time is automatically fetched from Aladhan API based on sunset time.
            {!hasLocationSettings && (
              <div style={{ marginTop: '0.5rem', fontWeight: 'bold', color: '#dc2626' }}>
                ⚠️ Please configure mosque location in Settings tab to enable fetching.
              </div>
            )}
          </div>
        </MaghribInfoBox>
      )}

      <PrayerGrid>
        {prayers.map(prayer => {
          const iqamaType = (prayerTimes as any)[`${prayer}_iqama_type`] || 'fixed';
          const iqamaOffset = (prayerTimes as any)[`${prayer}_iqama_offset`] || (prayer === 'maghrib' ? 5 : 15);
          const adhanTime = (prayerTimes as any)[`${prayer}_adhan`];
          const calculatedIqama = calculateIqamaTime(adhanTime, iqamaOffset);
          const isMaghrib = prayer === 'maghrib';
          const showFetchButton = isMaghrib && autoFetchEnabled && hasLocationSettings;

          return (
            <PrayerCard key={prayer} $highlighted={isMaghrib && autoFetchEnabled}>
              <PrayerName>
                {prayer}
                {isMaghrib && autoFetchEnabled && ' 🌅'}
              </PrayerName>
              
              <TimeInputGroup>
                <TimeLabel>
                  Adhan
                  {isMaghrib && autoFetchEnabled && ' (Auto-fetch)'}
                </TimeLabel>
                <TimeInput
                  type="text"
                  value={(prayerTimes as any)[`${prayer}_adhan`] || ''}
                  onChange={(e) => handleTimeChange(prayer, 'adhan', e.target.value)}
                  placeholder="e.g., 5:30 AM"
                  disabled={isMaghrib && autoFetchEnabled}
                />
                {showFetchButton && (
                  <FetchButton 
                    onClick={fetchMaghribTime} 
                    disabled={fetchingMaghrib}
                  >
                    <RefreshCw size={16} />
                    {fetchingMaghrib ? 'Fetching...' : 'Fetch Maghrib Now'}
                  </FetchButton>
                )}
                {isMaghrib && maghribFetchStatus && (
                  <APIStatusBox $success={maghribFetchStatus.success}>
                    {maghribFetchStatus.message}
                  </APIStatusBox>
                )}
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

      <SaveButton onClick={onSave} disabled={saving}>
        <Save size={20} />
        {saving ? 'Saving...' : 'Save Prayer Times'}
      </SaveButton>
    </Card>
  );
}