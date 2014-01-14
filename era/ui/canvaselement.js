Ui.Container.extend('Ui.CanvasElement', 
/**@lends Ui.CanvasElement#*/
{
	canvasEngine: 'svg',
	context: undefined,
	dpiRatio: 1,

	/**
	 * @constructs
	 * @class The base class for all Canvas drawing
	 * @extends Ui.Element
	 */
	constructor: function(config) {
		this.setSelectable(false);
	},

	/**
	 * Call this method when the canvas need to be redraw
	 */
	update: function() {
		if((this.canvasEngine === 'canvas') || (this.canvasEngine === 'vml')) {
			this.context.save();
			this.context.clearRect(0, 0, Math.ceil(this.getLayoutWidth() * this.dpiRatio), Math.ceil(this.getLayoutHeight() * this.dpiRatio));
			if(this.dpiRatio !== 1)
				this.context.scale(this.dpiRatio, this.dpiRatio);
			this.updateCanvas(this.context);
			this.context.restore();
		}
		else {
			var ctx = new Core.SVG2DContext({ document: this.getDrawing() });
			this.updateCanvas(ctx);
			if(this.getDrawing().childNodes.length > 0)
				this.getDrawing().removeChild(this.getDrawing().childNodes[0]);
			this.getDrawing().appendChild(ctx.getSVG());
		}
	},

	/*
	 * Get the canvas context
	 */
	getContext: function() {
		return this.context;
	},

	/**
	 * Override this method to provide the Canvas rendering
	 */
	updateCanvas: function(context) {
	}
}, 
/**@lends Ui.CanvasElement#*/
{
	renderDrawing: function(config) {
		if('canvasEngine' in config) {
			this.canvasEngine = config.canvasEngine;
			delete(config.canvasEngine);
		}
		// verify compatibility with the browser
		if((this.canvasEngine === 'canvas') && !navigator.supportCanvas) {
			if(navigator.supportSVG)
				this.canvasEngine = 'svg';
			else
				this.canvasEngine = 'vml';
		}
		if((this.canvasEngine === 'svg') && !navigator.supportSVG) {
			if(navigator.supportCanvas)
				this.canvasEngine = 'canvas';
			else
				this.canvasEngine = 'vml';
		}
		if((this.canvasEngine === 'vml') && !navigator.supportVML) {
			if(navigator.supportCanvas)
				this.canvasEngine = 'canvas';
			else
				this.canvasEngine = 'svg';
		}

		var drawing;
		if(this.canvasEngine === 'canvas') {
			drawing = document.createElement('canvas');
			this.context = drawing.getContext('2d');
		}
		else if(this.canvasEngine === 'vml') {
			// use excanvas
			drawing = document.createElement('canvas');
			drawing = G_vmlCanvasManager.initElement(drawing);
			this.context = drawing.getContext('2d');
			this.context.roundRect = Core.SVG2DPath.prototype.roundRect;
			this.context.svgPath = Core.SVG2DContext.prototype.svgPath;
			this.context.roundRectFilledShadow = Core.SVG2DContext.prototype.roundRectFilledShadow;
		}
		else {
			drawing = document.createElementNS(svgNS, 'svg');
			drawing.setAttribute('focusable', false);
			drawing.setAttribute('draggable', false);
		}
		return drawing;
	},

	arrangeCore: function(width, height) {
		// handle High DPI
		var devicePixelRatio = window.devicePixelRatio || 1;
		var backingStoreRatio = 1;
		if(this.context !== undefined) {
        	backingStoreRatio = this.context.webkitBackingStorePixelRatio ||
				this.context.mozBackingStorePixelRatio ||
				this.context.msBackingStorePixelRatio ||
				this.context.oBackingStorePixelRatio ||
				this.context.backingStorePixelRatio || 1;
		}
		this.dpiRatio = devicePixelRatio / backingStoreRatio;
		this.getDrawing().setAttribute('width', Math.ceil(width * this.dpiRatio), null);
		this.getDrawing().setAttribute('height', Math.ceil(height * this.dpiRatio), null);

		if(this.getIsVisible() && this.getIsLoaded())
			this.update();
	},

	drawCore: function() {	
		// update only if the layout was done
		if((this.getLayoutWidth() !== 0) && (this.getLayoutHeight() !== 0))
			this.update();
	},
	
	onInternalVisible: function() {
		Ui.CanvasElement.base.onInternalVisible.call(this);
		this.invalidateDraw();
	}
});

