import * as React from "react";

type Props = { children: React.ReactNode };
type State = { hasError: boolean };

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: any, info: any) {
    // TODO: Send to monitoring (Sentry/Datadog/Otel)
    console.error("[ErrorBoundary]", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="min-h-screen bg-[#05080F] text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full border border-amber-500/30 rounded-2xl p-6 bg-black/40">
          <h1 className="text-sm font-black tracking-widest uppercase text-amber-400">SYSTEM_GUARD_FALLBACK</h1>
          <p className="text-xs opacity-80 mt-2">Something went wrong. Please reload.</p>
          <button
            className="mt-4 w-full rounded-xl bg-amber-500 text-black font-black py-3 text-sm"
            onClick={() => location.reload()}
          >
            RELOAD
          </button>
        </div>
      </div>
    );
  }
}
