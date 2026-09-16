import styled, { css } from 'styled-components';
import { Theme } from '../../../constants/theme';

const Panel = styled.div<{ $flush?: boolean; $compact?: boolean }>`
  background: ${Theme.colors.surface.base};
  border: 1px solid ${Theme.colors.border.soft};
  border-radius: ${Theme.radius.xl};
  padding: ${Theme.spacing.xl} ${Theme.spacing.lg} ${Theme.spacing.lg};

  ${(props) =>
    props.$compact &&
    css`
      padding: ${Theme.spacing.lg};
    `}

  ${(props) =>
    props.$flush &&
    css`
      padding: 0;
      overflow: hidden;
    `}
`;

export default Panel;
