import { useEffect, useRef, useMemo } from "react";
import { Terminal, X, ChevronDown, Copy, Trash2, Check } from "lucide-react";
import { useLaunchStore } from "@/stores/launchStore";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";

export function FloatingConsole() {
  const { logs, isConsoleOpen, toggleConsole, setConsoleOpen, clearLogs } =
    useLaunchStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (scrollRef.current && isConsoleOpen) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isConsoleOpen]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(logs.join("\n"));
      setIsCopied(true);
      toast.success("Logs copied to clipboard");
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy logs");
    }
  };

  return (
    <>
      {isConsoleOpen && (
        <div className="fixed bottom-20 right-4 w-[800px] h-[500px] bg-zinc-950 border border-zinc-800/50 rounded-xl shadow-2xl z-50 flex flex-col animate-in slide-in-from-bottom-4 duration-200 ring-1 ring-white/10">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/50 bg-zinc-900/50 rounded-t-xl select-none">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <Terminal size={16} className="text-primary" />
              </div>
              <span className="font-medium text-zinc-200">Terminal Output</span>
              <span className="text-xs text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                {logs.length} lines
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleCopy}
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all rounded-lg group tooltip-trigger"
                title="Copy logs"
              >
                {isCopied ? (
                  <Check size={16} className="text-green-400" />
                ) : (
                  <Copy size={16} />
                )}
              </button>
              <button
                onClick={() => {
                  clearLogs();
                  toast.success("Console logs cleared");
                }}
                className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 transition-all rounded-lg"
                title="Clear logs"
              >
                <Trash2 size={16} />
              </button>
              <div className="w-px h-4 bg-zinc-800 mx-2" />
              <button
                onClick={() => setConsoleOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all rounded-lg"
              >
                <ChevronDown size={16} />
              </button>
              <button
                onClick={() => setConsoleOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all rounded-lg"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 font-mono text-[13px] leading-relaxed scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent"
            style={{ willChange: "transform", contain: "layout style paint" }}
          >
            {logs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-600 space-y-3">
                <Terminal size={48} className="opacity-20" />
                <p>No logs available</p>
                <p className="text-xs text-zinc-700">
                  Launch an instance to see output
                </p>
              </div>
            ) : (
              logs.slice(-500).map((log, i) => {
                const lineNum = Math.max(0, logs.length - 500) + i + 1;
                return (
                  <div
                    key={lineNum}
                    className={`py-0.5 break-all border-b border-white/[0.02] last:border-0 ${
                      log.includes("[ERROR]") ||
                      log.includes("[FATAL]") ||
                      log.includes("[APP ERROR]")
                        ? "text-red-400 bg-red-400/5 px-2 -mx-2 rounded-sm my-0.5"
                        : log.includes("[DOWNLOAD]")
                          ? "text-blue-400"
                          : log.includes("[SYSTEM]") ||
                              log.includes("[COMMAND]")
                            ? "text-primary font-medium"
                            : log.includes("[GAME]")
                              ? "text-zinc-300"
                              : "text-zinc-400"
                    }`}
                  >
                    <span className="text-zinc-700 mr-3 select-none text-[10px]">
                      {lineNum.toString().padStart(4, " ")}
                    </span>
                    {log}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      <Button
        onClick={toggleConsole}
        className={`fixed bottom-4 right-4 h-12 px-4 rounded-xl shadow-lg shadow-primary/5 z-50 gap-2.5 transition-all duration-300 font-medium tracking-wide ${
          isConsoleOpen
            ? "bg-primary text-primary-foreground translate-y-0 opacity-100 ring-4 ring-primary/20"
            : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 hover:bg-zinc-800"
        }`}
      >
        <div className="relative">
          <Terminal size={18} />
          {logs.length > 0 && !isConsoleOpen && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary border-2 border-zinc-900 rounded-full animate-bounce" />
          )}
        </div>
      </Button>
    </>
  );
}
