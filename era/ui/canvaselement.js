Ui.Container.extend('Ui.CanvasElement', 
/**@lends Ui.CanvasElement#*/
{
	context: undefined,

	/**
	 * @constructs
	 * @class The base class for all Canvas drawing
	 * @extends Ui.Element
	 */
	constructor: function(config){
	},

	/**
	 * Call this method when the canvas need to be redraw
	 */
	update: function() {
		this.context.clearRect(0, 0, this.getLayoutWidth(), this.getLayoutHeight());
		this.context.save();
		this.updateCanvas(this.context);
		this.context.restore();
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
	},

	roundRect: function(x, y, width, height, radiusTopLeft, radiusTopRight, radiusBottomRight, radiusBottomLeft, antiClockwise) {
		if((antiClockwise != undefined) && antiClockwise) {
			this.roundRectAntiClockwise(x, y, width, height, radiusTopLeft, radiusTopRight, radiusBottomRight, radiusBottomLeft);
			return;
		}
		if(radiusTopLeft > 0) {
			this.context.moveTo(x+0, y+radiusTopLeft);
			this.context.quadraticCurveTo(x+0,y+0,x+radiusTopLeft,y+0);
		}
		else
			this.context.moveTo(x+0,y+0);
		if(radiusTopRight > 0) {
			this.context.lineTo(x+(width-radiusTopRight),y+0);
			this.context.quadraticCurveTo(x+width,y+0,x+width,y+radiusTopRight);
		}
		else
			this.context.lineTo(x+width,y+0);
		if(radiusBottomRight > 0) {
			this.context.lineTo(x+width,y+(height-radiusBottomRight));
			this.context.quadraticCurveTo(x+width,y+height,x+(width-radiusBottomRight),y+height);
		}
		else
			this.context.lineTo(x+width,y+height);
		if(radiusBottomLeft > 0) {
			this.context.lineTo(x+radiusBottomLeft,y+height);
			this.context.quadraticCurveTo(x+0,y+height,x+0,y+(height-radiusBottomLeft));
		}
		else
			this.context.lineTo(x+0,y+height);
	},

	roundRectAntiClockwise: function(x, y, width, height, radiusTopLeft, radiusTopRight, radiusBottomRight, radiusBottomLeft) {
		if(radiusTopLeft > 0) {
			this.context.moveTo(x+radiusTopLeft, y+0);
			this.context.quadraticCurveTo(x+0,y+0,x+0,y+radiusTopLeft);
		}
		else
			this.context.moveTo(x+0,y+0);
		if(radiusBottomLeft > 0) {
			this.context.lineTo(x+0,y+(height-radiusBottomLeft));
			this.context.quadraticCurveTo(x+0,y+height,x+radiusBottomLeft,y+height);
		}
		else
			this.context.lineTo(x+0,y+height);
		if(radiusBottomRight > 0) {
			this.context.lineTo(x+(width-radiusBottomRight),y+height);
			this.context.quadraticCurveTo(x+width,y+height,x+width,y+(height-radiusBottomRight));
		}
		else
			this.context.lineTo(x+width,y+height);
		if(radiusTopRight > 0) {
			this.context.lineTo(x+width,y+radiusTopRight);
			this.context.quadraticCurveTo(x+width,y+0,x+(width-radiusTopRight),y+0);
		}
		else
			this.context.lineTo(x+width,y+0);
	},

	roundRectFilledShadow: function(x, y, width, height, radiusTopLeft, radiusTopRight, radiusBottomRight, radiusBottomLeft, inner, shadowWidth, color) {
		this.context.save();
		var rgba = color.getRgba();
		for(var i = 0; i < shadowWidth; i++) {
			var opacity;
			if(inner) {
				if(shadowWidth == 1)
					opacity = 1;
				else {
					var x = (i + 1) / shadowWidth;
					opacity = x * x;
				}
			}
			else
				opacity = (i+1) / (shadowWidth + 1);

			var color = new Ui.Color({ r: rgba.r, g: rgba.g, b: rgba.b, a: rgba.a*opacity });			
			this.context.fillStyle = color.getCssRgba();

			if(inner) {
				this.context.beginPath();
				this.roundRect(x, y, width, height, radiusTopLeft, radiusTopRight, radiusBottomRight, radiusBottomLeft);
				this.roundRect(x+shadowWidth-i, y+shadowWidth-i, width-((shadowWidth-i)*2), height-((shadowWidth-i)*2), radiusTopLeft, radiusTopRight, radiusBottomRight, radiusBottomLeft, true);
				this.context.closePath();
				this.context.fill();			
			}
			else {
				this.context.beginPath();
				this.roundRect(x+i, y+i, width-i*2, height-i*2, radiusTopLeft, radiusTopRight, radiusBottomRight, radiusBottomLeft);
				this.context.closePath();
				this.context.fill();
			}
		}
		this.context.restore();
	},

	svgPath: function(path) {	
		var ctx = this.context;
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
			else if(cmd == 'v') {
				y += parser.getCurrent(); parser.next();
				ctx.lineTo(x, y);
			}
			else if(cmd == 'V') {
				y = parser.getCurrent(); parser.next();
				ctx.lineTo(x, y);
			}
			else if(cmd == 'h') {
				x += parser.getCurrent(); parser.next();
				ctx.lineTo(x, y);
			}
			else if(cmd == 'H') {
				x = parser.getCurrent(); parser.next();
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
			else if(cmd == 's') {
				var x1 = x + parser.getCurrent(); parser.next();
				var y1 = y + parser.getCurrent(); parser.next();
				var x2 = x1;
				var y2 = y1;
				var x3 = x + parser.getCurrent(); parser.next();
				var y3 = y + parser.getCurrent(); parser.next();
				ctx.bezierCurveTo(x1, y1, x2, y2, x3, y3);
				ctx.lineTo(x3, y3);
				x = x3; y = y3;
			}
			else if(cmd == 'S') {
				var x1 = parser.getCurrent(); parser.next();
				var y1 = parser.getCurrent(); parser.next();
				var x2 = x1;
				var y2 = y1;
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
				console.log('Invalid SVG path cmd: '+cmd+' ('+path+')');
				throw('Invalid SVG path');
			}
		}
		ctx.closePath();
	}
}, 
/**@lends Ui.CanvasElement#*/
{
	renderDrawing: function() {
		var canvas = document.createElement('canvas');
		if('G_vmlCanvasManager' in window)
			canvas = G_vmlCanvasManager.initElement(canvas);
		this.context = canvas.getContext('2d');
		this.canvas = canvas;
		return canvas;
	},

	arrangeCore: function(width, height) {
		this.getDrawing().setAttribute('width', width, null);
		this.getDrawing().setAttribute('height', height, null);
		if(this.getIsVisible() && this.getIsLoaded())
			this.update();
	},

	drawCore: function() {
		this.update();
	}
});

