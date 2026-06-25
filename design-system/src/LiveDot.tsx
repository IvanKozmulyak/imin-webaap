import { cx } from './cx';

export interface LiveDotProps {
  /** Smaller 6px dot for inline captions. */
  small?: boolean;
  /** Freeze the pulse animation. */
  paused?: boolean;
  className?: string;
}

/** Pulsing green "live" indicator dot. */
export function LiveDot({ small, paused, className }: LiveDotProps) {
  return (
    <span
      className={cx('live-dot', small && 'live-dot--sm', paused && 'live-dot--static', className)}
    />
  );
}
