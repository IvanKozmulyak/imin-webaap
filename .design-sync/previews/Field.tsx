import { Field } from '@imin/night-kit';

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div style={{ background: '#08070d', padding: 32, borderRadius: 18, display: 'inline-block' }}>
    {children}
  </div>
);

export const Text = () => (
  <Frame>
    <div style={{ width: 300 }}>
      <Field label="Email" id="email" type="email" placeholder="you@yournight.com" />
    </div>
  </Frame>
);

export const Invalid = () => (
  <Frame>
    <div style={{ width: 300 }}>
      <Field label="City / country" id="city" placeholder="Lisbon, Portugal" invalid />
    </div>
  </Frame>
);

export const Textarea = () => (
  <Frame>
    <div style={{ width: 300 }}>
      <Field
        label="Why you / your edge"
        id="edge"
        multiline
        placeholder="What you'd own, what you've scaled before."
      />
    </div>
  </Frame>
);
