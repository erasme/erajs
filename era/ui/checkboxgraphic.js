
Ui.CanvasElement.extend('Ui.CheckBoxGraphic', {
	isDown: false,
	isChecked: false,
	color: undefined,
	checkColor: undefined,
	activeColor: undefined,
	borderWidth: 2,
	radius: 3,

	constructor: function(config) {
		this.color = new Ui.Color({ r: 1, g: 1, b: 1 });
		this.activeColor = new Ui.Color({ r: 0.31, g: 0.66, b: 0.31 });
		this.checkColor = new Ui.Color({ r: 1, g: 1, b: 1 });
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

	setRadius: function(radius) {
		if(this.radius !== radius) {
			this.radius = radius;
			this.invalidateDraw();
		}
	},

	getColor: function() {
		return this.color;
	},

	setColor: function(color) {
		if(this.color !== color) {
			this.color = Ui.Color.create(color);
			this.invalidateDraw();
		}
	},

	setBorderWidth: function(borderWidth) {
		if(this.borderWidth !== borderWidth) {
			this.borderWidth = borderWidth;
			this.invalidateDraw();
		}
	},

	setCheckColor: function(color) {
		if(this.checkColor !== color) {
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

		var radius = Math.min(this.radius, 10);

		// background
		if(this.getIsDown())
			ctx.globalAlpha = 0.8;

		// handle disable
		if(this.getIsDisabled())
			ctx.globalAlpha = 0.4;

		if(!this.isChecked) {
			// border
			ctx.strokeStyle = this.getColor().getCssRgba();
			ctx.lineWidth = this.borderWidth;
			ctx.beginPath();
			ctx.roundRect(cx-10+this.borderWidth/2, cy-10+this.borderWidth/2, 20-this.borderWidth, 20-this.borderWidth, radius, radius, radius, radius);
			ctx.closePath();
			ctx.stroke();
		}
		else {
			// border
			ctx.fillStyle = this.getColor().getCssRgba();
			ctx.beginPath();
			ctx.roundRect(cx-10, cy-10, 20, 20, radius, radius, radius, radius);
			ctx.closePath();
			ctx.fill();

			ctx.globalAlpha = 1;

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
			ctx.svgPath(path);
			ctx.closePath();
			ctx.fill();
			ctx.restore();
		}
	},

	measureCore: function(width, height) {
		return { width: 30, height: 30 };
	},
	
	onDisable: function() {
		this.invalidateDraw();
	},

	onEnable: function() {
		this.invalidateDraw();
	}
});
