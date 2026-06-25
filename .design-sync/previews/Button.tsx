import { Button } from '@imin/night-kit';

/** IMIN components live on the brand dark canvas — frame previews so light text and
 *  white-alpha borders read true (the card body itself is white). */
const Frame = ({ children }: { children: React.ReactNode }) => (
  <div style={{ background: '#08070d', padding: 32, borderRadius: 18, display: 'inline-block' }}>
    {children}
  </div>
);

export const Primary = () => (
  <Frame>
    <Button variant="primary">Let&rsquo;s talk</Button>
  </Frame>
);

export const Ghost = () => (
  <Frame>
    <Button variant="ghost">See the product →</Button>
  </Frame>
);

export const Block = () => (
  <Frame>
    <div style={{ width: 280 }}>
      <Button variant="primary" block>
        Request access
      </Button>
    </div>
  </Frame>
);

export const AsLink = () => (
  <Frame>
    <Button variant="primary" href="https://dashboard.imin.wtf" target="_blank" rel="noreferrer">
      Book a call with Bohdan →
    </Button>
  </Frame>
);
