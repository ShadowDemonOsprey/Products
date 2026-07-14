import { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Settings as SettingsIcon, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SettingsPanel({ settings, onChange, disabled }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card/50">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between p-4 transition-colors hover:bg-muted/30"
      >
        <span className="flex items-center gap-2 font-medium">
          <SettingsIcon className="h-4 w-4" /> Settings
        </span>
        <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="space-y-5 px-4 pb-4">
          <div>
            <div className="mb-2 flex justify-between">
              <Label>Frame Rate</Label>
              <span className="tabular-nums text-sm text-muted-foreground">{settings.fps} FPS</span>
            </div>
            <Slider
              value={[settings.fps]}
              min={5}
              max={60}
              step={1}
              disabled={disabled}
              onValueChange={([v]) => onChange({ ...settings, fps: v })}
            />
          </div>
          <div>
            <div className="mb-2 flex justify-between">
              <Label>Image Quality</Label>
              <span className="tabular-nums text-sm text-muted-foreground">{settings.quality} kb/s</span>
            </div>
            <Slider
              value={[settings.quality]}
              min={100}
              max={8000}
              step={100}
              disabled={disabled}
              onValueChange={([v]) => onChange({ ...settings, quality: v })}
            />
          </div>
        </div>
      )}
    </div>
  );
}