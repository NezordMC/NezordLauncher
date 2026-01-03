import { useEffect, useRef } from "react";
import { Terminal, X, Trash2, ArrowDown } from "lucide-react";
import { useLaunchStore } from "@/stores/launchStore";
import { Button } from "@/components/ui/button";

export function Console() {
  const { logs, isConsoleOpen, toggleConsole } = useLaunchStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isConsoleOpen && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, isConsoleOpen]);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-800 shadow-2xl transition-all duration-300 ease-in-out z-50 flex flex-col ${
        isConsoleOpen ? "h-64 translate-y-0" : "h-64 translate-y-full"
      }`}
    >
      <div className="h-8 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-4 select-none">
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
          <Terminal size={12} className="text-primary" />
          <span>NEZORD CONSOLE</span>
          <span className="bg-zinc-800 px-1.5 rounded text-[10px]">
            {logs.length} lines
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-zinc-500 hover:text-white"
            onClick={toggleConsole}
          >
            <ArrowDown size={14} />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 font-mono text-[10px] space-y-1 bg-black/50 backdrop-blur-sm">
        {logs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-zinc-600 italic">
            Ready. Waiting for commands...
          </div>
        ) : (
          logs.map((log, index) => (
            <div
              key={index}
              className="break-all whitespace-pre-wrap flex gap-2"
            >
              <span className="text-zinc-600 select-none">[{index + 1}]</span>
              <span
                className={
                  log.includes("[ERROR]") || log.includes("[FATAL]")
                    ? "text-red-400"
                    : log.includes("[SYSTEM]")
                      ? "text-blue-400"
                      : log.includes("[COMMAND]")
                        ? "text-primary font-bold"
                        : log.includes("[DOWNLOAD]")
                          ? "text-yellow-400"
                          : "text-zinc-300"
                }
              >
                {log}
              </span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
