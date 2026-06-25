import type { ReactNode } from 'react';
import { cx } from './cx';
import { LiveDot } from './LiveDot';

export interface ChipProps {
  /** Prefix the label with a small static live dot. */
  dot?: boolean;
  className?: string;
  children: ReactNode;
}

/** Mono outlined proof chip — the small "Live product · Paying client" tags. */
export function Chip({ dot, className, children }: ChipProps) {
  return (
    <span className={cx('proof-chip', className)}>
      {dot ? <LiveDot small paused /> : null}
      {children}
    </span>
  );
}
