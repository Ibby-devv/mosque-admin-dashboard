import React from 'react';
import styled from 'styled-components';
import { Save, MapPin } from 'lucide-react';
import { MosqueSettingsTabProps } from '../types';

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

const SectionTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 1.5rem 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SettingsForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div<{ marginBottom?: string }>`
  margin-bottom: ${props => props.marginBottom || '0'};
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  outline: none;
  transition: all 0.2s;
  box-sizing: border-box;

  &:focus {
    border-color: #1e3a8a;
    box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  outline: none;
  transition: all 0.2s;
  box-sizing: border-box;
  background: white;

  &:focus {
    border-color: #1e3a8a;
    box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1);
  }
`;

const TwoColumnGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
`;

const InfoBox = styled.div`
  margin-top: 1rem;
  padding: 0.75rem;
  background: #dbeafe;
  border: 1px solid #93c5fd;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  color: #1e40af;
`;

const HelpText = styled.p`
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
  margin-bottom: 0;
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

export default function MosqueSettingsTab({ mosqueSettings, onChange, onSave, saving }: MosqueSettingsTabProps): React.JSX.Element {
  const handleChange = (field: keyof typeof mosqueSettings, value: string | number | boolean): void => {
    onChange({
      ...mosqueSettings,
      [field]: value
    });
  };

  const calculationMethods = [
    { value: 1, label: 'University of Islamic Sciences, Karachi' },
    { value: 2, label: 'Islamic Society of North America (ISNA)' },
    { value: 3, label: 'Muslim World League (MWL)' },
    { value: 4, label: 'Umm Al-Qura University, Makkah' },
    { value: 5, label: 'Egyptian General Authority of Survey' },
    { value: 7, label: 'Institute of Geophysics, University of Tehran' },
    { value: 8, label: 'Gulf Region' },
    { value: 9, label: 'Kuwait' },
    { value: 10, label: 'Qatar' },
    { value: 11, label: 'Majlis Ugama Islam Singapura, Singapore' },
    { value: 12, label: 'Union Organization islamic de France' },
    { value: 13, label: 'Diyanet İşleri Başkanlığı, Turkey' },
    { value: 14, label: 'Spiritual Administration of Muslims of Russia' },
  ];

  return (
    <Card>
      <CardTitle>Mosque Information</CardTitle>
      
      <SettingsForm>
        <FormGroup>
          <Label>Mosque Name</Label>
          <Input
            type="text"
            value={mosqueSettings?.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
          />
        </FormGroup>

        <FormGroup>
          <Label>Address</Label>
          <Input
            type="text"
            value={mosqueSettings?.address || ''}
            onChange={(e) => handleChange('address', e.target.value)}
          />
        </FormGroup>

        <TwoColumnGrid>
          <FormGroup>
            <Label>Phone</Label>
            <Input
              type="text"
              value={mosqueSettings?.phone || ''}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
          </FormGroup>

          <FormGroup>
            <Label>Email</Label>
            <Input
              type="email"
              value={mosqueSettings?.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
            />
          </FormGroup>
        </TwoColumnGrid>

        <FormGroup>
          <Label>Website</Label>
          <Input
            type="text"
            value={mosqueSettings?.website || ''}
            onChange={(e) => handleChange('website', e.target.value)}
          />
        </FormGroup>

        <FormGroup>
          <Label>Imam</Label>
          <Input
            type="text"
            value={mosqueSettings?.imam || ''}
            onChange={(e) => handleChange('imam', e.target.value)}
          />
        </FormGroup>

        <SectionTitle>
          <MapPin size={20} />
          Location Settings (for Prayer Time Calculation)
        </SectionTitle>

        <InfoBox>
          <strong>📍 Location is used to automatically calculate all prayer times</strong>
          <div style={{ marginTop: '0.5rem' }}>
            Once you save your mosque location, all Adhan times will be automatically calculated from Aladhan API based on astronomical data.
            You only need to set the Iqama times in the Prayer Times tab.
          </div>
        </InfoBox>

        <TwoColumnGrid>
          <FormGroup>
            <Label>Latitude</Label>
            <Input
              type="number"
              step="0.000001"
              value={mosqueSettings?.latitude || ''}
              onChange={(e) => handleChange('latitude', parseFloat(e.target.value))}
              placeholder="-33.8688"
            />
            <HelpText>Example: -33.8688 (Sydney)</HelpText>
          </FormGroup>

          <FormGroup>
            <Label>Longitude</Label>
            <Input
              type="number"
              step="0.000001"
              value={mosqueSettings?.longitude || ''}
              onChange={(e) => handleChange('longitude', parseFloat(e.target.value))}
              placeholder="151.2093"
            />
            <HelpText>Example: 151.2093 (Sydney)</HelpText>
          </FormGroup>
        </TwoColumnGrid>

        <FormGroup>
          <Label>Prayer Time Calculation Method</Label>
          <Select
            value={mosqueSettings?.calculation_method || 3}
            onChange={(e) => handleChange('calculation_method', parseInt(e.target.value))}
          >
            {calculationMethods.map(method => (
              <option key={method.value} value={method.value}>
                {method.label}
              </option>
            ))}
          </Select>
          <HelpText>
            This determines how prayer times are calculated. MWL (Muslim World League) is commonly used globally.
          </HelpText>
        </FormGroup>
      </SettingsForm>

      <SaveButton onClick={onSave} disabled={saving}>
        <Save size={20} />
        {saving ? 'Saving...' : 'Save Mosque Settings'}
      </SaveButton>
    </Card>
  );
}