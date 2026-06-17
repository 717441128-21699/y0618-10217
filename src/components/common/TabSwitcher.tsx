import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface TabOption<T extends string> {
  id: T;
  label: string;
  icon?: React.ReactNode;
}

interface TabSwitcherProps<T extends string> {
  tabs: TabOption<T>[];
  active: T;
  onChange: (id: T) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export function TabSwitcher<T extends string>({
  tabs,
  active,
  onChange,
  className,
  size = 'md',
}: TabSwitcherProps<T>) {
  return (
    <div
      className={twMerge(
        clsx(
          'inline-flex rounded-xl bg-slate-900/70 p-1 border border-white/10 gap-1',
          size === 'sm' ? 'text-xs' : 'text-sm',
          className
        )
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={twMerge(
              clsx(
                'inline-flex items-center gap-1.5 font-medium rounded-lg transition-all duration-200',
                size === 'sm' ? 'px-2.5 py-1' : 'px-3.5 py-1.5',
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/90 to-violet-600/90 text-white shadow-[0_0_14px_rgba(6,182,212,0.4)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              )
            )}
          >
            {tab.icon && <span className="h-4 w-4">{tab.icon}</span>}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
