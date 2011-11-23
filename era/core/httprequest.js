Core.Object.extend('Core.HttpRequest', 
/**@lends Core.HttpRequest#*/
{
	url: undefined,
	method: 'GET',
	binary: false,
	request: undefined,
	arguments: undefined,

	/**
	*	@constructs
	*	@class
	*	@extends Core.Object
	*/
	constructor: function(config) {
		this.addEvents('error', 'done');

		this.request = new XMLHttpRequest();

		var wrapper = function() {
			var httprequest = arguments.callee.httprequest;
			if(httprequest.request.readyState == 4) {
				if(httprequest.request.status == 200)
					httprequest.fireEvent('done', httprequest);
				else
					httprequest.fireEvent('error', httprequest, httprequest.request.status);
			}
		}
		wrapper.httprequest = this;
		this.request.onreadystatechange = wrapper;
	},

	setUrl: function(url) {
		this.url = url;
	},

	setBinary: function(binary) {
		this.binary = binary;
	},

	setMethod: function(method) {
		this.method = method;
	},

	setRequestHeader: function(header, value) {
		this.request.setRequestHeader(header, value);
	},

	setArguments: function(arguments) {
		this.arguments = arguments;
	},

	addArgument: function(argName, argValue) {
		if(this.arguments == undefined)
			this.arguments = {};
		this.arguments[argName] = argValue;
	},

	abort: function() {
		this.request.abort();
	},

	send: function() {
		if(this.url == undefined)
			throw('url MUST be given for an HttpRequest');
		// encode arguments
		var args = '';
		if(this.arguments != undefined) {
			args = Core.Util.encodeURIQuery(this.arguments);
		}
		var url = this.url;
		if((this.method == 'GET') && (args != '')) {
			if(this.url.indexOf('?') == -1)
				url += '?'+args;
			else
				url += '&'+args;
		}
		this.request.open(this.method, url, true);
		if(this.binary)
			this.request.overrideMimeType('text/plain; charset=x-user-defined');
		this.request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
		if(this.method == 'POST')
			this.request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		if((this.method == 'POST') && (args != ''))
			this.request.send(args);
		else
			this.request.send();
	},

	getResponseText: function() {
		return this.request.responseText;
	},

	getResponseBase64: function() {
		var value = this.request.responseText;
		var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
		var res = '';
		var i = 0;
		while(i + 2 < value.length) {
			var val1 = value.charCodeAt(i++) & 0xff;
			var val2 = value.charCodeAt(i++) & 0xff;
			var val3 = value.charCodeAt(i++) & 0xff;
			var enc1 = code[val1 >> 2];
			var enc2 = code[((val1 & 3) << 4) | (val2 >> 4)];
			var enc3 = code[((val2 & 15) << 2) | (val3 >> 6)];
			var enc4 = code[val3 & 63];
			res += enc1+enc2+enc3+enc4;
		}
		// 2 bytes
		if(i + 1 < value.length) {
			var val1 = value.charCodeAt(i++) & 0xff;
			var val2 = value.charCodeAt(i++) & 0xff;
			var enc1 = code[val1 >> 2];
			var enc2 = code[((val1 & 3) << 4) | (val2 >> 4)];
			var enc3 = code[(val2 & 15) << 2];
			res += enc1+enc2+enc3+'=';
		}
		// 1 byte
		else if(i < value.length) {
			var val1 = value.charCodeAt(i++) & 0xff;
			var enc1 = code[val1 >> 2];
			var enc2 = code[(val1 & 3) << 4];
			res += enc1+enc2+'==';
		}
		return res;
	},

	getResponseJSON: function() {
		var res;
		try {
			res = JSON.parse(this.getResponseText());
		}
		catch(err) {
			res = undefined;
		}
		return res;
	},

	getResponseXML: function() {
		var parser=new DOMParser();
		try {
			var xmlDoc = parser.parseFromString(this.getResponseText(), 'text/xml');
			return xmlDoc;
		} catch(e) {}
		return undefined;
	}
});

