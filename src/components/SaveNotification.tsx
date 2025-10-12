import React from 'react';
import styled from 'styled-components';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { SaveNotificationProps } from '../types';

const Notification = styled.div<{ success: boolean }>`
  position: fixed;
  top: 5rem;
  right: 1.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${props => props.success ? '#10b981' : '#ef4444'};
  color: white;
  z-index: 50;
  animation: slideIn 0.3s ease-out;

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

export default function SaveNotification({ status, message }: SaveNotificationProps): React.JSX.Element | null {
  if (!status) return null;

  const isSuccess = status === 'success';

  return (
    <Notification success={isSuccess}>
      {isSuccess ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
      {message || (isSuccess ? 'Saved to Firebase successfully!' : 'Error saving to Firebase')}
    </Notification>
  );
}