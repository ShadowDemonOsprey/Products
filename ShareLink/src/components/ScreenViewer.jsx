import { useEffect, useRef } from 'react';
import { MonitorOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ScreenViewer({ stream, className }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  if (!stream) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-xl border border-dashed border-border bg-muted/20',
          className
        )}
      >
        <div className="text-center text-muted-foreground">
          <MonitorOff className="mx-auto mb-2 h-10 w-10 opacity-40" />
          <p className="text-sm">No stream yet</p>
        </div>
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      className={cn('rounded-xl border border-border bg-black object-contain', className)}
    />
  );
}