import React from 'react';
import styled from 'styled-components';
import { Clock, Calendar, DollarSign, Bell, Settings, Shield, Activity } from 'lucide-react';
import { TabsProps } from '../types';
import { Theme, media } from '../constants/theme';
import { usePermissions } from '../hooks/usePermissions';
import { Permission } from '../constants/roles';

const TabContainer = styled.div`
  background: ${Theme.colors.surface.base};
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1px solid ${Theme.colors.border.base};
`;

const TabsWrapper = styled.div`
  max-width: 72rem;
  margin: 0 auto;
  padding: ${Theme.spacing.sm} ${Theme.spacing.md};
  display: flex;
  gap: ${Theme.spacing.xs};
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  ${media.sm} {
    padding: ${Theme.spacing.md} ${Theme.spacing.xl};
    gap: ${Theme.spacing.sm};
  }
`;

const Tab = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: ${Theme.spacing.sm};
  padding: ${Theme.spacing.sm} ${Theme.spacing.md};
  font-family: inherit;
  font-weight: 600;
  border: none;
  border-radius: ${Theme.radius.md};
  color: ${(props) => (props.$active ? Theme.colors.text.inverse : Theme.colors.text.muted)};
  background: ${(props) => (props.$active ? Theme.colors.brand.navy[800] : 'transparent')};
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
  font-size: 13px;
  white-space: nowrap;
  min-height: 44px;

  ${media.sm} {
    padding: ${Theme.spacing.md} ${Theme.spacing.lg};
    font-size: 14px;
  }

  svg {
    flex-shrink: 0;
    opacity: ${(props) => (props.$active ? 1 : 0.7)};
  }

  &:hover {
    color: ${(props) => (props.$active ? Theme.colors.text.inverse : Theme.colors.text.base)};
    background: ${(props) =>
      props.$active ? Theme.colors.brand.navy[800] : Theme.colors.surface.soft};

    svg {
      opacity: 1;
    }
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
  isVisible: (has: (p: Permission) => boolean) => boolean;
}

export default function Tabs({ activeTab, onTabChange }: TabsProps): React.JSX.Element {
  const permissions = usePermissions();

  const allTabs: TabItem[] = [
    {
      id: 'prayer',
      label: 'Prayer Times',
      icon: <Clock size={18} />,
      isVisible: (has) =>
        has(Permission.VIEW_PRAYER_TIMES) || has(Permission.VIEW_JUMUAH_TIMES),
    },
    {
      id: 'events',
      label: 'Events',
      icon: <Calendar size={18} />,
      isVisible: (has) => has(Permission.VIEW_EVENTS),
    },
    {
      id: 'donations',
      label: 'Donations',
      icon: <DollarSign size={18} />,
      isVisible: (has) => has(Permission.VIEW_DONATIONS),
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell size={18} />,
      isVisible: (has) => has(Permission.SEND_NOTIFICATIONS),
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings size={18} />,
      isVisible: (has) => has(Permission.VIEW_MOSQUE_SETTINGS),
    },
    {
      id: 'admin',
      label: 'Admin',
      icon: <Shield size={18} />,
      isVisible: (has) => has(Permission.VIEW_USERS),
    },
    {
      id: 'activity',
      label: 'Activity',
      icon: <Activity size={18} />,
      isVisible: (has) => has(Permission.VIEW_USERS),
    },
  ];

  const visibleTabs = allTabs.filter((tab) => tab.isVisible(permissions.hasPermission));

  return (
    <TabContainer>
      <TabsWrapper>
        {visibleTabs.map((tab) => (
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
