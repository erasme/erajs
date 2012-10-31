
Ui.CanvasElement.extend('Ui.Shape', 
/**@lends Ui.Shape*/
{
	fill: undefined,
	path: undefined,
	scale: 1,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.Element
	*/
	constructor: function(config) {
		this.fill = new Ui.Color({ r: 0, g: 0, b: 0 });
	},

	setScale: function(scale) {
		if(this.scale != scale) {
			this.scale = scale;
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
			else
				fill = Ui.Element.create(fill);
			this.fill = fill;
			this.invalidateDraw();
		}
	},

	setPath: function(path) {
		if(this.path != path) {
			this.path = path;
			this.invalidateDraw();
		}
	}
}, {
	updateCanvas: function(ctx) {
		if(this.path === undefined)
			return;

		if(this.scale != 1)
			ctx.scale(this.scale, this.scale);

		this.svgPath(this.path);

		if(Ui.Color.hasInstance(this.fill))
			ctx.fillStyle = this.fill.getCssRgba();
		else if(Ui.LinearGradient.hasInstance(this.fill))
			ctx.fillStyle = this.fill.getCanvasGradient(ctx, this.getLayoutWidth(), this.getLayoutHeight());
		ctx.fill();
	}
});


