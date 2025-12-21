import { useState, useEffect } from "react";
import {
  LaunchGame,
  DownloadVersion,
  GetAccounts,
  AddOfflineAccount,
  LoginElyBy,
  SetActiveAccount,
  GetActiveAccount,
  GetVanillaVersions,
  GetFabricLoaders,
  GetQuiltLoaders,
} from "../../wailsjs/go/main/App";
import { EventsOn } from "../../wailsjs/runtime/runtime";
import { ModloaderType } from "../components/ModloaderSelector";

export interface Account {
  uuid: string;
  username: string;
  type: string;
}

export interface Version {
  id: string;
  type: string;
}

export function useLauncher() {
  const [isLaunching, setIsLaunching] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [activeAccount, setActiveAccountState] = useState<Account | null>(null);

  const [minecraftVersions, setMinecraftVersions] = useState<Version[]>([]);

  useEffect(() => {
    refreshAccounts();
    fetchVersions();

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

  const fetchVersions = async () => {
    try {
      const versions = await GetVanillaVersions();
      setMinecraftVersions(versions || []);
    } catch (e) {
      console.error("Failed to fetch versions", e);
    }
  };

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

  const fetchModloaders = async (
    mcVersion: string,
    type: ModloaderType,
  ): Promise<string[]> => {
    if (type === "vanilla") return [];
    try {
      if (type === "fabric") return await GetFabricLoaders(mcVersion);
      if (type === "quilt") return await GetQuiltLoaders(mcVersion);
    } catch (e) {
      console.error(`Failed to fetch ${type} loaders`, e);
    }
    return [];
  };

  const addOfflineAccount = async (username: string) => {
    try {
      await AddOfflineAccount(username);
      await refreshAccounts();
    } catch (e) {
      setLogs((p) => [...p, `[ERROR] Failed to add account: ${e}`]);
    }
  };

  const loginElyBy = async (u: string, p: string) => {
    try {
      await LoginElyBy(u, p);
      await refreshAccounts();
    } catch (e) {
      throw e;
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

  const launch = async (config: {
    version: string;
    ram: number;
    modloaderType: string;
    loaderVersion: string;
  }) => {
    if (isLaunching) return;
    if (!activeAccount) {
      setLogs((p) => [...p, `[ERROR] No account selected!`]);
      return;
    }

    setIsLaunching(true);
    setLogs([]);

    try {
      if (config.modloaderType === "vanilla") {
        setLogs((p) => [...p, `[COMMAND] Checking vanilla artifacts...`]);
        await DownloadVersion(config.version);
      } else {
        setLogs((p) => [
          ...p,
          `[COMMAND] Checking base artifacts for modloader...`,
        ]);
        await DownloadVersion(config.version);
      }

      setLogs((p) => [...p, `[COMMAND] Launching game sequence...`]);
      await LaunchGame(
        config.version,
        config.ram,
        config.modloaderType,
        config.loaderVersion,
      );
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
    loginElyBy,
    switchAccount,
    minecraftVersions,
    fetchModloaders,
  };
}
