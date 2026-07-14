import { Activity, Gauge } from 'lucide-react';

export default function StatsBar({ fps = 0, bandwidth = 0 }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-xl border border-border bg-card/50 p-3">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
          <Gauge className="h-3.5 w-3.5" /> FPS
        </div>
        <p className="mt-1 font-display text-2xl font-semibold tabular-nums">{fps}</p>
      </div>
      <div className="rounded-xl border border-border bg-card/50 p-3">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
          <Activity className="h-3.5 w-3.5" /> Bandwidth
        </div>
        <p className="mt-1 font-display text-2xl font-semibold tabular-nums">
          {bandwidth < 1000 ? bandwidth : (bandwidth / 1000).toFixed(1)}
          <span className="ml-1 text-sm text-muted-foreground">
            {bandwidth < 1000 ? 'kb/s' : 'Mb/s'}
          </span>
        </p>
      </div>
    </div>
  );
}