import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Save, Plus, Trash2, X } from "lucide-react";
import { JumuahTimesTabProps } from "../types";

// Define the new data structure for Jumuah times
interface JumuahTime {
  id: string;
  khutbah: string;
}

interface JumuahData {
  times: JumuahTime[];
  last_updated: string;
}

// Styled Components
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

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const TitleSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const UnsavedIndicator = styled.div`
  width: 8px;
  height: 8px;
  background: #f59e0b;
  border-radius: 50%;
  animation: pulse 2s infinite;

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const Button = styled.button<{ variant?: "primary" | "danger" }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  background: ${(props) =>
    props.variant === "danger" ? "#dc2626" : "#1e3a8a"};
  color: white;

  &:hover {
    background: ${(props) =>
      props.variant === "danger" ? "#b91c1c" : "#1e40af"};
  }

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
`;

const SmallButton = styled.button<{ variant?: "primary" | "danger" }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  font-weight: 500;
  font-size: 0.875rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  background: ${(props) =>
    props.variant === "danger" ? "#dc2626" : "#1e3a8a"};
  color: white;

  &:hover {
    background: ${(props) =>
      props.variant === "danger" ? "#b91c1c" : "#1e40af"};
  }

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
`;

const JumuahGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
`;

const JumuahCard = styled.div`
  border: 1px solid #10b981;
  background: #f0fbfd;
  border-radius: 0.75rem;
  border-left: 4px solid #10b981;
  padding: 1.25rem;
  position: relative;
`;

const JumuahTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 1rem;
`;

const TimeInputGroup = styled.div`
  margin-bottom: 0.75rem;
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

const CardActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
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
`;

const ModalContent = styled.div`
  background: white;
  max-width: 42rem;
  margin: 2rem auto;
  border-radius: 1rem;
  padding: 2rem;
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: bold;
  color: #1f2937;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  color: #6b7280;

  &:hover {
    color: #1f2937;
  }
`;

const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div``;

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

const SaveButton = styled.button<{ $hasChanges?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${(props) => (props.$hasChanges ? "#f59e0b" : "#1e3a8a")};
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${(props) => (props.$hasChanges ? "#d97706" : "#1e40af")};
  }

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
`;

export default function JumuahTimesTab({
  jumuahTimes,
  onChange,
  onSave,
  saving,
}: JumuahTimesTabProps): React.JSX.Element {
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

  const handleChange = (
    id: string,
    field: keyof JumuahTime,
    value: string
  ): void => {
    const updatedTimes = jumuahData.times.map((time) =>
      time.id === id ? { ...time, [field]: value } : time
    );

    const updatedData = {
      ...jumuahData,
      times: updatedTimes,
      last_updated: new Date().toISOString().split("T")[0],
    };

    setJumuahData(updatedData);
    onChange(updatedData);
    markAsChanged();
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
          <Button onClick={() => openModal()}>
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
                <TimeInput
                  type="text"
                  value={time.khutbah}
                  onChange={(e) =>
                    handleChange(time.id, "khutbah", e.target.value)
                  }
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
        disabled={saving}
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
              <Input
                type="text"
                value={formData.khutbah || ""}
                onChange={(e) => handleInputChange("khutbah", e.target.value)}
                placeholder="e.g., 12:30 PM"
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
