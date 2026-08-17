import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public props: Props;
  public state: State;

  constructor(props: Props) {
    super(props);
    this.props = props;
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled exception:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#1A1614] text-[#2C221E] dark:text-[#F4EFEA] flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-white dark:bg-[#241E1B] p-8 rounded-3xl border border-[#EBE6DD] dark:border-[#3D322B] shadow-xl space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-200 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            </div>

            <div className="space-y-2">
              <h1 className="font-serif-title text-2xl font-bold">
                Ocurrió un problema al cargar
              </h1>
              <p className="text-sm text-[#7C6E65] dark:text-[#A39489] leading-relaxed">
                Por favor recargá la página para volver a cargar el catálogo de Pampa Mates.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 rounded-xl bg-gray-100 dark:bg-[#1E1A17] text-left overflow-x-auto text-xs font-mono text-rose-600 dark:text-rose-400 border border-gray-200 dark:border-[#3D322B]">
                {this.state.error.message}
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={this.handleReset}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#4B5A36] dark:bg-[#809761] hover:bg-[#3A4729] dark:hover:bg-[#6b824e] text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-md cursor-pointer text-sm"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Volver al Catálogo</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

