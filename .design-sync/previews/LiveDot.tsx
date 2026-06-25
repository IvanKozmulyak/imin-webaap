import { LiveDot } from '@imin/night-kit';

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div style={{ background: '#08070d', padding: 32, borderRadius: 18, display: 'inline-block' }}>
    {children}
  </div>
);

const Row = ({ children }: { children: React.ReactNode }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, color: '#9a96ad', fontFamily: 'monospace', fontSize: 13 }}>
    {children}
  </span>
);

export const Pulsing = () => (
  <Frame>
    <Row>
      <LiveDot /> Live today
    </Row>
  </Frame>
);

export const Small = () => (
  <Frame>
    <Row>
      <LiveDot small /> 1,240 past buyers
    </Row>
  </Frame>
);

export const Static = () => (
  <Frame>
    <Row>
      <LiveDot small paused /> Paying client
    </Row>
  </Frame>
);
