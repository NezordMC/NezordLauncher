import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Terminal } from "lucide-react";

interface ConsoleProps {
  logs: string[];
}

export function Console({ logs }: ConsoleProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <Card className="w-full h-full bg-black/80 border-zinc-800 p-3 font-mono text-[10px] overflow-hidden flex flex-col no-drag shadow-inner relative group">
      <div className="absolute top-2 right-2 opacity-20 group-hover:opacity-50 transition-opacity">
        <Terminal size={14} />
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 pr-2 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
        {logs.length === 0 && (
          <div className="text-zinc-700 italic flex items-center gap-2 h-full justify-center">
            <div className="w-2 h-2 bg-zinc-800 animate-pulse rounded-full"></div>
            System Idle. Ready for commands.
          </div>
        )}
        {logs.map((log, index) => (
          <div
            key={index}
            className="break-all flex leading-relaxed hover:bg-white/5 px-1 rounded transition-colors"
          >
            <span className="text-zinc-700 mr-2 select-none shrink-0">
              &gt;
            </span>
            <span
              className={
                log.includes("[ERROR]") || log.includes("[FATAL]")
                  ? "text-red-500 font-bold"
                  : log.includes("[GAME]")
                    ? "text-blue-400"
                    : log.includes("[DOWNLOAD]")
                      ? "text-emerald-500"
                      : log.includes("[COMMAND]")
                        ? "text-yellow-500"
                        : "text-zinc-400"
              }
            >
              {log}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </Card>
  );
}
