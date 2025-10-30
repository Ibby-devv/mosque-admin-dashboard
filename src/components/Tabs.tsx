import React from 'react';
import styled from 'styled-components';
import { Clock, Calendar, DollarSign, Bell, Settings, CalendarDays } from 'lucide-react';
import { TabsProps } from '../types';
import { Theme, media } from '../constants/theme';

const TabContainer = styled.div`
  background: ${Theme.colors.surface.base};
  box-shadow: ${Theme.shadow.soft};
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1px solid ${Theme.colors.border.base};
`;

const TabsWrapper = styled.div`
  max-width: 72rem;
  margin: 0 auto;
  padding: ${Theme.spacing.md} ${Theme.spacing.md} ${Theme.spacing.sm};
  display: flex;
  gap: ${Theme.spacing.xs};
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  ${media.sm} {
    padding: ${Theme.spacing.lg} ${Theme.spacing.xl} ${Theme.spacing.md};
    gap: ${Theme.spacing.sm};
  }
`;

const Tab = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: ${Theme.spacing.sm};
  padding: ${Theme.spacing.sm} ${Theme.spacing.md};
  font-weight: 600;
  border: none;
  border-radius: ${Theme.radius.md};
  color: ${props => props.$active ? 'white' : Theme.colors.text.muted};
  background: ${props => props.$active ? Theme.colors.brand.navy[700] : 'transparent'};
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
  white-space: nowrap;
  min-height: 44px;

  ${media.sm} {
    padding: ${Theme.spacing.md} ${Theme.spacing.lg};
    font-size: 14px;
  }

  svg {
    flex-shrink: 0;
    opacity: ${props => props.$active ? 1 : 0.7};
  }

  &:hover {
    color: ${props => props.$active ? 'white' : Theme.colors.text.base};
    background: ${props => props.$active ? Theme.colors.brand.navy[600] : Theme.colors.surface.soft};
    transform: translateY(-1px);
    box-shadow: ${props => props.$active ? Theme.shadow.soft : 'none'};
    
    svg {
      opacity: 1;
    }
  }

  &:active {
    transform: translateY(0);
  }
`;

const TabLabel = styled.span`
  display: none;

  ${media.sm} {
    display: inline;
  }
`;

interface TabItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export default function Tabs({ activeTab, onTabChange }: TabsProps): React.JSX.Element {
  const tabs: TabItem[] = [
    { id: 'prayer', label: 'Prayer Times', icon: <Clock size={18} /> },
    { id: 'jumuah', label: 'Jumuah', icon: <CalendarDays size={18} /> },
    { id: 'events', label: 'Events', icon: <Calendar size={18} /> },
    { id: 'donations', label: 'Donations', icon: <DollarSign size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={18} /> }
  ];

  return (
    <TabContainer>
      <TabsWrapper>
        {tabs.map(tab => (
          <Tab
            key={tab.id}
            $active={activeTab === tab.id}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.icon}
            <TabLabel>{tab.label}</TabLabel>
          </Tab>
        ))}
      </TabsWrapper>
    </TabContainer>
  );
}
