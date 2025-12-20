export namespace auth {
	
	export class Account {
	    uuid: string;
	    username: string;
	    type: string;
	    accessToken: string;
	    clientToken: string;
	    userProperties?: any[];
	
	    static createFrom(source: any = {}) {
	        return new Account(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.uuid = source["uuid"];
	        this.username = source["username"];
	        this.type = source["type"];
	        this.accessToken = source["accessToken"];
	        this.clientToken = source["clientToken"];
	        this.userProperties = source["userProperties"];
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
	        if ('string' === typeof source) source = JSON.parse(source);
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
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
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

export namespace system {
	
	export class SystemInfo {
	    OS: string;
	    Arch: string;
	
	    static createFrom(source: any = {}) {
	        return new SystemInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.OS = source["OS"];
	        this.Arch = source["Arch"];
	    }
	}

}

