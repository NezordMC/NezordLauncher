import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useRef,
} from "react";
import {
  LaunchInstance,
  CancelDownload,
  StartInstanceDownload,
  StopInstance,
} from "../../wailsjs/go/main/App";
import { EventsOn } from "../../wailsjs/runtime/runtime";
import { Account, EventPayload } from "../types";
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
  const currentDownloadIdRef = useRef<string | null>(null);

  const addLog = (msg: string) => {
    setLogs((prev) => {
      if (prev.length > 1000) {
        return [...prev.slice(prev.length - 1000), msg];
      }
      return [...prev, msg];
    });
  };

  useEffect(() => {
    currentDownloadIdRef.current = currentDownloadId;
  }, [currentDownloadId]);

  useEffect(() => {
    const resolveInstanceId = (payload: EventPayload) =>
      payload.instanceId || currentDownloadIdRef.current;

    const cleanups = [
      EventsOn("download.status", (payload: EventPayload) => {
        const status = payload.status || "unknown";
        const message = payload.message || "No message";
        addLog(`[DOWNLOAD][${status.toUpperCase()}] ${message}`);
      }),
      EventsOn("download.progress", (payload: EventPayload) => {
        const instanceId = resolveInstanceId(payload);
        if (!instanceId) return;

        const current = payload.current || 0;
        const total = payload.total || 0;
        addLog(`[DOWNLOAD] Progress: ${current}/${total}`);
        setDownloadProgress((prev) => ({
          ...prev,
          [instanceId]: { current, total, status: "downloading" },
        }));
      }),
      EventsOn("download.complete", (payload: EventPayload) => {
        const instanceId = resolveInstanceId(payload);
        if (!instanceId) return;

        setDownloadProgress((prev) => ({
          ...prev,
          [instanceId]: {
            ...prev[instanceId],
            status: "completed",
          },
        }));
        if (currentDownloadIdRef.current === instanceId) {
          setCurrentDownloadId(null);
        }
      }),
      EventsOn("download.error", (payload: EventPayload) => {
        const instanceId = resolveInstanceId(payload);
        const errorMessage =
          payload.error?.cause || payload.error?.message || payload.message || "Download failed";
        addLog(`[ERROR] ${errorMessage}`);

        if (instanceId) {
          setDownloadProgress((prev) => ({
            ...prev,
            [instanceId]: {
              ...prev[instanceId],
              status: "failed",
            },
          }));
          if (currentDownloadIdRef.current === instanceId) {
            setCurrentDownloadId(null);
          }
        }
      }),
      EventsOn("launch.status", (payload: EventPayload) => {
        const message = payload.message || "No message";
        addLog(`[SYSTEM] ${message}`);
        if (message.includes("Game closed")) setLaunchingInstanceId(null);
      }),
      EventsOn("launch.game.log", (payload: EventPayload) => {
        addLog(`[GAME] ${payload.message || ""}`);
      }),
      EventsOn("launch.error", (payload: EventPayload) => {
        const message =
          payload.error?.cause || payload.error?.message || payload.message || "Unknown launch error";
        addLog(`[ERROR] ${message}`);
        setLaunchingInstanceId(null);
        setConsoleOpen(true);
      }),
      EventsOn("launch.exit", () => {
        setLaunchingInstanceId(null);
      }),
      EventsOn("app.log.error", (payload: EventPayload) => {
        const message =
          payload.error?.cause || payload.error?.message || payload.message || "Unknown app error";
        addLog(`[APP ERROR] ${message}`);
      }),
    ];
    return () => cleanups.forEach((c) => c());
  }, []);

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

      setDownloadProgress((prev) => ({
        ...prev,
        [id]: { ...prev[id], status: "idle" },
      }));
      setCurrentDownloadId(null);
    } catch (e: any) {
      if (e && e.includes && e.includes("cancelled")) {
        addLog(`[SYSTEM] Launch cancelled.`);
        toast.info("Launch cancelled.");
      } else {
        addLog(`[FATAL] Sequence aborted: ${e}`);
        toast.error(`Launch failed: ${e}`);
      }
      setLaunchingInstanceId(null);
      setCurrentDownloadId(null);
      setDownloadProgress((prev) => ({
        ...prev,
        [id]: { ...prev[id], status: "idle" },
      }));
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

  const stopInstance = async (id: string) => {
    try {
      addLog(`[COMMAND] Stopping Instance ${id}...`);
      await StopInstance(id);
    } catch (e: any) {
      addLog(`[ERROR] Failed to stop instance: ${e}`);
      toast.error(`Failed to stop instance: ${e}`);
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
    stopInstance,
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
