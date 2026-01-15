import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import {
  LaunchInstance,
  CancelDownload,
  StartInstanceDownload,
} from "../../wailsjs/go/main/App";
import { EventsOn } from "../../wailsjs/runtime/runtime";
import { Account } from "../types";
import { toast } from "sonner";

interface DownloadProgress {
  current: number;
  total: number;
  status: "downloading" | "completed" | "failed" | "idle";
}

function useGameLaunchLogic() {
  const [launchingInstanceId, setLaunchingInstanceId] = useState<string | null>(
    null,
  );
  const [isConsoleOpen, setConsoleOpen] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [downloadProgress, setDownloadProgress] = useState<
    Record<string, DownloadProgress>
  >({});
  const [currentDownloadId, setCurrentDownloadId] = useState<string | null>(
    null,
  );

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
      EventsOn("downloadProgress", (msg: string) => {
        addLog(`[DOWNLOAD] Progress: ${msg}`);
        if (currentDownloadId) {
          const parts = msg.split("/");
          if (parts.length === 2) {
            const current = parseInt(parts[0], 10);
            const total = parseInt(parts[1], 10);
            setDownloadProgress((prev) => ({
              ...prev,
              [currentDownloadId]: { current, total, status: "downloading" },
            }));
          }
        }
      }),
      EventsOn("downloadComplete", () => {
        if (currentDownloadId) {
          setDownloadProgress((prev) => ({
            ...prev,
            [currentDownloadId]: {
              ...prev[currentDownloadId],
              status: "completed",
            },
          }));
          setCurrentDownloadId(null);
        }
      }),
      EventsOn("downloadError", () => {
        if (currentDownloadId) {
          setDownloadProgress((prev) => ({
            ...prev,
            [currentDownloadId]: {
              ...prev[currentDownloadId],
              status: "failed",
            },
          }));
          setCurrentDownloadId(null);
        }
      }),
      EventsOn("launchStatus", (msg: string) => {
        addLog(`[SYSTEM] ${msg}`);
        if (msg.includes("Game closed")) setLaunchingInstanceId(null);
      }),
      EventsOn("gameLog", (msg: string) => addLog(`[GAME] ${msg}`)),
      EventsOn("launchError", (msg: string) => {
        addLog(`[ERROR] ${msg}`);
        setLaunchingInstanceId(null);
        setConsoleOpen(true);
      }),
    ];
    return () => cleanups.forEach((c) => c());
  }, [currentDownloadId]);

  const startDownload = async (instanceId: string) => {
    setCurrentDownloadId(instanceId);
    setDownloadProgress((prev) => ({
      ...prev,
      [instanceId]: { current: 0, total: 0, status: "downloading" },
    }));
    setConsoleOpen(true);

    try {
      addLog(`[COMMAND] Starting download for instance ${instanceId}...`);
      await StartInstanceDownload(instanceId);
      setDownloadProgress((prev) => ({
        ...prev,
        [instanceId]: { ...prev[instanceId], status: "completed" },
      }));
    } catch (e: any) {
      addLog(`[ERROR] Download failed: ${e}`);
      setDownloadProgress((prev) => ({
        ...prev,
        [instanceId]: { ...prev[instanceId], status: "failed" },
      }));
      toast.error(`Download failed: ${e}`);
    } finally {
      setCurrentDownloadId(null);
    }
  };

  const launchInstance = async (id: string, activeAccount: Account | null) => {
    if (launchingInstanceId) return;
    if (!activeAccount) {
      addLog(`[ERROR] No account selected!`);
      toast.error("No account selected! Please select an account first.");
      setConsoleOpen(true);
      return;
    }

    setLaunchingInstanceId(id);
    setCurrentDownloadId(id);
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
      setLaunchingInstanceId(null);
    }
  };

  const stopLaunch = async () => {
    try {
      await CancelDownload();
      setLaunchingInstanceId(null);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleConsole = () => setConsoleOpen(!isConsoleOpen);

  return {
    launchingInstanceId,
    logs,
    downloadProgress,
    isConsoleOpen,
    toggleConsole,
    launchInstance,
    stopLaunch,
    startDownload,
    setConsoleOpen,
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
