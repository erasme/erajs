Ui.CanvasElement.extend('Ui.Rectangle', 
/**@lends Ui.Rectangle#*/
{
	fill: undefined,
	radiusTopLeft: 0,
	radiusTopRight: 0,
	radiusBottomLeft: 0,
	radiusBottomRight: 0,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.Shape
	 */
	constructor: function(config) {
		this.fill = new Ui.Color({ r: 0, g: 0, b: 0 });
	},

	getFill: function() {
		return this.fill;
	},

	setFill: function(fill) {
		if(this.fill != fill) {
			if(typeof(fill) === 'string')
				fill = Ui.Color.create(fill);
			else
				fill = Ui.Element.create(fill);
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
}, 
/**@lends Ui.Rectangle#*/ 
{
	updateCanvas: function(ctx) {
		ctx.beginPath();
		ctx.roundRect(0, 0, this.getLayoutWidth(), this.getLayoutHeight(),
			this.radiusTopLeft, this.radiusTopRight, this.radiusBottomRight,
			this.radiusBottomLeft);
		ctx.closePath();
		if(Ui.Color.hasInstance(this.fill))
			ctx.fillStyle = this.fill.getCssRgba();
		else if(Ui.LinearGradient.hasInstance(this.fill))
			ctx.fillStyle = this.fill.getCanvasGradient(ctx, this.getLayoutWidth(), this.getLayoutHeight());
		ctx.fill();		
	}
});

