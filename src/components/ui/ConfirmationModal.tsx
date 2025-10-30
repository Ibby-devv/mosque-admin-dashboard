// ============================================================================
// UI COMPONENT: Confirmation Modal
// Location: mosque-admin-dashboard/src/components/ui/ConfirmationModal.tsx
// ============================================================================

import React from 'react';
import styled from 'styled-components';
import { AlertTriangle } from 'lucide-react';
import { Theme, media } from '../../constants/theme';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: ${Theme.spacing.lg};
`;

const Modal = styled.div`
  background: ${Theme.colors.surface.card};
  border-radius: ${Theme.radius.lg};
  padding: ${Theme.spacing.xl};
  width: 100%;
  max-width: 450px;
  box-shadow: ${Theme.shadow.card};

  ${media.sm} {
    padding: ${Theme.spacing.xxl};
  }
`;

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${Theme.spacing.md};
  margin-bottom: ${Theme.spacing.lg};
`;

const IconWrapper = styled.div<{ $variant: 'danger' | 'warning' | 'info' }>`
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: ${Theme.radius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => {
    switch (props.$variant) {
      case 'danger': return Theme.colors.status.errorLight;
      case 'warning': return Theme.colors.accent.amberSoft;
      case 'info': return Theme.colors.accent.blueSoft;
      default: return Theme.colors.surface.muted;
    }
  }};
  color: ${props => {
    switch (props.$variant) {
      case 'danger': return Theme.colors.status.error;
      case 'warning': return Theme.colors.accent.amber;
      case 'info': return Theme.colors.brand.navy[700];
      default: return Theme.colors.text.muted;
    }
  }};
`;

const Content = styled.div`
  flex: 1;
`;

const Title = styled.h3`
  font-size: ${Theme.typography.h3};
  font-weight: 700;
  color: ${Theme.colors.text.strong};
  margin: 0 0 ${Theme.spacing.sm} 0;
`;

const Message = styled.p`
  color: ${Theme.colors.text.muted};
  font-size: ${Theme.typography.body};
  margin: 0;
  line-height: 1.5;
`;

const Actions = styled.div`
  display: flex;
  gap: ${Theme.spacing.sm};
  justify-content: flex-end;
  margin-top: ${Theme.spacing.xl};

  ${media.sm} {
    gap: ${Theme.spacing.md};
  }
`;

const Button = styled.button<{ $variant: 'primary' | 'secondary' | 'danger' }>`
  padding: ${Theme.spacing.md} ${Theme.spacing.xl};
  min-height: 44px;
  border-radius: ${Theme.radius.md};
  font-weight: 600;
  font-size: ${Theme.typography.body};
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  ${props => {
    switch (props.$variant) {
      case 'danger':
        return `
          background: ${Theme.colors.status.error};
          color: white;
          &:hover {
            background: ${Theme.colors.status.errorDark};
            box-shadow: ${Theme.shadow.soft};
            transform: translateY(-1px);
          }
        `;
      case 'primary':
        return `
          background: ${Theme.colors.brand.navy[700]};
          color: white;
          &:hover {
            background: ${Theme.colors.brand.navy[600]};
            box-shadow: ${Theme.shadow.soft};
            transform: translateY(-1px);
          }
        `;
      case 'secondary':
        return `
          background: ${Theme.colors.surface.muted};
          color: ${Theme.colors.text.strong};
          &:hover {
            background: ${Theme.colors.surface.base};
            box-shadow: ${Theme.shadow.soft};
          }
        `;
    }
  }}

  &:active {
    transform: translateY(0);
  }
`;

export interface ConfirmationModalProps {
  title: string;
  message: string;
  variant?: 'danger' | 'warning' | 'info';
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationModal({
  title,
  message,
  variant = 'warning',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmationModalProps): React.JSX.Element {
  return (
    <Overlay onClick={onCancel}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <IconWrapper $variant={variant}>
            <AlertTriangle size={24} />
          </IconWrapper>
          <Content>
            <Title>{title}</Title>
            <Message>{message}</Message>
          </Content>
        </Header>
        <Actions>
          <Button $variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button 
            $variant={variant === 'danger' ? 'danger' : 'primary'} 
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </Actions>
      </Modal>
    </Overlay>
  );
}
