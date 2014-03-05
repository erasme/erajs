
Ui.CanvasElement.extend('Ui.ButtonGraphic', {
	text: undefined,
	icon: undefined,
	iconSize: 24,
	orientation: undefined,
	isDown: false,
	buttonHasFocus: false,
	fontSize: 16,
	fontFamily: 'Sans-serif',
	fontWeight: 'normal',
	textWidth: 0,
	spacing: 3,

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
	
	getOrientation: function() {
		var orientation = this.orientation;
		if(orientation === undefined)
			orientation = this.getStyleProperty('orientation');
		return (orientation === 'vertical')?'vertical':'horizontal';
	},

	setOrientation: function(orientation) {
		if(this.orientation !== orientation) {
			this.orientation = orientation;
			this.invalidateMeasure();
			this.invalidateDraw();
		}
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

	setHasFocus: function(hasFocus) {
		if(this.buttonHasFocus !== hasFocus) {
			this.buttonHasFocus = hasFocus;
			this.invalidateDraw();
		}
	},

	getBackground: function() {
		var color;
		if(this.buttonHasFocus)
			color = Ui.Color.create(this.getStyleProperty('focusBackground'));
		else
			color = Ui.Color.create(this.getStyleProperty('background'));
		var yuv = color.getYuva();
		var deltaY = 0;
		if(this.getIsDown())
			deltaY = -0.20;
		if(yuv.y < 0.4)
			return new Ui.Color({ y: yuv.y + deltaY, u: yuv.u, v: yuv.v, a: yuv.a });
		else
			return new Ui.Color({ y: yuv.y + deltaY, u: yuv.u, v: yuv.v, a: yuv.a });
	},

	getBackgroundDark: function() {
		var color;
		if(this.buttonHasFocus)
			color = Ui.Color.create(this.getStyleProperty('focusBackground'));
		else
			color = Ui.Color.create(this.getStyleProperty('background'));
		var yuv = color.getYuva();
		var deltaY = 0;
		if(this.getIsDown())
			deltaY = -0.20;
		if(yuv.y < 0.5)
			return new Ui.Color({ y: yuv.y - 0.30 + deltaY, u: yuv.u, v: yuv.v, a: yuv.a });
		else
			return new Ui.Color({ y: yuv.y - 0.20 + deltaY, u: yuv.u, v: yuv.v, a: yuv.a });
	},

	getForeground: function() {
		var color;
		if(this.buttonHasFocus)
			color = Ui.Color.create(this.getStyleProperty('focusForeground'));
		else
			color = Ui.Color.create(this.getStyleProperty('foreground'));
		var deltaY = 0;
		if(this.getIsDown())
			deltaY = 0.20;
		var yuv = color.getYuva();
		if(yuv.y < 0.4)
			return new Ui.Color({ y: yuv.y + deltaY, u: yuv.u, v: yuv.v, a: yuv.a });
		else
			return new Ui.Color({ y: yuv.y - deltaY, u: yuv.u, v: yuv.v, a: yuv.a });
	}
}, {
	updateCanvas: function(ctx) {
		var path; var scale;
		var width = this.getLayoutWidth();
		var height = this.getLayoutHeight();

		var radius = Math.min(this.getStyleProperty('radius'), (Math.min(width, height)/2));
		var orientation = this.getOrientation();

		// rect
		ctx.fillStyle = this.getBackground().getCssRgba();
		ctx.beginPath();
		ctx.roundRect(0, 0, width, height, radius, radius, radius, radius);
		ctx.closePath();
		ctx.fill();

		// border
		ctx.fillStyle = this.getBackgroundDark().getCssRgba();//'rgba(0,0,0,0.3)';
		ctx.beginPath();
		ctx.roundRect(0, 0, width, height, radius, radius, radius, radius);
		ctx.roundRect(1, 1, width-2, height-2, radius-1, radius-1, radius-1, radius-1, true);
		ctx.closePath();
		ctx.fill();

		// handle disable
		if(this.getIsDisabled())
			ctx.globalAlpha = 0.4;

		// icon only
		if((this.icon !== undefined) && (this.text === undefined)) {
			path = Ui.Icon.getPath(this.icon);
			scale = this.iconSize/48;
			// icon
			ctx.save();
			ctx.translate((width-this.iconSize)/2, (height-this.iconSize)/2);
			ctx.scale(scale, scale);
			ctx.fillStyle = this.getForeground().getCssRgba();
			ctx.beginPath();
			ctx.svgPath(path);
			ctx.closePath();
			ctx.fill();
			ctx.restore();
		}
		// text only
		else if((this.icon === undefined) && (this.text !== undefined)) {
			// text
			ctx.font = 'normal '+this.fontWeight+' '+this.fontSize+'px '+this.fontFamily;
			ctx.textBaseline = 'middle';
			ctx.fillStyle = this.getForeground().getCssRgba();
			ctx.fillText(this.text, (width-this.textWidth)/2, height/2+2);
		}
		// text + icon
		else if((this.icon !== undefined) && (this.text !== undefined)) {
			// vertical
			if(orientation === 'vertical') {
				path = Ui.Icon.getPath(this.icon);
				scale = this.iconSize/48;
				// icon
				ctx.save();
				ctx.translate((width-this.iconSize)/2, (height-this.fontSize-this.iconSize-this.spacing)/2);
				ctx.scale(scale, scale);
				ctx.fillStyle = this.getForeground().getCssRgba();
				ctx.beginPath();
				ctx.svgPath(path);
				ctx.closePath();
				ctx.fill();
				ctx.restore();
				// text
				ctx.font = this.fontWeight+' '+this.fontSize+'px '+this.fontFamily;
				ctx.textBaseline = 'top';
				ctx.fillStyle = this.getForeground().getCssRgba();
				ctx.fillText(this.text, (width-this.textWidth)/2, height-this.fontSize-4-this.spacing-1);
			}
			// horizontal
			else {
				path = Ui.Icon.getPath(this.icon);
				scale = this.iconSize/48;
				// icon
				ctx.save();
				ctx.translate(this.spacing+4, (height-this.iconSize)/2 -1);
				ctx.scale(scale, scale);
				ctx.fillStyle = this.getForeground().getCssRgba();
				ctx.beginPath();
				ctx.svgPath(path);
				ctx.closePath();
				ctx.fill();
				ctx.restore();
				// text
				ctx.font = 'normal '+this.fontWeight+' '+this.fontSize+'px '+this.fontFamily;
				ctx.textBaseline = 'middle';
				ctx.fillStyle = this.getForeground().getCssRgba();
				ctx.fillText(this.text, this.spacing*3+this.iconSize, height/2 +1);
//				ctx.fillText(this.text, (this.spacing+this.iconSize+width-this.textWidth)/2, height/2 +1);
			}
		}
	},

	measureCore: function(width, height) {
		// measure text if needed
		if(this.text !== undefined)
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
			if(this.getOrientation() === 'vertical')
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
	},

	onStyleChange: function() {
		this.spacing = Math.max(0, this.getStyleProperty('spacing'));
		this.iconSize = Math.max(0, this.getStyleProperty('iconSize'));
		this.fontFamily = this.getStyleProperty('fontFamily');
		this.fontSize = Math.max(0, this.getStyleProperty('fontSize'));
		this.fontWeight = this.getStyleProperty('fontWeight');
		this.invalidateMeasure();
		this.invalidateDraw();
	}
}, {
	style: {
		orientation: 'horizontal',
		background: 'rgba(250,250,250,1)',
		foreground: '#444444',
		focusBackground: new Ui.Color({ r: 0.13, g: 0.83, b: 1 }),
		focusForeground: '#222222',
		radius: 3,
		spacing: 5,
		iconSize: 24,
		fontSize: 16,
		fontFamily: 'Sans-serif',
		fontWeight: 'normal'
	}
});