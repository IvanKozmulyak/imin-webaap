import { Card } from '@imin/night-kit';

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div style={{ background: '#08070d', padding: 32, borderRadius: 18, display: 'inline-block' }}>
    {children}
  </div>
);

export const Organizer = () => (
  <Frame>
    <div style={{ width: 380 }}>
      <Card eyebrow="The organizer" title="Great nights. Lost on the marketing.">
        A 2-person crew can&rsquo;t run ads, email, SMS and design like a company with a
        marketing team — and they find out a show is soft when the budget&rsquo;s already gone.
      </Card>
    </div>
  </Frame>
);

export const EventGoer = () => (
  <Frame>
    <div style={{ width: 380 }}>
      <Card eyebrow="The event-goer" title="Want to go out. Don&rsquo;t know where — or who with.">
        New rooms, new circles, company for the night — not a romantic transaction. Dating
        apps don&rsquo;t fit.
      </Card>
    </div>
  </Frame>
);
