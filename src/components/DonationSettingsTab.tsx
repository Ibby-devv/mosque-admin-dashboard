// ============================================================================
// ADMIN COMPONENT: Donation Settings Tab
// Location: mosque-admin-dashboard/src/components/DonationSettingsTab.tsx
// ============================================================================

import React, { useState } from 'react';
import styled from 'styled-components';
import { Save, Plus, Trash2, Edit2, X } from 'lucide-react';
import { DonationSettings, DonationType } from '../types';
import Card from './ui/Card';
import { Theme, media } from '../constants/theme';
import { usePermissions } from '../hooks/usePermissions';
import { Permission } from '../constants/roles';

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const Container = Card;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${Theme.spacing.xl};
`;

const Title = styled.h2`
  font-size: ${Theme.typography.h2};
  font-weight: 700;
  color: ${Theme.colors.text.strong};
  margin: 0;

  ${media.sm} { font-size: ${Theme.typography.h1}; }
`;

const SaveButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${Theme.spacing.sm};
  background: ${Theme.colors.brand.navy[700]};
  color: white;
  padding: ${Theme.spacing.md} ${Theme.spacing.xl};
  min-height: 48px;
  border-radius: ${Theme.radius.md};
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;

  &:hover { background: ${Theme.colors.brand.navy[600]}; box-shadow: ${Theme.shadow.soft}; transform: translateY(-1px); }
  &:disabled { background: ${Theme.colors.border.medium}; cursor: not-allowed; transform: none; }
`;

const Section = styled.div`
  background: ${Theme.colors.surface.card};
  border: 1px solid ${Theme.colors.border.base};
  border-radius: ${Theme.radius.md};
  box-shadow: ${Theme.shadow.soft};
  padding: ${Theme.spacing.lg};
  margin-bottom: ${Theme.spacing.xl};

  &:hover { box-shadow: ${Theme.shadow.card}; }
`;

const SectionTitle = styled.h3`
  font-size: ${Theme.typography.h3};
  font-weight: 700;
  color: ${Theme.colors.text.strong};
  margin: 0 0 ${Theme.spacing.md} 0;
`;

const SectionDescription = styled.p`
  color: ${Theme.colors.text.muted};
  margin: 0 0 ${Theme.spacing.lg} 0;
  font-size: ${Theme.typography.small};
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${Theme.spacing.lg};

  ${media.sm} {
    grid-template-columns: 1fr 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${Theme.spacing.sm};
`;

const Label = styled.label`
  font-weight: 600;
  color: ${Theme.colors.text.strong};
  font-size: ${Theme.typography.small};
`;

const Input = styled.input`
  padding: ${Theme.spacing.md};
  min-height: 44px;
  border: 1px solid ${Theme.colors.border.base};
  border-radius: ${Theme.radius.md};
  font-size: ${Theme.typography.body};

  &:focus {
    outline: none;
    border-color: ${Theme.colors.brand.navy[700]};
    box-shadow: 0 0 0 3px ${Theme.colors.accent.blueSoft};
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
  gap: ${Theme.spacing.sm};
  cursor: pointer;
  font-size: ${Theme.typography.body};
  color: ${Theme.colors.text.strong};
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${Theme.spacing.sm};
`;

const ListItem = styled.div<{ disabled?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${Theme.spacing.lg};
  background: ${props => props.disabled ? Theme.colors.surface.muted : Theme.colors.surface.base};
  border: 1px solid ${Theme.colors.border.base};
  border-radius: ${Theme.radius.md};
  opacity: ${props => props.disabled ? 0.6 : 1};
`;

const ListItemContent = styled.div`
  display: flex;
  align-items: center;
  gap: ${Theme.spacing.lg};
  flex: 1;
`;

const ListItemText = styled.span`
  font-weight: 600;
  color: ${Theme.colors.text.strong};
`;

const ListItemActions = styled.div`
  display: flex;
  gap: ${Theme.spacing.sm};
`;

const IconButton = styled.button`
  padding: ${Theme.spacing.sm};
  min-height: 44px; min-width: 44px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: ${Theme.colors.text.muted};
  border-radius: ${Theme.radius.sm};
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;

  &:hover { background: ${Theme.colors.surface.muted}; color: ${Theme.colors.brand.navy[700]}; }
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${Theme.spacing.sm};
  padding: ${Theme.spacing.md} ${Theme.spacing.lg};
  background: ${Theme.colors.surface.muted};
  border: 1px dashed ${Theme.colors.border.base};
  border-radius: ${Theme.radius.md};
  cursor: pointer;
  color: ${Theme.colors.brand.navy[700]};
  font-weight: 600;
  width: 100%;
  transition: all 0.2s;

  &:hover { background: ${Theme.colors.surface.base}; box-shadow: ${Theme.shadow.soft}; }
`;

const AmountList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${Theme.spacing.sm};
`;

const AmountChip = styled.div`
  display: flex;
  align-items: center;
  gap: ${Theme.spacing.sm};
  padding: ${Theme.spacing.sm} ${Theme.spacing.lg};
  background: ${Theme.colors.accent.blueSoft};
  color: ${Theme.colors.brand.navy[700]};
  border-radius: ${Theme.radius.pill};
  font-weight: 600;
`;

const RemoveChipButton = styled.button`
  padding: 0;
  background: transparent;
  border: none;
  cursor: pointer;
  color: ${Theme.colors.brand.navy[700]};
  display: flex;
  align-items: center;

  &:hover { color: ${Theme.colors.status.error}; }
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
  background: ${Theme.colors.surface.card};
  border-radius: ${Theme.radius.lg};
  padding: ${Theme.spacing.xl};
  width: 90%;
  max-width: 500px;
  box-shadow: ${Theme.shadow.card};

  ${media.sm} { padding: ${Theme.spacing.xxl}; }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${Theme.spacing.xl};
`;

const ModalTitle = styled.h3`
  font-size: ${Theme.typography.h2};
  font-weight: 700;
  color: ${Theme.colors.text.strong};
  margin: 0;
`;

const ModalActions = styled.div`
  display: flex;
  gap: ${Theme.spacing.sm};
  justify-content: flex-end;
  margin-top: ${Theme.spacing.lg};
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: ${Theme.spacing.md} ${Theme.spacing.xl};
  min-height: 44px;
  border-radius: ${Theme.radius.md};
  font-weight: 600;
  border: none;
  cursor: pointer;
  background: ${props => props.variant === 'primary' ? Theme.colors.brand.navy[700] : Theme.colors.surface.muted};
  color: ${props => props.variant === 'primary' ? 'white' : Theme.colors.text.strong};
  transition: all 0.2s;

  &:hover { 
    background: ${props => props.variant === 'primary' ? Theme.colors.brand.navy[600] : Theme.colors.surface.base};
    box-shadow: ${Theme.shadow.soft};
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
  const { hasPermission } = usePermissions();
  const canEdit = hasPermission(Permission.EDIT_DONATION_SETTINGS);
  
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
        <SaveButton onClick={onSave} disabled={saving || !canEdit}>
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
          <AddButton onClick={() => setShowTypeModal(true)} disabled={!canEdit}>
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
            style={{ flex: 2 }}
          />
          <Button variant="primary" onClick={handleAddAmount} style={{ flex: 1 }}>
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
