import React from 'react';
import styled from 'styled-components';
import { LogOut } from 'lucide-react';
import { HeaderProps } from '../types';
import { Theme, media } from '../constants/theme';

const HeaderContainer = styled.div`
  background: linear-gradient(135deg, ${Theme.colors.brand.navy[800]} 0%, ${Theme.colors.brand.navy[700]} 50%, ${Theme.colors.brand.navy[900]} 100%);
  color: white;
  padding: ${Theme.spacing.lg} ${Theme.spacing.xl};
  box-shadow: ${Theme.shadow.header};
  position: relative;
  overflow: hidden;

  ${media.md} {
    padding: ${Theme.spacing.xl} ${Theme.spacing.xxl};
  }

  /* Subtle pattern overlay */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.05) 1px, transparent 0);
    background-size: 28px 28px;
    pointer-events: none;
  }
`;

const HeaderContent = styled.div`
  max-width: 72rem;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 1;
  gap: ${Theme.spacing.md};

  ${media.sm} {
    gap: ${Theme.spacing.lg};
  }
`;

const HeaderLeft = styled.div`
  flex: 1;
  min-width: 0; /* Allow text truncation */
`;

const HeaderGrid = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto auto;
  column-gap: ${Theme.spacing.md};
  row-gap: ${Theme.spacing.xs};
  align-items: center;
`;

const LogoImg = styled.img`
  height: 40px;
  width: auto;
  display: block;
  filter: drop-shadow(0 1px 1px rgba(0,0,0,0.15));

  ${media.sm} {
    height: 48px;
  }

  ${media.md} {
    height: 56px;
  }
`;

const HeaderTitle = styled.h1`
  font-size: 20px;
  font-weight: bold;
  margin: 0;
  color: ${Theme.colors.text.inverse};

  ${media.sm} {
    font-size: 24px;
  }

  ${media.md} {
    font-size: 26px;
  }
`;

const HeaderSubtitle = styled.p`
  color: ${Theme.colors.text.subtle};
  font-size: 13px;
  margin: 0;

  ${media.sm} {
    font-size: 14px;
  }
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${Theme.spacing.sm};
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: ${Theme.spacing.sm} ${Theme.spacing.md};
  border-radius: ${Theme.radius.md};
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s;
  white-space: nowrap;
  min-height: 44px; /* Touch-friendly */

  ${media.sm} {
    padding: ${Theme.spacing.md} ${Theme.spacing.lg};
    font-size: 14px;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    flex-shrink: 0;
  }

  span {
    display: none;

    ${media.sm} {
      display: inline;
    }
  }
`;

export default function Header({ onLogout, onHome }: HeaderProps): React.JSX.Element {
  return (
    <HeaderContainer>
      <HeaderContent>
        <HeaderLeft>
          <HeaderGrid onClick={onHome} style={{ cursor: onHome ? 'pointer' : 'default' }}>
            <LogoImg src="/logo-white.svg" alt="Mosque Logo" style={{ gridRow: '1 / span 2' }} />
            <HeaderTitle style={{ gridRow: 1 }}>Admin Dashboard</HeaderTitle>
            <HeaderSubtitle style={{ gridRow: 2 }}>Al Ansar Masjid Yagoona</HeaderSubtitle>
          </HeaderGrid>
        </HeaderLeft>
        <LogoutButton onClick={onLogout}>
          <LogOut size={18} />
          <span>Logout</span>
        </LogoutButton>
      </HeaderContent>
    </HeaderContainer>
  );
}