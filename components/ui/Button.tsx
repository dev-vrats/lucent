'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const variantStyles = {
  primary:     'bg-[#A4BF9D] text-[#071A1F] hover:bg-[#b8d1b1] font-semibold',
  secondary:   'bg-[#0F2E36] text-[#EAF3F0] hover:bg-[#0C3D48] border border-[rgba(164,191,157,0.14)]',
  ghost:       'bg-transparent text-[#93AFA8] hover:text-[#EAF3F0] hover:bg-[rgba(164,191,157,0.08)]',
  destructive: 'bg-[#D97878] text-white hover:bg-[#c96060] font-semibold',
  outline:     'bg-transparent text-[#A4BF9D] border border-[#A4BF9D] hover:bg-[rgba(164,191,157,0.1)]',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-7 py-3.5 text-base rounded-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, disabled, children, className = '', ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center gap-2 transition-colors duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variantStyles[variant]} ${sizeStyles[size]} ${className}
        `}
        {...(props as any)}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
