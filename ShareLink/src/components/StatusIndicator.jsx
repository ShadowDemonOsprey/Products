import { cn } from '@/lib/utils';

const STATUS_CONFIG = {
  idle: { className: 'bg-slate-500/10 text-slate-400', dot: 'bg-slate-400', label: 'Idle' },
  waiting: { className: 'bg-amber-500/10 text-amber-400', dot: 'bg-amber-400 animate-pulse', label: 'Waiting' },
  connected: { className: 'bg-emerald-500/10 text-emerald-400', dot: 'bg-emerald-400', label: 'Connected' },
  error: { className: 'bg-red-500/10 text-red-400', dot: 'bg-red-500', label: 'Error' },
};

export default function StatusIndicator({ status = 'idle' }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.idle;
  return (
    <div className={cn('inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium', cfg.className)}>
      <span className={cn('h-2 w-2 rounded-full', cfg.dot)} />
      {cfg.label}
    </div>
  );
}