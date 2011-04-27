
navigator.isGecko = (navigator.userAgent.match(/Gecko\//i) != null);
navigator.isWebkit = (navigator.userAgent.match(/WebKit\//i) != null);

navigator.isIE = (navigator.userAgent.match(/MSIE/i) != null);
navigator.isOpera =  ((navigator.userAgent == undefined) || (navigator.userAgent.match(/Opera\//i) != null));
navigator.isChrome = (navigator.userAgent.match(/ Chrome\//) != null);
navigator.isSafari = (navigator.userAgent.match(/ Safari\//) != null);

navigator.iPad = (navigator.userAgent.match(/iPad/i) != null);
navigator.iPhone = (navigator.userAgent.match(/iPhone/i) != null);

var svgNS = "http://www.w3.org/2000/svg";
var htmlNS = "http://www.w3.org/1999/xhtml";

Core = {};
Core.Util = {};
Core.Util.idGenerator = 0;
Core.Util.generateId = function() {
	return ++Core.Util.idGenerator;
};

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
};

String.prototype.fromBase64 = function() {
	var value = this;
	var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
	var res = '';
	var i = 0;
	while(i < value.length) {
		enc1 = code.indexOf(value[i++]);
		enc2 = code.indexOf(value[i++]);
		enc3 = code.indexOf(value[i++]);
		enc4 = code.indexOf(value[i++]);

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

// correct IE specific bugs
if(navigator.isIE) {
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
		var isArray = (this.constructor.toString().indexOf('function Array()') != -1);
		for(var prop in this) {
			try {
				var propValue = this[prop];
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

if(window.console == undefined) {
	window.console = {
		log: function() {},
		error: function() {},
		warn: function() {}
	};
}

