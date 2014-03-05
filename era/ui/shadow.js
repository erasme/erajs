
Ui.CanvasElement.extend('Ui.Shadow', 
/**@lends Ui.Shadow#*/
{
	radiusTopLeft: 0,
	radiusTopRight: 0,
	radiusBottomLeft: 0,
	radiusBottomRight: 0,
	shadowWidth: 0,
	inner: false,
	color: undefined,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.LBox
	 */
	constructor: function(config) {
		this.color = Ui.Color.create('black');
		this.setShadowWidth(4);
	},

	getColor: function() {
		return this.color;
	},

	setColor: function(color) {
		if(this.color != color) {
			this.color = Ui.Color.create(color);
			this.invalidateDraw();
		}
	},

	getInner: function() {
		return this.inner;
	},

	setInner: function(inner) {
		if(this.inner != inner) {
			this.inner = inner;
			this.invalidateDraw();
		}
	},

	setShadowWidth: function(shadowWidth) {
		if(this.shadowWidth != shadowWidth) {
			this.shadowWidth = shadowWidth;
			this.invalidateDraw();
		}
	},

	getShadowWidth: function(){
		return this.shadowWidth;
	},

	setRadius: function(radius) {
		this.radiusTopLeft = radius;
		this.radiusTopRight = radius;
		this.radiusBottomLeft = radius;
		this.radiusBottomRight = radius;
		this.invalidateDraw();
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
		var width = this.getLayoutWidth();
		var height = this.getLayoutHeight();

		for(var i = 0; i < this.shadowWidth; i++) {
			var rgba = this.color.getRgba();
			var opacity;
			if(this.inner) {
				if(this.shadowWidth == 1)
					opacity = 1;
				else {
					var x = (i + 1) / this.shadowWidth;
					opacity = x * x;
				}
			}
			else
				opacity = (i+1) / (this.shadowWidth + 1);

			var color = new Ui.Color({ r: rgba.r, g: rgba.g, b: rgba.b, a: rgba.a*opacity });
			ctx.fillStyle = color.getCssRgba();

			if(this.inner) {
				ctx.beginPath();
				ctx.roundRect(0, 0, width, height, this.radiusTopLeft, this.radiusTopRight, this.radiusBottomRight, this.radiusBottomLeft);
				ctx.roundRect(this.shadowWidth-i, this.shadowWidth-i, width-((this.shadowWidth-i)*2), height-((this.shadowWidth-i)*2), this.radiusTopLeft, this.radiusTopRight, this.radiusBottomRight, this.radiusBottomLeft, true);
				ctx.closePath();
				ctx.fill();			
			}
			else {
				ctx.beginPath();
				ctx.roundRect(i, i, width-i*2, height-i*2, this.radiusTopLeft, this.radiusTopRight, this.radiusBottomRight, this.radiusBottomLeft);
				ctx.closePath();
				ctx.fill();
			}
		}
	}
});

