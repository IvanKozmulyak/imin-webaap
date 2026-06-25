import type { ReactNode } from 'react';

export interface ModalProps {
  /** Native <dialog> open state. */
  open?: boolean;
  /** Mono accent eyebrow in the header. */
  eyebrow?: ReactNode;
  /** Display-font modal title. */
  title: ReactNode;
  /** Sub copy under the title. */
  sub?: ReactNode;
  /** Close handler for the × button. */
  onClose?: () => void;
  /** Modal body — typically a form. */
  children: ReactNode;
}

/** Centered <dialog> modal with the IMIN header (eyebrow · title · sub · close). */
export function Modal({ open, eyebrow, title, sub, onClose, children }: ModalProps) {
  return (
    <dialog className="modal" open={open} aria-label={typeof title === 'string' ? title : undefined}>
      <div className="modal-head">
        <div>
          {eyebrow ? <div className="modal-eyebrow">{eyebrow}</div> : null}
          <div className="modal-title">{title}</div>
          {sub ? <p className="modal-sub">{sub}</p> : null}
        </div>
        <button type="button" className="modal-close" aria-label="Close" onClick={onClose}>
          ×
        </button>
      </div>
      {children}
    </dialog>
  );
}
