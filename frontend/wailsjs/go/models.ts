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

