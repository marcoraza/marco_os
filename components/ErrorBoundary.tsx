import React, { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-accent-red/10 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-accent-red">error</span>
          </div>
          <h2 className="text-sm font-bold text-text-primary mb-2">Algo deu errado</h2>
          <p className="text-xs text-text-secondary mb-4 max-w-md">
            {this.state.error?.message || 'Erro inesperado ao renderizar esta seção.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest bg-accent-blue/10 border border-accent-blue/30 text-accent-blue rounded-sm hover:bg-accent-blue/20 transition-all"
          >
            Tentar Novamente
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
