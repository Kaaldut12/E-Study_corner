// frontend/src/components/common/ErrorBoundary.jsx
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Production ErrorBoundary caught an exception:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-slate-100 font-sans">
          <div className="glass-panel max-w-lg w-full p-8 rounded-3xl border border-slate-800 text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 bg-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center text-3xl mx-auto border border-rose-500/30">
              ⚡
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Application Resilience Active</span>
              <h1 className="text-2xl font-black text-white">Something went wrong</h1>
              <p className="text-xs text-slate-400">
                An unhandled runtime error occurred. Our production resilience handler caught the issue to prevent complete application failure.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-left overflow-x-auto text-[11px] text-rose-300 font-mono">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 py-3 bg-linear-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg hover:opacity-95 transition"
              >
                Reload Application
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition"
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
