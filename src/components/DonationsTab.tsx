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
import Card from './ui/Card';
import { Theme, media } from '../constants/theme';
// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const Container = Card;

const TabContainer = styled.div`
  display: flex;
  gap: ${Theme.spacing.sm};
  margin-bottom: ${Theme.spacing.xl};
  border-bottom: 2px solid ${Theme.colors.border.base};
  padding-bottom: ${Theme.spacing.sm};
`;

const Tab = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: ${Theme.spacing.sm};
  padding: ${Theme.spacing.md} ${Theme.spacing.xl};
  min-height: 44px;
  border: none;
  background: ${props => props.$active ? Theme.colors.brand.navy[700] : 'transparent'};
  color: ${props => props.$active ? 'white' : Theme.colors.text.muted};
  border-radius: ${Theme.radius.sm};
  cursor: pointer;
  font-weight: 600;
  font-size: ${Theme.typography.small};
  transition: all 0.2s;

  ${media.sm} {
    font-size: ${Theme.typography.body};
  }

  &:hover {
    background: ${props => props.$active ? Theme.colors.brand.navy[600] : Theme.colors.surface.muted};
    color: ${props => props.$active ? 'white' : Theme.colors.brand.navy[700]};
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
