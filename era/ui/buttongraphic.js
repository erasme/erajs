
Ui.CanvasElement.extend('Ui.ButtonGraphic', {
	text: undefined,
	icon: undefined,
	iconSize: 24,
	orientation: 'vertical',
	isDown: false,
	radius: 4,
	spacing: 3,
	color: undefined,
	contentColor: undefined,
	fontSize: 16,
	fontFamily: 'Sans-serif',
	fontWeight: 'normal',
	textWidth: 0,

	constructor: function(config) {
		this.color = new Ui.Color({ r: 0.31, g: 0.66, b: 1 });
	},

	getText: function() {
		return this.text;
	},

	setText: function(text) {
		if(this.text != text) {
			this.text = text;
			this.invalidateMeasure();
			this.invalidateDraw();
		}
	},

	getIcon: function() {
		return this.icon;
	},

	setIcon: function(icon) {
		if(this.icon != icon) {
			this.icon = icon;
			this.invalidateMeasure();
			this.invalidateDraw();
		}
	},

	setIconSize: function(size) {
		if(this.iconSize != size) {
			this.iconSize = size;
			this.invalidateMeasure();
			this.invalidateDraw();
		}
	},

	getOrientation: function() {
		return this.orientation;
	},

	setOrientation: function(orientation) {
		if(this.orientation != orientation) {
			this.orientation = orientation;
			this.invalidateMeasure();
			this.invalidateDraw();
		}
	},

	setFontSize: function(fontSize) {
		if(this.fontSize != fontSize) {
			this.fontSize = fontSize;
			this.invalidateMeasure();
			this.invalidateDraw();
		}
	},

	getFontSize: function() {
		return this.fontSize;
	},

	setFontFamily: function(fontFamily) {
		if(this.fontFamily != fontFamily) {
			this.fontFamily = fontFamily;
			this.invalidateMeasure();
			this.invalidateDraw();
		}
	},

	getFontFamily: function() {
		return this.fontFamily;
	},

	setFontWeight: function(fontWeight) {
		if(this.fontWeight != fontWeight) {
			this.fontWeight = fontWeight;
			this.invalidateMeasure();
			this.invalidateDraw();
		}
	},

	getFontWeight: function() {
		return this.fontWeight;
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

	setRadius: function(radius) {
		if(this.radius != radius) {
			this.radius = radius;
			this.invalidateMeasure();
			this.invalidateDraw();
		}
	},

	setSpacing: function(spacing) {
		if(this.spacing != spacing) {
			this.spacing = spacing;
			this.invalidateMeasure();
			this.invalidateDraw();
		}
	},

	setColor: function(color) {
		if(this.color != color) {
			this.color = Ui.Color.create(color);
			this.invalidateDraw();
		}
	},

	setContentColor: function(color) {
		if(this.contentColor != color) {
			this.contentColor = Ui.Color.create(color);
			this.invalidateDraw();
		}
	},

	getGradient: function() {
		var yuv = this.color.getYuv();
		var deltaY = 0;
		if(this.getIsDown())
			deltaY = -0.20;
		return new Ui.LinearGradient({ stops: [
			{ offset: 0, color: new Ui.Color({ y: yuv.y + 0.10 + deltaY, u: yuv.u, v: yuv.v }) },
			{ offset: 1, color: new Ui.Color({ y: yuv.y - 0.10 + deltaY, u: yuv.u, v: yuv.v }) }
		] });
	},

	getContentColor: function() {
		var deltaY = 0;
		if(this.getIsDown())
			deltaY = 0.20;
		if(this.contentColor != undefined) {
			var yuv = this.contentColor.getYuv();
			return new Ui.Color({ y: yuv.y + deltaY, u: yuv.u, v: yuv.v });
		}
		else {
			var yuv = this.color.getYuv();
			if(yuv.y < 0.4)
				return new Ui.Color({ y: yuv.y + (0.60 + deltaY), u: yuv.u, v: yuv.v });
			else
				return new Ui.Color({ y: yuv.y - (0.60 + deltaY), u: yuv.u, v: yuv.v });
		}
	},
	
	getDarkColor: function() {
		var yuv = this.color.getYuv();
		var deltaY = 0;
		if(this.getIsDown())
			deltaY = -0.20;
		if(yuv.y < 0.4)
			return new Ui.Color({ y: yuv.y - 0.60 + deltaY, u: yuv.u, v: yuv.v, a: 0.8 });
		else
			return new Ui.Color({ y: yuv.y - 0.40 + deltaY, u: yuv.u, v: yuv.v, a: 0.4 });
	},

	getLightColor: function() {
		var yuv = this.color.getYuv();
		var deltaY = 0;
		if(this.getIsDown())
			deltaY = -0.20;
		if(yuv.y < 0.4)
			return new Ui.Color({ y: yuv.y - 0.15 + deltaY, u: yuv.u, v: yuv.v });
		else
			return new Ui.Color({ y: yuv.y + 0.15 + deltaY, u: yuv.u, v: yuv.v });
	}

}, {
	updateCanvas: function(ctx) {	
		var width = this.getLayoutWidth();
		var height = this.getLayoutHeight();

		// dark shadow
		ctx.fillStyle = this.getDarkColor().getCssRgba();//'rgba(0,0,0,0.3)';
		ctx.beginPath();
		this.roundRect(0, 0, width, height, this.radius+1, this.radius+1, this.radius+1, this.radius+1);
		ctx.closePath();
		ctx.fill();

		// rect2
		ctx.fillStyle = this.getLightColor().getCssRgba();
		ctx.beginPath();
		this.roundRect(1, 1, width-2, height-2, this.radius, this.radius, this.radius, this.radius);
		ctx.closePath();
		ctx.fill();

		// handle disable
		if(this.getIsDisabled())
			ctx.globalAlpha = 0.2;

		// icon only
		if((this.icon !== undefined) && (this.text === undefined)) {
			var path = Ui.Icon.getPath(this.icon);
			var scale = this.iconSize/48;
			// icon
			ctx.save();
			ctx.translate((width-this.iconSize)/2, (height-this.iconSize)/2);
			ctx.scale(scale, scale);
			ctx.fillStyle = this.getContentColor().getCssRgba();
			ctx.beginPath();
			this.svgPath(path);
			ctx.closePath();
			ctx.fill();
			ctx.restore();
		}
		// text only
		else if((this.icon === undefined) && (this.text !== undefined)) {
			// text
			ctx.font = 'normal '+this.fontWeight+' '+this.fontSize+'px '+this.fontFamily;
			ctx.textBaseline = 'middle';
			ctx.fillStyle = this.getContentColor().getCssRgba();
			ctx.fillText(this.text, (width-this.textWidth)/2, height/2+2);
		}
		// text + icon
		else if((this.icon !== undefined) && (this.text !== undefined)) {
			// vertical
			if(this.orientation == 'vertical') {
				var path = Ui.Icon.getPath(this.icon);
				var scale = this.iconSize/48;
				// icon
				ctx.save();
				ctx.translate((width-this.iconSize)/2, (height-this.fontSize-this.iconSize-this.spacing)/2);
				ctx.scale(scale, scale);
				ctx.fillStyle = this.getContentColor().getCssRgba();
				ctx.beginPath();
				this.svgPath(path);
				ctx.closePath();
				ctx.fill();
				ctx.restore();
				// text
				ctx.font = this.fontWeight+' '+this.fontSize+'px '+this.fontFamily;
				ctx.textBaseline = 'top';
				ctx.fillStyle = this.getContentColor().getCssRgba();
				ctx.fillText(this.text, (width-this.textWidth)/2, height-this.fontSize-4-this.spacing-1);
			}
			// horizontal
			else {
				var path = Ui.Icon.getPath(this.icon);
				var scale = this.iconSize/48;
				// icon
				ctx.save();
				ctx.translate(this.spacing+4, (height-this.iconSize)/2 -1);
				ctx.scale(scale, scale);
				ctx.fillStyle = this.getContentColor().getCssRgba();
				ctx.beginPath();
				this.svgPath(path);
				ctx.closePath();
				ctx.fill();
				ctx.restore();
				// text
				ctx.font = 'normal '+this.fontWeight+' '+this.fontSize+'px '+this.fontFamily;
				ctx.textBaseline = 'middle';
				ctx.fillStyle = this.getContentColor().getCssRgba();
				ctx.fillText(this.text, this.spacing*3+this.iconSize, height/2 +1);
//				ctx.fillText(this.text, (this.spacing+this.iconSize+width-this.textWidth)/2, height/2 +1);
			}
		}
	},

	measureCore: function(width, height) {
		// measure text if needed
		if(this.text != undefined)
			this.textWidth = Ui.Label.measureText(this.text, this.fontSize, this.fontFamily, this.fontWeight).width;

		var size = { width: 10, height: 10 };
		// icon only
		if((this.icon !== undefined) && (this.text === undefined)) {
			size = { width: this.iconSize + this.spacing*2 + 6, height: this.iconSize + this.spacing*2 + 6 };
		}
		// text only
		else if((this.icon === undefined) && (this.text !== undefined)) {
			size = { width: this.textWidth + this.spacing*2 + 6, height: this.fontSize + this.spacing*2 + 6 };
		}
		// text + icon
		else if((this.icon !== undefined) && (this.text !== undefined)) {
			// vertical
			if(this.orientation == 'vertical')
				size = { width: Math.max(this.textWidth, this.iconSize) + this.spacing*2 + 6, height: this.iconSize + this.fontSize + this.spacing*3 + 6 };
			// horizontal
			else
				size = { width: this.textWidth + this.iconSize + this.spacing*4 + 6, height: Math.max(this.iconSize, this.fontSize) + this.spacing*2 + 6 };
		}
		return size;
	},
	
	onDisable: function() {
		this.invalidateDraw();
	},

	onEnable: function() {
		this.invalidateDraw();
	}
});