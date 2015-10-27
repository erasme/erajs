Ui.CanvasElement.extend('Ui.Loading', {
	fill: 'black',
	clock: undefined,
	ease: undefined,

	constructor: function(config) {
		if('fill' in config) {
			this.setFill(config.fill);
			delete(config.fill);
		}
		else
			this.setFill(this.fill);

		this.ease = new Anim.PowerEase({ mode: 'inout' });
		this.clock = new Anim.Clock({ repeat: 'forever', duration: 2 });
		this.connect(this.clock, 'timeupdate', this.onTick);
	},

	setFill: function(fill) {
		this.fill = Ui.Color.create(fill);
		this.invalidateDraw();
	},

	onTick: function(clock, progress) {
		this.invalidateDraw();
	}
}, {
	onVisible: function() {
		Ui.Loading.base.onVisible.apply(this, arguments);
		this.clock.begin();
	},

	onHidden: function() {
		Ui.Loading.base.onHidden.apply(this, arguments);
		this.clock.stop();
	},

	updateCanvas: function(ctx) {
		var p = this.clock.getProgress();
		if(p === undefined)
			p = 0;
		var p2 = (p > 0.8) ? (1 - ((p - 0.8)*5)) : (p / 0.8);

		var w = this.getLayoutWidth();
		var h = this.getLayoutHeight();
		var x = w / 2;
		var y = h / 2;
		var lineWidth = Math.max(2, Math.min(5, Math.min(w, h) * 5 / 60));
		var radius = ((Math.min(w, h) - lineWidth) / 2) - 5;
		var startAngle = Math.PI * 2 * p;
		if(p > 0.8)
			startAngle = Math.PI * 2 * p - (Math.PI * 2 * 5 * this.ease.ease(p2) / 6);
		var endAngle = startAngle + (Math.PI / 4) + (Math.PI * 2 * 5 * this.ease.ease(p2) / 6);

		ctx.strokeStyle = this.getStyleProperty('color').getCssRgba();
		ctx.beginPath();
		ctx.arc(x, y, radius, startAngle, endAngle, false);
		ctx.lineWidth = lineWidth;
		ctx.stroke();
	},

	measureCore: function(width, height) {
		return { width: 30, height: 30 };
	}
}, {
	style: {
		color: new Ui.Color({ r: 0.27, g: 0.52, b: 0.9 })
	}
});

