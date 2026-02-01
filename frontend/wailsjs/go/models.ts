export namespace auth {
  export class Account {
    uuid: string;
    username: string;
    type: string;
    userProperties?: any[];

    static createFrom(source: any = {}) {
      return new Account(source);
    }

    constructor(source: any = {}) {
      if ("string" === typeof source) source = JSON.parse(source);
      this.uuid = source["uuid"];
      this.username = source["username"];
      this.type = source["type"];
      this.userProperties = source["userProperties"];
    }
  }
}

export namespace instances {
  export class InstanceSettings {
    ramMB: number;
    javaPath: string;
    resolutionW: number;
    resolutionH: number;
    jvmArgs: string;
    overrideJava: boolean;
    overrideRam: boolean;
    gpuPreference: string;

    static createFrom(source: any = {}) {
      return new InstanceSettings(source);
    }

    constructor(source: any = {}) {
      if ("string" === typeof source) source = JSON.parse(source);
      this.ramMB = source["ramMB"];
      this.javaPath = source["javaPath"];
      this.resolutionW = source["resolutionW"];
      this.resolutionH = source["resolutionH"];
      this.jvmArgs = source["jvmArgs"];
      this.overrideJava = source["overrideJava"];
      this.overrideRam = source["overrideRam"];
      this.gpuPreference = source["gpuPreference"];
    }
  }
  export class Instance {
    id: string;
    name: string;
    icon: string;
    gameVersion: string;
    modloaderType: string;
    modloaderVersion: string;
    installState: string;
    settings: InstanceSettings;
    // Go type: time
    created: any;
    // Go type: time
    lastPlayed: any;
    playTime: number;

    static createFrom(source: any = {}) {
      return new Instance(source);
    }

    constructor(source: any = {}) {
      if ("string" === typeof source) source = JSON.parse(source);
      this.id = source["id"];
      this.name = source["name"];
      this.icon = source["icon"];
      this.gameVersion = source["gameVersion"];
      this.modloaderType = source["modloaderType"];
      this.modloaderVersion = source["modloaderVersion"];
      this.installState = source["installState"];
      this.settings = this.convertValues(source["settings"], InstanceSettings);
      this.created = this.convertValues(source["created"], null);
      this.lastPlayed = this.convertValues(source["lastPlayed"], null);
      this.playTime = source["playTime"];
    }

    convertValues(a: any, classs: any, asMap: boolean = false): any {
      if (!a) {
        return a;
      }
      if (a.slice && a.map) {
        return (a as any[]).map((elem) => this.convertValues(elem, classs));
      } else if ("object" === typeof a) {
        if (asMap) {
          for (const key of Object.keys(a)) {
            a[key] = new classs(a[key]);
          }
          return a;
        }
        return new classs(a);
      }
      return a;
    }
  }
}

export namespace javascanner {
  export class JavaInfo {
    path: string;
    version: string;
    major: number;

    static createFrom(source: any = {}) {
      return new JavaInfo(source);
    }

    constructor(source: any = {}) {
      if ("string" === typeof source) source = JSON.parse(source);
      this.path = source["path"];
      this.version = source["version"];
      this.major = source["major"];
    }
  }
}

export namespace models {
  export class Version {
    id: string;
    type: string;
    url: string;
    // Go type: time
    time: any;
    // Go type: time
    releaseTime: any;
    sha1: string;
    complianceLevel: number;

    static createFrom(source: any = {}) {
      return new Version(source);
    }

    constructor(source: any = {}) {
      if ("string" === typeof source) source = JSON.parse(source);
      this.id = source["id"];
      this.type = source["type"];
      this.url = source["url"];
      this.time = this.convertValues(source["time"], null);
      this.releaseTime = this.convertValues(source["releaseTime"], null);
      this.sha1 = source["sha1"];
      this.complianceLevel = source["complianceLevel"];
    }

    convertValues(a: any, classs: any, asMap: boolean = false): any {
      if (!a) {
        return a;
      }
      if (a.slice && a.map) {
        return (a as any[]).map((elem) => this.convertValues(elem, classs));
      } else if ("object" === typeof a) {
        if (asMap) {
          for (const key of Object.keys(a)) {
            a[key] = new classs(a[key]);
          }
          return a;
        }
        return new classs(a);
      }
      return a;
    }
  }
}

export namespace settings {
  export class LauncherSettings {
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

    static createFrom(source: any = {}) {
      return new LauncherSettings(source);
    }

    constructor(source: any = {}) {
      if ("string" === typeof source) source = JSON.parse(source);
      this.language = source["language"];
      this.theme = source["theme"];
      this.closeAction = source["closeAction"];
      this.dataPath = source["dataPath"];
      this.windowMode = source["windowMode"];
      this.defaultRamMB = source["defaultRamMB"];
      this.defaultResolutionW = source["defaultResolutionW"];
      this.defaultResolutionH = source["defaultResolutionH"];
      this.defaultJvmArgs = source["defaultJvmArgs"];
      this.defaultJavaPath = source["defaultJavaPath"];
      this.autoUpdateEnabled = source["autoUpdateEnabled"];
      this.gpuPreference = source["gpuPreference"];
    }
  }
}

export namespace system {
  export class SystemInfo {
    OS: string;
    Arch: string;

    static createFrom(source: any = {}) {
      return new SystemInfo(source);
    }

    constructor(source: any = {}) {
      if ("string" === typeof source) source = JSON.parse(source);
      this.OS = source["OS"];
      this.Arch = source["Arch"];
    }
  }
}

export namespace updater {
  export class UpdateInfo {
    available: boolean;
    version: string;
    url: string;
    description: string;

    static createFrom(source: any = {}) {
      return new UpdateInfo(source);
    }

    constructor(source: any = {}) {
      if ("string" === typeof source) source = JSON.parse(source);
      this.available = source["available"];
      this.version = source["version"];
      this.url = source["url"];
      this.description = source["description"];
    }
  }
}
