
navigator.isGecko = (navigator.userAgent.match(/Gecko\//i) != null);
navigator.isWebkit = (navigator.userAgent.match(/WebKit\//i) != null);

navigator.isIE = (navigator.userAgent.match(/MSIE/i) != null);
navigator.isIE7 = (navigator.userAgent.match(/MSIE 7\./i) != null);
navigator.isIE8 = (navigator.userAgent.match(/MSIE 8\./i) != null);

navigator.isOpera =  ((navigator.userAgent == undefined) || (navigator.userAgent.match(/Opera\//i) != null));

navigator.isChrome = (navigator.userAgent.match(/ Chrome\//) != null);

navigator.isSafari = (navigator.userAgent.match(/ Safari\//) != null);

navigator.isFirefox = (navigator.userAgent.match(/ Firefox\//) != null);
navigator.isFirefox3 = (navigator.userAgent.match(/ Firefox\/3\./) != null);
navigator.isFirefox3_5 = (navigator.userAgent.match(/ Firefox\/3\.5\./) != null);
navigator.isFirefox3_6 = (navigator.userAgent.match(/ Firefox\/3\.6\./) != null);

navigator.iPad = (navigator.userAgent.match(/iPad/i) != null);
navigator.iPhone = (navigator.userAgent.match(/iPhone/i) != null);
navigator.iOs = navigator.iPad || navigator.iPhone;

navigator.Android = (navigator.userAgent.match(/Android/i) != null);

var svgNS = "http://www.w3.org/2000/svg";
var htmlNS = "http://www.w3.org/1999/xhtml";


//if(navigator.userAgent.match(/MSIE 9/i) != null) {
//	meta = document.createElement('meta');
//	meta['http-equiv'] = 'X-UA-Compatible';
//	meta.content = 'IE=IE9';
//	document.getElementsByTagName("head")[0].insertBefore(meta,document.getElementsByTagName("head")[0].firstChild);
//}

navigator.supportSVG = false;
try {
	var test = document.createElementNS(svgNS, 'g');
	if('ownerSVGElement' in test)
		navigator.supportSVG = true;
} catch(e) {}

var test = document.createElement('canvas');
navigator.supportCanvas = 'getContext' in test;

navigator.supportRgba = true;
navigator.supportRgb = true;
var test = document.createElement('div');
try {
	test.style.background = 'rgba(0, 0, 0, 0.5)';
} catch(e) {
	navigator.supportRgba = false;
}
try {
	test.style.background = 'rgb(0, 0, 0)';
} catch(e) {
	navigator.supportRgb = false;
}

/**
*	@namespace Regroup all the non Ui related classes : event, object, httprequest etc. 
*/
Core = {};

/**
*	@namespace	A set of utilities.
*/
Core.Util = {};

Core.Util.idGenerator = 0;
Core.Util.generateId = function() {
	return ++Core.Util.idGenerator;
};

Core.Util.baseDirectory = function(file) {
	var scripts;
	if(document.scripts != undefined)
		scripts = document.scripts;
	else
		scripts = document.getElementsByTagName('script');
	for(var i = 0; i < scripts.length; i++) {
		var pos = scripts[i].src.search(file);
		if(pos != -1)
			return scripts[i].src.substring(0, pos);
	}
	return undefined;
};

Core.Util.include = function(fileName) {
   	document.write("<script type='text/javascript' src='"+fileName+"'></script>");
}

Core.Util.clone = function(obj) {
	if(obj === null || typeof(obj) !== 'object')
		return null;
	var clone = {};
	for(var prop in obj)
		clone[prop] = obj[prop];
    return clone;
};

Core.Util.encodeURIQuery = function(obj) {
	// encode arguments
	var args = '';
	if(obj != undefined) {
		for(var prop in obj) {
			var propValue = obj[prop];
			if((typeof(propValue) != 'number') && (typeof(propValue) != 'string') &&  (typeof(propValue) != 'boolean') && (typeof(propValue) != 'object'))
				continue;
			if(args != '')
				args += '&';
			args += encodeURIComponent(prop)+'=';
			if(typeof(propValue) == 'object')
				args += encodeURIComponent(JSON.stringify(propValue));
			else
				args += encodeURIComponent(propValue);
		}
	}
	return args;
}

String.prototype.utf8Encode = function() {
	var res = '';
	for(var i = 0; i < this.length; i++) { 
		var c = this.charCodeAt(i); 
		if(c < 128)
			res += String.fromCharCode(c);
		else if((c >= 128) && (c < 2048)) {
			res += String.fromCharCode((c >> 6) | 192);
			res += String.fromCharCode((c & 63) | 128);
		}
		else {
			res += String.fromCharCode((c >> 12) | 224);
			res += String.fromCharCode(((c >> 6) & 63) | 128);
			res += String.fromCharCode((c & 63) | 128);
		}
	}
	return res;
};

String.prototype.utf8Decode = function() {
	var res = '';
	var i = 0;
	var c; 
	while(i < this.length) {
		c = this.charCodeAt(i++);
		if(c < 128)
			res += String.fromCharCode(c);
		else if((c >= 192) && (c < 224))
			res += String.fromCharCode(((c & 31) << 6) | (this.charCodeAt(i++) & 63));
		else
			res += String.fromCharCode(((c & 15) << 12) | ((this.charCodeAt(i++) & 63) << 6) | (this.charCodeAt(i++) & 63));
	}
	return res;
};

String.prototype.toBase64 = function() {
	var value = this.utf8Encode();
	var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
	var res = '';
	var i = 0;
	while(i + 2 < value.length) {
		var val1 = value.charCodeAt(i++) & 0xff;
		var val2 = value.charCodeAt(i++) & 0xff;
		var val3 = value.charCodeAt(i++) & 0xff;
		var enc1 = code.charAt(val1 >> 2);
		var enc2 = code.charAt(((val1 & 3) << 4) | (val2 >> 4));
		var enc3 = code.charAt(((val2 & 15) << 2) | (val3 >> 6));
		var enc4 = code.charAt(val3 & 63);
		res += enc1+enc2+enc3+enc4;
	}
	// 2 bytes
	if(i + 1 < value.length) {
		var val1 = value.charCodeAt(i++) & 0xff;
		var val2 = value.charCodeAt(i++) & 0xff;
		var enc1 = code.charAt(val1 >> 2);
		var enc2 = code.charAt(((val1 & 3) << 4) | (val2 >> 4));
		var enc3 = code.charAt((val2 & 15) << 2);
		res += enc1+enc2+enc3+'=';
	}
	// 1 byte
	else if(i < value.length) {
		var val1 = value.charCodeAt(i++) & 0xff;
		var enc1 = code.charAt(val1 >> 2);
		var enc2 = code.charAt((val1 & 3) << 4);
		res += enc1+enc2+'==';
	}
	return res;
};

String.prototype.fromBase64 = function() {
	var value = this;
	var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
	var res = '';
	var i = 0;
	while(i < value.length) {
		enc1 = code.indexOf(value.charAt(i++));
		enc2 = code.indexOf(value.charAt(i++));
		enc3 = code.indexOf(value.charAt(i++));
		enc4 = code.indexOf(value.charAt(i++));

		char1 = (enc1 << 2) | (enc2 >> 4);
		char2 = ((enc2 & 15) << 4) | (enc3 >> 2);
		char3 = ((enc3 & 3) << 6) | enc4;

		res += String.fromCharCode(char1);
		if(enc3 != 64) {
			res += String.fromCharCode(char2);
			if(enc4 != 64)
				res += String.fromCharCode(char3);
		}
	}
	return res.utf8Decode();
};

//Implement trim if it's not natively available
//Code from https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/String/Trim#Compatibility
if(!String.prototype.trim) {
  String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g,'');
  };
}

navigator.supportVML = false;

/**#nocode+ Avoid Jsdoc warnings...*/
// correct IE specific bugs
if(navigator.isIE) {
	if(navigator.supportSVG) {
		SVGTextContentElement.prototype.__getStartPositionOfChar = SVGTextContentElement.prototype.getStartPositionOfChar;
		SVGTextContentElement.prototype.getStartPositionOfChar = function(charnum) {
			var point = this.__getStartPositionOfChar(charnum);
			return point.matrixTransform(this.getScreenCTM().inverse());
		};
		SVGTextContentElement.prototype.__getEndPositionOfChar = SVGTextContentElement.prototype.getEndPositionOfChar;
		SVGTextContentElement.prototype.getEndPositionOfChar = function(charnum) {
			var point = this.__getEndPositionOfChar(charnum);
			return point.matrixTransform(this.getScreenCTM().inverse());
		};

		SVGTextContentElement.prototype.__getCharNumAtPosition = SVGTextContentElement.prototype.getCharNumAtPosition;
		SVGTextContentElement.prototype.getCharNumAtPosition = function(point) {
			return this.getCharNumAtPositionHelper(point.x, 0, this.getNumberOfChars()-1);
		};
		SVGTextContentElement.prototype.getCharNumAtPositionHelper = function(x, start, end) {
			startX = this.getStartPositionOfChar(start).x;
			endX = this.getEndPositionOfChar(end).x;
			if((x < startX) || (x > endX))
				return -1;
			if(start == end)
				return start;
			var middle = Math.floor((start + end)/2);
			var res = this.getCharNumAtPositionHelper(x, start, middle);
			if(res != -1)
				return res;
			return this.getCharNumAtPositionHelper(x, middle+1, end);
		};
	}
	// else, add support for VML
	else {
		if(!document.namespaces['vml']) {
			if(navigator.userAgent.match(/MSIE 8/i) != null)
				document.namespaces.add('vml', 'urn:schemas-microsoft-com:vml', '#default#VML');
			else
				document.namespaces.add('vml', 'urn:schemas-microsoft-com:vml');
		}
		var styleSheet = (document.styleSheets.length > 0) ? document.styleSheets[0] : document.createStyleSheet();
		styleSheet.addRule('vml\\:shape', 'behavior:url(#default#VML)');
		styleSheet.addRule('vml\\:fill', 'behavior:url(#default#VML)');
		styleSheet.addRule('vml\\:rect', 'behavior:url(#default#VML)');
		styleSheet.addRule('vml\\:roundrect', 'behavior:url(#default#VML)');
		navigator.supportVML = true;
	}
	// re-write elementFromPoint for IE7 & IE8 when in iframe because it dont work
	if((navigator.isIE7 || navigator.isIE8) && (window.parent != window)) {
		document.elementFromPoint = function(x, y, el) {
			if(el == undefined)
				el = document.body;
			if(!(('childNodes' in el) && ('offsetLeft' in el) && ('offsetTop' in el)))
				return undefined;
			for(var i = 0; i < el.childNodes.length; i++) {
				var res = document.elementFromPoint(x - el.offsetLeft, y - el.offsetTop, el.childNodes[i]);
				if(res != undefined)
					return res;
			}
			if((x >= el.offsetLeft) && (y >= el.offsetTop) && (x - el.offsetLeft <= el.clientWidth) && (y - el.offsetTop <= el.clientHeight))
				return el;
			return undefined;
		}
	}
}

// correct bug with high density screen on Chrome mobile
if(('devicePixelRatio' in window) && (devicePixelRatio != 1)) {
	var element = document.elementFromPoint(window.innerWidth+10, window.innerHeight+10);
	if(element != undefined) {
		document.__elementFromPoint = document.elementFromPoint;
		document.elementFromPoint = function(x,y) {
			return document.__elementFromPoint(x*devicePixelRatio, y*devicePixelRatio);
		};
	}
}

// correct Opera specific bugs
if(navigator.isOpera) {
	CanvasRenderingContext2D.prototype.arcTo = function(x1, y1, x2, y2, r) {
		// TODO: improve this with a correct interpolation
		this.quadraticCurveTo(x1, y1, x2, y2);
	};
}

if(window.JSON == undefined) {
	var json = {};
	json.parse = function(json) {
		return eval('('+json+')');
	};
	json.stringify = function(object) {
		var res = '';
		var first = true;
		var isArray = (object.constructor.toString().indexOf('function Array()') != -1);
		for(var prop in object) {
			try {
				var propValue = object[prop];
				if((typeof(propValue) != 'number') && (typeof(propValue) != 'string') && (typeof(propValue) != 'object'))
					continue;
				if(first)
					first = false;
				else
					res += ", ";
				if(!isArray)
					res += '"'+prop+'": ';
				if(typeof(propValue) == 'object')
					res += JSON.stringify(propValue);
				else if(typeof(propValue) == 'number')
					res += propValue;
				else if(typeof(propValue) == 'string')
					res += '"'+propValue.replace('"','\\"')+'"';
			} catch(err) {}
		}
		if(isArray)
			res = '[ '+res+' ]';
		else
			res = '{ '+res+' }';
		return res;
	};
	window.JSON = json;
}

// correct Safari iOS6 bug
if(navigator.iOs) {
(function (window) {
	// This library re-implements setTimeout, setInterval, clearTimeout, clearInterval for iOS6.
	// iOS6 suffers from a bug that kills timers that are created while a page is scrolling.
	// This library fixes that problem by recreating timers after scrolling finishes (with interval correction).
	// This code is free to use by anyone (MIT, blabla).
	// Original Author: rkorving@wizcorp.jp
	var timeouts = {};
	var intervals = {};
	var orgSetTimeout = window.setTimeout;
	var orgSetInterval = window.setInterval;
	var orgClearTimeout = window.clearTimeout;
	var orgClearInterval = window.clearInterval;
	// To prevent errors if loaded on older IE.
	if (!window.addEventListener) return false;
	function createTimer(set, map, args) {
		var id, cb = args[0],
			repeat = (set === orgSetInterval);

		function callback() {
			if (cb) {
				cb.apply(window, arguments);
				if (!repeat) {
					delete map[id];
					cb = null;
				}
			}
		}
		args[0] = callback;
		id = set.apply(window, args);
		map[id] = {
			args: args,
			created: Date.now(),
			cb: cb,
			id: id
		};
		return id;
	}

	function resetTimer(set, clear, map, virtualId, correctInterval) {
		var timer = map[virtualId];
		if (!timer) {
			return;
		}
		var repeat = (set === orgSetInterval);
		// cleanup
		clear(timer.id);
		// reduce the interval (arg 1 in the args array)
		if (!repeat) {
			var interval = timer.args[1];
			var reduction = Date.now() - timer.created;
			if (reduction < 0) {
				reduction = 0;
			}
			interval -= reduction;
			if (interval < 0) {
				interval = 0;
			}
			timer.args[1] = interval;
		}
		// recreate
		function callback() {
			if (timer.cb) {
				timer.cb.apply(window, arguments);
				if (!repeat) {
					delete map[virtualId];
					timer.cb = null;
				}
			}
		}
		timer.args[0] = callback;
		timer.created = Date.now();
		timer.id = set.apply(window, timer.args);
	}
	window.setTimeout = function () {
		return createTimer(orgSetTimeout, timeouts, arguments);
	};
	window.setInterval = function () {
		return createTimer(orgSetInterval, intervals, arguments);
	};
	window.clearTimeout = function (id) {
		var timer = timeouts[id];
		if (timer) {
			delete timeouts[id];
			orgClearTimeout(timer.id);
		}
	};
	window.clearInterval = function (id) {
		var timer = intervals[id];
		if (timer) {
			delete intervals[id];
			orgClearInterval(timer.id);
		}
	};
	//check and add listener on the top window if loaded on frameset/iframe
	var win = window;
	while (win.location != win.parent.location) {
		win = win.parent;
	}
	win.addEventListener('scroll', function () {
		// recreate the timers using adjusted intervals
		// we cannot know how long the scroll-freeze lasted, so we cannot take that into account
		var virtualId;
		for (virtualId in timeouts) {
			resetTimer(orgSetTimeout, orgClearTimeout, timeouts, virtualId);
		}
		for (virtualId in intervals) {
			resetTimer(orgSetInterval, orgClearInterval, intervals, virtualId);
		}
	});
}(window));
}

if(window.console == undefined) {
	window.console = {
		log: function() {},
		error: function() {},
		warn: function() {}
	};
}
/**#nocode-*/
