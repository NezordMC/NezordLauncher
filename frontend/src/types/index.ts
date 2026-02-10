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
  gpuPreference: string;
  wrapperCommand: string;
}

export interface Instance {
  id: string;
  name: string;
  gameVersion: string;
  modloaderType: string;
  modloaderVersion: string;
  created: string;
  installState: string;
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
  javaPath: string;
}

export interface LauncherSettings {
  language: string;
  theme: string;
  closeAction: string;
  dataPath: string;
  windowMode: string;
  defaultRamMB: number;
  defaultResolutionW: number;
  defaultResolutionH: number;
  defaultJvmArgs: string;
  defaultJavaPath: string;
  autoUpdateEnabled: boolean;
  gpuPreference: string;
  wrapperCommand: string;
}

export interface EventErrorPayload {
  code: string;
  message: string;
  cause?: string;
}

export interface EventPayload {
  timestamp: string;
  source: string;
  instanceId?: string;
  status?: string;
  message?: string;
  current?: number;
  total?: number;
  meta?: unknown;
  error?: EventErrorPayload;
}
