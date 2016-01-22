Ui.Container.extend('Ui.CanvasElement', 
/**@lends Ui.CanvasElement#*/
{
	canvasEngine: 'svg',
	context: undefined,
	svgDrawing: undefined,
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
		if(this.canvasEngine === 'canvas') {
			this.context.clearRect(0, 0, Math.ceil(this.getLayoutWidth() * this.dpiRatio), Math.ceil(this.getLayoutHeight() * this.dpiRatio));
			this.context.save();
			if(this.dpiRatio !== 1)
				this.context.scale(this.dpiRatio, this.dpiRatio);
			this.updateCanvas(this.context);
			this.context.restore();
		}
		else {
			if(this.svgDrawing !== undefined)
				this.getDrawing().removeChild(this.svgDrawing);
			var svgDrawing = document.createElementNS(svgNS, 'svg');
			svgDrawing.style.position = 'absolute';
			svgDrawing.style.top = '0px';
			svgDrawing.style.left = '0px';
			svgDrawing.style.width = this.getLayoutWidth()+'px';
			svgDrawing.style.height = this.getLayoutHeight()+'px';
			svgDrawing.setAttribute('focusable', false);
			svgDrawing.setAttribute('draggable', false);
			// very important, SVG elements cant take pointers events
			// because touch* events are captured by the initial element they
			// are raised over. If this element is remove from the DOM (like canvas redraw)
			// the following events (like touchmove, touchend) will never raised
			svgDrawing.setAttribute('pointer-events', 'none');
			var ctx = new Core.SVG2DContext({ document: svgDrawing });
			this.updateCanvas(ctx);
			this.svgDrawing = svgDrawing;
			this.svgDrawing.appendChild(ctx.getSVG());
			this.getDrawing().appendChild(this.svgDrawing);
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
		if((this.canvasEngine === 'canvas') && !navigator.supportCanvas)
			this.canvasEngine = 'svg';
		if((this.canvasEngine === 'svg') && !navigator.supportSVG)
			this.canvasEngine = 'canvas';
		
		var drawing; var resourceDrawing;
		if(this.canvasEngine === 'canvas') {
			drawing = document.createElement('canvas');
			this.context = drawing.getContext('2d');
		}
		else {
			drawing = document.createElement('div');
			resourceDrawing = document.createElement('div');
			resourceDrawing.style.width = '0px';
			resourceDrawing.style.height = '0px';
			resourceDrawing.style.visibility = 'hidden';

			drawing.appendChild(resourceDrawing);
			this.setContainerDrawing(resourceDrawing);
			if(navigator.supportCanvas)
				drawing.toDataURL = this.svgToDataURL.bind(this);
		}
		return drawing;
	},

	svgToDataURL: function() {
		var drawing = document.createElement('canvas');
		var context = drawing.getContext('2d');
		drawing.setAttribute('width', Math.ceil(this.getLayoutWidth()), null);
		drawing.setAttribute('height', Math.ceil(this.getLayoutHeight()), null);
		this.updateCanvas(context);
		return drawing.toDataURL.apply(drawing, arguments);
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
	d: undefined,
	x: 0,
	y: 0,

	constructor: function(config) {
		this.d = '';
	},

	moveTo: function(x, y) {
		this.d += ' M '+x+' '+y;
		this.x = x; this.y = y;
	},

	lineTo: function(x, y) {
		this.d += ' L '+x+' '+y;
		this.x = x; this.y = y;
	},	

	quadraticCurveTo: function(cpx, cpy, x, y) {
		this.d += ' Q '+cpx+' '+cpy+' '+x+' '+y;
		this.x = x; this.y = y;
	},

	bezierCurveTo: function(cp1x, cp1y, cp2x, cp2y, x, y) {
		this.d += ' C '+cp1x+' '+cp1y+' '+cp2x+' '+cp2y+' '+x+' '+y;
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
		// A rx ry x-axis-rotation large-arc-flag sweep-flag x y
		this.d += ' A '+radiusX+' '+radiusY+' '+(angle*Math.PI/180)+' 0 '+((p<0)?1:0)+' '+x2+' '+y2;
		this.x = x2; this.y = y2;
	},
	
	closePath: function() {
		this.d += ' Z';
	},

	rect: function(x, y, w, h) {
		this.moveTo(x, y);
		this.lineTo(x+w, y);
		this.lineTo(x+w, y+h);
		this.lineTo(x, y+h);
	},

	arc: function(x, y, radius, startAngle, endAngle, anticlockwise) {
		this.ellipse(x, y, radius, radius, 0, startAngle, endAngle, anticlockwise);
	},

	ellipse: function(x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise) {
		// special case, full ellipse
		if((rotation === 0) && (startAngle === 0) && (endAngle === Math.PI*2)) {
			this.moveTo(x, y+radiusY);
			this.arcTo(x+radiusX, y+radiusY, x+radiusX, y, radiusX, radiusY, Math.PI/2);
			this.arcTo(x+radiusX, y-radiusY, x, y-radiusY, radiusX, radiusY, Math.PI/2);
			this.arcTo(x-radiusX, y-radiusY, x-radiusX, y, radiusX, radiusY, Math.PI/2);
			this.arcTo(x-radiusX, y+radiusY, x, y+radiusY, radiusX, radiusY, Math.PI/2);
		}
		else {
			var startX = x + Math.cos(startAngle) * radiusX;
			var startY = y + Math.sin(startAngle) * radiusY;
			var endX = x + Math.cos(endAngle) * radiusX;
			var endY = y + Math.sin(endAngle) * radiusY;

			this.moveTo(startX, startY);
			var largeArc = (((endAngle-startAngle) + Math.PI * 2) % (Math.PI * 2)) > Math.PI;
			if(anticlockwise)
				largeArc = !largeArc;

			// A rx ry x-axis-rotation large-arc-flag sweep-flag x y
			this.d += ' A '+radiusX+' '+radiusY+' '+((endAngle-startAngle)*Math.PI/180)+' '+(largeArc?1:0)+' '+(!anticlockwise?1:0)+' '+endX+' '+endY;
			this.x = endX; this.y = endY;
		}
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
		var path = document.createElementNS(svgNS, 'path');
		path.setAttribute('d', this.d);
		return path;
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
		color = Ui.Color.create(color);
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
	lineDash: undefined,
	globalAlpha: 1,
	currentTransform: undefined,
	font: 'default 10px sans-serif',
	textAlign: 'start',
	textBaseLine: 'alphabetic',
	direction: 'inherit',
	clipId: undefined,
	
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
		this.lineDash = [];

		this.defs = document.createElementNS(svgNS, 'defs');
		this.g.appendChild(this.defs);
	},

	beginPath: function() {
		this.currentPath = new Core.SVG2DPath();
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

	arc: function(x, y, radius, startAngle, endAngle, anticlockwise) {
		this.currentPath.arc(x, y, radius, startAngle, endAngle, anticlockwise);
	},

	ellipse: function(x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise) {
		this.currentPath.ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise);
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
		if(this.clipId !== undefined)
			svg.setAttributeNS(null, 'clip-path', 'url(#'+this.clipId+')');
		svg.style.opacity = this.globalAlpha;
		svg.transform.baseVal.initialize(this.document.createSVGTransformFromMatrix(this.currentTransform));
		this.g.appendChild(svg);
	},

	stroke: function() {
		var svg = this.currentPath.getSVG();
		svg.style.stroke = this.strokeStyle;
		svg.style.fill = 'none';
		svg.style.opacity = this.globalAlpha;
		svg.style.strokeWidth = this.lineWidth;
		if(this.clipId !== undefined)
			svg.setAttributeNS(null, 'clip-path', 'url(#'+this.clipId+')');
		if(this.lineDash.length !== 0)
			svg.setAttributeNS(null, 'stroke-dasharray', this.lineDash.join(','));
		svg.setAttributeNS(null, 'pointer-events', 'none');
		svg.transform.baseVal.initialize(this.document.createSVGTransformFromMatrix(this.currentTransform));
		this.g.appendChild(svg);
	},

	clip: function() {
		var clip = document.createElementNS(svgNS, 'clipPath');
		this.clipId = '_clip'+(++Core.SVG2DContext.counter);
		clip.setAttributeNS(null, 'id', this.clipId);
		clip.appendChild(this.currentPath.getSVG());
		this.defs.appendChild(clip);
	},

	resetClip: function() {
		this.clipId = undefined;
	},

	getLineDash: function() {
		return this.lineDash;
	},

	setLineDash: function(lineDash) {
		this.lineDash = lineDash;
	},  

	// drawing images
	drawImage: function(image, sx, sy, sw, sh, dx, dy, dw, dh) {
		var img;
		var nw = image.naturalWidth;
		var nh = image.naturalHeight;
		
		if(sw === undefined) {
			dx = sx; dy = sy;
			sx = 0; sy = 0;
			sw = nw; sh = nh;
			dw = nw; dh = nh;
		}
		else if(dx === undefined) {
			dx = sx; dy = sy;
			dw = sw; dh = sh;
			sx = 0; sy = 0;
			sw = nw; sh = nh;
		}
		
		if((sx === 0) && (sy === 0) && (sw === nw) && (sh == nh)) {
			img = document.createElementNS(svgNS, 'image');
			if(this.clipId !== undefined)
				img.setAttributeNS(null, 'clip-path', 'url(#'+this.clipId+')');
			img.style.opacity = this.globalAlpha;
			// very important, SVG elements cant take pointers events
			// because touch* events are captured by the initial element they
			// are raised over. If this element is remove from the DOM (like canvas redraw)
			// the following events (like touchmove, touchend) will never raised
			img.setAttributeNS(null, 'pointer-events', 'none');
			img.href.baseVal = image.src;
			img.setAttributeNS(null, 'x', dx);
			img.setAttributeNS(null, 'y', dy);
			img.setAttributeNS(null, 'width', dw);
			img.setAttributeNS(null, 'height', dh);
			img.transform.baseVal.initialize(this.document.createSVGTransformFromMatrix(this.currentTransform));
			this.g.appendChild(img);
		}
		else {
			var pattern = document.createElementNS(svgNS, 'pattern');
			var id = '_pat'+(++Core.SVG2DContext.counter);
			pattern.setAttributeNS(null, 'id', id);
			pattern.setAttributeNS(null, 'patternUnits' ,'userSpaceOnUse');
			pattern.setAttributeNS(null, 'x', dx);
			pattern.setAttributeNS(null, 'y', dy);
			pattern.setAttributeNS(null, 'width', dw);
			pattern.setAttributeNS(null, 'height', dh);

			img = document.createElementNS(svgNS, 'image');
			img.href.baseVal = image.src;
			img.setAttributeNS(null, 'x', -sx*dw/sw);
			img.setAttributeNS(null, 'y', -sy*dh/sh);
			img.setAttributeNS(null, 'width', nw*dw/sw);
			img.setAttributeNS(null, 'height', nh*dh/sh);
			pattern.appendChild(img);
			this.defs.appendChild(pattern);

			var path = document.createElementNS(svgNS, 'path');
			path.setAttributeNS(null, 'pointer-events', 'none');
			path.pathSegList.appendItem(path.createSVGPathSegMovetoAbs(dx, dy));
			path.pathSegList.appendItem(path.createSVGPathSegLinetoAbs(dx+dw, dy));
			path.pathSegList.appendItem(path.createSVGPathSegLinetoAbs(dx+dw, dy+dh));
			path.pathSegList.appendItem(path.createSVGPathSegLinetoAbs(dx, dy+dh));
			path.pathSegList.appendItem(path.createSVGPathSegClosePath());
			path.style.fill = 'url(#'+id+')';
			if(this.clipId !== undefined)
				path.setAttributeNS(null, 'clip-path', 'url(#'+this.clipId+')');
			path.style.opacity = this.globalAlpha;
			path.transform.baseVal.initialize(this.document.createSVGTransformFromMatrix(this.currentTransform));
			this.g.appendChild(path);
		}
	},

	fillText: function(text, x, y, maxWidth) {
		var t = document.createElementNS(svgNS, 'text');
		var textNode = document.createTextNode(text);
		t.appendChild(textNode);

		t.style.fill = this.fillStyle;
		t.style.opacity = this.globalAlpha;
		t.setAttributeNS(null, 'pointer-events', 'none');
		t.transform.baseVal.initialize(this.document.createSVGTransformFromMatrix(this.currentTransform));
		if(this.textAlign == 'center')
			t.style.textAnchor = 'middle';
		else if(this.textAlign == 'end')
			t.style.textAnchor = 'end';
		else if(this.textAlign == 'right')
			t.style.textAnchor = 'end';
		
		var font = this.parseFont(this.font);
		t.style.fontFamily = font.family;
		t.style.fontWeight = font.weight;
		t.style.fontSize = font.size;
		t.style.fontStyle = font.style;

		if(!navigator.isWebkit) {
			var fontSize = parseInt(font.size);
			if(this.textBaseline === 'top')
				y += fontSize*0.8;
			else if(this.textBaseline === 'hanging')
				y += fontSize*0.8;
			else if(this.textBaseline === 'middle')
				y += (fontSize*0.8)/2;
			else if(this.textBaseline === 'bottom')
				y += fontSize*-0.2;
		}
		else {
			if(this.textBaseline === 'top')
				t.style.alignmentBaseline = 'text-before-edge';
			else if(this.textBaseline === 'hanging')
				t.style.alignmentBaseline = 'text-before-edge';
			else if(this.textBaseline === 'middle')
				t.style.alignmentBaseline = 'central';
			else if(this.textBaseline === 'alphabetic')
				t.style.alignmentBaseline = 'alphabetic';
			else if(this.textBaseline === 'ideographic')
				t.style.alignmentBaseline = 'ideographic';
			else if(this.textBaseline === 'bottom')
				t.style.alignmentBaseline = 'text-after-edge';
		}
		
		t.setAttributeNS(null, 'x', x);
		t.setAttributeNS(null, 'y', y);

		this.g.appendChild(t);
	},

	strokeText: function(text, x, y, maxWidth) {
	},

	save: function() {
		var state = {
			fillStyle: this.fillStyle,
			strokeStyle: this.strokeStyle,
			lineWidth: this.lineWidth,
			lineDash: this.lineDash,
			globalAlpha: this.globalAlpha,
			matrix: {
				a: this.currentTransform.a, b: this.currentTransform.b,
				c: this.currentTransform.c, d: this.currentTransform.d,
				e: this.currentTransform.e, f: this.currentTransform.f },
			font: this.font,
			textAlign: this.textAlign,
			textBaseLine: this.textBaseLine,
			direction: this.direction,
			clipId: this.clipId
		};
		this.states.push(state);
	},

	restore: function() {
		if(this.states.length > 0) {
			var state = this.states.pop();
			this.fillStyle = state.fillStyle;
			this.strokeStyle = state.strokeStyle;
			this.lineWidth = state.lineWidth;
			this.lineDash = state.lineDash;
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
			this.clipId = state.clipId;
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
		this.currentTransform = this.currentTransform.multiply(mulMatrix);
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

	measureText: function(text) {
		var font = this.parseFont(this.font);
		return Ui.Label.measureText(text, font.size, font.family, font.weight);
	},

	svgPath: function(path) {
		var x = 0; var y = 0;
		var x1; var y1; var x2; var y2; var x3; var y3;
		var beginX = 0; var beginY = 0;

		var parser = new Ui.SvgParser({ path: path });
		parser.next();

		this.beginPath();

		while(!parser.isEnd()) {
			var cmd = parser.getCmd();
			if(parser.isCmd())
				parser.next();

			if(cmd === 'm') {
				parser.setCmd('l');
				x += parser.getCurrent(); parser.next(); 
				y += parser.getCurrent(); parser.next();
				beginX = x;
				beginY = y;
				this.moveTo(x, y);
			}
			else if(cmd === 'M') {
				parser.setCmd('L');
				x = parser.getCurrent(); parser.next();
				y = parser.getCurrent(); parser.next();
				beginX = x;
				beginY = y;
				this.moveTo(x, y);
			}
			else if(cmd === 'l') {
				x += parser.getCurrent(); parser.next();
				y += parser.getCurrent(); parser.next();
				this.lineTo(x, y);
			}
			else if(cmd === 'L') {
				x = parser.getCurrent(); parser.next();
				y = parser.getCurrent(); parser.next();
				this.lineTo(x, y);
			}
			else if(cmd === 'v') {
				y += parser.getCurrent(); parser.next();
				this.lineTo(x, y);
			}
			else if(cmd === 'V') {
				y = parser.getCurrent(); parser.next();
				this.lineTo(x, y);
			}
			else if(cmd === 'h') {
				x += parser.getCurrent(); parser.next();
				this.lineTo(x, y);
			}
			else if(cmd === 'H') {
				x = parser.getCurrent(); parser.next();
				this.lineTo(x, y);
			}
			else if(cmd === 'c') {
				x1 = x + parser.getCurrent(); parser.next();
				y1 = y + parser.getCurrent(); parser.next();
				x2 = x + parser.getCurrent(); parser.next();
				y2 = y + parser.getCurrent(); parser.next();
				x3 = x + parser.getCurrent(); parser.next();
				y3 = y + parser.getCurrent(); parser.next();
				this.bezierCurveTo(x1, y1, x2, y2, x3, y3);
				x = x3; y = y3;
			}
			else if(cmd === 'C') {
				x1 = parser.getCurrent(); parser.next();
				y1 = parser.getCurrent(); parser.next();
				x2 = parser.getCurrent(); parser.next();
				y2 = parser.getCurrent(); parser.next();
				x3 = parser.getCurrent(); parser.next();
				y3 = parser.getCurrent(); parser.next();
				this.bezierCurveTo(x1, y1, x2, y2, x3, y3);
				x = x3; y = y3;
			}
			else if(cmd === 's') {
				x1 = x + parser.getCurrent(); parser.next();
				y1 = y + parser.getCurrent(); parser.next();
				x2 = x1;
				y2 = y1;
				x3 = x + parser.getCurrent(); parser.next();
				y3 = y + parser.getCurrent(); parser.next();
				this.bezierCurveTo(x1, y1, x2, y2, x3, y3);
				this.lineTo(x3, y3);
				x = x3; y = y3;
			}
			else if(cmd === 'S') {
				x1 = parser.getCurrent(); parser.next();
				y1 = parser.getCurrent(); parser.next();
				x2 = x1;
				y2 = y1;
				x3 = parser.getCurrent(); parser.next();
				y3 = parser.getCurrent(); parser.next();
				this.bezierCurveTo(x1, y1, x2, y2, x3, y3);
				x = x3; y = y3;
			}
			else if(cmd === 'q') {
				x1 = x + parser.getCurrent(); parser.next();
				y1 = y + parser.getCurrent(); parser.next();
				x2 = x + parser.getCurrent(); parser.next();
				y2 = y + parser.getCurrent(); parser.next();
				this.quadraticCurveTo(x1, y1, x2, y2);
				x = x2; y = y2;
			}
			else if(cmd === 'Q') {
				x1 = parser.getCurrent(); parser.next();
				y1 = parser.getCurrent(); parser.next();
				x2 = parser.getCurrent(); parser.next();
				y2 = parser.getCurrent(); parser.next();
				this.quadraticCurveTo(x1, y1, x2, y2);
				x = x2; y = y2;
			}
			else if((cmd === 'z') || (cmd === 'Z')) {
				x = beginX;
				y = beginY;
				this.closePath();
			}
			else {
				throw('Invalid SVG path cmd: '+cmd+' ('+path+')');
			}
		}
	},

	parseFont: function(font) {
		var tab = font.split(' ');
		if(tab.length === 1)
			return { style: 'default', weight: 'normal', size: 16, family: tab[0] };
		if(tab.length === 2)
			return { style: 'default', weight: 'normal', size: parseInt(tab[0]), family: tab[1] };
		else if(tab.length === 3)
			return { style: 'default', weight: tab[0], size: parseInt(tab[1]), family: tab[2] };
		else if(tab.length === 4)
			return { style: tab[0], weight: tab[1], size: parseInt(tab[2]), family: tab[3] };
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

			color = new Ui.Color({ r: rgba.r, g: rgba.g, b: rgba.b, a: rgba.a*opacity });			
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
}, {}, {
	counter: 0
});

if(navigator.supportCanvas) {
	CanvasRenderingContext2D.prototype.roundRect = Core.SVG2DPath.prototype.roundRect;
	CanvasRenderingContext2D.prototype.svgPath = Core.SVG2DContext.prototype.svgPath;
	CanvasRenderingContext2D.prototype.roundRectFilledShadow = Core.SVG2DContext.prototype.roundRectFilledShadow;
}
