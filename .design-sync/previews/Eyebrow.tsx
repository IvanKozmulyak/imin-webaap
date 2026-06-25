import { Eyebrow } from '@imin/night-kit';

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div style={{ background: '#08070d', padding: 32, borderRadius: 18, display: 'inline-block' }}>
    {children}
  </div>
);

export const Plain = () => (
  <Frame>
    <Eyebrow>Two sides · same market</Eyebrow>
  </Frame>
);

export const Green = () => (
  <Frame>
    <Eyebrow tone="green">The room is full again</Eyebrow>
  </Frame>
);

export const Pill = () => (
  <Frame>
    <Eyebrow pill>The two-sided platform for nightlife</Eyebrow>
  </Frame>
);
