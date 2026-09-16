"use client";

import { ReactNode, ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'subtle';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, loading, variant = 'primary', size = 'md', children, disabled, ...props }, ref) => {
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
      md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
      lg: 'px-5 py-3 text-base rounded-xl gap-2.5',
    };

    const variantClasses = {
      primary: 'bg-[#17152b] text-white hover:bg-slate-800 shadow-xs active:bg-slate-900',
      secondary: 'bg-white text-slate-700 border border-slate-200/90 hover:bg-slate-50 hover:border-slate-300 shadow-xs active:bg-slate-100',
      outline: 'border border-slate-200/90 text-slate-700 hover:bg-slate-50 hover:border-slate-300 active:bg-slate-100',
      ghost: 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 active:bg-slate-200/80',
      danger: 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 active:bg-rose-200',
      subtle: 'bg-violet-50 text-violet-700 border border-violet-100 hover:bg-violet-100 active:bg-violet-200',
    };

    // If className explicitly overrides background, don't conflict with base variant class
    const hasCustomBg = className && (className.includes('bg-') || className.includes('border-'));
    const appliedVariantClass = hasCustomBg ? '' : variantClasses[variant];

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-semibold transition-all duration-150 ease-out select-none active:scale-[0.98]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30 focus-visible:ring-offset-1',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 disabled:pointer-events-none',
          sizeClasses[size],
          appliedVariantClass,
          className
        )}
        disabled={loading || disabled}
        {...props}
      >
        {loading && <Loader2 size={size === 'sm' ? 14 : 16} className="animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export interface BadgeProps {
  children: ReactNode;
  tone?: 'violet' | 'green' | 'red' | 'amber' | 'blue' | 'gray';
  variant?: 'subtle' | 'outline' | 'solid';
  className?: string;
}

export function Badge({
  children,
  tone = 'violet',
  variant = 'subtle',
  className,
}: BadgeProps) {
  const toneClasses = {
    violet: {
      subtle: 'bg-violet-50 text-violet-700 border-violet-100/80',
      outline: 'border-violet-200 text-violet-700 bg-transparent',
      solid: 'bg-violet-600 text-white border-transparent',
    },
    green: {
      subtle: 'bg-emerald-50 text-emerald-700 border-emerald-100/80',
      outline: 'border-emerald-200 text-emerald-700 bg-transparent',
      solid: 'bg-emerald-600 text-white border-transparent',
    },
    red: {
      subtle: 'bg-rose-50 text-rose-700 border-rose-100/80',
      outline: 'border-rose-200 text-rose-700 bg-transparent',
      solid: 'bg-rose-600 text-white border-transparent',
    },
    amber: {
      subtle: 'bg-amber-50 text-amber-800 border-amber-200/70',
      outline: 'border-amber-200 text-amber-800 bg-transparent',
      solid: 'bg-amber-500 text-white border-transparent',
    },
    blue: {
      subtle: 'bg-blue-50 text-blue-700 border-blue-100/80',
      outline: 'border-blue-200 text-blue-700 bg-transparent',
      solid: 'bg-blue-600 text-white border-transparent',
    },
    gray: {
      subtle: 'bg-slate-100/80 text-slate-700 border-slate-200/60',
      outline: 'border-slate-200 text-slate-700 bg-transparent',
      solid: 'bg-slate-700 text-white border-transparent',
    },
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-tight border',
        toneClasses[tone][variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className, hover = false }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card transition-all duration-200 ease-out',
        hover && 'hover:shadow-card-hover hover:border-slate-300/80',
        className
      )}
    >
      {children}
    </div>
  );
}
