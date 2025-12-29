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

function useGameLaunchLogic() {
  const [isLaunching, setIsLaunching] = useState(false);
  const [isConsoleOpen, setConsoleOpen] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const cleanups = [
      EventsOn("downloadStatus", (msg: string) =>
        setLogs((p) => [...p, `[DOWNLOAD] ${msg}`]),
      ),
      EventsOn("launchStatus", (msg: string) => {
        setLogs((p) => [...p, `[SYSTEM] ${msg}`]);
        if (msg.includes("Game closed")) setIsLaunching(false);
      }),
      EventsOn("gameLog", (msg: string) => setLogs((p) => [...p, msg])),
      EventsOn("launchError", (msg: string) => {
        setLogs((p) => [...p, `[ERROR] ${msg}`]);
        setIsLaunching(false);
        setConsoleOpen(true);
      }),
    ];
    return () => cleanups.forEach((c) => c());
  }, []);

  const launchInstance = async (id: string, activeAccount: Account | null) => {
    if (isLaunching) return;
    if (!activeAccount) {
      setLogs((p) => [...p, `[ERROR] No account selected!`]);
      setConsoleOpen(true);
      return;
    }

    setIsLaunching(true);
    setConsoleOpen(true);
    setLogs([]);

    try {
      setLogs((p) => [...p, `[COMMAND] Launching Instance ${id}...`]);
      await LaunchInstance(id);
    } catch (e: any) {
      if (e && e.includes && e.includes("cancelled")) {
        setLogs((p) => [...p, `[SYSTEM] Launch cancelled.`]);
      } else {
        setLogs((p) => [...p, `[FATAL] Sequence aborted: ${e}`]);
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
