// ============================================================================
// UI COMPONENT: Loading Spinner
// Location: mosque-admin-dashboard/src/components/ui/Loading.tsx
// ============================================================================

import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Loader2 } from 'lucide-react';
import { Theme } from '../../constants/theme';

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(0.95);
  }
`;

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const Container = styled.div<{ $fullPage?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${Theme.spacing.lg};
  padding: ${Theme.spacing.xl};
  
  ${props => props.$fullPage && `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${Theme.colors.surface.base};
    z-index: 9999;
  `}
`;

const LogoWrapper = styled.div`
  width: 80px;
  height: 80px;
  border-radius: ${Theme.radius.lg};
  overflow: hidden;
  animation: ${pulse} 2s ease-in-out infinite;
  box-shadow: ${Theme.shadow.card};
`;

const Logo = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

const SpinnerWrapper = styled.div`
  color: ${Theme.colors.brand.navy[700]};
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.p`
  color: ${Theme.colors.text.muted};
  font-size: ${Theme.typography.body};
  font-weight: 500;
  margin: 0;
`;

interface LoadingProps {
  fullPage?: boolean;
  text?: string;
  useLogo?: boolean;
}

export default function Loading({ 
  fullPage = false, 
  text = 'Loading...',
  useLogo = false 
}: LoadingProps): React.JSX.Element {
  return (
    <Container $fullPage={fullPage}>
      {useLogo ? (
        <LogoWrapper>
         <Logo src="/logo-navy.svg" alt="Loading" />
        </LogoWrapper>
      ) : (
        <SpinnerWrapper>
          <Loader2 size={48} />
        </SpinnerWrapper>
      )}
      {text && <LoadingText>{text}</LoadingText>}
    </Container>
  );
}
