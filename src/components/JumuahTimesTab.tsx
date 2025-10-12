import React from 'react';
import styled from 'styled-components';
import { Save } from 'lucide-react';
import { JumuahTimesTabProps } from '../types';

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

const JumuahGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
`;

const JumuahCard = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
`;

const JumuahTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 1rem;
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

export default function JumuahTimesTab({ jumuahTimes, onChange, onSave, saving }: JumuahTimesTabProps): React.JSX.Element {
  const handleChange = (field: keyof typeof jumuahTimes, value: string): void => {
    onChange({
      ...jumuahTimes,
      [field]: value
    });
  };

  return (
    <Card>
      <CardTitle>Friday (Jumuah) Prayer Times</CardTitle>
      
      <JumuahGrid>
        <JumuahCard>
          <JumuahTitle>First Jumuah</JumuahTitle>
          <TimeInputGroup>
            <TimeLabel>Khutbah Time</TimeLabel>
            <TimeInput
              type="text"
              value={jumuahTimes?.first_khutbah || ''}
              onChange={(e) => handleChange('first_khutbah', e.target.value)}
              placeholder="e.g., 12:30 PM"
            />
          </TimeInputGroup>
          <TimeInputGroup>
            <TimeLabel>Prayer Time</TimeLabel>
            <TimeInput
              type="text"
              value={jumuahTimes?.first_prayer || ''}
              onChange={(e) => handleChange('first_prayer', e.target.value)}
              placeholder="e.g., 1:00 PM"
            />
          </TimeInputGroup>
        </JumuahCard>

        <JumuahCard>
          <JumuahTitle>Second Jumuah</JumuahTitle>
          <TimeInputGroup>
            <TimeLabel>Khutbah Time</TimeLabel>
            <TimeInput
              type="text"
              value={jumuahTimes?.second_khutbah || ''}
              onChange={(e) => handleChange('second_khutbah', e.target.value)}
              placeholder="e.g., 1:45 PM"
            />
          </TimeInputGroup>
          <TimeInputGroup>
            <TimeLabel>Prayer Time</TimeLabel>
            <TimeInput
              type="text"
              value={jumuahTimes?.second_prayer || ''}
              onChange={(e) => handleChange('second_prayer', e.target.value)}
              placeholder="e.g., 2:15 PM"
            />
          </TimeInputGroup>
        </JumuahCard>
      </JumuahGrid>

      <SaveButton onClick={onSave} disabled={saving}>
        <Save size={20} />
        {saving ? 'Saving...' : 'Save Jumuah Times'}
      </SaveButton>
    </Card>
  );
}