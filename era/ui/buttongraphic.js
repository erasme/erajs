
Ui.CanvasElement.extend('Ui.ButtonGraphic', {
	text: undefined,
	icon: undefined,
	iconSize: 24,
	orientation: 'horizontal',
	fontSize: 16,
	fontFamily: 'Sans-serif',
	fontWeight: 'normal',
	borderWidth: 1,
	measuredTextWidth: 0,
	textWidth: 0,
	spacing: 3,
	radius: 3,
	showText: true,
	showIcon: true,
	badge: undefined,
	badgeColor: undefined,
	badgeTextColor: undefined,
	background: undefined,
	backgroundBorder: undefined,
	foreground: undefined,
	
	constructor: function(config) {
		this.setBadgeColor('red');
		this.setBadgeTextColor('white');
		this.setBackground('rgba(250,250,250,1)');
		this.setBackgroundBorder('rgba(200,200,200,1)');
		this.setForeground('rgba(140,140,140,1)');
	},

	getText: function() {
		return this.text;
	},

	setText: function(text) {
		if(this.text !== text) {
			this.text = text;
			this.invalidateMeasure();
			this.invalidateDraw();
		}
	},

	getIcon: function() {
		return this.icon;
	},

	setIcon: function(icon) {
		if(this.icon !== icon) {
			this.icon = icon;
			this.invalidateMeasure();
			this.invalidateDraw();
		}
	},

	getBadge: function() {
		return this.badge;
	},

	setBadge: function(badgeText) {
		if(this.badge !== badgeText) {
			this.badge = badgeText;
			this.invalidateDraw();			
		}
	},
	
	getOrientation: function() {
		return (this.orientation === 'vertical')?'vertical':'horizontal';
	},

	setOrientation: function(orientation) {
		if(this.orientation !== orientation) {
			this.orientation = orientation;
			this.invalidateMeasure();
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

	getIsActive: function() {
		return this.isActive;
	},

	setIsActive: function(isActive) {
		if(this.isActive != isActive) {
			this.isActive = isActive;
			this.invalidateDraw();
		}
	},

	setHasFocus: function(hasFocus) {
		if(this.buttonHasFocus !== hasFocus) {
			this.buttonHasFocus = hasFocus;
			this.invalidateDraw();
		}
	},

	setSpacing: function(spacing) {
		if(this.spacing !== spacing) {
			this.spacing = spacing;
			this.invalidateMeasure();
		}
	},

	setIconSize: function(iconSize) {
		if(this.iconSize !== iconSize) {
			this.iconSize = iconSize;
			this.invalidateMeasure();
		}
	},

	setFontFamily: function(fontFamily) {
		if(this.fontFamily !== fontFamily) {
			this.fontFamily = fontFamily;
			this.invalidateMeasure();
		}
	},

	setFontSize: function(fontSize) {
		if(this.fontSize !== fontSize) {
			this.fontSize = fontSize;
			this.invalidateMeasure();
		}
	},

	setFontWeight: function(fontWeight) {
		if(this.fontWeight !== fontWeight) {
			this.fontWeight = fontWeight;
			this.invalidateMeasure();
		}
	},

	setBorderWidth: function(borderWidth) {
		if(this.borderWidth !== borderWidth) {
			this.borderWidth = borderWidth;
			this.invalidateMeasure();
		}
	},

	setRadius: function(radius) {
		if(this.radius !== radius) {
			this.radius = radius;
			this.invalidateDraw();
		}
	},

	setShowText: function(showText) {
		if(this.showText !== showText) {
			this.showText = showText;
			this.invalidateMeasure();
		}
	},

	setShowIcon: function(showIcon) {
		if(this.showIcon !== showIcon) {
			this.showIcon = showIcon;
			this.invalidateMeasure();
		}
	},

	setTextWidth: function(textWidth) {
		if(this.textWidth !== textWidth) {
			this.textWidth = textWidth;
			this.invalidateMeasure();
		}
	},

	setBadgeColor: function(badgeColor) {
		this.badgeColor = Ui.Color.create(badgeColor);
		this.invalidateDraw();
	},

	setBadgeTextColor: function(badgeTextColor) {
		this.badgeTextColor = Ui.Color.create(badgeTextColor);
		this.invalidateDraw();
	},
	
	setBackgroundBorder: function(backgroundBorder) {
		this.backgroundBorder = Ui.Color.create(backgroundBorder);
		this.invalidateDraw();
	},

	setForeground: function(foreground) {
		this.foreground = Ui.Color.create(foreground);
		this.invalidateDraw();
	}	
}, {
	setBackground: function(background) {
		this.background = Ui.Color.create(background);
		this.invalidateDraw();
	},

	updateCanvas: function(ctx) {
		var path; var scale;
		var width = this.getLayoutWidth();
		var height = this.getLayoutHeight();

		var radius = Math.min(this.radius, (Math.min(width, height)/2));

		// handle disable
		if(this.getIsDisabled())
			ctx.globalAlpha = 0.4;

		// rect
		ctx.fillStyle = this.background.getCssRgba();
		ctx.beginPath();
		ctx.roundRect(0, 0, width, height, radius, radius, radius, radius);
		ctx.closePath();
		ctx.fill();

		// border
		if(this.borderWidth > 0) {
			ctx.strokeStyle = this.backgroundBorder.getCssRgba();
			ctx.lineWidth = this.borderWidth;
			ctx.beginPath();
			ctx.roundRect(this.borderWidth/2, this.borderWidth/2, width-this.borderWidth, height-this.borderWidth, radius, radius, radius, radius);
			ctx.closePath();
			ctx.stroke();
		}

		// icon only
		if(this.showIcon && (this.icon !== undefined) && ((this.text === undefined) || !this.showText)) {
			path = Ui.Icon.getPath(this.icon);
			scale = this.iconSize/48;
			// icon
			ctx.save();
			ctx.translate((width-this.iconSize)/2, (height-this.iconSize)/2);

			if(this.badge !== undefined)
				Ui.Icon.drawIconAndBadge(ctx, this.icon, this.iconSize, this.foreground.getCssRgba(),
					this.badge, this.iconSize/3,
					this.badgeColor.getCssRgba(),
					this.badgeTextColor.getCssRgba());
			else
				Ui.Icon.drawIcon(ctx, this.icon, this.iconSize, this.foreground.getCssRgba());

			ctx.restore();
		}
		// text only
		else if(this.showText && ((this.icon === undefined) || !this.showIcon) && (this.text !== undefined)) {
			// text
			ctx.font = 'normal '+this.fontWeight+' '+this.fontSize+'px '+this.fontFamily;
			ctx.textBaseline = 'middle';
			ctx.fillStyle = this.foreground.getCssRgba();
			ctx.fillText(this.text, (width-this.measuredTextWidth)/2, height/2+2);
		}
		// text + icon
		else if(this.showIcon && (this.icon !== undefined) && (this.text !== undefined) && this.showText) {
			// vertical
			if(this.orientation === 'vertical') {
				path = Ui.Icon.getPath(this.icon);
				scale = this.iconSize/48;
				// icon
				ctx.save();
				ctx.translate((width-this.iconSize)/2, (height-this.fontSize-this.iconSize-this.spacing)/2);

				if(this.badge !== undefined)
					Ui.Icon.drawIconAndBadge(ctx, this.icon, this.iconSize, this.foreground.getCssRgba(),
						this.badge, this.iconSize/3,
						this.badgeColor.getCssRgba(),
						this.badgeTextColor.getCssRgba());
				else
					Ui.Icon.drawIcon(ctx, this.icon, this.iconSize, this.foreground.getCssRgba());

				ctx.restore();
				// text
				ctx.font = this.fontWeight+' '+this.fontSize+'px '+this.fontFamily;
				ctx.textBaseline = 'top';
				ctx.fillStyle = this.foreground.getCssRgba();
				ctx.fillText(this.text, (width-this.measuredTextWidth)/2, height-this.fontSize-4-this.spacing-1);
			}
			// horizontal
			else {
				path = Ui.Icon.getPath(this.icon);
				scale = this.iconSize/48;
				// icon
				ctx.save();
				ctx.translate(this.spacing+4, (height-this.iconSize)/2 -1);

				if(this.badge !== undefined)
					Ui.Icon.drawIconAndBadge(ctx, this.icon, this.iconSize, this.foreground.getCssRgba(),
						this.badge, this.iconSize/3,
						this.badgeColor.getCssRgba(),
						this.badgeTextColor.getCssRgba());
				else
					Ui.Icon.drawIcon(ctx, this.icon, this.iconSize, this.foreground.getCssRgba());
				ctx.restore();
				// text
				ctx.font = 'normal '+this.fontWeight+' '+this.fontSize+'px '+this.fontFamily;
				ctx.textBaseline = 'middle';
				ctx.fillStyle = this.foreground.getCssRgba();
				ctx.fillText(this.text, this.spacing*3+this.iconSize, height/2 +1);
//				ctx.fillText(this.text, (this.spacing+this.iconSize+width-this.measuredTextWidth)/2, height/2 +1);
			}
		}
		if(!this.showText && (this.text !== undefined))
			this.getDrawing().title = this.text;
		else
			this.getDrawing().title = '';
	},

	measureCore: function(width, height) {
		// measure text if needed
		if(this.text !== undefined)
			this.measuredTextWidth = Ui.Label.measureText(this.text, this.fontSize, this.fontFamily, this.fontWeight).width;
		
		var size = { width: 10, height: 10 };
		// icon only
		if(this.showIcon && (this.icon !== undefined) && ((this.text === undefined) || !this.showText)) {
			size = { width: this.iconSize + this.spacing*2 + 6, height: this.iconSize + this.spacing*2 + 6 };
		}
		// text only
		else if(this.showText && ((this.icon === undefined) || !this.showIcon) && (this.text !== undefined)) {
			size = {
				width: Math.max(this.measuredTextWidth, this.textWidth) + this.spacing*2 + 6,
				height: this.fontSize + this.spacing*2 + 6
			};
		}
		// text + icon
		else if(this.showIcon && (this.icon !== undefined) && this.showText && (this.text !== undefined)) {
			// vertical
			if(this.orientation === 'vertical')
				size = {
					width: Math.max(Math.max(this.measuredTextWidth, this.textWidth), this.iconSize) + this.spacing*2 + 6,
					height: this.iconSize + this.fontSize + this.spacing*3 + 6
				};
			// horizontal
			else
				size = {
					width: Math.max(this.measuredTextWidth, this.textWidth) + this.iconSize + this.spacing*4 + 6,
					height: Math.max(this.iconSize, this.fontSize) + this.spacing*2 + 6
				};
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