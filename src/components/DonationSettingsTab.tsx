// ============================================================================
// ADMIN COMPONENT: Donation Settings Tab
// Location: mosque-admin-dashboard/src/components/DonationSettingsTab.tsx
// ============================================================================

import React, { useState } from 'react';
import styled from 'styled-components';
import { Save, Plus, Trash2, Edit2, X } from 'lucide-react';
import { DonationSettings, DonationType, RecurringFrequencyOption } from '../types';

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const Container = styled.div`
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e3a8a;
  margin: 0;
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

  &:hover {
    background: #1e40af;
  }

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
`;

const Section = styled.div`
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e3a8a;
  margin: 0 0 1rem 0;
`;

const SectionDescription = styled.p`
  color: #6b7280;
  margin: 0 0 1.5rem 0;
  font-size: 0.875rem;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #1e3a8a;
    box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1);
  }
`;

const Checkbox = styled.input`
  width: 1.25rem;
  height: 1.25rem;
  cursor: pointer;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: #374151;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const ListItem = styled.div<{ disabled?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: ${props => props.disabled ? '#f3f4f6' : '#f9fafb'};
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  opacity: ${props => props.disabled ? 0.6 : 1};
`;

const ListItemContent = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
`;

const ListItemText = styled.span`
  font-weight: 500;
  color: #374151;
`;

const ListItemActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const IconButton = styled.button`
  padding: 0.5rem;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #6b7280;
  border-radius: 0.25rem;

  &:hover {
    background: #e5e7eb;
    color: #1e3a8a;
  }
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #f3f4f6;
  border: 1px dashed #d1d5db;
  border-radius: 0.5rem;
  cursor: pointer;
  color: #1e3a8a;
  font-weight: 600;
  width: 100%;

  &:hover {
    background: #e5e7eb;
  }
`;

const AmountList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const AmountChip = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #dbeafe;
  color: #1e3a8a;
  border-radius: 9999px;
  font-weight: 600;
`;

const RemoveChipButton = styled.button`
  padding: 0;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #1e3a8a;
  display: flex;
  align-items: center;

  &:hover {
    color: #dc2626;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 0.75rem;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e3a8a;
  margin: 0;
`;

const ModalActions = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  background: ${props => props.variant === 'primary' ? '#1e3a8a' : '#f3f4f6'};
  color: ${props => props.variant === 'primary' ? 'white' : '#374151'};

  &:hover {
    background: ${props => props.variant === 'primary' ? '#1e40af' : '#e5e7eb'};
  }