Core.Object.extend('Core.SVG2DPath', {
	path: undefined,
	context: undefined,
	x: 0,
	y: 0,

	constructor: function(config) {
		this.path = document.createElementNS(svgNS, 'path');
		this.context = config.context;
		delete(config.context);
	},

	moveTo: function(x, y) {
		this.path.pathSegList.appendItem(this.path.createSVGPathSegMovetoAbs(x, y));
		this.x = x; this.y = y;
	},

	lineTo: function(x, y) {
		this.path.pathSegList.appendItem(this.path.createSVGPathSegLinetoAbs(x, y));
		this.x = x; this.y = y;
	},	

	quadraticCurveTo: function(cpx, cpy, x, y) {
		this.path.pathSegList.appendItem(this.path.createSVGPathSegCurvetoQuadraticAbs(x, y, cpx, cpy));
		this.x = x; this.y = y;
	},

	bezierCurveTo: function(cp1x, cp1y, cp2x, cp2y, x, y) {
		this.path.pathSegList.appendItem(this.path.createSVGPathSegCurvetoCubicAbs(x, y, cp1x, cp1y, cp2x, cp2y));
		this.x = x; this.y = y;
	},

	arcTo: function(x1, y1, x2, y2, radiusX, radiusY, angle) {
		var vx1 = this.x - x1;
		var vy1 = this.y - y1;
		var vx2 = x2 - x1;
		var vy2 = y2 - y1;
		var p = vx1*vy2 - vy1*vx2;
		if(angle === undefined) {
			angle = radiusY;
			radiusY = radiusX;
		}
		this.path.pathSegList.appendItem(this.path.createSVGPathSegArcAbs(x2, y2, radiusX, radiusY, angle*Math.PI/180, 0, (p<0)?1:0));
		this.x = x2; this.y = y2;
	},
	
	closePath: function() {
		this.path.pathSegList.appendItem(this.path.createSVGPathSegClosePath());
	},

  	rect: function(x, y, w, h) {
		this.moveTo(x, y);
		this.lineTo(x+w, y);
		this.lineTo(x+w, y+h);
		this.lineTo(x, y+h);
	},

	roundRect: function(x, y, w, h, radiusTopLeft, radiusTopRight, radiusBottomRight, radiusBottomLeft, antiClockwise) {
		if(antiClockwise === true) {
			this.moveTo(x+radiusTopLeft, y);
			if(radiusTopLeft > 0)
				this.arcTo(x, y, x, y+radiusTopLeft, radiusTopLeft, radiusTopLeft, Math.PI/4);
			this.lineTo(x,y+h-radiusBottomLeft);
			if(radiusBottomLeft > 0)
				this.arcTo(x, y+h, x+radiusBottomLeft, y+h, radiusBottomLeft, radiusBottomLeft, Math.PI/4);
			this.lineTo(x+w-radiusBottomRight,y+h);
			if(radiusBottomRight > 0)
				this.arcTo(x+w, y+h, x+w,y+h-radiusBottomRight, radiusBottomRight, radiusBottomRight, Math.PI/4);
			this.lineTo(x+w,y+radiusTopRight);
			if(radiusTopRight > 0)
				this.arcTo(x+w, y, x+w-radiusTopRight, y, radiusTopRight, radiusTopRight, Math.PI/4);
		}
		else {
			this.moveTo(x, y+radiusTopLeft);
			if(radiusTopLeft > 0)
				this.arcTo(x, y, x+radiusTopLeft,y, radiusTopLeft, radiusTopLeft, Math.PI/4);
			this.lineTo(x+w-radiusTopRight,y);
			if(radiusTopRight > 0)
				this.arcTo(x+w, y, x+w, y+radiusTopRight, radiusTopRight, radiusTopRight, Math.PI/4);
			this.lineTo(x+w,y+h-radiusBottomRight);
			if(radiusBottomRight > 0)
				this.arcTo(x+w, y+h, x+w-radiusBottomRight,y+h, radiusBottomRight, radiusBottomRight, Math.PI/4);
			this.lineTo(x+radiusBottomLeft,y+h);
			if(radiusBottomLeft > 0)
				this.arcTo(x,y+h,x,y+h-radiusBottomLeft, radiusBottomLeft, radiusBottomLeft, Math.PI/4);
		}
	},

	getSVG: function() {
		return this.path.cloneNode();
	}
});

