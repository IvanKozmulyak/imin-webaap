import { StatCard } from '@imin/night-kit';

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div style={{ background: '#08070d', padding: 32, borderRadius: 18, display: 'inline-block' }}>
    {children}
  </div>
);

export const Market = () => (
  <Frame>
    <div style={{ width: 240 }}>
      <StatCard value="$85B" cite="Mordor Intelligence, 2025">
        Global event-ticketing market — nightlife is its biggest, fastest segment.
      </StatCard>
    </div>
  </Frame>
);

export const Loneliness = () => (
  <Frame>
    <div style={{ width: 240 }}>
      <StatCard value="57%" cite="eupinions 2024 · WHO 2025">
        Of 18–35 Europeans feel lonely — 63% in France, our beachhead.
      </StatCard>
    </div>
  </Frame>
);
