import type { ChangeEventHandler, ReactNode } from 'react';
import { cx } from './cx';

export interface FieldProps {
  /** Mono uppercase label text. */
  label: ReactNode;
  /** Input id (label is wired to it). */
  id?: string;
  /** Render a multi-line textarea instead of an input. */
  multiline?: boolean;
  type?: string;
  name?: string;
  placeholder?: string;
  value?: string;
  /** Red invalid border. */
  invalid?: boolean;
  onChange?: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
}

/** Labeled form field — mono label over the IMIN dark input or textarea. */
export function Field({
  label,
  id,
  multiline,
  type = 'text',
  name,
  placeholder,
  value,
  invalid,
  onChange,
}: FieldProps): ReactNode {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {multiline ? (
        <textarea
          id={id}
          name={name}
          placeholder={placeholder}
          value={value}
          className={cx(invalid && 'is-invalid')}
          onChange={onChange as ChangeEventHandler<HTMLTextAreaElement>}
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          className={cx(invalid && 'is-invalid')}
          onChange={onChange as ChangeEventHandler<HTMLInputElement>}
        />
      )}
    </div>
  );
}
