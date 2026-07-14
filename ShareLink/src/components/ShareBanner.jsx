import { Radio } from 'lucide-react';

export default function ShareBanner() {
  return (
    <div className="flex animate-pulse items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3">
      <Radio className="h-5 w-5 shrink-0 text-rose-400" />
      <div>
        <p className="font-medium text-rose-200">Screen sharing is active</p>
        <p className="text-xs text-rose-300/70">
          Your screen is being shared with the connected viewer. Click Stop Sharing to end.
        </p>
      </div>
    </div>
  );
}