import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { Save, Plus, Trash2, X, Pencil } from 'lucide-react';
import { JumuahSectionProps, JumuahTime, JumuahData } from '../types';
import TimeInput from './TimeInput';
import { Theme, media } from '../constants/theme';
import { Panel, BlockLabel, PrimaryButton } from './ui/calm';
import { usePermissions } from '../hooks/usePermissions';
import { Permission } from '../constants/roles';

const Section = styled.section`
  margin-top: ${Theme.spacing.xxl};
  padding-bottom: ${Theme.spacing.xxl};
`;

const SectionHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${Theme.spacing.md};
  margin-bottom: ${Theme.spacing.lg};

  ${media.sm} {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${Theme.spacing.sm};
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: ${Theme.typography.h3};
  font-weight: 600;
  letter-spacing: -0.2px;
  color: ${Theme.colors.text.strong};
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(217, 119, 6, 0.45); }
  70% { box-shadow: 0 0 0 8px rgba(217, 119, 6, 0); }
  100% { box-shadow: 0 0 0 0 rgba(217, 119, 6, 0); }
`;

const UnsavedDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${Theme.colors.brand.gold[600]};
  animation: ${pulse} 2s infinite;
`;

const AddButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${Theme.spacing.sm};
  min-height: 44px;
  padding: ${Theme.spacing.sm} ${Theme.spacing.lg};
  border: 1px solid ${Theme.colors.border.soft};
  border-radius: ${Theme.radius.lg};
  background: ${Theme.colors.surface.base};
  color: ${Theme.colors.brand.navy[800]};
  font-family: inherit;
  font-size: ${Theme.typography.body};
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover:not(:disabled) {
    background: ${Theme.colors.surface.soft};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${Theme.spacing.md};
  margin-bottom: ${Theme.spacing.lg};
`;

const Row = styled(Panel)`
  display: flex;
  flex-direction: column;
  gap: ${Theme.spacing.md};

  ${media.sm} {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const RowMain = styled.div`
  flex: 1;
  min-width: 0;
`;

const RowTitle = styled.div`
  font-size: 15px;
  font-weight: 500;
  color: ${Theme.colors.text.strong};
  margin-bottom: 2px;
`;

const RowMeta = styled.div`
  font-size: 13px;
  color: ${Theme.colors.text.muted};
`;

const RowActions = styled.div`
  display: flex;
  gap: ${Theme.spacing.sm};
  flex-shrink: 0;
`;

const IconButton = styled.button<{ $danger?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${Theme.spacing.xs};
  min-height: 40px;
  min-width: 40px;
  padding: ${Theme.spacing.sm} ${Theme.spacing.md};
  border: 1px solid ${Theme.colors.border.soft};
  border-radius: ${Theme.radius.md};
  background: ${Theme.colors.surface.base};
  color: ${(props) =>
    props.$danger ? Theme.colors.status.error : Theme.colors.text.muted};
  font-family: inherit;
  font-size: ${Theme.typography.small};
  font-weight: 500;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: ${Theme.colors.surface.soft};
    color: ${(props) =>
      props.$danger ? Theme.colors.status.errorDark : Theme.colors.brand.navy[800]};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const Modal = styled.div<{ $show: boolean }>`
  display: ${(props) => (props.$show ? 'flex' : 'none')};
  position: fixed;
  inset: 0;
  background: rgba(11, 18, 32, 0.45);
  z-index: 1000;
  align-items: flex-end;
  justify-content: center;
  padding: ${Theme.spacing.lg};
  overflow-y: auto;

  ${media.sm} {
    align-items: center;
  }
`;

const ModalContent = styled.div`
  background: ${Theme.colors.surface.base};
  width: 100%;
  max-width: 28rem;
  border-radius: ${Theme.radius.xl};
  border: 1px solid ${Theme.colors.border.soft};
  padding: ${Theme.spacing.xl};
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${Theme.spacing.xl};
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: ${Theme.typography.h3};
  font-weight: 600;
  color: ${Theme.colors.text.strong};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: ${Theme.spacing.sm};
  color: ${Theme.colors.text.muted};
  min-height: 44px;
  min-width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${Theme.radius.sm};

  &:hover {
    color: ${Theme.colors.text.strong};
    background: ${Theme.colors.surface.muted};
  }
`;

const FormGroup = styled.div`
  margin-bottom: ${Theme.spacing.lg};
`;

const Label = styled.label`
  display: block;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: ${Theme.colors.text.muted};
  margin-bottom: ${Theme.spacing.sm};
`;

const ModalActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${Theme.spacing.sm};

  ${media.sm} {
    flex-direction: row;
  }
`;

const SecondaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: ${Theme.spacing.md} ${Theme.spacing.xl};
  border: 1px solid ${Theme.colors.border.soft};
  border-radius: ${Theme.radius.lg};
  background: ${Theme.colors.surface.base};
  color: ${Theme.colors.text.muted};
  font-family: inherit;
  font-size: ${Theme.typography.body};
  font-weight: 600;
  cursor: pointer;
  flex: 1;

  &:hover {
    background: ${Theme.colors.surface.soft};
  }
`;

const SaveWrap = styled.div`
  ${media.sm} {
    max-width: 280px;
  }
`;

export default function JumuahSection({
  jumuahTimes,
  onChange,
  onSave,
  saving,
}: JumuahSectionProps): React.JSX.Element {
  const { hasPermission } = usePermissions();
  const canView = hasPermission(Permission.VIEW_JUMUAH_TIMES);
  const canEdit = hasPermission(Permission.EDIT_JUMUAH_TIMES);

  const [jumuahData, setJumuahData] = useState<JumuahData>({
    times: [],
    last_updated: undefined,
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingTime, setEditingTime] = useState<JumuahTime | null>(null);
  const [formData, setFormData] = useState<Partial<JumuahTime>>({
    id: '',
    khutbah: '',
  });

  useEffect(() => {
    if (jumuahTimes && jumuahTimes.times) {
      setJumuahData(jumuahTimes as JumuahData);
    } else {
      setJumuahData({
        times: [{ id: '1', khutbah: '' }],
        last_updated: undefined,
      });
    }
  }, [jumuahTimes]);

  if (!canView) {
    return <></>;
  }

  const openModal = (time?: JumuahTime) => {
    if (time) {
      setEditingTime(time);
      setFormData(time);
    } else {
      setEditingTime(null);
      setFormData({
        id: `${jumuahData.times.length + 1}`,
        khutbah: '',
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTime(null);
  };

  const handleSaveTime = () => {
    if (!formData.khutbah) {
      alert('Please fill in the Khutbah time');
      return;
    }

    let updatedTimes;
    if (editingTime) {
      updatedTimes = jumuahData.times.map((time) =>
        time.id === editingTime.id ? (formData as JumuahTime) : time
      );
    } else {
      updatedTimes = [...jumuahData.times, formData as JumuahTime];
    }

    const updatedData = {
      ...jumuahData,
      times: updatedTimes,
    };

    setJumuahData(updatedData);
    onChange(updatedData);
    setHasChanges(true);
    closeModal();
  };

  const handleDeleteTime = (id: string) => {
    if (id === '1') {
      alert('The first Jumuah time cannot be deleted');
      return;
    }

    const updatedTimes = jumuahData.times.filter((time) => time.id !== id);
    const updatedData = {
      ...jumuahData,
      times: updatedTimes,
    };

    setJumuahData(updatedData);
    onChange(updatedData);
    setHasChanges(true);
  };

  const handleSave = async () => {
    await onSave();
    setHasChanges(false);
  };

  const getJumuahNumber = (id: string): number => {
    const index = jumuahData.times.findIndex((time) => time.id === id);
    return index + 1;
  };

  return (
    <Section>
      <BlockLabel>Friday</BlockLabel>
      <SectionHeader>
        <TitleRow>
          <SectionTitle>Jumuah</SectionTitle>
          {hasChanges && <UnsavedDot />}
        </TitleRow>
        {canEdit && (
          <AddButton type="button" onClick={() => openModal()}>
            <Plus size={18} />
            Add time
          </AddButton>
        )}
      </SectionHeader>

      <List>
        {jumuahData.times.map((time) => {
          const jumuahNumber = getJumuahNumber(time.id);
          const isFirst = jumuahNumber === 1;
          const label =
            jumuahData.times.length === 1 ? 'Jumuah' : `Jumuah ${jumuahNumber}`;

          return (
            <Row key={time.id} $compact>
              <RowMain>
                <RowTitle>
                  {label}
                  {isFirst && jumuahData.times.length > 1 ? (
                    <span style={{ color: Theme.colors.text.subtle, fontWeight: 400 }}>
                      {' '}
                      · Default
                    </span>
                  ) : null}
                </RowTitle>
                <RowMeta>Khutbah {time.khutbah || '—'}</RowMeta>
              </RowMain>
              {canEdit && (
                <RowActions>
                  <IconButton type="button" onClick={() => openModal(time)}>
                    <Pencil size={16} />
                    Edit
                  </IconButton>
                  <IconButton
                    type="button"
                    $danger
                    onClick={() => handleDeleteTime(time.id)}
                    disabled={isFirst}
                    title={
                      isFirst
                        ? 'The first Jumuah time cannot be deleted'
                        : 'Delete this Jumuah time'
                    }
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </RowActions>
              )}
            </Row>
          );
        })}
      </List>

      {canEdit && (
        <SaveWrap>
          <PrimaryButton
            type="button"
            onClick={handleSave}
            disabled={saving || !hasChanges}
            $dirty={hasChanges}
            $fullWidth
          >
            <Save size={18} />
            {saving ? 'Saving…' : hasChanges ? 'Save Jumuah' : 'Save Jumuah'}
          </PrimaryButton>
        </SaveWrap>
      )}

      <Modal $show={showModal} onClick={closeModal}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
            <ModalTitle>
              {editingTime
                ? `Edit Jumuah ${getJumuahNumber(editingTime.id)}`
                : 'Add Jumuah time'}
            </ModalTitle>
            <CloseButton type="button" onClick={closeModal} aria-label="Close">
              <X size={22} />
            </CloseButton>
          </ModalHeader>

          <FormGroup>
            <Label>Khutbah time</Label>
            <TimeInput
              value={formData.khutbah || ''}
              onChange={(value) => setFormData((prev) => ({ ...prev, khutbah: value }))}
              placeholder="Select time"
              required
            />
          </FormGroup>

          <ModalActions>
            <PrimaryButton type="button" onClick={handleSaveTime} $fullWidth>
              <Save size={18} />
              {editingTime ? 'Update' : 'Add'}
            </PrimaryButton>
            <SecondaryButton type="button" onClick={closeModal}>
              Cancel
            </SecondaryButton>
          </ModalActions>
        </ModalContent>
      </Modal>
    </Section>
  );
}
