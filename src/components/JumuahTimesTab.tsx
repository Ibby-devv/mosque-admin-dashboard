import React, { useState, useEffect } from "react";
import styled, { keyframes, css } from "styled-components";
import { Save, Plus, Trash2, X } from "lucide-react";
import { JumuahTimesTabProps } from "../types";
import TimeInput from './TimeInput';
import { Theme, media } from '../constants/theme';
import Card from './ui/Card';
import { usePermissions } from '../hooks/usePermissions';
import { Permission } from '../constants/roles';

// Define the new data structure for Jumuah times
interface JumuahTime {
  id: string;
  khutbah: string;
}

interface JumuahData {
  times: JumuahTime[];
  last_updated: string;
}

// Styled Components (Card imported from shared ui/Card)

const CardTitle = styled.h2`
  font-size: ${Theme.typography.h2};
  font-weight: bold;
  color: ${Theme.colors.text.strong};
  margin-bottom: 0;

  ${media.sm} {
    font-size: ${Theme.typography.h1};
  }
`;

const HeaderRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${Theme.spacing.md};
  margin-bottom: ${Theme.spacing.xl};

  ${media.sm} {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

const TitleSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${Theme.spacing.md};
`;

// Pulse animation
const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.6); }
  70% { box-shadow: 0 0 0 10px rgba(245, 158, 11, 0); }
  100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
`;

const UnsavedIndicator = styled.div`
  width: 8px;
  height: 8px;
  background: ${Theme.colors.status.warning};
  border-radius: 50%;
  box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.6);
  animation: ${pulse} 2s infinite;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${Theme.spacing.md};
`;

const Button = styled.button<{ variant?: "primary" | "danger" }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${Theme.spacing.sm};
  padding: ${Theme.spacing.md} ${Theme.spacing.xl};
  min-height: 48px;
  border-radius: ${Theme.radius.md};
  font-weight: 600;
  font-size: ${Theme.typography.body};
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  background: ${(props) =>
    props.variant === "danger" ? Theme.colors.status.error : Theme.colors.brand.navy[700]};
  color: white;

  &:hover {
    background: ${(props) =>
      props.variant === "danger" ? Theme.colors.status.errorDark : Theme.colors.brand.navy[600]};
    transform: translateY(-1px);
    box-shadow: ${Theme.shadow.soft};
  }

  &:disabled {
    background: ${Theme.colors.border.medium};
    cursor: not-allowed;
    transform: none;
  }
`;

const SmallButton = styled.button<{ variant?: "primary" | "danger" }>`
  display: flex;
  align-items: center;
  gap: ${Theme.spacing.xs};
  padding: ${Theme.spacing.sm} ${Theme.spacing.md};
  min-height: 36px;
  border-radius: ${Theme.radius.sm};
  font-weight: 500;
  font-size: ${Theme.typography.small};
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  background: ${(props) =>
    props.variant === "danger" ? Theme.colors.status.error : Theme.colors.brand.navy[700]};
  color: white;

  &:hover {
    background: ${(props) =>
      props.variant === "danger" ? Theme.colors.status.errorDark : Theme.colors.brand.navy[600]};
    transform: translateY(-1px);
  }

  &:disabled {
    background: ${Theme.colors.border.medium};
    cursor: not-allowed;
    transform: none;
  }
`;

const JumuahGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${Theme.spacing.lg};
  margin-bottom: ${Theme.spacing.xl};

  ${media.sm} {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  }
`;

const JumuahCard = styled.div`
  border: 1px solid ${Theme.colors.border.base};
  background: ${Theme.colors.surface.card};
  border-radius: ${Theme.radius.md};
  border-left: 4px solid ${Theme.colors.brand.navy[700]};
  padding: ${Theme.spacing.lg};
  position: relative;
  box-shadow: ${Theme.shadow.soft};
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${Theme.shadow.card};
    border-color: ${Theme.colors.brand.navy[700]};
  }
`;

const JumuahTitle = styled.h3`
  font-size: ${Theme.typography.h3};
  font-weight: bold;
  color: ${Theme.colors.text.strong};
  margin-bottom: ${Theme.spacing.lg};
`;

const TimeInputGroup = styled.div`
  margin-bottom: ${Theme.spacing.md};
`;

const TimeLabel = styled.label`
  display: block;
  font-size: ${Theme.typography.body};
  font-weight: 500;
  color: ${Theme.colors.text.muted};
  margin-bottom: ${Theme.spacing.xs};
`;

const ReadOnlyTimeDisplay = styled.input`
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
`;

const CardActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${Theme.spacing.sm};
  margin-top: ${Theme.spacing.lg};
`;

const Modal = styled.div<{ $show: boolean }>`
  display: ${(props) => (props.$show ? "block" : "none")};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  overflow-y: auto;
  padding: ${Theme.spacing.lg};
`;

const ModalContent = styled.div`
  background: ${Theme.colors.surface.card};
  max-width: 42rem;
  margin: 2rem auto;
  border-radius: ${Theme.radius.lg};
  padding: ${Theme.spacing.xl};
  position: relative;
  box-shadow: ${Theme.shadow.card};

  ${media.sm} {
    padding: ${Theme.spacing.xxl};
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${Theme.spacing.xl};
`;

const ModalTitle = styled.h3`
  font-size: ${Theme.typography.h2};
  font-weight: bold;
  color: ${Theme.colors.text.strong};

  ${media.sm} {
    font-size: ${Theme.typography.h1};
  }
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
  transition: all 0.2s;

  &:hover {
    color: ${Theme.colors.text.strong};
    background: ${Theme.colors.surface.muted};
  }
`;

const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${Theme.spacing.lg};
`;

const FormGroup = styled.div``;

const Label = styled.label`
  display: block;
  font-size: ${Theme.typography.body};
  font-weight: 600;
  color: ${Theme.colors.text.strong};
  margin-bottom: ${Theme.spacing.sm};
`;

// Removed unused Input styled component - now using TimeInput component

const SaveButton = styled.button<{ $hasChanges?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${Theme.spacing.sm};
  background: ${(props) => (props.$hasChanges ? Theme.colors.status.warning : Theme.colors.brand.navy[700])};
  color: white;
  padding: ${Theme.spacing.md} ${Theme.spacing.xl};
  min-height: 48px;
  border-radius: ${Theme.radius.md};
  font-weight: 600;
  font-size: ${Theme.typography.body};
  border: none;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${(props) => (props.$hasChanges ? Theme.colors.brand.gold[600] : Theme.colors.brand.navy[600])};
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

  ${props => props.$hasChanges && css`animation: ${pulse} 2s infinite;`}
`;

export default function JumuahTimesTab({
  jumuahTimes,
  onChange,
  onSave,
  saving,
}: JumuahTimesTabProps): React.JSX.Element {
  const { hasPermission } = usePermissions();
  const canEdit = hasPermission(Permission.EDIT_PRAYER_TIMES);
  
  const [jumuahData, setJumuahData] = useState<JumuahData>({
    times: [],
    last_updated: new Date().toISOString().split("T")[0],
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingTime, setEditingTime] = useState<JumuahTime | null>(null);
  const [formData, setFormData] = useState<Partial<JumuahTime>>({
    id: "",
    khutbah: "",
  });

  // Initialize data from props
  useEffect(() => {
    if (jumuahTimes && jumuahTimes.times) {
      setJumuahData(jumuahTimes as JumuahData);
    } else {
      // Create default structure with one empty time
      setJumuahData({
        times: [{ id: "1", khutbah: "" }],
        last_updated: new Date().toISOString().split("T")[0],
      });
    }
  }, [jumuahTimes]);

  const markAsChanged = () => {
    setHasChanges(true);
  };

  const openModal = (time?: JumuahTime) => {
    if (time) {
      setEditingTime(time);
      setFormData(time);
    } else {
      setEditingTime(null);
      setFormData({
        id: `${jumuahData.times.length + 1}`,
        khutbah: "",
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTime(null);
  };

  const handleInputChange = (field: keyof JumuahTime, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveTime = () => {
    if (!formData.khutbah) {
      alert("Please fill in the Khutbah time");
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
      last_updated: new Date().toISOString().split("T")[0],
    };

    setJumuahData(updatedData);
    onChange(updatedData);
    markAsChanged();
    closeModal();
  };

  const handleDeleteTime = (id: string) => {
    if (id === "1") {
      alert("The first Jumuah time cannot be deleted");
      return;
    }

    const updatedTimes = jumuahData.times.filter((time) => time.id !== id);
    const updatedData = {
      ...jumuahData,
      times: updatedTimes,
      last_updated: new Date().toISOString().split("T")[0],
    };

    setJumuahData(updatedData);
    onChange(updatedData);
    markAsChanged();
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
    <Card>
      <HeaderRow>
        <TitleSection>
          <CardTitle>Friday (Jumuah) Prayer Times</CardTitle>
          {hasChanges && <UnsavedIndicator />}
        </TitleSection>
        <ButtonGroup>
          <Button onClick={() => openModal()} disabled={!canEdit}>
            <Plus size={20} />
            Add Jumuah Time
          </Button>
        </ButtonGroup>
      </HeaderRow>

      <JumuahGrid>
        {jumuahData.times.map((time) => {
          const jumuahNumber = getJumuahNumber(time.id);
          const isFirst = jumuahNumber === 1;

          return (
            <JumuahCard key={time.id}>
              <JumuahTitle>
                {jumuahData.times.length === 1
                  ? "Jumuah"
                  : `Jumuah ${jumuahNumber}`}
                {isFirst && jumuahData.times.length > 1 && (
                  <span
                    style={{
                      fontSize: "0.875rem",
                      color: "#6b7280",
                      marginLeft: "0.5rem",
                    }}
                  >
                    (Default)
                  </span>
                )}
              </JumuahTitle>
              <TimeInputGroup>
                <TimeLabel>Khutbah Time</TimeLabel>
                <ReadOnlyTimeDisplay
                  type="text"
                  value={time.khutbah}
                  readOnly
                  placeholder="e.g., 12:30 PM"
                />
              </TimeInputGroup>
              <CardActions>
                <SmallButton onClick={() => openModal(time)}>Edit</SmallButton>
                <SmallButton
                  variant="danger"
                  onClick={() => handleDeleteTime(time.id)}
                  disabled={isFirst}
                  title={
                    isFirst
                      ? "The first Jumuah time cannot be deleted"
                      : "Delete this Jumuah time"
                  }
                >
                  <Trash2 size={16} />
                </SmallButton>
              </CardActions>
            </JumuahCard>
          );
        })}
      </JumuahGrid>

      <SaveButton
        onClick={handleSave}
        disabled={saving || !canEdit}
        $hasChanges={hasChanges}
      >
        <Save size={20} />
        {saving
          ? "Saving..."
          : hasChanges
          ? "Save Changes"
          : "Save Jumuah Times"}
      </SaveButton>

      {/* Modal for adding/editing Jumuah times */}
      <Modal $show={showModal} onClick={closeModal}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
            <ModalTitle>
              {editingTime
                ? `Edit Jumuah ${getJumuahNumber(editingTime.id)}`
                : "Add New Jumuah Time"}
            </ModalTitle>
            <CloseButton onClick={closeModal}>
              <X size={24} />
            </CloseButton>
          </ModalHeader>

          <Form>
            <FormGroup>
              <Label>Khutbah Time *</Label>
              <TimeInput
                value={formData.khutbah || ""}
                onChange={(value) => handleInputChange("khutbah", value)}
                placeholder="Select time"
                required
              />
            </FormGroup>

            <ButtonGroup>
              <Button onClick={handleSaveTime}>
                <Save size={20} />
                {editingTime ? "Update Time" : "Add Time"}
              </Button>
              <Button onClick={closeModal} style={{ background: "#6b7280" }}>
                Cancel
              </Button>
            </ButtonGroup>
          </Form>
        </ModalContent>
      </Modal>
    </Card>
  );
}
