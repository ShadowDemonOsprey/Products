import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Monitor, Play, Square, Copy, Check, LogOut, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSharer } from '@/hooks/useSharer';
import { loadSettings, saveSettings } from '@/lib/settings';
import StatusIndicator from '@/components/StatusIndicator';
import ConnectionLog from '@/components/ConnectionLog';
import StatsBar from '@/components/StatsBar';
import SettingsPanel from '@/components/SettingsPanel';
import ShareBanner from '@/components/ShareBanner';
import ScreenViewer from '@/components/ScreenViewer';

export default function Share() {
  const [settings, setSettings] = useState(loadSettings);
  const [password, setPassword] = useState('');
  const [log, setLog] = useState([]);
  const [copied, setCopied] = useState(false);

  const addLog = useCallback((message) => {
    setLog((prev) => [...prev, { time: new Date().toLocaleTimeString(), message }]);
  }, []);

  const { status, stats, roomCode, localStream, createRoom, startSharing, stopSharing, disconnect } =
    useSharer(addLog);

  const updateSettings = (s) => {
    setSettings(s);
    saveSettings(s);
  };

  const handleCreate = async () => {
    if (password.length < 4) {
      addLog('Password must be at least 4 characters');
      return;
    }
    await createRoom(password);
  };

  const handleStart = () => startSharing(settings);

  const copyCode = () => {
    if (!roomCode) return;
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isActive = status === 'waiting' || status === 'connected';

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Monitor className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-semibold">Share Screen</span>
        </div>
        <StatusIndicator status={status} />
      </header>

      <main className="flex-1 px-6 py-8">
        <div className="mx-auto max-w-5xl">
          {!roomCode ? (
            <div className="mx-auto mt-12 max-w-md">
              <div className="rounded-2xl border border-border bg-card/50 p-8 animate-slide-up">
                <h2 className="mb-2 font-display text-2xl font-semibold">Create a sharing room</h2>
                <p className="mb-6 text-sm text-muted-foreground">
                  Set a shared secret password. You'll get a room code to share with your viewer.
                </p>
                <div className="space-y-3">
                  <div>
                    <Label className="mb-1.5 block">Shared Password</Label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 4 characters"
                      onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                    />
                  </div>
                  <Button onClick={handleCreate} className="w-full" disabled={password.length < 4}>
                    Create Room
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="space-y-5 lg:col-span-1">
                <div className="rounded-2xl border border-border bg-card/50 p-5">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">Room Code</Label>
                  <div className="mt-2 flex items-center gap-2">
                    <code className="flex-1 font-display text-3xl font-bold tracking-widest">{roomCode}</code>
                    <Button variant="outline" size="icon" onClick={copyCode}>
                      {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Share this code and your password with the viewer.
                  </p>
                </div>
                <SettingsPanel settings={settings} onChange={updateSettings} disabled={isActive} />
                <StatsBar fps={stats.fps} bandwidth={stats.bandwidth} />
              </div>

              <div className="space-y-5 lg:col-span-2">
                {isActive && <ShareBanner />}
                <div className="flex gap-3">
                  {!isActive ? (
                    <Button onClick={handleStart} className="flex-1" size="lg">
                      <Play className="mr-2 h-4 w-4" /> Start Sharing
                    </Button>
                  ) : (
                    <Button onClick={stopSharing} variant="destructive" className="flex-1" size="lg">
                      <Square className="mr-2 h-4 w-4" /> Stop Sharing
                    </Button>
                  )}
                  <Button onClick={disconnect} variant="outline" size="lg">
                    <LogOut className="mr-2 h-4 w-4" /> Disconnect
                  </Button>
                </div>
                <ScreenViewer stream={localStream} className="aspect-video w-full" />
                <div>
                  <Label className="mb-2 block text-xs uppercase tracking-wide text-muted-foreground">
                    Connection Log
                  </Label>
                  <ConnectionLog entries={log} />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}