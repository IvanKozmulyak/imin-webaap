import { Modal, Field, Button } from '@imin/night-kit';

/** Modal is its own dark panel. A <dialog open> is position:absolute by UA default,
 *  so give it a sized relative box to center within (inset:0 + margin:auto). */
export const ApplyForm = () => (
  <div style={{ position: 'relative', width: 480, height: 540, background: '#08070d', borderRadius: 18 }}>
    <Modal
      open
      eyebrow="Growth · Co-founder"
      title="Apply for the seat"
      sub="Own scaling demand at IMIN. Tell us your edge and leave your resume — Bohdan & Ivan read every one."
    >
      <form className="access-form" style={{ display: 'grid', gap: 14 }}>
        <Field label="Name" id="m-name" placeholder="First and last" />
        <Field label="Email" id="m-email" type="email" placeholder="you@email.com" />
        <Button variant="primary" block type="submit">
          Send application
        </Button>
      </form>
    </Modal>
  </div>
);
