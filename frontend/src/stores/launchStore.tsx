import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { LaunchInstance, CancelDownload } from "../../wailsjs/go/main/App";
import { EventsOn } from "../../wailsjs/runtime/runtime";
import { Account } from "../types";
import { toast } from "sonner";

function useGameLaunchLogic() {
  const [isLaunching, setIsLaunching] = useState(false);
  const [isConsoleOpen, setConsoleOpen] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [downloadProgress, setDownloadProgress] = useState<string>("");

  const addLog = (msg: string) => {
    setLogs((prev) => {
      if (prev.length > 1000) {
        return [...prev.slice(prev.length - 1000), msg];
      }
      return [...prev, msg];
    });
  };

  useEffect(() => {
    const cleanups = [
      EventsOn("downloadStatus", (msg: string) => addLog(`[DOWNLOAD] ${msg}`)),
      EventsOn("downloadProgress", (msg: string) => setDownloadProgress(msg)),
      EventsOn("launchStatus", (msg: string) => {
        addLog(`[SYSTEM] ${msg}`);
        if (msg.includes("Game closed")) setIsLaunching(false);
      }),
      EventsOn("gameLog", (msg: string) => addLog(msg)),
      EventsOn("launchError", (msg: string) => {
        addLog(`[ERROR] ${msg}`);
        setIsLaunching(false);
        setConsoleOpen(true);
      }),
    ];
    return () => cleanups.forEach((c) => c());
  }, []);

  const launchInstance = async (id: string, activeAccount: Account | null) => {
    if (isLaunching) return;
    if (!activeAccount) {
      addLog(`[ERROR] No account selected!`);
      toast.error("No account selected! Please select an account first.");
      setConsoleOpen(true);
      return;
    }

    setIsLaunching(true);
    setConsoleOpen(true);
    setLogs([]);

    try {
      addLog(`[COMMAND] Launching Instance ${id}...`);
      await LaunchInstance(id);
    } catch (e: any) {
      if (e && e.includes && e.includes("cancelled")) {
        addLog(`[SYSTEM] Launch cancelled.`);
        toast.info("Launch cancelled.");
      } else {
        addLog(`[FATAL] Sequence aborted: ${e}`);
        toast.error(`Launch failed: ${e}`);
      }
      setIsLaunching(false);
    }
  };

  const stopLaunch = async () => {
    try {
      await CancelDownload();
    } catch (e) {
      console.error(e);
    }
  };

  const toggleConsole = () => setConsoleOpen(!isConsoleOpen);

  return {
    isLaunching,
    logs,
    downloadProgress,
    isConsoleOpen,
    toggleConsole,
    launchInstance,
    stopLaunch,
  };
}

const LaunchContext = createContext<ReturnType<
  typeof useGameLaunchLogic
> | null>(null);

export function LaunchProvider({ children }: { children: ReactNode }) {
  const store = useGameLaunchLogic();
  return (
    <LaunchContext.Provider value={store}>{children}</LaunchContext.Provider>
  );
}

export function useLaunchStore() {
  const context = useContext(LaunchContext);
  if (!context) {
    throw new Error("useLaunchStore must be used within a LaunchProvider");
  }
  return context;
}
