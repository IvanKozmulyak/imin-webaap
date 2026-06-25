import type { ReactNode } from 'react';
import { cx } from './cx';

export interface StatCardProps {
  /** The big display number, e.g. "$85B". */
  value: ReactNode;
  /** Optional source citation shown in mono below the body. */
  cite?: ReactNode;
  className?: string;
  /** Supporting copy under the number. */
  children: ReactNode;
}

/** Hover-lift stat card — a display number, a line of body, an optional citation. */
export function StatCard({ value, cite, className, children }: StatCardProps) {
  return (
    <div className={cx('stat-card', className)}>
      <span className="stat-num">{value}</span>
      <p className="stat-body">{children}</p>
      {cite ? <cite className="stat-cite">{cite}</cite> : null}
    </div>
  );
}