Core.Object.extend('Core.SVGGradient', {
	gradient: undefined,
	id: undefined,

	constructor: function(config) {
		this.gradient = document.createElementNS(svgNS, 'linearGradient');
		this.gradient.setAttributeNS(null, 'gradientUnits', 'userSpaceOnUse');
		this.gradient.setAttributeNS(null, 'x1', config.x0);
		this.gradient.setAttributeNS(null, 'y1', config.y0);
		this.gradient.setAttributeNS(null, 'x2', config.x1);
		this.gradient.setAttributeNS(null, 'y2', config.y1);
		delete(config.x0); delete(config.y0);
		delete(config.x1); delete(config.y1);

		this.id = '_grad'+(++Core.SVGGradient.counter);
		this.gradient.setAttributeNS(null, 'id', this.id);
	},

	getId: function() {
		return this.id;
	},

	addColorStop: function(offset, color) {
		var svgStop = document.createElementNS(svgNS, 'stop');
		svgStop.setAttributeNS(null, 'offset', offset);
		svgStop.style.stopColor = color;
		var color = Ui.Color.create(color);
		svgStop.style.stopOpacity = color.getRgba().a;
		this.gradient.appendChild(svgStop);
	},

	getSVG: function() {
		return this.gradient;
	}
}, {}, {
	counter: 0
});
	
