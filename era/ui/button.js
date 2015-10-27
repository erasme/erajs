
Ui.CompactLabel.extend('Ui.ButtonText', {});

Ui.CanvasElement.extend('Ui.ButtonBackground', {
	borderWidth: 1,
	border: undefined,
	background: undefined,
	radius: 3,

	constructor: function() {
		this.setBorder('black');
		this.setBackground('white');
	},

	setBorderWidth: function(borderWidth) {
		this.borderWidth = borderWidth;
		this.invalidateDraw();
	},

	setBorder: function(border) {
		this.border = Ui.Color.create(border);
		this.invalidateDraw();
	},

	setRadius: function(radius) {
		this.radius = radius;
		this.invalidateDraw();
	}

}, {
	setBackground: function(background) {
		this.background = Ui.Color.create(background);
		this.invalidateDraw();
	},

	updateCanvas: function(ctx) {
		var w = this.getLayoutWidth();
		var h = this.getLayoutHeight();

		var radius = Math.min(this.radius, Math.min(w,h)/2);

		ctx.beginPath();
		var br = Math.max(0, radius-this.borderWidth);
		ctx.roundRect(this.borderWidth, this.borderWidth,
			w-this.borderWidth*2, h-this.borderWidth*2,
			br, br, br, br);
		ctx.closePath();
		ctx.fillStyle = this.background.getCssRgba();
		ctx.fill();
		if(this.borderWidth > 0) {
			ctx.beginPath();
			ctx.roundRect(0, 0, w, h, radius, radius, radius, radius);
			ctx.roundRect(this.borderWidth, this.borderWidth,
				w-this.borderWidth*2, h-this.borderWidth*2,
				br, br,	br, br, true);
			ctx.closePath();
			ctx.fillStyle = this.border.getCssRgba();
			ctx.fill();
		}
	}
});

Ui.CanvasElement.extend('Ui.ButtonIcon', {
	badge: undefined,
	badgeColor: undefined,
	badgeTextColor: undefined,
	fill: undefined,
	icon: 'eye',

	constructor: function() {
		this.setFill('black');
		this.setBadgeColor('red');
		this.setBadgeTextColor('white');
	},

	getIcon: function() {
		return this.icon;
	},

	setIcon: function(icon) {
		this.icon = icon;
		this.invalidateDraw();
	},

	setBadge: function(badge) {
		this.badge = badge;
		this.invalidateDraw();
	},

	setBadgeColor: function(badgeColor) {
		this.badgeColor = Ui.Color.create(badgeColor);
		this.invalidateDraw();
	},

	setBadgeTextColor: function(badgeTextColor) {
		this.badgeTextColor = Ui.Color.create(badgeTextColor);
		this.invalidateDraw();
	},

	setFill: function(fill) {
		this.fill = Ui.Color.create(fill);
		this.invalidateDraw();
	}

}, {
	updateCanvas: function(ctx) {
		var w = this.getLayoutWidth();
		var h = this.getLayoutHeight();
		var iconSize = Math.min(w,h);

		// icon
		ctx.save();
		ctx.translate((w-iconSize)/2, (h-iconSize)/2);

		if(this.badge !== undefined)
			Ui.Icon.drawIconAndBadge(ctx, this.icon, iconSize, this.fill.getCssRgba(),
				this.badge, iconSize/2.5,
				this.badgeColor.getCssRgba(),
				this.badgeTextColor.getCssRgba());
		else
			Ui.Icon.drawIcon(ctx, this.icon, iconSize, this.fill.getCssRgba());
		ctx.restore();
	}
});

