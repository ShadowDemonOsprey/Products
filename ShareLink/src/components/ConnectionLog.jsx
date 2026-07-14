import { useEffect, useRef } from 'react';

export default function ConnectionLog({ entries = [] }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries]);

  return (
    <div className="h-48 max-h-48 overflow-y-auto rounded-xl border border-border bg-black/30 p-4 font-mono text-xs flex flex-col gap-1">
      {entries.length === 0 ? (
        <p className="text-muted-foreground/50">Waiting for events…</p>
      ) : (
        entries.map((e, i) => (
          <div key={i} className="flex gap-2">
            <span className="shrink-0 text-muted-foreground/60">{e.time}</span>
            <span className="text-foreground/90">{e.message}</span>
          </div>
        ))
      )}
      <div ref={endRef} />
    </div>
  );
}