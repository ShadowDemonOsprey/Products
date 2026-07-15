import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function SettingsPanel({ settings, onChange, disabled }) {
  const update = (key, value) => {
    onChange({
      ...settings,
      [key]: value,
    });
  };

  return (
    <div className="rounded-2xl border border-border bg-card/50 p-5 space-y-4">
      <h3 className="font-display text-lg font-semibold">
        Settings
      </h3>

      <div>
        <Label className="mb-1.5 block">
          FPS
        </Label>
        <Input
          type="number"
          min="1"
          max="60"
          value={settings.fps}
          disabled={disabled}
          onChange={(e) =>
            update("fps", Number(e.target.value))
          }
        />
      </div>

      <div>
        <Label className="mb-1.5 block">
          Quality (kbps)
        </Label>
        <Input
          type="number"
          min="100"
          value={settings.quality}
          disabled={disabled}
          onChange={(e) =>
            update("quality", Number(e.target.value))
          }
        />
      </div>
    </div>
  );
}