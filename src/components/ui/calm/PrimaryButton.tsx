import styled, { css, keyframes } from 'styled-components';
import { Theme } from '../../../constants/theme';

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(217, 119, 6, 0.45); }
  70% { box-shadow: 0 0 0 10px rgba(217, 119, 6, 0); }
  100% { box-shadow: 0 0 0 0 rgba(217, 119, 6, 0); }
`;

const PrimaryButton = styled.button<{ $dirty?: boolean; $fullWidth?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${Theme.spacing.sm};
  min-height: 48px;
  padding: ${Theme.spacing.md} ${Theme.spacing.xl};
  border: none;
  border-radius: ${Theme.radius.lg};
  background: ${(props) =>
    props.$dirty ? Theme.colors.brand.gold[600] : Theme.colors.brand.navy[800]};
  color: ${Theme.colors.text.inverse};
  font-family: inherit;
  font-size: ${Theme.typography.body};
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease, opacity 0.15s ease;
  box-shadow: ${Theme.shadow.header};
  width: ${(props) => (props.$fullWidth ? '100%' : 'auto')};

  &:hover:not(:disabled) {
    background: ${(props) =>
      props.$dirty ? Theme.colors.brand.gold[600] : Theme.colors.brand.navy[700]};
  }

  &:active:not(:disabled) {
    opacity: 0.92;
  }

  &:disabled {
    background: ${Theme.colors.border.medium};
    box-shadow: none;
    cursor: not-allowed;
  }

  ${(props) =>
    props.$dirty &&
    css`
      animation: ${pulse} 2s infinite;
    `}
`;

export default PrimaryButton;
