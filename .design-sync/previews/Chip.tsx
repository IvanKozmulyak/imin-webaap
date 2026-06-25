import { Chip } from '@imin/night-kit';

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div style={{ background: '#08070d', padding: 32, borderRadius: 18, display: 'inline-block' }}>
    {children}
  </div>
);

export const WithDot = () => (
  <Frame>
    <Chip dot>Live product</Chip>
  </Frame>
);

export const Plain = () => (
  <Frame>
    <Chip>Web Summit ×2</Chip>
  </Frame>
);

export const Row = () => (
  <Frame>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      <Chip dot>Live product</Chip>
      <Chip dot>Paying client</Chip>
      <Chip>Web Summit ×2</Chip>
      <Chip>Metz winner</Chip>
    </div>
  </Frame>
);
