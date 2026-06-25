import type { ReactNode } from 'react';
import { cx } from './cx';

export interface EyebrowProps {
  /** Render as a bordered, glowing pill (hero style) instead of a plain label. */
  pill?: boolean;
  /** Accent (default) or green tone. */
  tone?: 'accent' | 'green';
  className?: string;
  children: ReactNode;
}

/** Mono uppercase section label — the small kicker above every heading. */
export function Eyebrow({ pill, tone = 'accent', className, children }: EyebrowProps) {
  if (pill) {
    return <span className={cx('eyebrow-pill', className)}>{children}</span>;
  }
  return (
    <span className={cx('eyebrow', tone === 'green' && 'eyebrow--green', className)}>
      {children}
    </span>
  );
}