Core.Object.extend('Core.SVG2DContext', {
	fillStyle: 'black',
	strokeStyle: 'black',
	lineWidth: 1,
	globalAlpha: 1,
	currentTransform: undefined,
	font: 'default 10px sans-serif',
	textAlign: 'start',
	textBaseLine: 'alphabetic',
	direction: 'inherit',
	
	document: undefined,
	currentPath: undefined,
	g: undefined,
	defs: undefined,
	states: undefined,

	constructor: function(config) {
		this.document = config.document;
		delete(config.document);

		this.g = document.createElementNS(svgNS, 'g');
		this.currentTransform = this.document.createSVGMatrix();
		this.states = [];

		this.defs = document.createElementNS(svgNS, 'defs');
		this.g.appendChild(this.defs);
	},

	beginPath: function() {
		this.currentPath = new Core.SVG2DPath({ context: this });
	},

	moveTo: function(x, y) {
		this.currentPath.moveTo(x, y);
	},

	lineTo: function(x, y) {
		this.currentPath.lineTo(x, y);
	},

	quadraticCurveTo: function(cpx, cpy, x, y) {
		this.currentPath.quadraticCurveTo(cpx, cpy, x, y);
	},

	bezierCurveTo: function(cp1x, cp1y, cp2x, cp2y, x, y) {
		this.currentPath.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
	},

	rect: function(x, y, w, h) {
		this.currentPath.rect(x, y, w, h);
	},

	roundRect: function(x, y, w, h, radiusTopLeft, radiusTopRight, radiusBottomRight, radiusBottomLeft, antiClockwise) {
		this.currentPath.roundRect(x, y, w, h, radiusTopLeft, radiusTopRight, radiusBottomRight, radiusBottomLeft, antiClockwise);
	},

	closePath: function() {
		this.currentPath.closePath();
	},

	fill: function() {
		var svg = this.currentPath.getSVG();
		if(Core.SVGGradient.hasInstance(this.fillStyle)) {
			var id = this.fillStyle.getId();
			this.defs.appendChild(this.fillStyle.getSVG());
			svg.style.fill = 'url(#'+id+')';
		}
		else
			svg.style.fill = this.fillStyle;
		svg.style.opacity = this.globalAlpha;
		// very important, SVG elements cant take pointers events
		// because touch* events are captured by the initial element they
		// are raised over. If this element is remove from the DOM (like canvas redraw)
		// the following events (like touchmove, touchend) will never raised
		svg.setAttributeNS(null, 'pointer-events', 'none');
		svg.transform.baseVal.initialize(this.document.createSVGTransformFromMatrix(this.currentTransform));
		this.g.appendChild(svg);
	},

	stroke: function() {
		var svg = this.currentPath.getSVG();
		svg.style.stroke = this.strokeStyle;
		svg.style.fill = 'none';
		svg.style.opacity = this.globalAlpha;
		svg.style.strokeWidth = this.lineWidth;
		svg.setAttributeNS(null, 'pointer-events', 'none');
		svg.transform.baseVal.initialize(this.document.createSVGTransformFromMatrix(this.currentTransform));
		this.g.appendChild(svg);
	},

	fillText: function(text, x, y, maxWidth) {
		var t = document.createElementNS(svgNS, 'text');
		t.style.fill = this.fillStyle;
		t.style.opacity = this.globalAlpha;
		t.setAttributeNS(null, 'pointer-events', 'none');
		t.transform.baseVal.initialize(this.document.createSVGTransformFromMatrix(this.currentTransform));
		t.setAttributeNS(null, 'x', x);
		t.setAttributeNS(null, 'y', y);
		if(this.textAlign == 'center')
			t.style.textAnchor = 'middle';
		else if(this.textAlign == 'end')
			t.style.textAnchor = 'end';
		
		if(this.textBaseline === 'top')
			t.style.alignmentBaseline = 'text-before-edge';
		else if(this.textBaseline === 'hanging')
			t.style.alignmentBaseline = 'hanging';
		else if(this.textBaseline === 'middle')
			t.style.alignmentBaseline = 'middle';
		else if(this.textBaseline === 'alphabetic')
			t.style.alignmentBaseline = 'alphabetic';
		else if(this.textBaseline === 'ideographic')
			t.style.alignmentBaseline = 'ideographic';
		else if(this.textBaseline === 'bottom')
			t.style.alignmentBaseline = 'text-after-edge';

		t.style.alignmentBaseline = this.textBaseline;

		var font = this.parseFont(this.font);
		t.style.fontFamily = font.family;
		t.style.fontSize = font.size;
		t.style.fontStyle = font.style;

		var textNode = document.createTextNode(text);
		t.appendChild(textNode);

		this.g.appendChild(t);
	},

	strokeText: function(text, x, y, maxWidth) {
	},

	save: function() {
		var state = {
			fillStyle: this.fillStyle,
			strokeStyle: this.strokeStyle,
			lineWidth: this.lineWidth,
			globalAlpha: this.globalAlpha,
			matrix: {
				a: this.currentTransform.a, b: this.currentTransform.b,
				c: this.currentTransform.c, d: this.currentTransform.d,
				e: this.currentTransform.e, f: this.currentTransform.f },
			font: this.font,
			textAlign: this.textAlign,
			textBaseLine: this.textBaseLine,
			direction: this.direction
		}
		this.states.push(state);
	},

	restore: function() {
		if(this.states.length > 0) {
			var state = this.states.pop();
			this.fillStyle = state.fillStyle;
			this.strokeStyle = state.strokeStyle;
			this.lineWidth = state.lineWidth;
			this.globalAlpha = state.globalAlpha;
			this.currentTransform = this.document.createSVGMatrix();
			this.currentTransform.a = state.matrix.a;
			this.currentTransform.b = state.matrix.b;
			this.currentTransform.c = state.matrix.c;
			this.currentTransform.d = state.matrix.d;
			this.currentTransform.e = state.matrix.e;
			this.currentTransform.f = state.matrix.f;
			this.font = state.font;
			this.textAlign = state.textAlign;
			this.textBaseLine = state.textBaseLine;
			this.direction = state.direction;
		}
	},

	scale: function(x, y) {
		this.currentTransform = this.currentTransform.scaleNonUniform(x, (y === undefined)?x:y);
	},

	rotate: function(angle) {
		this.currentTransform = this.currentTransform.rotate(angle*180/Math.PI);
	},

	translate: function(x, y) {
		this.currentTransform = this.currentTransform.translate(x, y);
	},

	transform: function(a, b, c, d, e, f) {
		var mulMatrix = this.document.createSVGMatrix();
		mulMatrix.a = a;
		mulMatrix.b = b;
		mulMatrix.c = c;
		mulMatrix.d = d;
		mulMatrix.e = e;
		mulMatrix.f = f;
		this.currentTransform.multiply(mulMatrix);
	},

	setTransform: function(a, b, c, d, e, f) {
		this.currentTransform.a = a;
		this.currentTransform.b = b;
		this.currentTransform.c = c;
		this.currentTransform.d = d;
		this.currentTransform.e = e;
		this.currentTransform.f = f;
	},

	resetTransform: function() {
		this.currentTransform = this.document.createSVGMatrix();
	},

	clearRect: function(x, y, w, h) {
	},

	fillRect: function(x, y, w, h) {
		this.beginPath();
		this.currentPath.rect(x, y, w, h);
		this.closePath();
		this.fill();
	},

	strokeRect: function(x, y, w, h) {
		this.beginPath();
		this.currentPath.rect(x, y, w, h);
		this.closePath();
		this.stroke();
	},

	createLinearGradient: function(x0, y0, x1, y1) {
		return new Core.SVGGradient({ x0: x0, y0: y0, x1: x1, y1: y1 });
	},

	svgPath: function(path) {
		var x = 0;
		var y = 0;

		var parser = new Ui.SvgParser({ path: path });
		parser.next();

		this.beginPath();

		while(!parser.isEnd()) {
			var cmd = parser.getCmd();
			if(parser.isCmd())
				parser.next();

			if(cmd == 'm') {
				parser.setCmd('l');
				x += parser.getCurrent(); parser.next(); 
				y += parser.getCurrent(); parser.next();
				this.moveTo(x, y);
			}
			else if(cmd == 'M') {
				parser.setCmd('L');
				x = parser.getCurrent(); parser.next();
				y = parser.getCurrent(); parser.next();
				this.moveTo(x, y);
			}
			else if(cmd == 'l') {
				x += parser.getCurrent(); parser.next();
				y += parser.getCurrent(); parser.next();
				this.lineTo(x, y);
			}
			else if(cmd == 'L') {
				x = parser.getCurrent(); parser.next();
				y = parser.getCurrent(); parser.next();
				this.lineTo(x, y);
			}
			else if(cmd == 'v') {
				y += parser.getCurrent(); parser.next();
				this.lineTo(x, y);
			}
			else if(cmd == 'V') {
				y = parser.getCurrent(); parser.next();
				this.lineTo(x, y);
			}
			else if(cmd == 'h') {
				x += parser.getCurrent(); parser.next();
				this.lineTo(x, y);
			}
			else if(cmd == 'H') {
				x = parser.getCurrent(); parser.next();
				this.lineTo(x, y);
			}
			else if(cmd == 'c') {
				var x1 = x + parser.getCurrent(); parser.next();
				var y1 = y + parser.getCurrent(); parser.next();
				var x2 = x + parser.getCurrent(); parser.next();
				var y2 = y + parser.getCurrent(); parser.next();
				var x3 = x + parser.getCurrent(); parser.next();
				var y3 = y + parser.getCurrent(); parser.next();
				this.bezierCurveTo(x1, y1, x2, y2, x3, y3);
				x = x3; y = y3;
			}
			else if(cmd == 'C') {
				var x1 = parser.getCurrent(); parser.next();
				var y1 = parser.getCurrent(); parser.next();
				var x2 = parser.getCurrent(); parser.next();
				var y2 = parser.getCurrent(); parser.next();
				var x3 = parser.getCurrent(); parser.next();
				var y3 = parser.getCurrent(); parser.next();
				this.bezierCurveTo(x1, y1, x2, y2, x3, y3);
				x = x3; y = y3;
			}
			else if(cmd == 's') {
				var x1 = x + parser.getCurrent(); parser.next();
				var y1 = y + parser.getCurrent(); parser.next();
				var x2 = x1;
				var y2 = y1;
				var x3 = x + parser.getCurrent(); parser.next();
				var y3 = y + parser.getCurrent(); parser.next();
				this.bezierCurveTo(x1, y1, x2, y2, x3, y3);
				this.lineTo(x3, y3);
				x = x3; y = y3;
			}
			else if(cmd == 'S') {
				var x1 = parser.getCurrent(); parser.next();
				var y1 = parser.getCurrent(); parser.next();
				var x2 = x1;
				var y2 = y1;
				var x3 = parser.getCurrent(); parser.next();
				var y3 = parser.getCurrent(); parser.next();
				this.bezierCurveTo(x1, y1, x2, y2, x3, y3);
				x = x3; y = y3;
			}
			else if(cmd == 'q') {
				var x1 = x + parser.getCurrent(); parser.next();
				var y1 = y + parser.getCurrent(); parser.next();
				var x2 = x + parser.getCurrent(); parser.next();
				var y2 = y + parser.getCurrent(); parser.next();
				this.quadraticCurveTo(x1, y1, x2, y2);
				x = x2; y = y2;
			}
			else if(cmd == 'Q') {
				var x1 = parser.getCurrent(); parser.next();
				var y1 = parser.getCurrent(); parser.next();
				var x2 = parser.getCurrent(); parser.next();
				var y2 = parser.getCurrent(); parser.next();
				this.quadraticCurveTo(x1, y1, x2, y2);
				x = x2; y = y2;
			}
			else if((cmd == 'z') || (cmd == 'Z')) {
				this.closePath();
			}
			else {
				console.log('Invalid SVG path cmd: '+cmd+' ('+path+')');
				throw('Invalid SVG path');
			}
		}
	},

	parseFont: function(font) {
		var tab = font.split(' ');
		if(tab.length === 1)
			return { style: 'default', weight: 'normal', size: '16px', family: tab[0] };
		if(tab.length === 2)
			return { style: 'default', weight: 'normal', size: tab[0], family: tab[1] };
		else if(tab.length === 3)
			return { style: 'default', weight: tab[0], size: tab[1], family: tab[2] };
		else if(tab.length === 4)
			return { style: tab[0], weight: tab[1], size: tab[2], family: tab[3] };
	},

	roundRectFilledShadow: function(x, y, width, height, radiusTopLeft, radiusTopRight, radiusBottomRight, radiusBottomLeft, inner, shadowWidth, color) {
		this.save();
		var rgba = color.getRgba();
		for(var i = 0; i < shadowWidth; i++) {
			var opacity;
			if(inner) {
				if(shadowWidth == 1)
					opacity = 1;
				else {
					var tx = (i + 1) / shadowWidth;
					opacity = tx * tx;
				}
			}
			else
				opacity = (i+1) / (shadowWidth + 1);

			var color = new Ui.Color({ r: rgba.r, g: rgba.g, b: rgba.b, a: rgba.a*opacity });			
			this.fillStyle = color.getCssRgba();

			if(inner) {
				this.beginPath();
				this.roundRect(x, y, width, height, radiusTopLeft, radiusTopRight, radiusBottomRight, radiusBottomLeft);
				this.roundRect(x+shadowWidth-i, y+shadowWidth-i, width-((shadowWidth-i)*2), height-((shadowWidth-i)*2), radiusTopLeft, radiusTopRight, radiusBottomRight, radiusBottomLeft, true);
				this.closePath();
				this.fill();			
			}
			else {
				this.beginPath();
				this.roundRect(x+i, y+i, width-i*2, height-i*2, radiusTopLeft, radiusTopRight, radiusBottomRight, radiusBottomLeft);
				this.closePath();
				this.fill();
			}
		}
		this.restore();
	},
	
	getSVG: function() {
		return this.g;
	}
});

if(navigator.supportCanvas) {
	CanvasRenderingContext2D.prototype.roundRect = Core.SVG2DPath.prototype.roundRect;
	CanvasRenderingContext2D.prototype.svgPath = Core.SVG2DContext.prototype.svgPath;
	CanvasRenderingContext2D.prototype.roundRectFilledShadow = Core.SVG2DContext.prototype.roundRectFilledShadow;
}
