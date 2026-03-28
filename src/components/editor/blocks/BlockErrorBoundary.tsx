import React from "react";
import { AlertCircle } from "lucide-react";

export class BlockErrorBoundary extends React.Component<
  { children: React.ReactNode; blockId: string; onRemove: (id: string) => void },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[BlockErrorBoundary] block:", this.props.blockId, error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-0 my-1 p-3 rounded-xl border border-destructive/30 bg-destructive/5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
            <span className="text-xs text-destructive">Erro neste bloco</span>
          </div>
          <button
            type="button"
            onClick={() => this.props.onRemove(this.props.blockId)}
            className="text-[10px] text-destructive/70 hover:text-destructive underline cursor-pointer"
          >
            Remover
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
