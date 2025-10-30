// ============================================================================
// UI COMPONENT: Toast Notification
// Location: mosque-admin-dashboard/src/components/ui/Toast.tsx
// ============================================================================

import React, { useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { Theme } from '../../constants/theme';

const slideIn = keyframes`
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(400px);
    opacity: 0;
  }
`;

const ToastContainer = styled.div<{ $variant: ToastVariant; $isExiting: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: ${Theme.spacing.md};
  background: ${Theme.colors.surface.card};
  border: 1px solid ${props => {
    switch (props.$variant) {
      case 'success': return Theme.colors.status.success;
      case 'error': return Theme.colors.status.error;
      case 'warning': return Theme.colors.status.warning;
      case 'info': return Theme.colors.brand.navy[700];
      default: return Theme.colors.border.base;
    }
  }};
  border-left: 4px solid ${props => {
    switch (props.$variant) {
      case 'success': return Theme.colors.status.success;
      case 'error': return Theme.colors.status.error;
      case 'warning': return Theme.colors.status.warning;
      case 'info': return Theme.colors.brand.navy[700];
      default: return Theme.colors.border.base;
    }
  }};
  border-radius: ${Theme.radius.md};
  padding: ${Theme.spacing.lg};
  box-shadow: ${Theme.shadow.card};
  min-width: 300px;
  max-width: 400px;
  animation: ${props => props.$isExiting ? slideOut : slideIn} 0.3s ease-out forwards;
`;

const IconWrapper = styled.div<{ $variant: ToastVariant }>`
  flex-shrink: 0;
  color: ${props => {
    switch (props.$variant) {
      case 'success': return Theme.colors.status.success;
      case 'error': return Theme.colors.status.error;
      case 'warning': return Theme.colors.status.warning;
      case 'info': return Theme.colors.brand.navy[700];
      default: return Theme.colors.text.muted;
    }
  }};
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${Theme.spacing.xs};
`;

const Title = styled.div`
  font-weight: 700;
  color: ${Theme.colors.text.strong};
  font-size: ${Theme.typography.body};
`;

const Message = styled.div`
  color: ${Theme.colors.text.muted};
  font-size: ${Theme.typography.small};
`;

const CloseButton = styled.button`
  flex-shrink: 0;
  background: transparent;
  border: none;
  cursor: pointer;
  color: ${Theme.colors.text.muted};
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;

  &:hover {
    color: ${Theme.colors.text.strong};
  }
`;

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  variant: ToastVariant;
  title?: string;
  message: string;
  duration?: number;
  onClose: () => void;
}

const getIcon = (variant: ToastVariant) => {
  switch (variant) {
    case 'success': return <CheckCircle size={20} />;
    case 'error': return <XCircle size={20} />;
    case 'warning': return <AlertCircle size={20} />;
    case 'info': return <Info size={20} />;
    default: return <Info size={20} />;
  }
};

const getDefaultTitle = (variant: ToastVariant) => {
  switch (variant) {
    case 'success': return 'Success';
    case 'error': return 'Error';
    case 'warning': return 'Warning';
    case 'info': return 'Info';
    default: return '';
  }
};

export default function Toast({ 
  variant, 
  title, 
  message, 
  duration = 4000, 
  onClose 
}: ToastProps): React.JSX.Element {
  const [isExiting, setIsExiting] = React.useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 300); // Wait for exit animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300);
  };

  return (
    <ToastContainer $variant={variant} $isExiting={isExiting}>
      <IconWrapper $variant={variant}>
        {getIcon(variant)}
      </IconWrapper>
      <Content>
        <Title>{title || getDefaultTitle(variant)}</Title>
        <Message>{message}</Message>
      </Content>
      <CloseButton onClick={handleClose}>
        <X size={18} />
      </CloseButton>
    </ToastContainer>
  );
}
