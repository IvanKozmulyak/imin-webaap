import { StatusPill } from '@imin/night-kit';

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div style={{ background: '#08070d', padding: 32, borderRadius: 18, display: 'inline-block' }}>
    {children}
  </div>
);

export const LiveToday = () => (
  <Frame>
    <StatusPill>Live today</StatusPill>
  </Frame>
);

export const Shipping = () => (
  <Frame>
    <StatusPill>Shipping now</StatusPill>
  </Frame>
);
