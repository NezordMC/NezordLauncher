import { useState, useEffect } from "react";
import { LaunchGame } from "../../wailsjs/go/main/App";
import { EventsOn } from "../../wailsjs/runtime/runtime";
import { LaunchConfig } from "../components/LauncherForm";

export function useLauncher() {
  const [isLaunching, setIsLaunching] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const cancelDownloadListener = EventsOn("downloadStatus", (msg: string) => {
      setLogs((prev) => [...prev, `[DOWNLOAD] ${msg}`]);
    });

    const cancelLaunchListener = EventsOn("launchStatus", (msg: string) => {
      setLogs((prev) => [...prev, `[SYSTEM] ${msg}`]);
      if (msg.includes("Game closed")) {
        setIsLaunching(false);
      }
    });

    const cancelGameLogListener = EventsOn("gameLog", (msg: string) => {
      setLogs((prev) => [...prev, msg]);
    });

    const cancelErrorListener = EventsOn("launchError", (msg: string) => {
      setLogs((prev) => [...prev, `[ERROR] ${msg}`]);
      setIsLaunching(false);
    });

    return () => {
      cancelDownloadListener();
      cancelLaunchListener();
      cancelGameLogListener();
      cancelErrorListener();
    };
  }, []);

  const launch = async (config: LaunchConfig) => {
    setIsLaunching(true);
    setLogs([
      `[COMMAND] Initializing launch sequence for ${config.version}...`,
    ]);

    try {
      await LaunchGame(config.version, config.ram, config.username);
    } catch (e) {
      setLogs((prev) => [...prev, `[FATAL] Backend call failed: ${e}`]);
      setIsLaunching(false);
    }
  };

  return {
    isLaunching,
    logs,
    launch,
  };
}
