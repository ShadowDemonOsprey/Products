import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Eye, ArrowLeft, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useViewer } from '@/hooks/useViewer';
import StatusIndicator from '@/components/StatusIndicator';
import ConnectionLog from '@/components/ConnectionLog';
import StatsBar from '@/components/StatsBar';
import ScreenViewer from '@/components/ScreenViewer';

export default function Connect() {
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [log, setLog] = useState([]);

  const addLog = useCallback((message) => {
    setLog((prev) => [...prev, { time: new Date().toLocaleTimeString(), message }]);
  }, []);

  const { status, stats, remoteStream, connect, disconnect } = useViewer(addLog);
  const isConnected = status === 'waiting' || status === 'connected';

  const handleConnect = async () => {
    if (code.length < 4 || password.length < 4) {
      addLog('Enter a valid room code and password');
      return;
    }
    await connect(code.toUpperCase(), password);
  };

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
            <Eye className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-semibold">Connect to Screen</span>
        </div>
        <StatusIndicator status={status} />
      </header>

      <main className="flex-1 px-6 py-8">
        <div className="mx-auto max-w-5xl">
          {!isConnected ? (
            <div className="mx-auto mt-12 max-w-md">
              <div className="rounded-2xl border border-border bg-card/50 p-8 animate-slide-up">
                <h2 className="mb-2 font-display text-2xl font-semibold">Join a sharing session</h2>
                <p className="mb-6 text-sm text-muted-foreground">
                  Enter the room code and shared password from the sharer.
                </p>
                <div className="space-y-3">
                  <div>
                    <Label className="mb-1.5 block">Room Code</Label>
                    <Input
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      placeholder="6-character code"
                      maxLength={6}
                      className="font-display tracking-widest uppercase"
                    />
                  </div>
                  <div>
                    <Label className="mb-1.5 block">Password</Label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Shared secret"
                      onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
                    />
                  </div>
                  <Button
                    onClick={handleConnect}
                    className="w-full"
                    disabled={code.length < 4 || password.length < 4}
                  >
                    Connect
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="space-y-5 lg:col-span-1">
                <StatsBar fps={stats.fps} bandwidth={stats.bandwidth} />
                <Button onClick={disconnect} variant="outline" className="w-full">
                  <LogOut className="mr-2 h-4 w-4" /> Disconnect
                </Button>
              </div>
              <div className="space-y-5 lg:col-span-2">
                <ScreenViewer stream={remoteStream} className="aspect-video w-full" />
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