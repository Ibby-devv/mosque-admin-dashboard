// ============================================================================
// ADMIN COMPONENT: Campaigns Tab
// Location: mosque-admin-dashboard/src/components/CampaignsTab.tsx
// ============================================================================

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Save, Plus, Edit2, Trash2, X, Target, Calendar, DollarSign } from 'lucide-react';
import {
  collection,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';

// ============================================================================
// TYPES
// ============================================================================

interface Campaign {
  id: string;
  title: string;
  description: string;
  goal_amount: number; // in cents
  current_amount: number; // in cents
  currency: string;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  status: 'active' | 'completed' | 'paused';
  image_url?: string;
  is_visible_in_app: boolean;
  created_at: any;
  updated_at: any;
}

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const Container = styled.div`
  padding: 0;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  color: #1f2937;
  margin: 0;
`;

const Button = styled.button<{ $variant?: 'primary' | 'danger' | 'success' }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props =>
    props.$variant === 'danger' ? '#dc2626' :
      props.$variant === 'success' ? '#059669' :
        '#1e3a8a'
  };
  color: white;

  &:hover {
    background: ${props =>
    props.$variant === 'danger' ? '#b91c1c' :
      props.$variant === 'success' ? '#047857' :
        '#1e40af'
  };
  }

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
`;

const SmallButton = styled.button<{ $variant?: 'primary' | 'danger' }>`
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
  background: ${props => props.$variant === 'danger' ? '#dc2626' : '#1e3a8a'};
  color: white;

  &:hover {
    background: ${props => props.$variant === 'danger' ? '#b91c1c' : '#1e40af'};
  }

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
`;

const CampaignsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
`;

const CampaignCard = styled.div<{ $status: string }>`
  border: 1px solid ${props =>
    props.$status === 'active' ? '#10b981' :
      props.$status === 'paused' ? '#f59e0b' :
        '#9ca3af'
  };
  background: ${props =>
    props.$status === 'active' ? '#f0fdf4' :
      props.$status === 'paused' ? '#fffbeb' :
        '#f9fafb'
  };
  border-left: 4px solid ${props =>
    props.$status === 'active' ? '#10b981' :
      props.$status === 'paused' ? '#f59e0b' :
        '#9ca3af'
  };
  border-radius: 0.75rem;
  padding: 1.25rem;
  position: relative;
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
`;

const StatusBadge = styled.span<{ $status: string }>`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  background: ${props =>
    props.$status === 'active' ? '#d1fae5' :
      props.$status === 'paused' ? '#fef3c7' :
        '#f3f4f6'
  };
  color: ${props =>
    props.$status === 'active' ? '#065f46' :
      props.$status === 'paused' ? '#92400e' :
        '#6b7280'
  };
`;

const CampaignTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;

const CampaignDescription = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0.5rem 0 1rem 0;
  line-height: 1.5;
`;

const ProgressSection = styled.div`
  margin: 1rem 0;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 1rem;
  background: #e5e7eb;
  border-radius: 9999px;
  overflow: hidden;
  margin-bottom: 0.5rem;
`;

const ProgressFill = styled.div<{ $percentage: number }>`
  height: 100%;
  width: ${props => Math.min(props.$percentage, 100)}%;
  background: ${props => props.$percentage >= 100 ? '#10b981' : '#3b82f6'};
  transition: width 0.3s ease;
`;

const ProgressText = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 600;
`;

const CampaignDetail = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
`;

const CampaignActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const Modal = styled.div<{ $show: boolean }>`
  display: ${props => props.$show ? 'block' : 'none'};
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

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  outline: none;
  transition: all 0.2s;
  box-sizing: border-box;
  min-height: 100px;
  resize: vertical;
  font-family: inherit;

  &:focus {
    border-color: #1e3a8a;
    box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1);
  }
`;

const TwoColumnGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
`;

const Checkbox = styled.input`
  width: 1.25rem;
  height: 1.25rem;
  cursor: pointer;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
`;

const EmptyStateTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;

const EmptyStateText = styled.p`
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
`;

// ============================================================================
// COMPONENT
// ============================================================================

interface CampaignsTabProps {
  saving: boolean;
  onSaveStatusChange: (success: boolean) => void;
}

