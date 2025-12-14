import { useState, useEffect } from "react";

import {
  LaunchGame,
  DownloadVersion,
  GetAccounts,
  AddOfflineAccount,
  SetActiveAccount,
  GetActiveAccount,
} from "../../wailsjs/go/main/App";
import { EventsOn } from "../../wailsjs/runtime/runtime";

export interface Account {
  uuid: string;
  username: string;
  type: string;
}

export function useLauncher() {
  const [isLaunching, setIsLaunching] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [activeAccount, setActiveAccountState] = useState<Account | null>(null);

  useEffect(() => {
    refreshAccounts();

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

  const refreshAccounts = async () => {
    try {
      const accs = await GetAccounts();
      setAccounts(accs || []);
      const active = await GetActiveAccount();
      setActiveAccountState(active);
    } catch (e) {
      console.error("Failed to load accounts", e);
    }
  };

  const addOfflineAccount = async (username: string) => {
    try {
      await AddOfflineAccount(username);
      await refreshAccounts();
    } catch (e) {
      setLogs((p) => [...p, `[ERROR] Failed to add account: ${e}`]);
    }
  };

  const switchAccount = async (uuid: string) => {
    try {
      await SetActiveAccount(uuid);
      await refreshAccounts();
    } catch (e) {
      console.error("Failed to switch account", e);
    }
  };

  const launch = async (config: { version: string; ram: number }) => {
    if (isLaunching) return;
    if (!activeAccount) {
      setLogs((p) => [...p, `[ERROR] No account selected!`]);
      return;
    }

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
        `[COMMAND] Artifacts verified. Launching as ${activeAccount.username}...`,
      ]);

      await LaunchGame(config.version, config.ram);
    } catch (e) {
      setLogs((p) => [...p, `[FATAL] Sequence aborted: ${e}`]);
      setIsLaunching(false);
    }
  };

  return {
    isLaunching,
    logs,
    launch,
    accounts,
    activeAccount,
    addOfflineAccount,
    switchAccount,
  };
}
