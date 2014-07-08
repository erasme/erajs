

Ui.CanvasElement.extend('Ui.DualIcon', {
	icon: undefined,
	fill: undefined,
	stroke: undefined,
	strokeWidth: undefined,

	constructor: function(config) {
		this.icon = config.icon;
		delete(config.icon);
	},

	getFill: function() {
		if(this.fill === undefined)
			return Ui.Color.create(this.getStyleProperty('fill'));
		else
			return this.fill;
	},
	
	setFill: function(fill) {
		this.fill = Ui.Color.create(fill);
		this.invalidateDraw();
	},

	getStroke: function() {
		if(this.stroke === undefined)
			return Ui.Color.create(this.getStyleProperty('stroke'));
		else
			return this.stroke;
	},
			
	setStroke: function(stroke) {
		this.stroke = Ui.Color.create(stroke);
		this.invalidateDraw();
	},

	getStrokeWidth: function() {
		if(this.strokeWidth === undefined)
			return this.getStyleProperty('strokeWidth');
		else
			return this.strokeWidth;
	},

	setStrokeWidth: function(strokeWidth) {
		this.strokeWidth = strokeWidth;
		this.invalidateDraw();
	}
}, {
	updateCanvas: function(ctx) {
		var strokeWidth = this.getStrokeWidth();
		ctx.save();
		var scale = Math.min(this.getLayoutWidth(), this.getLayoutHeight())/48;
		ctx.scale(scale, scale);
		ctx.translate(strokeWidth, strokeWidth);
		var scale2 = (48-(strokeWidth*2))/48;
		ctx.scale(scale2, scale2);
		ctx.svgPath(Ui.Icon.getPath(this.icon));
		ctx.strokeStyle = this.getStroke().getCssRgba();
		ctx.lineWidth = strokeWidth*2;
		ctx.stroke();
		ctx.fillStyle = this.getFill().getCssRgba();
		ctx.fill();
		ctx.restore();
	}
}, {
	style: {
		fill: '#ffffff',
		stroke: '#000000',
		strokeWidth: 2
	}
});


