// ============================================================================
// ADMIN COMPONENT: Donations Tab (Wrapper with Sub-tabs)
// Location: mosque-admin-dashboard/src/components/DonationsTab.tsx
// ============================================================================

import React, { useState } from 'react';
import styled from 'styled-components';
import { BarChart3, Settings, Target } from 'lucide-react';
import DonationAnalyticsTab from './DonationAnalyticsTab';
import DonationSettingsTab from './DonationSettingsTab';
import { DonationSettings } from '../types';
import CampaignsTab from './CampaignsTab';
// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const Container = styled.div`
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 0.5rem;
`;

const Tab = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  background: ${props => props.$active ? '#1e3a8a' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#6b7280'};
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$active ? '#1e40af' : '#f3f4f6'};
    color: ${props => props.$active ? 'white' : '#1e3a8a'};
  }
`;

// ============================================================================
// COMPONENT PROPS
// ============================================================================

interface DonationsTabProps {
  donationSettings: DonationSettings | null;
  onSettingsChange: (settings: DonationSettings) => void;
  onSaveSettings: () => void;
  saving: boolean;
  onSaveStatusChange: (success: boolean) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function DonationsTab({
  donationSettings,
  onSettingsChange,
  onSaveSettings,
  saving,
  onSaveStatusChange,
}: DonationsTabProps): React.JSX.Element {
  const [activeSubTab, setActiveSubTab] = useState<'analytics' | 'settings' | 'campaigns'>('settings');

  return (
    <Container>
      {/* Sub-tab Navigation */}
      <TabContainer>
        <Tab
          $active={activeSubTab === 'settings'}
          onClick={() => setActiveSubTab('settings')}
        >
          <Settings size={18} />
          Settings
        </Tab>
        <Tab
          $active={activeSubTab === 'analytics'}
          onClick={() => setActiveSubTab('analytics')}
        >
          <BarChart3 size={18} />
          Analytics
        </Tab>
        <Tab
          $active={activeSubTab === 'campaigns'}
          onClick={() => setActiveSubTab('campaigns')}
        >
          <Target size={18} />
          Campaigns
        </Tab>
      </TabContainer>

      {/* Sub-tab Content */}
      {activeSubTab === 'analytics' && (
        <DonationAnalyticsTab
          saving={saving}
          onSaveStatusChange={onSaveStatusChange}
        />
      )}

      {activeSubTab === 'settings' && (
        <DonationSettingsTab
          settings={donationSettings}
          onChange={onSettingsChange}
          onSave={onSaveSettings}
          saving={saving}
        />
      )}

      {activeSubTab === 'campaigns' && (
        <CampaignsTab
          saving={saving}
          onSaveStatusChange={onSaveStatusChange}
        />
      )}
    </Container>
  );
}