Ui.Selectionable.extend('Ui.Button', 
/** @lends Ui.Button# */
{
	dropbox: undefined,
	isActive: false,
	mainBox: undefined,
	buttonPartsBox: undefined,
	icon: undefined,
	iconBox: undefined,
	text: undefined,
	textBox: undefined,
	marker: undefined,
	badge: undefined,
	bg: undefined,
	orientation: undefined,

    /**
     * @constructs
	 * @class A Button is a pressable element that looks like a rounded rectangle (by default) with some text and/or icon.        
     * @extends Ui.Pressable
     * @param {String} [config.text] Button's text
     * @param {String} [config.icon] SVG Icon name
     * @param {String} [config.orientation] 'vertical' or 'horizontal'
	 * @param {mixed} [config] see {@link Ui.Pressable} constructor for more options.  
     * @see <a href="samples/button/">Button sample</a>.
     */ 
	constructor: function(config) {
		this.dropbox = new Ui.DropBox();
		this.setContent(this.dropbox);

		this.bg = new Ui.ButtonBackground();

		this.dropbox.setContent(this.bg);

		this.mainBox = new Ui.HBox();
		this.dropbox.append(this.mainBox);

		this.buttonPartsBox = new Ui.Box();
		this.mainBox.append(this.buttonPartsBox, true);

		this.textBox = new Ui.LBox();

		this.iconBox = new Ui.LBox();

		this.connect(this, 'down', this.updateColors);
		this.connect(this, 'up', this.updateColors);
		this.connect(this, 'focus', this.updateColors);
		this.connect(this, 'blur', this.updateColors);
		this.connect(this, 'enter', this.updateColors);
		this.connect(this, 'leave', this.updateColors);
	},

	getDropBox: function() {
		return this.dropbox;
	},

	getTextBox: function() {
		return this.textBox;
	},

	getText: function() {
		return this.text;
	},

	setText: function(text) {
		if(typeof(text) === 'string') {
			if(this.text !== undefined) {
				if(Ui.ButtonText.hasInstance(this.text))
					this.text.setText(text);
				else {
					this.text = new Ui.ButtonText({	text: text, color: this.getForeground() });
					this.textBox.setContent(this.text);
				}
			}
			else {
				this.text = new Ui.ButtonText({ text: text, color: this.getForeground() });
				this.textBox.setContent(this.text);
			}
		}
		else {
			this.text = text;
			if(Ui.Element.hasInstance(this.text))
				this.textBox.setContent(this.text);
			else if(this.text !== undefined) {
				this.text = new Ui.ButtonText({ text: this.text.toString(), color: this.getForeground() });
				this.textBox.setContent(this.text);
			}
		}
		this.updateVisibles();
	},

	getIconBox: function() {
		return this.iconBox;
	},

	getIcon: function() {
		return this.icon;
	},
	
	setIcon: function(icon) {
		if(typeof(icon) === 'string') {
			if(this.icon !== undefined) {
				if(Ui.ButtonIcon.hasInstance(this.icon))
					this.icon.setIcon(icon);
				else {
					this.icon = new Ui.ButtonIcon({ icon: icon, badge: this.badge,
						fill: this.getForeground(),
						badgeColor: this.getStyleProperty('badgeColor'),
						badgeTextColor: this.getStyleProperty('badgeTextColor') });
					this.iconBox.setContent(this.icon);
				}
			}
			else {
				this.icon = new Ui.ButtonIcon({ icon: icon, badge: this.badge,
					fill: this.getForeground(),
					badgeColor: this.getStyleProperty('badgeColor'),
					badgeTextColor: this.getStyleProperty('badgeTextColor') });
				this.iconBox.setContent(this.icon);
			}
		}
		else {
			this.icon = icon;
			this.iconBox.setContent(this.icon);
		}
		this.updateVisibles();
	},
	
	setMarker: function(marker) {
		if(this.marker !== undefined)
			this.mainBox.remove(this.marker);
		this.marker = marker;
		this.mainBox.append(this.marker);
	},

	getIsActive: function() {
		return this.isActive;
	},

	setIsActive: function(isActive) {
		if(this.isActive !== isActive) {
			this.isActive = isActive;
			this.updateColors();
		}
	},

	getBadge: function() {
		return this.badge;
	},

	setBadge: function(text) {
		this.badge = text;
		if(Ui.ButtonIcon.hasInstance(this.icon)) {
			this.icon.setBadge(text);
		}
	},

    /** @return {String} Orientation */
	getOrientation: function() {
		if(this.orientation !== undefined)
			return this.orientation;
		else
			return this.getStyleProperty('orientation');
	},
    
    /** @param {String} orientation can be 'vertical' or 'horizontal' */
	setOrientation: function(orientation) {
		this.orientation = orientation;
		this.buttonPartsBox.setOrientation(this.getOrientation());
		this.updateVisibles();
	},
	
	getBackground: function() {
		var color;
		if(this.isActive) {
			if(this.getHasFocus() && !this.getIsMouseFocus())
				color = Ui.Color.create(this.getStyleProperty('focusActiveBackground'));
			else
				color = Ui.Color.create(this.getStyleProperty('activeBackground'));
		}
		else {
			if(this.getHasFocus() && !this.getIsMouseFocus())
				color = Ui.Color.create(this.getStyleProperty('focusBackground'));
			else
				color = Ui.Color.create(this.getStyleProperty('background'));
		}
		var yuv = color.getYuva();
		var deltaY = 0;
		if(this.getIsDown())
			deltaY = -0.20;
		else if(this.getIsOver()) {
			deltaY = 0.20;
			yuv.a = Math.max(0.4, yuv.a);
		}
		return new Ui.Color({ y: yuv.y + deltaY, u: yuv.u, v: yuv.v, a: yuv.a });
	},

	getBackgroundBorder: function() {
		var color;
		if(this.isActive) {
			if(this.getHasFocus() && !this.getIsMouseFocus())
				color = Ui.Color.create(this.getStyleProperty('focusActiveBackgroundBorder'));
			else
				color = Ui.Color.create(this.getStyleProperty('activeBackgroundBorder'));
		}
		else {
			if(this.getHasFocus() && !this.getIsMouseFocus())
				color = Ui.Color.create(this.getStyleProperty('focusBackgroundBorder'));
			else
				color = Ui.Color.create(this.getStyleProperty('backgroundBorder'));
		}
		var yuv = color.getYuva();
		var deltaY = 0;
		if(this.getIsDown())
			deltaY = -0.20;
		else if(this.getIsOver())
			deltaY = 0.20;
		return new Ui.Color({ y: yuv.y + deltaY, u: yuv.u, v: yuv.v, a: yuv.a });
	},

	getForeground: function() {
		var color;
		if(this.isActive) {
			if(this.getHasFocus() && !this.getIsMouseFocus())
				color = Ui.Color.create(this.getStyleProperty('focusActiveForeground'));
			else
				color = Ui.Color.create(this.getStyleProperty('activeForeground'));
		}
		else {
			if(this.getHasFocus() && !this.getIsMouseFocus())
				color = Ui.Color.create(this.getStyleProperty('focusForeground'));
			else
				color = Ui.Color.create(this.getStyleProperty('foreground'));
		}
		var deltaY = 0;
		if(this.getIsDown())
			deltaY = -0.20;
		else if(this.getIsOver())
			deltaY = 0.20;
		var yuv = color.getYuva();
		return new Ui.Color({ y: yuv.y + deltaY, u: yuv.u, v: yuv.v, a: yuv.a });
	},

	getIsTextVisible: function() {
		return((this.text !== undefined) && (this.getStyleProperty('showText') || (this.icon === undefined)));
	},

	getIsIconVisible: function() {
		return((this.icon !== undefined) && (this.getStyleProperty('showIcon') || (this.text === undefined)));
	},

	updateVisibles: function() {
		if(this.getIsTextVisible()) {
			if(this.textBox.getParent() === undefined)
				this.buttonPartsBox.append(this.textBox, true);
			if(Ui.ButtonText.hasInstance(this.text)) {
				if(this.getIsIconVisible() && (this.getOrientation() === 'horizontal'))
					this.text.setTextAlign('left');
				else
					this.text.setTextAlign('center');
				
				this.text.setFontFamily(this.getStyleProperty('fontFamily'));
				this.text.setFontSize(this.getStyleProperty('fontSize'));
				this.text.setFontWeight(this.getStyleProperty('fontWeight'));
				this.text.setMaxLine(this.getStyleProperty('maxLine'));
				this.text.setWhiteSpace(this.getStyleProperty('whiteSpace'));
				this.text.setInterLine(this.getStyleProperty('interLine'));
				this.text.setTextTransform(this.getStyleProperty('textTransform'));
			}
		}
		else if(this.textBox.getParent() !== undefined)
			this.buttonPartsBox.remove(this.textBox);
		if(this.getIsIconVisible()) {
			Ui.Box.setResizable(this.iconBox, !this.getIsTextVisible());
			if(this.iconBox.getParent() === undefined)
				this.buttonPartsBox.prepend(this.iconBox);
		}
		else if(this.iconBox.getParent() !== undefined)
			this.buttonPartsBox.remove(this.iconBox);

		if(this.getOrientation() === 'horizontal') {
			if(this.getIsTextVisible())
				this.text.setVerticalAlign('center');
		}
		else {
			if(this.getIsIconVisible() && this.getIsTextVisible())
				this.text.setVerticalAlign('top');
			else if(this.getIsTextVisible())
				this.text.setVerticalAlign('center');
		}
	},

	updateColors: function() {
		var fg = this.getForeground();
		this.bg.setBackground(this.getBackground());
		this.bg.setBorder(this.getBackgroundBorder());
		if(Ui.ButtonText.hasInstance(this.text))
			this.text.setColor(fg);
		if(Ui.ButtonIcon.hasInstance(this.icon)) {
			this.icon.setFill(fg);
			this.icon.setBadgeColor(this.getStyleProperty('badgeColor'));
			this.icon.setBadgeTextColor(this.getStyleProperty('badgeTextColor'));
		}
	}
}, {
	onDisable: function() {
		Ui.Button.base.onDisable.apply(this, arguments);
		this.setOpacity(0.4);
	},

	onEnable: function() {
		Ui.Button.base.onEnable.apply(this, arguments);
		this.setOpacity(1);
	},

	onStyleChange: function() {
		this.buttonPartsBox.setSpacing(Math.max(0, this.getStyleProperty('spacing')));
		this.buttonPartsBox.setMargin(Math.max(0, this.getStyleProperty('padding')));
		this.bg.setRadius(this.getStyleProperty('radius'));
		this.bg.setBorderWidth(this.getStyleProperty('borderWidth'));
		var iconSize = Math.max(0, this.getStyleProperty('iconSize'));
		this.iconBox.setWidth(iconSize);
		this.iconBox.setHeight(iconSize);
		this.textBox.setWidth(this.getStyleProperty('textWidth'));
		this.textBox.setMaxWidth(this.getStyleProperty('maxTextWidth'));
		this.textBox.setHeight(this.getStyleProperty('textHeight'));
		this.buttonPartsBox.setOrientation(this.getOrientation());
		this.updateVisibles();
		this.updateColors();
	}
}, {
	style: {
		orientation: 'horizontal',
		borderWidth: 1,
		badgeColor: 'red',
		badgeTextColor: 'white',
		background: 'rgba(250,250,250,1)',
		backgroundBorder: 'rgba(140,140,140,1)',
		foreground: '#444444',
		activeBackground: 'rgba(250,250,250,1)',
		activeBackgroundBorder: 'rgba(140,140,140,1)',
		activeForeground: '#dc6c36',
		focusBackground: '#07a0e5',//'rgb(33,211,255)',
		focusBackgroundBorder: new Ui.Color({ r: 0.04, g: 0.43, b: 0.5 }),
		focusForeground: 'rgba(250,250,250,1)',//'#222222',
		focusActiveBackground: 'rgb(33,211,255)',
		focusActiveBackgroundBorder: new Ui.Color({ r: 0.04, g: 0.43, b: 0.5 }),
		focusActiveForeground: 'white',
		radius: 3,
		spacing: 10,
		padding: 7,
		iconSize: 26,
		fontSize: 16,
		fontFamily: 'Sans-serif',
		fontWeight: 'normal',
		textWidth: 70,
		textTransform: 'uppercase',
		maxTextWidth: Number.MAX_VALUE,
		textHeight: 26,
		interLine: 1,
		maxLine: 3,
		whiteSpace: 'nowrap',
		showText: true,
		showIcon: true
	}
});

Ui.Button.extend('Ui.DefaultButton', {}, {}, {
	style: {
		borderWidth: 1,
		background: '#444444',
		backgroundBorder: '#444444',
		foreground: 'rgba(250,250,250,1)'
	}
});


