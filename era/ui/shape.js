
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
	},

	setScale: function(scale) {
		if(this.scale != scale) {
			this.scale = scale;
			this.invalidateDraw();
		}
	},

	getFill: function() {
		if(this.fill === undefined)
			return Ui.Color.create(this.getStyleProperty('color'));
		else
			return this.fill;
	},

	setFill: function(fill) {
		if(this.fill !== fill) {
			if(typeof(fill) === 'string')
				fill = Ui.Color.create(fill);
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
	onStyleChange: function() {
		this.invalidateDraw();
	},

	updateCanvas: function(ctx) {
		if(this.path === undefined)
			return;

		if(this.scale != 1)
			ctx.scale(this.scale, this.scale);

		ctx.svgPath(this.path);

		var fill = this.getFill();		
		if(Ui.Color.hasInstance(fill))
			ctx.fillStyle = fill.getCssRgba();
		else if(Ui.LinearGradient.hasInstance(fill))
			ctx.fillStyle = fill.getCanvasGradient(ctx, this.getLayoutWidth(), this.getLayoutHeight());
		ctx.fill();
	}
}, {
	style: {
		color: '#444444'
	}
});


