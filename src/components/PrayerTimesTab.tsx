import React from 'react';
import styled from 'styled-components';
import { Save } from 'lucide-react';
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

const PrayerGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
`;

const PrayerCard = styled.div`
  border: 1px solid #e5e7eb;
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

export default function PrayerTimesTab({ prayerTimes, onChange, onSave, saving }: PrayerTimesTabProps): React.JSX.Element {
  const prayers: string[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

  const handleTimeChange = (prayer: string, type: 'adhan' | 'iqama', value: string): void => {
    onChange({
      ...prayerTimes,
      [`${prayer}_${type}`]: value
    } as any);
  };

  return (
    <Card>
      <CardTitle>Daily Prayer Times</CardTitle>
      
      <InfoBox>
        <strong>Note:</strong> These are the current prayer times shown in the mobile app. 
        Update them whenever the times change (typically a few times per month).
        {prayerTimes?.last_updated && (
          <div style={{ marginTop: '0.5rem' }}>
            Last updated: {new Date(prayerTimes.last_updated).toLocaleDateString('en-AU', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        )}
      </InfoBox>

      <PrayerGrid>
        {prayers.map(prayer => (
          <PrayerCard key={prayer}>
            <PrayerName>{prayer}</PrayerName>
            <TimeInputGroup>
              <TimeLabel>Adhan</TimeLabel>
              <TimeInput
                type="text"
                value={(prayerTimes as any)[`${prayer}_adhan`] || ''}
                onChange={(e) => handleTimeChange(prayer, 'adhan', e.target.value)}
                placeholder="e.g., 5:30 AM"
              />
            </TimeInputGroup>
            <TimeInputGroup>
              <TimeLabel>Iqama</TimeLabel>
              <TimeInput
                type="text"
                value={(prayerTimes as any)[`${prayer}_iqama`] || ''}
                onChange={(e) => handleTimeChange(prayer, 'iqama', e.target.value)}
                placeholder="e.g., 5:45 AM"
              />
            </TimeInputGroup>
          </PrayerCard>
        ))}
      </PrayerGrid>

      <SaveButton onClick={onSave} disabled={saving}>
        <Save size={20} />
        {saving ? 'Saving...' : 'Save Prayer Times'}
      </SaveButton>
    </Card>
  );
}