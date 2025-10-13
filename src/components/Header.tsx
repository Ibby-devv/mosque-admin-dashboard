import React from 'react';
import styled from 'styled-components';
import { LogOut } from 'lucide-react';
import { HeaderProps } from '../types';

const HeaderContainer = styled.div`
  background: #1e3a8a;
  color: white;
  padding: 1rem 1.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
`;

const HeaderContent = styled.div`
  max-width: 72rem;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const HeaderTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
`;

const HeaderSubtitle = styled.p`
  color: #93c5fd;
  font-size: 0.875rem;
  margin: 0.25rem 0 0 0;
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #1e40af;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background 0.2s;

  &:hover {
    background: #1d4ed8;
  }
`;

export default function Header({ onLogout }: HeaderProps): React.JSX.Element {
  return (
    <HeaderContainer>
      <HeaderContent>
        <div>
          <HeaderTitle>Admin Dashboard</HeaderTitle>
          <HeaderSubtitle>Al Ansar Masjid Yagoona</HeaderSubtitle>
        </div>
        <LogoutButton onClick={onLogout}>
          <LogOut size={18} />
          Logout
        </LogoutButton>
      </HeaderContent>
    </HeaderContainer>
  );
}