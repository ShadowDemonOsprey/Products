import { Link } from 'react-router-dom';
import { Monitor, Eye, Shield, Zap, Lock } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Monitor className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-semibold">ScreenLink</span>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        <div className="mb-12 max-w-2xl text-center">
          <h1 className="mb-4 font-display text-4xl font-bold tracking-tight md:text-5xl">
            Secure screen sharing
            <br />
            between your computers
          </h1>
          <p className="text-lg text-muted-foreground">
            End-to-end encrypted, password-protected, and built for low-latency remote monitoring.
            No installs, no persistence — runs right in your browser.
          </p>
        </div>

        <div className="grid w-full max-w-3xl gap-5 md:grid-cols-2">
          <Link
            to="/share"
            className="group rounded-2xl border border-border bg-card/50 p-6 transition-all hover:border-primary/50 hover:bg-card"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-transform group-hover:scale-110">
              <Monitor className="h-6 w-6 text-primary" />
            </div>
            <h2 className="mb-1 font-display text-xl font-semibold">Share My Screen</h2>
            <p className="text-sm text-muted-foreground">Start broadcasting your screen to a remote viewer.</p>
          </Link>

          <Link
            to="/connect"
            className="group rounded-2xl border border-border bg-card/50 p-6 transition-all hover:border-primary/50 hover:bg-card"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-transform group-hover:scale-110">
              <Eye className="h-6 w-6 text-primary" />
            </div>
            <h2 className="mb-1 font-display text-xl font-semibold">Connect to Screen</h2>
            <p className="text-sm text-muted-foreground">View a remote screen using a room code and password.</p>
          </Link>
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <Lock className="h-4 w-4" /> TLS encrypted
          </span>
          <span className="flex items-center gap-2">
            <Shield className="h-4 w-4" /> Password protected
          </span>
          <span className="flex items-center gap-2">
            <Zap className="h-4 w-4" /> Low latency
          </span>
        </div>
      </main>
    </div>
  );
}