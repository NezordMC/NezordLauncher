import { useEffect, useRef } from "react";
import { Terminal, X, ChevronDown } from "lucide-react";
import { useLaunchStore } from "@/stores/launchStore";
import { Button } from "@/components/ui/button";

export function FloatingConsole() {
  const { logs, isConsoleOpen, toggleConsole, setConsoleOpen } =
    useLaunchStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current && isConsoleOpen) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isConsoleOpen]);

  return (
    <>
      {isConsoleOpen && (
        <div className="fixed bottom-20 right-4 w-96 h-80 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl z-50 flex flex-col animate-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-zinc-900/50 rounded-t-xl">
            <div className="flex items-center gap-2 text-sm font-medium text-zinc-300">
              <Terminal size={14} className="text-primary" />
              Console
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setConsoleOpen(false)}
                className="p-1 text-zinc-500 hover:text-white transition-colors rounded"
              >
                <ChevronDown size={16} />
              </button>
              <button
                onClick={() => setConsoleOpen(false)}
                className="p-1 text-zinc-500 hover:text-white transition-colors rounded"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-3 font-mono text-xs leading-relaxed"
          >
            {logs.length === 0 ? (
              <div className="text-zinc-600 text-center py-8">
                No logs yet. Launch an instance to see output.
              </div>
            ) : (
              logs.map((log, i) => (
                <div
                  key={i}
                  className={`py-0.5 break-all ${
                    log.includes("[ERROR]") ||
                    log.includes("[FATAL]") ||
                    log.includes("[APP ERROR]")
                      ? "text-red-400"
                      : log.includes("[DOWNLOAD]")
                        ? "text-blue-400"
                        : log.includes("[SYSTEM]") || log.includes("[COMMAND]")
                          ? "text-primary"
                          : "text-zinc-400"
                  }`}
                >
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <Button
        onClick={toggleConsole}
        className={`fixed bottom-4 right-4 h-12 px-4 rounded-xl shadow-lg z-50 gap-2 transition-all ${
          isConsoleOpen
            ? "bg-primary text-white"
            : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
        }`}
      >
        <Terminal size={18} />
        <span className="text-sm font-medium">Console</span>
        {logs.length > 0 && !isConsoleOpen && (
          <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
        )}
      </Button>
    </>
  );
}
