import type { ReactNode } from 'react';
import { GlassCard } from '../common/GlassCard';

interface LayoutPanelProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
}

export function LayoutPanel({ title, subtitle, icon, children, className, actions }: LayoutPanelProps) {
  return (
    <GlassCard className={`flex flex-col h-full ${className ?? ''}`} padding="none">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2 min-w-0">
          {icon && <div className="h-5 w-5 shrink-0 text-cyan-400">{icon}</div>}
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-slate-100 truncate tracking-wide">{title}</h2>
            {subtitle && <p className="text-[11px] text-slate-400 truncate">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
      <div className="flex-1 min-h-0 overflow-auto custom-scrollbar px-4 py-3">{children}</div>
    </GlassCard>
  );
}
