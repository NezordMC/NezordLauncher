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

