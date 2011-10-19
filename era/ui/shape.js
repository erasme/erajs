
Ui.Element.extend('Ui.Shape', 
/**@lends Ui.Shape*/
{
	shapeDrawing: undefined,
	vmlFill: undefined,
	vmlOpacity: 1,
	svgPath: undefined,
	svgGradient: undefined,
	svgDefs: undefined,

	fill: undefined,
	path: undefined,
	vmlPath: undefined,
	scale: 1,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.Element
	*/
	constructor: function(config) {
	},

	setScale: function(scale) {
		if(this.scale != scale) {
			this.scale = scale;
			if(Ui.Shape.forceCanvas)
				this.updateCanvas();
			else if(navigator.supportSVG)
				this.svgPath.setAttribute('transform', 'scale( '+scale.toFixed(4)+', '+scale.toFixed(4)+' )');
			else if(navigator.supportVML)
				this.shapeDrawing.coordsize = (this.getLayoutWidth() * 100 / scale)+' '+(this.getLayoutHeight() * 100 / scale);
		}
	},

	setFill: function(fill) {
		if(this.fill != fill) {
			if(typeof(fill) == 'string')
				fill = Ui.Color.create(fill);
			fill = Ui.Element.create(fill, this);
			this.fill = fill;
			if(Ui.Shape.forceCanvas) {
				this.updateCanvas();
			}
			else if(navigator.supportSVG) {
				if(this.svgGradient != undefined) {
					this.svgDefs.removeChild(this.svgGradient);
					this.svgGradient = undefined;
				}
				if(Ui.Color.hasInstance(fill)) {
					this.svgPath.style.fill = fill.getCssHtml();
					this.svgPath.style.opacity = fill.getRgba().a;
				}
				else if(Ui.LinearGradient.hasInstance(fill)) {
					this.svgGradient = fill.getSVGGradient();
					var gradId = 'grad'+Core.Util.generateId();
					this.svgGradient.setAttributeNS(null, 'id', gradId);

					this.svgDefs.appendChild(this.svgGradient);
					this.svgPath.style.fill = 'url(#'+gradId+')';
					this.svgPath.style.opacity = 1;
				}
			}
			else if(navigator.supportVML) {
				if(this.vmlFill != undefined) {
					this.shapeDrawing.removeChild(this.vmlFill);
					this.vmlFill = undefined;
				}
				if(Ui.Color.hasInstance(fill)) {
					this.vmlFill = document.createElement('vml:fill');
					this.vmlFill.type = 'solid';
					this.vmlFill.color = fill.getCssHtml();
//					this.vmlFill.opacity = fill.getRgba().a;
					this.vmlFill.opacity = fill.getRgba().a * this.vmlOpacity;
					this.shapeDrawing.appendChild(this.vmlFill);
				}
				else if(Ui.LinearGradient.hasInstance(fill)) {
					this.vmlFill = fill.getVMLFill();
					this.shapeDrawing.appendChild(this.vmlFill);
				}
			}
		}
	},

	setPath: function(path) {
		if(this.path != path) {
			this.path = path;
			if(Ui.Shape.forceCanvas)
				this.updateCanvas();
			else if(navigator.supportSVG)
				this.svgPath.setAttributeNS(null, 'd', this.path, null);
			else if(navigator.supportVML) {
				this.vmlPath = this.pathToVML(path);
				this.shapeDrawing.path = this.vmlPath;
			}
		}
	},

	pathToVML: function(path) {
		var x = 0;
		var y = 0;

		var parser = new Ui.SvgParser({ path: path });
		parser.next();

		var vml = '';
		while(!parser.isEnd()) {
			var cmd = parser.getCmd();
			if(parser.isCmd())
				parser.next();

			if(cmd == 'm') {
				parser.setCmd('l');
				x += parser.getCurrent(); parser.next(); 
				y += parser.getCurrent(); parser.next();
				vml += 'm '+Math.round(x * 100)+','+Math.round(y * 100)+' ';
			}
			else if(cmd == 'M') {
				parser.setCmd('L');
				x = parser.getCurrent(); parser.next();
				y = parser.getCurrent(); parser.next();
				vml += 'm '+Math.round(x * 100)+','+Math.round(y * 100)+' ';
			}
			else if(cmd == 'l') {
				x += parser.getCurrent(); parser.next();
				y += parser.getCurrent(); parser.next();
				vml += 'l '+Math.round(x * 100)+','+Math.round(y * 100)+' ';
			}
			else if(cmd == 'L') {
				x = parser.getCurrent(); parser.next();
				y = parser.getCurrent(); parser.next();
				vml += 'l '+Math.round(x * 100)+','+Math.round(y * 100)+' ';
			}
			else if(cmd == 'c') {
				var x1 = x + parser.getCurrent(); parser.next();
				var y1 = y + parser.getCurrent(); parser.next();
				var x2 = x + parser.getCurrent(); parser.next();
				var y2 = y + parser.getCurrent(); parser.next();
				var x3 = x + parser.getCurrent(); parser.next();
				var y3 = y + parser.getCurrent(); parser.next();
//				vml += 'c '+Math.round(x1 * 100)+','+Math.round(y1 * 100)+' '+Math.round(x2 * 100)+','+Math.round(y2 * 100)+' '+Math.round(x * 100)+','+Math.round(y * 100)+' ';
				for(var i = 0; i < 1; i += 0.1) {
					var c1 = (1 - i);
					var c12 = c1*c1;
					var c13 = c12*c1;
					var t2 = i*i;
					var t3 = t2*i;
					var cx = c13*x + 3*c12*i*x1 + 3*c1*t2*x2 + t3*x3;
					var cy = c13*y + 3*c12*i*y1 + 3*c1*t2*y2 + t3*y3;
					vml += 'l '+Math.round(cx * 100)+','+Math.round(cy * 100)+' ';
				}
				x = x3; y = y3;
				vml += 'l '+Math.round(x * 100)+','+Math.round(y * 100)+' ';
			}
			else if(cmd == 'C') {
				var x1 = parser.getCurrent(); parser.next();
				var y1 = parser.getCurrent(); parser.next();
				var x2 = parser.getCurrent(); parser.next();
				var y2 = parser.getCurrent(); parser.next();
				var x3 = parser.getCurrent(); parser.next();
				var y3 = parser.getCurrent(); parser.next();
//				vml += 'c '+Math.round(x1 * 100)+','+Math.round(y1 * 100)+' '+Math.round(x2 * 100)+','+Math.round(y2 * 100)+' '+Math.round(x * 100)+','+Math.round(y * 100)+' ';
				for(var i = 0; i < 1; i += 0.1) {
					var c1 = (1 - i);
					var c12 = c1*c1;
					var c13 = c12*c1;
					var t2 = i*i;
					var t3 = t2*i;
					var cx = c13*x + 3*c12*i*x1 + 3*c1*t2*x2 + t3*x3;
					var cy = c13*y + 3*c12*i*y1 + 3*c1*t2*y2 + t3*y3;
					vml += 'l '+Math.round(cx * 100)+','+Math.round(cy * 100)+' ';
				}
				x = x3; y = y3;
				vml += 'l '+Math.round(x * 100)+','+Math.round(y * 100)+' ';
			}
			else if(cmd == 'q') {
				var x1 = x + parser.getCurrent(); parser.next();
				var y1 = y + parser.getCurrent(); parser.next();
				var x2 = x + parser.getCurrent(); parser.next();
				var y2 = y + parser.getCurrent(); parser.next();
//				vml += 'qb '+Math.round(x1 * 100)+','+Math.round(y1 * 100)+' '+Math.round(x * 100)+','+Math.round(y * 100)+' ';
				for(var i = 0; i < 1; i += 0.1) {
					var c1 = (1 - i);
					var c12 = c1*c1;
					var t2 = i*i;
					var cx = c12*x + 2*c1*i*x1 + t2*x2;
					var cy = c12*y + 2*c1*i*y1 + t2*y2;
					vml += 'l '+Math.round(cx * 100)+','+Math.round(cy * 100)+' ';
				}
				x = x2; y = y2;
				vml += 'l '+Math.round(x * 100)+','+Math.round(y * 100)+' ';
			}
			else if(cmd == 'Q') {
				var x1 = parser.getCurrent(); parser.next();
				var y1 = parser.getCurrent(); parser.next();
				var x2 = parser.getCurrent(); parser.next();
				var y2 = parser.getCurrent(); parser.next();
//				vml += 'qb '+Math.round(x1 * 100)+','+Math.round(y1 * 100)+' '+Math.round(x * 100)+','+Math.round(y * 100)+' ';
				for(var i = 0; i < 1; i += 0.1) {
					var c1 = (1 - i);
					var c12 = c1*c1;
					var t2 = i*i;
					var cx = c12*x + 2*c1*i*x1 + t2*x2;
					var cy = c12*y + 2*c1*i*y1 + t2*y2;
					vml += 'l '+Math.round(cx * 100)+','+Math.round(cy * 100)+' ';
				}
				x = x2; y = y2;
			}
			else if(cmd == 'z')
				vml += 'x ';
			else {
				console.log('Invalid SVG path cmd: '+cmd);
				throw('Invalid SVG path');
			}
		}
		vml += 'e';
		return vml;
	},

	pathToCanvas: function(path, ctx) {
		var x = 0;
		var y = 0;

		ctx.beginPath();

		var parser = new Ui.SvgParser({ path: path });
		parser.next();

		while(!parser.isEnd()) {
			var cmd = parser.getCmd();
			if(parser.isCmd())
				parser.next();

			if(cmd == 'm') {
				parser.setCmd('l');
				x += parser.getCurrent(); parser.next(); 
				y += parser.getCurrent(); parser.next();
				ctx.moveTo(x, y);
			}
			else if(cmd == 'M') {
				parser.setCmd('L');
				x = parser.getCurrent(); parser.next();
				y = parser.getCurrent(); parser.next();
				ctx.moveTo(x, y);
			}
			else if(cmd == 'l') {
				x += parser.getCurrent(); parser.next();
				y += parser.getCurrent(); parser.next();
				ctx.lineTo(x, y);
			}
			else if(cmd == 'L') {
				x = parser.getCurrent(); parser.next();
				y = parser.getCurrent(); parser.next();
				ctx.lineTo(x, y);
			}
			else if(cmd == 'c') {
				var x1 = x + parser.getCurrent(); parser.next();
				var y1 = y + parser.getCurrent(); parser.next();
				var x2 = x + parser.getCurrent(); parser.next();
				var y2 = y + parser.getCurrent(); parser.next();
				var x3 = x + parser.getCurrent(); parser.next();
				var y3 = y + parser.getCurrent(); parser.next();
				ctx.bezierCurveTo(x1, y1, x2, y2, x3, y3);
				x = x3; y = y3;
			}
			else if(cmd == 'C') {
				var x1 = parser.getCurrent(); parser.next();
				var y1 = parser.getCurrent(); parser.next();
				var x2 = parser.getCurrent(); parser.next();
				var y2 = parser.getCurrent(); parser.next();
				var x3 = parser.getCurrent(); parser.next();
				var y3 = parser.getCurrent(); parser.next();
				ctx.bezierCurveTo(x1, y1, x2, y2, x3, y3);
				x = x3; y = y3;
			}
			else if(cmd == 'q') {
				var x1 = x + parser.getCurrent(); parser.next();
				var y1 = y + parser.getCurrent(); parser.next();
				var x2 = x + parser.getCurrent(); parser.next();
				var y2 = y + parser.getCurrent(); parser.next();
				ctx.quadraticCurveTo(x1, y1, x2, y2);
				x = x2; y = y2;
			}
			else if(cmd == 'Q') {
				var x1 = parser.getCurrent(); parser.next();
				var y1 = parser.getCurrent(); parser.next();
				var x2 = parser.getCurrent(); parser.next();
				var y2 = parser.getCurrent(); parser.next();
				ctx.quadraticCurveTo(x1, y1, x2, y2);
				x = x2; y = y2;
			}
			else if(cmd == 'z') {
			}
			else {
				console.log('Invalid SVG path cmd: '+cmd);
				throw('Invalid SVG path');
			}
		}
		ctx.closePath();
	},

	updateCanvas: function() {
		var ctx = this.shapeDrawing.getContext("2d");

		ctx.save();

		ctx.clearRect(0, 0, this.getLayoutWidth(), this.getLayoutHeight());

		if(this.path == undefined)
			return;

		if(this.scale != 1)
			ctx.scale(this.scale, this.scale);

		this.pathToCanvas(this.path, ctx);

		var fill = this.fill;
		if(typeof(fill) == 'string')
			fill = Ui.Color.create(fill);

		if(Ui.Color.hasInstance(fill))
			ctx.fillStyle = fill.getCssRgba();
		else if(Ui.LinearGradient.hasInstance(fill))
			ctx.fillStyle = fill.getCanvasGradient(ctx, this.getLayoutWidth(), this.getLayoutHeight());

		ctx.fill();

		ctx.restore();
	}
}, {
	render: function() {
		if(Ui.Shape.forceCanvas)
			this.shapeDrawing = document.createElement('canvas');
		else if(navigator.supportSVG) {
			this.shapeDrawing = document.createElementNS(svgNS, 'svg');
			this.shapeDrawing.setAttribute('focusable', false);
			
			this.svgDefs = document.createElementNS(svgNS, 'defs');
			this.shapeDrawing.appendChild(this.svgDefs);

			this.svgPath = document.createElementNS(svgNS, 'path');
			this.svgPath.style.fillOpacity = '1';
			this.svgPath.style.stroke = 'none';
			this.shapeDrawing.appendChild(this.svgPath);
		}
		else if(navigator.supportVML) {
			this.shapeDrawing = document.createElement('vml:shape');
			this.shapeDrawing.stroked = false;
			this.vmlFill = document.createElement('vml:fill');
			this.vmlFill.type = 'solid';
			this.vmlFill.color = '#000000';
			this.shapeDrawing.appendChild(this.vmlFill);
		}
		this.shapeDrawing.style.display = 'block';
		this.shapeDrawing.style.position = 'absolute';
		this.shapeDrawing.style.left = '0px';
		this.shapeDrawing.style.top = '0px';
		return this.shapeDrawing;
	},

	arrangeCore: function(width, height) {
		width = Math.round(width);
		height = Math.round(height);
		this.shapeDrawing.style.width = width+'px';
		this.shapeDrawing.style.height = height+'px';
		if(!Ui.Shape.forceCanvas && !navigator.supportSVG && navigator.supportVML) {
			this.shapeDrawing.coordorigin = '0 0';
			this.shapeDrawing.coordsize = (width * 100 / this.scale)+' '+(height * 100 / this.scale);
		}
		if(Ui.Shape.forceCanvas) {
			this.shapeDrawing.setAttribute('width', width, null);
			this.shapeDrawing.setAttribute('height', height, null);
			this.updateCanvas();
		}
	},

	onVisible: function() {
		if(!Ui.Shape.forceCanvas && !navigator.supportSVG && navigator.supportVML) {
			var width = this.getLayoutWidth();
			var height = this.getLayoutHeight();

			this.shapeDrawing.style.width = width+'px';
			this.shapeDrawing.style.height = height+'px';
			this.shapeDrawing.path = this.vmlPath;
			this.shapeDrawing.coordorigin = '0 0';
			this.shapeDrawing.coordsize = (width * 100 / this.scale)+' '+(height * 100 / this.scale);

			if(this.vmlFill != undefined) {
				this.shapeDrawing.removeChild(this.vmlFill);
				this.vmlFill = undefined;
			}
			if(Ui.Color.hasInstance(this.fill)) {
				this.vmlFill = document.createElement('vml:fill');
				this.vmlFill.type = 'solid';
				this.vmlFill.color = this.fill.getCssHtml();
				this.vmlFill.opacity = this.fill.getRgba().a * this.vmlOpacity;
				this.shapeDrawing.appendChild(this.vmlFill);
			}
			else if(Ui.LinearGradient.hasInstance(this.fill)) {
				this.vmlFill = this.fill.getVMLFill();
				this.shapeDrawing.appendChild(this.vmlFill);
			}
		}
	},

	onCumulOpacityChange: function(cumulOpacity) {
//		console.log('Shape.onCumulOpacityChange: '+cumulOpacity);
		this.vmlOpacity = cumulOpacity;
		if(Ui.Color.hasInstance(this.fill)) {
			this.shapeDrawing.removeChild(this.vmlFill);
			this.vmlFill = document.createElement('vml:fill');
			this.vmlFill.type = 'solid';
			this.vmlFill.color = this.fill.getCssHtml();
			this.vmlFill.opacity = this.fill.getRgba().a * this.vmlOpacity;
			this.shapeDrawing.appendChild(this.vmlFill);
		}
	}

/*	setOpacity: function(opacity) {
		if(!navigator.supportSVG && navigator.supportVML) {
			console.log('handle VML opacity hack '+opacity);
			this.vmlOpacity = opacity;
			if(Ui.Color.hasInstance(this.fill)) {
				this.shapeDrawing.removeChild(this.vmlFill);
				this.vmlFill = document.createElement('vml:fill');
				this.vmlFill.type = 'solid';
				this.vmlFill.color = this.fill.getCssHtml();
				this.vmlFill.opacity = this.fill.getRgba().a * this.vmlOpacity;
				this.shapeDrawing.appendChild(this.vmlFill);
			}
		}
		else
			Ui.Shape.base.setOpacity.call(this, opacity);
	},

	getOpacity: function() {
		if(!navigator.supportSVG && navigator.supportVML)
			return this.vmlOpacity;
		else
			return Ui.Shape.base.getOpacity.call(this);
	}*/
}, {
	forceCanvas: (navigator.userAgent.match(/ Firefox\/3\.5\./) != null) || (navigator.userAgent.match(/ Firefox\/3\.6\./) != null)
});

