import { Pillar } from '@imin/night-kit';

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div style={{ background: '#08070d', padding: 32, borderRadius: 18, display: 'inline-block' }}>
    {children}
  </div>
);

export const Join = () => (
  <Frame>
    <div style={{ width: 260 }}>
      <Pillar word="Join">Find an event nearby. Find someone to go with. One tap.</Pillar>
    </div>
  </Frame>
);

export const Create = () => (
  <Frame>
    <div style={{ width: 260 }}>
      <Pillar word="Create">Anyone can put on a night — living-room party to club night, in minutes.</Pillar>
    </div>
  </Frame>
);

export const Earn = () => (
  <Frame>
    <div style={{ width: 260 }}>
      <Pillar word="Earn">Host exclusive experiences and get paid. Turn a social life into income.</Pillar>
    </div>
  </Frame>
);
