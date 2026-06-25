import type { MouseEventHandler, ReactNode } from 'react';
import { cx } from './cx';

export interface ButtonProps {
  /** Visual style. `primary` = gradient fill, `ghost` = hairline outline. */
  variant?: 'primary' | 'ghost';
  /** Full-width, centered — for forms and cards. */
  block?: boolean;
  /** When set, renders an `<a>` instead of a `<button>`. */
  href?: string;
  /** Anchor target (only with `href`). */
  target?: string;
  /** Anchor rel (only with `href`). */
  rel?: string;
  /** Button type (ignored when `href` is set). */
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  onClick?: MouseEventHandler;
  className?: string;
  children: ReactNode;
}

/** The IMIN pill button — gradient `primary` for the main action, outlined `ghost` for the secondary. */
export function Button({
  variant = 'primary',
  block,
  href,
  target,
  rel,
  type = 'button',
  disabled,
  onClick,
  className,
  children,
}: ButtonProps) {
  const cls = cx('btn', `btn--${variant}`, block && 'btn--block', className);
  if (href) {
    return (
      <a className={cls} href={href} target={target} rel={rel} onClick={onClick}>
        {children}
      </a>
    );
  }
  return (
    <button className={cls} type={type} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}