export default function CampaignsTab({ saving, onSaveStatusChange }: CampaignsTabProps): React.JSX.Element {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [formData, setFormData] = useState<Partial<Campaign>>({
    title: '',
    description: '',
    goal_amount: 0,
    current_amount: 0,
    currency: 'AUD',
    start_date: '',
    end_date: '',
    status: 'active',
    image_url: '',
    is_visible_in_app: true,
  });

  // Load campaigns on mount
  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const campaignsRef = collection(db, 'campaigns');
      const q = query(campaignsRef, orderBy('created_at', 'desc'));
      const querySnapshot = await getDocs(q);

      const loadedCampaigns: Campaign[] = [];
      querySnapshot.forEach((doc) => {
        loadedCampaigns.push({ id: doc.id, ...doc.data() } as Campaign);
      });

      setCampaigns(loadedCampaigns);
      console.log('Campaigns loaded:', loadedCampaigns.length);
    } catch (error) {
      console.error('Error loading campaigns:', error);
      onSaveStatusChange(false);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (campaign?: Campaign) => {
    if (campaign) {
      setEditingCampaign(campaign);
      setFormData({
        ...campaign,
        // Convert cents to dollars for display
        goal_amount: campaign.goal_amount / 100,
        current_amount: campaign.current_amount / 100,
      });
    } else {
      setEditingCampaign(null);
      setFormData({
        title: '',
        description: '',
        goal_amount: 0,
        current_amount: 0,
        currency: 'AUD',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        status: 'active',
        image_url: '',
        is_visible_in_app: true,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCampaign(null);
  };

  const handleInputChange = (field: keyof Campaign, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveCampaign = async () => {
    try {
      if (!formData.title || !formData.goal_amount || !formData.start_date) {
        alert('Please fill in required fields: Title, Goal Amount, and Start Date');
        return;
      }

      // Convert dollars to cents for storage
      const campaignData = {
        ...formData,
        goal_amount: Math.round((formData.goal_amount || 0) * 100),
        current_amount: Math.round((formData.current_amount || 0) * 100),
      };

      if (editingCampaign) {
        // Update existing campaign
        const campaignRef = doc(db, 'campaigns', editingCampaign.id);
        await updateDoc(campaignRef, {
          ...campaignData,
          updated_at: serverTimestamp(),
        });
        console.log('Campaign updated:', editingCampaign.id);
      } else {
        // Create new campaign
        const newCampaignRef = doc(collection(db, 'campaigns'));
        await setDoc(newCampaignRef, {
          id: newCampaignRef.id,
          ...campaignData,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        });
        console.log('New campaign created with ID:', newCampaignRef.id);
      }

      onSaveStatusChange(true);
      closeModal();
      loadCampaigns();
    } catch (error) {
      console.error('Error saving campaign:', error);
      onSaveStatusChange(false);
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!window.confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'campaigns', campaignId));
      console.log('Campaign deleted:', campaignId);
      onSaveStatusChange(true);
      loadCampaigns();
    } catch (error) {
      console.error('Error deleting campaign:', error);
      onSaveStatusChange(false);
    }
  };

  const formatCurrency = (cents: number): string => {
    return `$${(cents / 100).toLocaleString('en-AU', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-AU', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const calculateProgress = (current: number, goal: number): number => {
    return goal > 0 ? (current / goal) * 100 : 0;
  };

  return (
    <Container>
      <Header>
        <Title>Campaigns Management</Title>
        <Button onClick={() => openModal()}>
          <Plus size={20} />
          Add New Campaign
        </Button>
      </Header>

      {loading ? (
        <EmptyState>Loading campaigns...</EmptyState>
      ) : campaigns.length === 0 ? (
        <EmptyState>
          <EmptyStateTitle>No campaigns yet</EmptyStateTitle>
          <EmptyStateText>
            Create your first fundraising campaign to start engaging with your community
          </EmptyStateText>
          <Button onClick={() => openModal()}>
            <Plus size={20} />
            Add First Campaign
          </Button>
        </EmptyState>
      ) : (
        <CampaignsGrid>
          {campaigns.map(campaign => {
            const progress = calculateProgress(campaign.current_amount, campaign.goal_amount);

            return (
              <CampaignCard key={campaign.id} $status={campaign.status}>
                <StatusBadge $status={campaign.status}>
                  {campaign.status.toUpperCase()}
                </StatusBadge>

                <CampaignTitle>{campaign.title}</CampaignTitle>

                <CampaignDescription>{campaign.description}</CampaignDescription>

                <ProgressSection>
                  <ProgressBar>
                    <ProgressFill $percentage={progress} />
                  </ProgressBar>
                  <ProgressText>
                    <span>{formatCurrency(campaign.current_amount)} raised</span>
                    <span>{progress.toFixed(0)}%</span>
                  </ProgressText>
                  <ProgressText>
                    <span style={{ color: '#1f2937', fontWeight: 700 }}>
                      Goal: {formatCurrency(campaign.goal_amount)}
                    </span>
                    {progress >= 100 && (
                      <span style={{ color: '#10b981', fontWeight: 700 }}>✅ Goal Reached!</span>
                    )}
                  </ProgressText>
                </ProgressSection>

                <CampaignDetail>
                  <Calendar size={16} />
                  {formatDate(campaign.start_date)} - {formatDate(campaign.end_date)}
                </CampaignDetail>

                {campaign.image_url && (
                  <CampaignDetail>
                    🖼️ Image configured
                  </CampaignDetail>
                )}

                <CampaignDetail>
                  {campaign.is_visible_in_app ? '✅ Visible in app' : '❌ Hidden from app'}
                </CampaignDetail>

                <CampaignActions>
                  <SmallButton onClick={() => openModal(campaign)}>
                    <Edit2 size={16} />
                    Edit
                  </SmallButton>
                  <SmallButton
                    $variant="danger"
                    onClick={() => handleDeleteCampaign(campaign.id)}
                  >
                    <Trash2 size={16} />
                    Delete
                  </SmallButton>
                </CampaignActions>
              </CampaignCard>
            );
          })}
        </CampaignsGrid>
      )}

      {/* Campaign Modal */}
      <Modal $show={showModal} onClick={closeModal}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
            <ModalTitle>
              {editingCampaign ? 'Edit Campaign' : 'Add New Campaign'}
            </ModalTitle>
            <CloseButton onClick={closeModal}>
              <X size={24} />
            </CloseButton>
          </ModalHeader>

          <Form>
            <FormGroup>
              <Label>Title *</Label>
              <Input
                type="text"
                value={formData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Ramadan Fund 2025"
              />
            </FormGroup>

            <FormGroup>
              <Label>Description *</Label>
              <TextArea
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the campaign purpose..."
              />
            </FormGroup>

            <TwoColumnGrid>
              <FormGroup>
                <Label>Goal Amount ($) *</Label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.goal_amount || ''}
                  onChange={(e) => handleInputChange('goal_amount', parseFloat(e.target.value) || 0)}
                  placeholder="e.g., 25000"
                />
              </FormGroup>

              <FormGroup>
                <Label>Current Amount ($)</Label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.current_amount || 0}
                  onChange={(e) => handleInputChange('current_amount', parseFloat(e.target.value) || 0)}
                  placeholder="e.g., 5000"
                />
              </FormGroup>
            </TwoColumnGrid>

            <TwoColumnGrid>
              <FormGroup>
                <Label>Start Date *</Label>
                <Input
                  type="date"
                  value={formData.start_date || ''}
                  onChange={(e) => handleInputChange('start_date', e.target.value)}
                />
              </FormGroup>

              <FormGroup>
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={formData.end_date || ''}
                  onChange={(e) => handleInputChange('end_date', e.target.value)}
                />
              </FormGroup>
            </TwoColumnGrid>

            <FormGroup>
              <Label>Image URL (Optional)</Label>
              <Input
                type="text"
                value={formData.image_url || ''}
                onChange={(e) => handleInputChange('image_url', e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </FormGroup>

            <FormGroup>
              <Label>Status</Label>
              <select
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  outline: 'none',
                }}
                value={formData.status || 'active'}
                onChange={(e) => handleInputChange('status', e.target.value)}
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </select>
            </FormGroup>

            <FormGroup>
              <CheckboxLabel>
                <Checkbox
                  type="checkbox"
                  checked={formData.is_visible_in_app ?? true}
                  onChange={(e) => handleInputChange('is_visible_in_app', e.target.checked)}
                />
                Visible in mobile app
              </CheckboxLabel>
            </FormGroup>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <Button onClick={closeModal} style={{ background: '#6b7280' }}>
                Cancel
              </Button>
              <Button onClick={handleSaveCampaign} disabled={saving}>
                <Save size={20} />
                {saving ? 'Saving...' : (editingCampaign ? 'Update Campaign' : 'Create Campaign')}
              </Button>
            </div>
          </Form>
        </ModalContent>
      </Modal>
    </Container>
  );
}
