'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium text-[#EAF3F0]"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`
            w-full px-4 py-2.5 rounded-xl text-sm
            bg-[rgba(15,46,54,0.8)] text-[#EAF3F0]
            border transition-all duration-200
            placeholder:text-[#5E7A76]
            focus:outline-none focus:ring-2 focus:ring-[#A4BF9D]/40
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error
              ? 'border-[#D97878] focus:border-[#D97878]'
              : 'border-[rgba(164,191,157,0.14)] focus:border-[rgba(164,191,157,0.4)]'
            }
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-xs text-[#D97878]">{error}</p>}
        {hint && !error && <p className="text-xs text-[#5E7A76]">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className = '', id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-[#EAF3F0]">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={`
            w-full px-4 py-2.5 rounded-xl text-sm resize-y min-h-[120px]
            bg-[rgba(15,46,54,0.8)] text-[#EAF3F0]
            border transition-all duration-200
            placeholder:text-[#5E7A76]
            focus:outline-none focus:ring-2 focus:ring-[#A4BF9D]/40
            ${error
              ? 'border-[#D97878]'
              : 'border-[rgba(164,191,157,0.14)] focus:border-[rgba(164,191,157,0.4)]'
            }
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-xs text-[#D97878]">{error}</p>}
        {hint && !error && <p className="text-xs text-[#5E7A76]">{hint}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
