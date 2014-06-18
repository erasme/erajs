
Ui.CanvasElement.extend('Ui.Frame', {
	fill: undefined,
	radiusTopLeft: 0,
	radiusTopRight: 0,
	radiusBottomLeft: 0,
	radiusBottomRight: 0,
	frameWidth: 10,

	constructor: function(config) {
		this.fill = new Ui.Color({ r: 0, g: 0, b: 0 });
	},

	getFrameWidth: function() {
		return this.frameWidth;
	},

	setFrameWidth: function(frameWidth) {
		if(frameWidth != this.frameWidth) {
			this.frameWidth = frameWidth;
			this.invalidateDraw();
		}
	},

	getFill: function() {
		return this.fill;
	},

	setFill: function(fill) {
		if(this.fill != fill) {
			if(typeof(fill) === 'string')
				fill = Ui.Color.create(fill);
			this.fill = fill;
			this.invalidateDraw();
		}
	},

	setRadius: function(radius) {
		this.setRadiusTopLeft(radius);
		this.setRadiusTopRight(radius);
		this.setRadiusBottomLeft(radius);
		this.setRadiusBottomRight(radius);
	},

	getRadiusTopLeft: function() {
		return this.radiusTopLeft;
	},

	setRadiusTopLeft: function(radiusTopLeft) {
		if(this.radiusTopLeft != radiusTopLeft) {
			this.radiusTopLeft = radiusTopLeft;
			this.invalidateDraw();
		}
	},

	getRadiusTopRight: function() {
		return this.radiusTopRight;
	},

	setRadiusTopRight: function(radiusTopRight) {
		if(this.radiusTopRight != radiusTopRight) {
			this.radiusTopRight = radiusTopRight;
			this.invalidateDraw();
		}
	},

	getRadiusBottomLeft: function() {
		return this.radiusBottomLeft;
	},

	setRadiusBottomLeft: function(radiusBottomLeft) {
		if(this.radiusBottomLeft != radiusBottomLeft) {
			this.radiusBottomLeft = radiusBottomLeft;
			this.invalidateDraw();
		}
	},

	getRadiusBottomRight: function() {
		return this.radiusBottomRight;
	},

	setRadiusBottomRight: function(radiusBottomRight) {
		if(this.radiusBottomRight != radiusBottomRight) {
			this.radiusBottomRight = radiusBottomRight;
			this.invalidateDraw();
		}
	}
}, {
	updateCanvas: function(ctx) {
		var w = this.getLayoutWidth();
		var h = this.getLayoutHeight();
		var topLeft = this.radiusTopLeft;
		var topRight = this.radiusTopRight;
		if(topLeft + topRight > w) {
			topLeft = w/2;
			topRight = w/2;
		}
		var bottomLeft = this.radiusBottomLeft;
		var bottomRight = this.radiusBottomRight;
		if(bottomLeft + bottomRight > w) {
			bottomLeft = w/2;
			bottomRight = w/2;
		}
		if(topLeft + bottomLeft > h) {
			topLeft = h/2;
			bottomLeft = h/2;
		}
		if(topRight + bottomRight > h) {
			topRight = h/2;
			bottomRight = h/2;
		}

		ctx.beginPath();
		ctx.roundRect(0, 0, w, h, topLeft, topRight, bottomRight, bottomLeft);
		ctx.roundRect(this.frameWidth, this.frameWidth, w-(this.frameWidth*2), h-(this.frameWidth*2), topLeft, topRight, bottomRight, bottomLeft, true);
		ctx.closePath();
		if(Ui.Color.hasInstance(this.fill))
			ctx.fillStyle = this.fill.getCssRgba();
		else if(Ui.LinearGradient.hasInstance(this.fill))
			ctx.fillStyle = this.fill.getCanvasGradient(ctx, w, h);
		ctx.fill();		
	}
});
	