Core.Object.extend('Core.HttpRequest', 
/**@lends Core.HttpRequest#*/
{
	url: undefined,
	method: 'GET',
	binary: false,
	request: undefined,

	/**
	*	@constructs
	*	@class
	*	@extends Core.Object
	*/
	constructor: function(config) {
		if('url' in config)
			this.setUrl(config.url);
		if('method' in config)
			this.setMethod(config.method);
		if('binary' in config)
			this.binary = config.binary;

//		if(Core.HttpRequest.supportXDomainRequest) {
//			this.request = new XDomainRequest();
//
//			var wrapperLoad = function() {
//				var httprequest = arguments.callee.httprequest;
//				httprequest.fireEvent('done');
//			}
//			wrapperLoad.httprequest = this;
//			this.request.onload = wrapperLoad;
//
//			var wrapperError = function() {
//				var httprequest = arguments.callee.httprequest;
//				httprequest.fireEvent('error');
//			}
//			wrapperError.httprequest = this;
//			this.request.onerror = wrapperError;
//
//			this.request.open(this.method, this.url);
//		}
//		else {
			this.request = new XMLHttpRequest();
			if(this.binary)
				this.request.overrideMimeType('text/plain; charset=x-user-defined');

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
//		}
		this.addEvents('error', 'done');
	},

	setUrl: function(url) {
		this.url = url;
	},

	setMethod: function(method) {
		this.method = method;
	},

	setRequestHeader: function(header, value) {
		this.request.setRequestHeader(header, value);
	},

	abort: function() {
		this.request.abort();
	},

	send: function() {
		if(this.url == undefined)
			throw('url MUST be given for an HttpRequest');

		this.request.open(this.method, this.url, true);
		this.request.send();
//		if((arguments == undefined) || (arguments == null))
//			this.request.send.apply(this.request, []);
//		else
//			this.request.send.apply(this.request, arguments);
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


//Core.HttpRequest.supportXDomainRequest = false;
//try {
//	new XDomainRequest();
//	Core.HttpRequest.supportXDomainRequest = true;
//}
//catch(e) {}

