import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  glow?: boolean;
  glowColor?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingMap = {
  none: '',
  sm: 'p-2',
  md: 'p-4',
  lg: 'p-6',
};

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(function GlassCard(
  { children, className, glow = false, glowColor = '#06b6d4', padding = 'md', ...rest },
  ref
) {
  return (
    <div
      ref={ref}
      className={twMerge(
        clsx(
          'relative rounded-xl overflow-hidden',
          'bg-slate-900/60 backdrop-blur-xl border border-white/10',
          'shadow-[0_8px_32px_rgba(2,6,23,0.4)]',
          paddingMap[padding],
          className
        )
      )}
      {...rest}
      style={{
        ...(rest.style ?? {}),
        boxShadow: glow
          ? `0 0 24px -4px ${glowColor}55, 0 8px 32px rgba(2,6,23,0.4)`
          : rest.style?.boxShadow,
      }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-20 bg-gradient-to-br from-white/5 via-transparent to-cyan-500/5" />
      <div className="relative z-10">{children}</div>
    </div>
  );
});
