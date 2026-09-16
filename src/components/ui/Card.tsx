import styled from 'styled-components';
import { Theme, media } from '../../constants/theme';

/** Shared content surface — calm hairline panel (aliases Panel language). */
const Card = styled.div`
  background: ${Theme.colors.surface.base};
  border: 1px solid ${Theme.colors.border.soft};
  border-radius: ${Theme.radius.xl};
  padding: ${Theme.spacing.lg};

  ${media.sm} {
    padding: ${Theme.spacing.xl};
  }

  ${media.md} {
    padding: ${Theme.spacing.xxl};
  }
`;

export default Card;
