import { useEffect, useRef } from "react";
import { Terminal, ArrowDown } from "lucide-react";
import { useLaunchStore } from "@/stores/launchStore";
import { Button } from "@/components/ui/button";
import { useVirtualizer } from "@tanstack/react-virtual";

export function Console() {
  const { logs, isConsoleOpen, toggleConsole } = useLaunchStore();
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: logs.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 18,
    overscan: 5,
  });

  useEffect(() => {
    if (isConsoleOpen && logs.length > 0) {
      virtualizer.scrollToIndex(logs.length - 1);
    }
  }, [logs.length, isConsoleOpen, virtualizer]);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 flex flex-col transition-transform duration-300 ease-in-out ${
        isConsoleOpen ? "translate-y-0" : "translate-y-full"
      }`}
      style={{ height: "16rem" }}
    >
      <div className="h-8 bg-zinc-900 border-t border-b border-zinc-800 flex items-center justify-between px-4 select-none shadow-lg">
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

      <div
        ref={parentRef}
        className="flex-1 overflow-y-auto p-4 font-mono text-[10px] bg-black/90 backdrop-blur-md"
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const log = logs[virtualRow.index];
            return (
              <div
                key={virtualRow.index}
                data-index={virtualRow.index}
                ref={virtualizer.measureElement}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                className="break-all whitespace-pre-wrap flex gap-2"
              >
                <span className="text-zinc-600 select-none min-w-[30px] text-right">
                  [{virtualRow.index + 1}]
                </span>
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
            );
          })}
        </div>
      </div>
    </div>
  );
}