`;

// ============================================================================
// COMPONENT PROPS
// ============================================================================

interface DonationSettingsTabProps {
  settings: DonationSettings | null;
  onChange: (settings: DonationSettings) => void;
  onSave: () => void;
  saving: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function DonationSettingsTab({
  settings,
  onChange,
  onSave,
  saving,
}: DonationSettingsTabProps): React.JSX.Element {
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [editingType, setEditingType] = useState<DonationType | null>(null);
  const [newTypeName, setNewTypeName] = useState('');
  const [newAmount, setNewAmount] = useState('');

  if (!settings) {
    return <Container>Loading settings...</Container>;
  }

  const handleAddType = () => {
    if (!newTypeName.trim()) return;

    const newType: DonationType = {
      id: newTypeName.toLowerCase().replace(/\s+/g, '_'),
      label: newTypeName,
      enabled: true,
    };

    onChange({
      ...settings,
      donation_types: [...settings.donation_types, newType],
    });

    setNewTypeName('');
    setShowTypeModal(false);
  };

  const handleEditType = (type: DonationType) => {
    setEditingType(type);
    setNewTypeName(type.label);
    setShowTypeModal(true);
  };

  const handleUpdateType = () => {
    if (!editingType || !newTypeName.trim()) return;

    onChange({
      ...settings,
      donation_types: settings.donation_types.map(t =>
        t.id === editingType.id ? { ...t, label: newTypeName } : t
      ),
    });

    setEditingType(null);
    setNewTypeName('');
    setShowTypeModal(false);
  };

  const handleDeleteType = (typeId: string) => {
    if (settings.donation_types.length <= 1) {
      alert('You must have at least one donation type');
      return;
    }

    if (window.confirm('Are you sure you want to delete this donation type?')) {
      onChange({
        ...settings,
        donation_types: settings.donation_types.filter(t => t.id !== typeId),
      });
    }
  };

  const handleToggleType = (typeId: string) => {
    onChange({
      ...settings,
      donation_types: settings.donation_types.map(t =>
        t.id === typeId ? { ...t, enabled: !t.enabled } : t
      ),
    });
  };

  const handleAddAmount = () => {
    const amount = parseFloat(newAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (settings.preset_amounts.includes(amount)) {
      alert('This amount already exists');
      return;
    }

    onChange({
      ...settings,
      preset_amounts: [...settings.preset_amounts, amount].sort((a, b) => a - b),
    });

    setNewAmount('');
  };

  const handleRemoveAmount = (amount: number) => {
    onChange({
      ...settings,
      preset_amounts: settings.preset_amounts.filter(a => a !== amount),
    });
  };

  const handleToggleFrequency = (frequencyId: string) => {
    onChange({
      ...settings,
      recurring_frequencies: settings.recurring_frequencies.map(f =>
        f.id === frequencyId ? { ...f, enabled: !f.enabled } : f
      ),
    });
  };

  return (
    <Container>
      <Header>
        <Title>Donation Settings</Title>
        <SaveButton onClick={onSave} disabled={saving}>
          <Save size={20} />
          {saving ? 'Saving...' : 'Save Settings'}
        </SaveButton>
      </Header>

      <Section>
        <SectionTitle>Donation Types</SectionTitle>
        <SectionDescription>
          Configure the types of donations users can make. These will appear as options in the mobile app.
        </SectionDescription>

        <List>
          {settings.donation_types.map(type => (
            <ListItem key={type.id} disabled={!type.enabled}>
              <ListItemContent>
                <Checkbox
                  type="checkbox"
                  checked={type.enabled}
                  onChange={() => handleToggleType(type.id)}
                />
                <ListItemText>{type.label}</ListItemText>
              </ListItemContent>
              <ListItemActions>
                <IconButton onClick={() => handleEditType(type)}>
                  <Edit2 size={18} />
                </IconButton>
                <IconButton onClick={() => handleDeleteType(type.id)}>
                  <Trash2 size={18} />
                </IconButton>
              </ListItemActions>
            </ListItem>
          ))}
        </List>

        <div style={{ marginTop: '1rem' }}>
          <AddButton onClick={() => setShowTypeModal(true)}>
            <Plus size={20} />
            Add Donation Type
          </AddButton>
        </div>
      </Section>

      <Section>
        <SectionTitle>Preset Amounts</SectionTitle>
        <SectionDescription>
          Set quick-select donation amounts for users. They can also enter custom amounts.
        </SectionDescription>

        <AmountList>
          {settings.preset_amounts.map(amount => (
            <AmountChip key={amount}>
              ${amount}
              <RemoveChipButton onClick={() => handleRemoveAmount(amount)}>
                <X size={16} />
              </RemoveChipButton>
            </AmountChip>
          ))}
        </AmountList>

        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
          <Input
            type="number"
            placeholder="Enter amount (e.g., 250)"
            value={newAmount}
            onChange={(e) => setNewAmount(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddAmount()}
            style={{ flex: 1 }}
          />
          <Button variant="primary" onClick={handleAddAmount}>
            Add
          </Button>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <CheckboxLabel>
            <Checkbox
              type="checkbox"
              checked={settings.allow_custom_amount}
              onChange={(e) => onChange({ ...settings, allow_custom_amount: e.target.checked })}
            />
            Allow users to enter custom amounts
          </CheckboxLabel>
        </div>
      </Section>

      <Section>
        <SectionTitle>General Settings</SectionTitle>

        <FormGrid>
          <FormGroup>
            <Label>Minimum Donation Amount ($)</Label>
            <Input
              type="number"
              value={settings.minimum_amount}
              onChange={(e) => onChange({ ...settings, minimum_amount: parseFloat(e.target.value) || 5 })}
              min="1"
            />
          </FormGroup>

          <FormGroup>
            <Label>Receipt Number Prefix</Label>
            <Input
              type="text"
              value={settings.receipt_prefix}
              onChange={(e) => onChange({ ...settings, receipt_prefix: e.target.value.toUpperCase() })}
              placeholder="RCP"
              maxLength={5}
            />
          </FormGroup>
        </FormGrid>
      </Section>

      <Section>
        <SectionTitle>Recurring Donation Frequencies</SectionTitle>
        <SectionDescription>
          Enable or disable recurring donation frequency options.
        </SectionDescription>

        <List>
          {settings.recurring_frequencies.map(freq => (
            <ListItem key={freq.id} disabled={!freq.enabled}>
              <ListItemContent>
                <Checkbox
                  type="checkbox"
                  checked={freq.enabled}
                  onChange={() => handleToggleFrequency(freq.id)}
                />
                <ListItemText>{freq.label}</ListItemText>
              </ListItemContent>
            </ListItem>
          ))}
        </List>
      </Section>

      {showTypeModal && (
        <Modal onClick={() => {
          setShowTypeModal(false);
          setEditingType(null);
          setNewTypeName('');
        }}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                {editingType ? 'Edit Donation Type' : 'Add Donation Type'}
              </ModalTitle>
              <IconButton onClick={() => {
                setShowTypeModal(false);
                setEditingType(null);
                setNewTypeName('');
              }}>
                <X size={24} />
              </IconButton>
            </ModalHeader>

            <FormGroup>
              <Label>Donation Type Name</Label>
              <Input
                type="text"
                value={newTypeName}
                onChange={(e) => setNewTypeName(e.target.value)}
                placeholder="e.g., Building Fund"
                autoFocus
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    editingType ? handleUpdateType() : handleAddType();
                  }
                }}
              />
            </FormGroup>

            <ModalActions>
              <Button variant="secondary" onClick={() => {
                setShowTypeModal(false);
                setEditingType(null);
                setNewTypeName('');
              }}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={editingType ? handleUpdateType : handleAddType}
              >
                {editingType ? 'Update' : 'Add'}
              </Button>
            </ModalActions>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
}
