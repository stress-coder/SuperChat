import type { UseFormRegisterReturn } from 'react-hook-form';
import '@/assets/css/field.css';

interface TextFieldProps {
  /** Ties the label to the input; the error message reuses it as `${id}-error`. */
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  /** The message from react-hook-form's `errors.<name>.message`, when invalid. */
  error?: string;
  /** The result of `register('<name>')` — spread, never destructured, so the ref survives. */
  registration: UseFormRegisterReturn;
}

/**
 * A labelled text input with its inline validation error. Pairs with
 * react-hook-form: the caller passes `register(...)` straight through.
 */
const TextField = ({
  id,
  label,
  type = 'text',
  placeholder,
  autoComplete,
  error,
  registration,
}: TextFieldProps) => {
  const errorId = `${id}-error`;

  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className={`field__input${error ? ' field__input--invalid' : ''}`}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        {...registration}
      />
      {error && (
        <span className="field__error" id={errorId} role="alert">
          {error}
        </span>
      )}
    </div>
  );
};

export default TextField;
