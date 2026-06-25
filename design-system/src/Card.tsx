import type { ReactNode } from 'react';
import { cx } from './cx';

export interface CardProps {
  /** Mono uppercase kicker above the title. */
  eyebrow?: ReactNode;
  /** Display-font card title. */
  title: ReactNode;
  className?: string;
  /** Card body copy. */
  children: ReactNode;
}

/** Surface card with an accent eyebrow, display title and body — the problem/feature card. */
export function Card({ eyebrow, title, className, children }: CardProps) {
  return (
    <div className={cx('card', className)}>
      {eyebrow ? <span className="card-eyebrow">{eyebrow}</span> : null}
      <h3 className="card-h3">{title}</h3>
      <p className="card-body">{children}</p>
    </div>
  );
}
