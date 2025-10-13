import React from 'react';
import styled from 'styled-components';
import { TabsProps } from '../types';

const TabContainer = styled.div`
  background: white;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
`;

const TabsWrapper = styled.div`
  max-width: 72rem;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  gap: 1.5rem;
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: 1rem 1.5rem;
  font-weight: 600;
  border: none;
  border-bottom: 2px solid ${props => props.$active ? '#1e3a8a' : 'transparent'};
  color: ${props => props.$active ? '#1e3a8a' : '#6b7280'};
  background: none;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;

  &:hover {
    color: ${props => props.$active ? '#1e3a8a' : '#374151'};
  }
`;

interface TabItem {
  id: string;
  label: string;
}

export default function Tabs({ activeTab, onTabChange }: TabsProps): React.JSX.Element {
  const tabs: TabItem[] = [
    { id: 'prayer', label: 'Daily Prayer Times' },
    { id: 'jumuah', label: 'Jumuah Times' },
    { id: 'events', label: 'Events' },
    { id: 'settings', label: 'Mosque Settings' }
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
            {tab.label}
          </Tab>
        ))}
      </TabsWrapper>
    </TabContainer>
  );
}
