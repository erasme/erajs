
Ui.CanvasElement.extend('Ui.CheckBoxGraphic', {
	isEnable: true,
	isDown: false,
	isChecked: false,
	radius: 4,
	color: undefined,
	checkColor: undefined,

	constructor: function(config) {
		this.color = new Ui.Color({ r: 1, g: 1, b: 1 });
		this.checkColor = new Ui.Color({ r: 0.31, g: 0.66, b: 0.31 });
	},

	getIsDown: function() {
		return this.isDown;
	},

	setIsDown: function(isDown) {
		if(this.isDown != isDown) {
			this.isDown = isDown;
			this.invalidateDraw();
		}
	},

	getIsChecked: function() {
		return this.isChecked;
	},

	setIsChecked: function(isChecked) {
		if(this.isChecked != isChecked) {
			this.isChecked = isChecked;
			this.invalidateDraw();
		}
	},

	getIsEnable: function() {
		return this.isEnable;
	},

	setIsEnable: function(isEnable) {
		if(this.isEnable != isEnable) {
			this.isEnable = isEnable;
			this.invalidateDraw();
		}
	},

	setRadius: function(radius) {
		if(this.radius != radius) {
			this.radius = radius;
			this.invalidateMeasure();
			this.invalidateDraw();
		}
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

	setCheckColor: function(color) {
		if(this.checkColor != color) {
			this.checkColor = Ui.Color.create(color);
			this.invalidateDraw();
		}
	},

	getCheckColor: function() {
		var deltaY = 0;
		if(this.getIsDown())
			deltaY = 0.20;
		var yuv = this.checkColor.getYuv();
		return new Ui.Color({ y: yuv.y + deltaY, u: yuv.u, v: yuv.v });
	}
}, {
	updateCanvas: function(ctx) {	
		var w = this.getLayoutWidth();
		var h = this.getLayoutHeight();
		var cx = w/2;
		var cy = h/2;

		// light shadow
		ctx.fillStyle = 'rgba(255,255,255,0.25)';
		ctx.beginPath();
		this.roundRect(cx-12, cy-12+1, 24, 24-1, this.radius, this.radius, this.radius, this.radius);
		ctx.closePath();
		ctx.fill();

		// dark shadow
		ctx.fillStyle = 'rgba(0,0,0,0.4)';
		ctx.beginPath();
		this.roundRect(cx-12, cy-12, 24, 24-1, this.radius, this.radius, this.radius, this.radius);
		ctx.closePath();
		ctx.fill();

		// background
		if(this.getIsDown())
			ctx.globalAlpha = 0.8;
		ctx.fillStyle = this.getColor().getCssRgba();
		ctx.beginPath();
		this.roundRect(cx-12+1, cy-12+1, 24-2, 24-3, this.radius-1, this.radius-1, this.radius-1, this.radius-1);
		ctx.closePath();
		ctx.fill();
		
		// inner shadow
		this.roundRectFilledShadow(cx-12+1, cy-12+1, 24-2, 24-3, this.radius-1, this.radius-1, this.radius-1, this.radius-1, true, 2, new Ui.Color({ a: 0.2 }));

		// handle disable
		if(!this.isEnable)
			ctx.globalAlpha = 0.2;

		if(this.isChecked) {
			// icon
			var iconSize = 20;
			var path = Ui.Icon.getPath('check');
			var scale = iconSize/48;
			// icon
			ctx.save();
			ctx.translate((w-iconSize)/2, (h-iconSize)/2);
			ctx.scale(scale, scale);
			ctx.fillStyle = this.getCheckColor().getCssRgba();
			ctx.beginPath();
			this.svgPath(path);
			ctx.closePath();
			ctx.fill();
			ctx.restore();
		}
	},

	measureCore: function(width, height) {
		return { width: 30, height: 30 };
	}
});
