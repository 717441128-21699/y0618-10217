import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

type Variant = 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface GlowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  variant?: Variant;
  size?: Size;
  glow?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-gradient-to-r from-cyan-500/90 to-violet-600/90 text-white border-cyan-400/50 hover:from-cyan-400 hover:to-violet-500 hover:border-cyan-300/80 hover:shadow-[0_0_24px_rgba(6,182,212,0.5)]',
  secondary:
    'bg-slate-800/80 text-slate-100 border-slate-600/60 hover:bg-slate-700/90 hover:border-slate-500/80 hover:text-white hover:shadow-[0_0_18px_rgba(148,163,184,0.25)]',
  danger:
    'bg-gradient-to-r from-rose-600/90 to-red-700/90 text-white border-rose-400/50 hover:from-rose-500 hover:to-red-600 hover:shadow-[0_0_20px_rgba(244,63,94,0.45)]',
  success:
    'bg-gradient-to-r from-emerald-500/90 to-teal-600/90 text-white border-emerald-400/50 hover:from-emerald-400 hover:to-teal-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.5)]',
  ghost:
    'bg-transparent text-slate-300 border-transparent hover:bg-white/5 hover:text-white hover:border-white/10',
};

const sizeStyles: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-4 py-2 text-sm rounded-xl gap-2',
  lg: 'px-6 py-3 text-base rounded-xl gap-2 font-semibold',
};

export const GlowButton = forwardRef<HTMLButtonElement, GlowButtonProps>(function GlowButton(
  { children, className, variant = 'primary', size = 'md', glow = false, icon, fullWidth, disabled, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled}
      className={twMerge(
        clsx(
          'relative inline-flex items-center justify-center font-medium transition-all duration-200',
          'border backdrop-blur-sm',
          'active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth ? 'w-full' : '',
          glow ? 'shadow-[0_0_18px_rgba(6,182,212,0.35)]' : '',
          className
        )
      )}
      {...rest}
    >
      {icon && <span className={clsx('inline-flex shrink-0', size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4')}>{icon}</span>}
      {children}
    </button>
  );
});
