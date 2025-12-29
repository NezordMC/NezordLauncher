export interface Account {
  uuid: string;
  username: string;
  type: string;
}

export interface Version {
  id: string;
  type: string;
}

export interface InstanceSettings {
  ramMB: number;
  javaPath: string;
  resolutionW: number;
  resolutionH: number;
  jvmArgs: string;
  overrideJava: boolean;
  overrideRam: boolean;
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
  settings: InstanceSettings;
}

export interface JavaInfo {
  path: string;
  version: string;
  major: number;
}

export interface GlobalDefaults {
  ram: number;
  width: number;
  height: number;
  jvmArgs: string;
}
