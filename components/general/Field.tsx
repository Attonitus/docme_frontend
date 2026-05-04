import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
 
interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}
 
// Input con label y mensaje de error integrados.
// Usa forwardRef para que react-hook-form pueda registrarlo directamente:
// <Field label="Email" error={errors.email?.message} {...register('email')} />
export const Field = forwardRef<HTMLInputElement, FieldProps>(
  ({ label, error, className, id, ...props }, ref) => {

    const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-');
 
    return (
      <div className="space-y-1.5">
        <Label
          htmlFor={inputId}
          className='text-[12px] leading-[1.5] font-bold'
        >
          {label}
        </Label>
 
        <Input
          id={inputId}
          ref={ref}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className='placeholder:text-beige-500 text-[14px] leading-[1.5]'
          {...props}
        />

 
        {error && (
          <p
            id={`${inputId}-error`}
            role="alert"
            className="text-[12px] leading-[1.5] text-red-700 text-right gap-1"
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);
 