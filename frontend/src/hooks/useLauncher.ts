import { useState, useEffect } from "react";
import { LaunchGame, DownloadVersion } from "../../wailsjs/go/main/App";
import { EventsOn } from "../../wailsjs/runtime/runtime";
import { LaunchConfig } from "../components/LauncherForm";

export function useLauncher() {
  const [isLaunching, setIsLaunching] = useState(false);
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
      }),
    ];
    return () => cleanups.forEach((c) => c());
  }, []);

  const launch = async (config: LaunchConfig) => {
    if (isLaunching) return;
    setIsLaunching(true);
    setLogs([]);

    try {
      setLogs((p) => [
        ...p,
        `[COMMAND] Checking artifacts for version ${config.version}...`,
      ]);
      await DownloadVersion(config.version);

      setLogs((p) => [
        ...p,
        `[COMMAND] Artifacts verified. Initializing launch sequence...`,
      ]);
      await LaunchGame(config.version, config.ram, config.username);
    } catch (e) {
      setLogs((p) => [...p, `[FATAL] Sequence aborted: ${e}`]);
      setIsLaunching(false);
    }
  };

  return { isLaunching, logs, launch };
}
