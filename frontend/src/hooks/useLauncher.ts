import { useState, useEffect } from "react";
import {
  LaunchInstance, 
  CreateInstance, 
  GetInstances, 
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


export interface Instance {
  id: string;
  name: string;
  gameVersion: string;
  modloaderType: string;
  modloaderVersion: string;
  created: string;
  lastPlayed: string;
  playTime: number;
}

export function useLauncher() {
  const [isLaunching, setIsLaunching] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [activeAccount, setActiveAccountState] = useState<Account | null>(null);

  
  const [minecraftVersions, setMinecraftVersions] = useState<Version[]>([]);

  
  const [instances, setInstances] = useState<Instance[]>([]);

  
  useEffect(() => {
    refreshAccounts();
    fetchVersions();
    refreshInstances(); 

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

  
  const refreshInstances = async () => {
    try {
      const list = await GetInstances();
      setInstances(list || []);
    } catch (e) {
      console.error("Failed to load instances", e);
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
      
      
      

      const tempInstanceName = `QuickPlay-${config.version}`;
      setLogs((p) => [
        ...p,
        `[SYSTEM] Creating temporary instance: ${tempInstanceName}...`,
      ]);

      
      
      const inst = await CreateInstance(
        tempInstanceName,
        config.version,
        config.modloaderType,
        config.loaderVersion,
      );

      
      setLogs((p) => [
        ...p,
        `[COMMAND] Checking artifacts for ${config.version}...`,
      ]);
      await DownloadVersion(config.version);

      setLogs((p) => [...p, `[COMMAND] Launching Instance ${inst.id}...`]);
      await LaunchInstance(inst.id);
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
    instances, 
  };
}
