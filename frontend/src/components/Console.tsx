import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";

interface ConsoleProps {
  logs: string[];
}

export function Console({ logs }: ConsoleProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <Card className="w-full h-full bg-black border-zinc-800 p-2 font-mono text-[10px] overflow-y-auto no-drag shadow-inner">
      <div className="flex flex-col space-y-0.5">
        {logs.length === 0 && (
          <div className="text-zinc-600 italic">Waiting for log stream...</div>
        )}
        {logs.map((log, index) => (
          <div key={index} className="break-all flex">
            <span className="text-zinc-600 mr-2 select-none">&gt;</span>
            <span
              className={
                log.includes("[ERROR]") || log.includes("Error")
                  ? "text-red-500"
                  : log.includes("[GAME]")
                    ? "text-blue-400"
                    : "text-zinc-300"
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
