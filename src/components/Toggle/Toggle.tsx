import { type ButtonHTMLAttributes } from 'react';

export interface ToggleProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'type' | 'onChange'
> {
  checked: boolean;
  label: string;
  description?: string;
  onChange: (checked: boolean) => void;
}

const getAriaChecked = (checked: boolean): 'true' | 'false' => {
  return checked ? 'true' : 'false';
};

const Toggle = ({
  checked,
  label,
  description,
  onChange,
  className = '',
  ...props
}: ToggleProps) => {
  return (
    <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
      <div>
        <p className="font-medium text-gray-900">{label}</p>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={getAriaChecked(checked)}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-primary-600' : 'bg-gray-300'
        } ${className}`}
        {...props}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
};

export default Toggle;
