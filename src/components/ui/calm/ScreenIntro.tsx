import React from 'react';
import styled from 'styled-components';
import { Theme } from '../../../constants/theme';

const Wrap = styled.div`
  margin-bottom: ${Theme.spacing.lg};
`;

const Title = styled.h2`
  margin: 0;
  font-size: ${Theme.typography.h3};
  font-weight: 600;
  letter-spacing: -0.2px;
  color: ${Theme.colors.text.strong};
`;

const Subtitle = styled.p`
  margin: ${Theme.spacing.xs} 0 0;
  font-size: 13px;
  color: ${Theme.colors.text.muted};
  line-height: 1.45;
`;

interface ScreenIntroProps {
  title: string;
  subtitle?: string;
}

export default function ScreenIntro({ title, subtitle }: ScreenIntroProps): React.JSX.Element {
  return (
    <Wrap>
      <Title>{title}</Title>
      {subtitle ? <Subtitle>{subtitle}</Subtitle> : null}
    </Wrap>
  );
}
