import type { ReactNode } from 'react';
import { cx } from './cx';

export interface PillarProps {
  /** One-word gradient headline, e.g. "Join". */
  word: ReactNode;
  className?: string;
  /** Supporting line under the word. */
  children: ReactNode;
}

/** Vision pillar — a single gradient word over a line of copy, in a surface card. */
export function Pillar({ word, className, children }: PillarProps) {
  return (
    <div className={cx('pillar', className)}>
      <span className="pillar-word">{word}</span>
      <p>{children}</p>
    </div>
  );
}
