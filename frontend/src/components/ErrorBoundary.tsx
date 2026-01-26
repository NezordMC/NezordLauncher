import { Component, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message || "Unexpected error" };
  }

  componentDidCatch() {
    return;
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen flex items-center justify-center bg-zinc-950 text-zinc-200">
          <div className="max-w-lg w-full p-6 bg-zinc-900 border border-zinc-800 rounded-lg text-center space-y-3">
            <div className="text-lg font-semibold">UI crashed</div>
            <div className="text-xs text-zinc-500 break-all">
              {this.state.message}
            </div>
            <button
              className="px-4 py-2 text-sm rounded-md bg-primary text-white"
              onClick={() => window.location.reload()}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
