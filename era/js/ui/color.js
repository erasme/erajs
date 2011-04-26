

Object.extend('Ui.Color', {
	r: 0,
	g: 0,
	b: 0,
	a: 1,

	constructor: function(config) {
		// define from RGB model
		if((config.r != undefined) || (config.g != undefined) || (config.b != undefined)) {
			if(config.r != undefined)
				this.r = Math.min(Math.max(config.r, 0), 1);
			if(config.g != undefined)
				this.g = Math.min(Math.max(config.g, 0), 1);
			if(config.b != undefined)
				this.b = Math.min(Math.max(config.b, 0), 1);
		}
		else if((config.h != undefined) || (config.s != undefined) || (config.l != undefined)) {
			var h = (config.h != undefined)?config.h:0;
			var s = (config.s != undefined)?config.s:0;
			var l = (config.l != undefined)?config.l:0;
			this.initFromHsl(h, s, l);
		}
		else if((config.y != undefined) || (config.u != undefined) || (config.v != undefined)) {
			var y = Math.max((config.y != undefined)?config.y:0, 0);
			var u = (config.u != undefined)?config.u:0;
			var v = (config.v != undefined)?config.v:0;
			this.initFromYuv(y, u, v);
		}
		if(config.a != undefined)
			this.a = config.a;
	},

	getCssRgba: function() {
		return 'rgba('+Math.round(this.r * 255)+','+Math.round(this.g * 255)+','+Math.round(this.b * 255)+','+this.a+')';
	},

	getCssRgb: function() {
		return 'rgb('+Math.round(this.r * 255)+','+Math.round(this.g * 255)+','+Math.round(this.b * 255)+')';
	},

	getCssHtml: function() {
		var res = '#';
		var t = Math.round(this.r * 255).toString(16);
		if(t.length == 1)
			t = '0'+t;
		res += t;
		t = Math.round(this.g * 255).toString(16);
		if(t.length == 1)
			t = '0'+t;
		res += t;
		t = Math.round(this.b * 255).toString(16);
		if(t.length == 1)
			t = '0'+t;
		res += t;
		return res;
	},

	getRgba: function() {
		return { r: this.r, g: this.g, b: this.b, a: this.a };
	},

	getRgb: function() {
		return this.getRgba();
	},

	getHsla: function() {
		var r = this.r;
		var g = this.g;
		var b = this.b;
		var min = Math.min(r, Math.min(g, b));
		var max = Math.max(r, Math.max(g, b));
		var h;
		var s;
		var l = max;
		var delta = max - min;
		if(max != 0)
			s = delta / max;
		else
			return { h: 0, s: 0, l: l, a: this.a };
		if(r == max)
			h = (g - b) / delta;
		else if(g == max)
			h = 2 + (b -r) / delta;
		else
			h = 4 + (r - g) / delta;
		h *= 60;
		if(h < 0)
			h += 360;
		return { h: h, s: s, l: l, a: this.a };
	},

	getHsl: function() {
		return this.getHsla();
	},

	getYuva: function() {
		var y = 0.299 * this.r + 0.587 * this.g + 0.114 * this.b;
		var u = 0.492 * (this.b - y);
		var v = 0.877 * (this.r - y);
		return { y: y, u: u, v: v, a: this.a };
	},

	getYuv: function() {
		return this.getYuva();
	},

	//
	// Private
	//
	initFromHsl: function(h, s, l) {
		if(s <= 0) {
			this.r = l; this.g = l; this.b = l;
			return;
		}
		h /= 60;
		var i = Math.floor(h);
		var f = h - i;
		var p = l * ( 1 - s );
		var q = l * ( 1 - s * f );
		var t = l * ( 1 - s * ( 1 - f ) );
		if(i == 0) {
			this.r = l; this.g = t; this.b = p;
		}
		else if(i == 1) {
			this.r = q; this.g = l; this.b = p;
		}
		else if(i == 2) {
			this.r = p; this.g = l; this.b = t;
		}
		else if(i == 3) {
			this.r = p; this.g = q; this.b = l;
		}
		else if(i == 4) {
			this.r = t; this.g = p; this.b = l;
		}
		else {
			this.r = l; this.g = p; this.b = q;
		}
	},

	initFromYuv: function(y, u, v) {
		this.r = Math.max(0, Math.min(y + 1.13983 * v, 1));
		this.g = Math.max(0, Math.min(y - 0.39465 * u - 0.58060 * v, 1));
		this.b = Math.max(0, Math.min(y + 2.03211 * u, 1));
	},

}, {
	toString: function() {
		return 'color('+this.r.toFixed(4)+', '+this.g.toFixed(4)+', '+this.b.toFixed(4)+', '+this.a.toFixed(4)+')';
	},
});

Ui.Color.create = function(color) {
	if(typeof(color) == 'string') {
		// parse the color
		if(color.indexOf('rgba(') == 0) {
		}
		else if(color.indexOf('rgb(') == 0) {
		}
		else if(color.indexOf('#') == 0) {
			if(color.length == 7) {
				var r = parseInt(color.substr(1,2), 16) / 255;
				var g = parseInt(color.substr(3,2), 16) / 255;
				var b = parseInt(color.substr(5,2), 16) / 255;
				return new Ui.Color({ r: r, g: g, b: b });
			}
			else if(color.length == 4) {
				var r = parseInt(color.substr(1,1), 16) / 15;
				var g = parseInt(color.substr(2,1), 16) / 15;
				var b = parseInt(color.substr(3,1), 16) / 15;
				return new Ui.Color({ r: r, g: g, b: b });
			}
		}
		throw('Unknown color format');
	}
	else
		return color;
};

