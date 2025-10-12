import React from 'react';
import styled from 'styled-components';
import { Save } from 'lucide-react';
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

const TwoColumnGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
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
  const handleChange = (field: keyof typeof mosqueSettings, value: string): void => {
    onChange({
      ...mosqueSettings,
      [field]: value
    });
  };

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
      </SettingsForm>

      <SaveButton onClick={onSave} disabled={saving}>
        <Save size={20} />
        {saving ? 'Saving...' : 'Save Mosque Settings'}
      </SaveButton>
    </Card>
  );
}