// ============================================================================
// UI COMPONENT: Toast Container Manager
// Location: mosque-admin-dashboard/src/components/ui/ToastContainer.tsx
// ============================================================================

import React from 'react';
import styled from 'styled-components';
import Toast, { ToastProps } from './Toast';
import { Theme } from '../../constants/theme';

const Container = styled.div`
  position: fixed;
  top: ${Theme.spacing.xl};
  right: ${Theme.spacing.xl};
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: ${Theme.spacing.md};
  pointer-events: none;

  > * {
    pointer-events: all;
  }
`;

export interface ToastItem extends Omit<ToastProps, 'onClose'> {
  id: string;
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onRemoveToast: (id: string) => void;
}

export default function ToastContainer({ toasts, onRemoveToast }: ToastContainerProps): React.JSX.Element {
  return (
    <Container>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          variant={toast.variant}
          title={toast.title}
          message={toast.message}
          duration={toast.duration}
          onClose={() => onRemoveToast(toast.id)}
        />
      ))}
    </Container>
  );
}
