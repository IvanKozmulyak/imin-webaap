import type { ReactNode } from 'react';
import { cx } from './cx';
import { LiveDot } from './LiveDot';

export interface StatusPillProps {
  className?: string;
  children: ReactNode;
}

/** Green outlined pill with a live dot — the "Live today" status marker. */
export function StatusPill({ className, children }: StatusPillProps) {
  return (
    <span className={cx('status-pill', className)}>
      <LiveDot />
      {children}
    </span>
  );
}
