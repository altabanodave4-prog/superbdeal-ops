import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Catches render errors so a single broken view does not white-screen the whole workstation.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // In production this would report to an error monitoring service
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="min-h-[40vh] flex flex-col items-center justify-center p-8 text-center"
        >
          <div className="w-14 h-14 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center mb-4">
            <AlertTriangle className="w-7 h-7 text-red-600" aria-hidden />
          </div>
          <h2 className="text-lg font-semibold text-slate-900 mb-1">
            {this.props.fallbackTitle ?? 'Something went wrong'}
          </h2>
          <p className="text-sm text-slate-600 max-w-md mb-4">
            This panel hit an unexpected error. Your other workspaces should still work. You can
            try reloading this section.
          </p>
          {this.state.error && (
            <pre className="text-left text-[11px] font-mono bg-slate-100 border border-slate-200 rounded-lg p-3 mb-4 max-w-lg overflow-auto text-slate-700">
              {this.state.error.message}
            </pre>
          )}
          <button
            type="button"
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            <RefreshCw className="w-4 h-4" aria-hidden />
            Retry section
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