Core.Object.extend('Ui.SvgParser', {
	path: undefined,
	pos: 0,
	cmd: undefined,
	current: undefined,
	value: false,
	end: false,

	constructor: function(config) {
		this.path = config.path;
	},

	isEnd: function() {
		return this.end;
	},

	next: function() {
		this.end = this.pos >= this.path.length;
		if(!this.end) {
			while((this.pos < this.path.length) && ((this.path.charAt(this.pos) == ' ') || (this.path.charAt(this.pos) == ',') || (this.path.charAt(this.pos) == ';')))
				this.pos++;
			this.current = '';
			var lastIsText = undefined;
			while((this.pos < this.path.length) && (this.path.charAt(this.pos) != ' ') && (this.path.charAt(this.pos) != ',') && (this.path.charAt(this.pos) != ';')) {
				var c = this.path.charAt(this.pos);
				var isText = (c != 'e') && ((c >= 'a') && (c <= 'z')) || ((c >= 'A') && (c <= 'Z'));
				if((lastIsText == undefined) || (lastIsText == isText)) {
					lastIsText = isText;
					this.current += c;
					this.pos++;
				}
				else
					break;
			}
			var value = new Number(this.current);
			this.value = !isNaN(value);
			if(this.value)
				this.current = value;
			else
				this.cmd = this.current;
		}
	},

	setCmd: function(cmd) {
		this.cmd = cmd;
	},

	getCmd: function() {
		return this.cmd;
	},

	getCurrent: function() {
		return this.current;
	},

	isCmd: function() {
		return !this.value;
	},

	isValue: function() {
		return this.value;
	}
});


