import { Component, type ErrorInfo, type ReactNode } from 'react';

interface State {
    failed: boolean;
}

/** Last-resort screen: a render crash shows a ticket with a reload action instead of a blank page. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
    state: State = { failed: false };

    static getDerivedStateFromError(): State {
        return { failed: true };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error('Pack crashed', error, info.componentStack);
    }

    render() {
        if (!this.state.failed) return this.props.children;
        return (
            <main className="grid min-h-screen place-items-center px-4">
                <div className="ticket max-w-md space-y-3 p-8">
                    <h1 className="font-display text-4xl">Something tore.</h1>
                    <p className="text-ink-soft">The page hit an error. Your DOGE is safe on-chain; reload to pick up where you left off.</p>
                    <button type="button" onClick={() => window.location.reload()} className="chip font-semibold">Reload the page</button>
                </div>
            </main>
        );
    }
}
