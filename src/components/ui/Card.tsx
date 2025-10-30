import styled from 'styled-components';
import { Theme, media } from '../../constants/theme';

// Reusable Card component based on the Jumuah Times card design
const Card = styled.div`
  background: ${Theme.colors.surface.card};
  border: 1px solid ${Theme.colors.border.soft};
  border-radius: ${Theme.radius.lg};
  box-shadow: ${Theme.shadow.card};
  padding: ${Theme.spacing.lg};

  ${media.sm} {
    padding: ${Theme.spacing.xl};
  }

  ${media.md} {
    padding: ${Theme.spacing.xxl};
  }
`;

export default Card;
