import styled from 'styled-components';
import { Theme } from '../../../constants/theme';

const BlockLabel = styled.div`
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: ${Theme.colors.text.muted};
  margin-bottom: ${Theme.spacing.md};
`;

export default BlockLabel;
