import { clsx } from "clsx";

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

export function LoadingOverlay({
  isVisible,
  message = "Loading...",
}: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 shadow-xl flex flex-col items-center gap-4 min-w-[200px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-700 border-t-primary" />
        <p className="text-zinc-300 text-sm font-medium">{message}</p>
      </div>
    </div>
  );
}
