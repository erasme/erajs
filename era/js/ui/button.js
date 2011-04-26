//
// Define the Button class.
//
Ui.Pressable.extend('Ui.Button', {
	allcontent: undefined,
	contentBox: undefined,
	content: undefined,
	text: undefined,
	textBox: undefined,
	text1: undefined,
	text2: undefined,
	icon: undefined,
	iconBox: undefined,
	icon1: undefined,
	icon2: undefined,
	orientation: 'vertical',

	rect1: undefined,
	rect2: undefined,

	lightShadow: undefined,
	darkShadow: undefined,

	constructor: function(config) {
		this.setPadding(3);

		this.lightShadow = new Ui.Rectangle({ fill: new Ui.Color({ r: 1, g: 1, b: 1, a: 0.25 }), radius: 4, marginTop: 1  });
		this.append(this.lightShadow);

		this.darkShadow = new Ui.Rectangle({ fill: new Ui.Color({ r: 0, g: 0, b: 0, a: 0.4}), radius: 4, marginBottom: 1  });
		this.append(this.darkShadow);

		this.allcontent = new Ui.LBox();
		this.append(this.allcontent);

		this.rect2 = new Ui.Rectangle({ radius: 4, marginTop: 1, marginBottom: 2, marginLeft: 1, marginRight: 1  });
		this.allcontent.append(this.rect2);

		this.rect1 = new Ui.Rectangle({ radius: 3, marginTop: 2, marginBottom: 2, marginLeft: 1, marginRight: 1 });
		this.allcontent.append(this.rect1);

		this.contentBox = new Ui.Box({ verticalAlign: 'center', horizontalAlign: 'center' });
		this.allcontent.append(this.contentBox);

		this.iconBox = new Ui.LBox({ verticalAlign: 'center', horizontalAlign: 'center' });
		this.contentBox.append(this.iconBox);

		if(config.text != undefined)
			this.setText(config.text);
		if(config.icon != undefined)
			this.setIcon(config.icon);
		if(config.orientation != undefined)
			this.setOrientation(config.orientation);

		this.connect(this, 'down', this.onButtonDown);
		this.connect(this, 'up', this.onButtonUp);
	},

	getText: function() {
		return this.text;
	},

	setText: function(text) {
		if(this.text != text) {
			this.text = text;
			if(this.text == undefined) {
				if(this.textBox != undefined) {
					this.contentBox.remove(this.textBox);
					this.textBox = undefined;
					this.text1 = undefined;
					this.text2 = undefined;
				}
			}
			else {
				if(this.textBox == undefined) {
					this.textBox = new Ui.LBox({ verticalAlign: 'center', horizontalAlign: 'center' });
					this.contentBox.append(this.textBox);
					this.text1 = new Ui.Label({ text: this.text, color: this.getContentLightColor() });
					this.text2 = new Ui.Label({ text: this.text, color: this.getContentColor() });
					this.textBox.append(this.text1);
					this.textBox.append(this.text2);
				}
				else {
					this.text1.setText(this.text);
					this.text2.setText(this.text);
				}
			}
			this.updateSizes();
		}
	},

	getIcon: function() {
		return this.icon;
	},

	setIcon: function(icon) {
		if(icon == undefined) {
			if(this.icon != undefined) {
				this.iconBox.remove(this.icon1);
				this.iconBox.remove(this.icon2);
				this.icon1 = undefined;
				this.icon2 = undefined;
				this.icon = undefined;
			}
			if(this.content != undefined) {
				this.iconBox.remove(this.content);
				this.content = undefined;
			}
		}
		else {
			if(typeof(icon) == 'string') {
				if(this.content != undefined) {
					this.iconBox.remove(this.content);
					this.content = undefined;
				}
				if(this.icon != icon) {
					this.icon = icon;
					if(this.icon1 != undefined)
						this.iconBox.remove(this.icon1);
					if(this.icon2 != undefined)
						this.iconBox.remove(this.icon2);
					this.icon1 = Ui.Icon.create(icon, 24, 24, this.getContentLightColor());
					this.icon2 = Ui.Icon.create(icon, 24, 24, this.getContentColor());
					this.iconBox.append(this.icon1);
					this.iconBox.append(this.icon2);
				}
			}
			else {
				if(this.icon1 != undefined)
					this.iconBox.remove(this.icon1);
				if(this.icon2 != undefined)
					this.iconBox.remove(this.icon2);
				this.icon1 = undefined;
				this.icon2 = undefined;
				this.icon = undefined;
				if(this.content != icon) {
					if(this.content != undefined)
						this.iconBox.remove(this.content);
					this.content = icon;
					this.iconBox.append(this.content);
				}
			}
		}
		this.updateSizes();
	},

	getOrientation: function() {
		return this.orientation;
	},

	setOrientation: function(orientation) {
		if(this.orientation != orientation) {
			this.orientation = orientation;
			this.contentBox.setOrientation(this.orientation);
			this.updateSizes();
		}
	},

	//
	// Private
	//

	updateSizes: function() {
		// vertical
		if(this.orientation == 'vertical') {
			if(this.text != undefined) {
				// icon + text
				if(this.icon != undefined) {
					this.textBox.setMarginLeft(8);
					this.textBox.setMarginRight(8);
					this.textBox.setMarginTop(6);
					this.textBox.setMarginBottom(7);
					this.text1.setMargin(0);
					this.text1.setMarginTop(2);
					this.text2.setMargin(1);
					this.text1.setFontWeight('normal');
					this.text2.setFontWeight('normal');

					this.iconBox.setMarginLeft(8);
					this.iconBox.setMarginRight(8);
					this.iconBox.setMarginTop(7);
					this.iconBox.setMarginBottom(0);
					this.icon1.setMarginTop(2);
					this.icon1.setMarginBottom(0);
					this.icon2.setMarginTop(1);
					this.icon2.setMarginBottom(1);
				}
				// content + text
				else if(this.content != undefined) {
					this.textBox.setMarginLeft(8);
					this.textBox.setMarginRight(8);
					this.textBox.setMarginTop(7);
					this.textBox.setMarginBottom(7);
					this.text1.setMargin(0);
					this.text1.setMarginTop(2);
					this.text2.setMargin(1);
					this.text1.setFontWeight('normal');
					this.text2.setFontWeight('normal');

					this.iconBox.setMarginLeft(8);
					this.iconBox.setMarginRight(8);
					this.iconBox.setMarginTop(8);
					this.iconBox.setMarginBottom(0);
				}
				// text only
				else {
					this.textBox.setMarginLeft(10);
					this.textBox.setMarginRight(10);
					this.textBox.setMarginTop(7);
					this.textBox.setMarginBottom(7);
					this.text1.setMargin(0);
					this.text1.setMarginTop(2);
					this.text2.setMargin(1);

					this.text1.setFontWeight('bold');
					this.text2.setFontWeight('bold');

					this.iconBox.setMargin(0);
				}
			}
			// icon only
			else {
				if(this.icon != undefined) {
					this.iconBox.setMarginLeft(8);
					this.iconBox.setMarginRight(8);
					this.iconBox.setMarginTop(7);
					this.iconBox.setMarginBottom(7);
					this.icon1.setMarginTop(2);
					this.icon1.setMarginBottom(0);
					this.icon2.setMarginTop(1);
					this.icon2.setMarginBottom(1);
				}
				else if(this.content != undefined) {
					this.iconBox.setMargin(8);
				}
			}
		}
		// horizontal
		else {
			if(this.text != undefined) {
				// icon + text
				if(this.icon != undefined) {
					this.textBox.setMarginLeft(8);
					this.textBox.setMarginRight(8);
					this.textBox.setMarginTop(7);
					this.textBox.setMarginBottom(7);
					this.text1.setMargin(0);
					this.text1.setMarginTop(2);
					this.text2.setMargin(1);
					this.text1.setFontWeight('bold');
					this.text2.setFontWeight('bold');

					this.iconBox.setMarginLeft(8);
					this.iconBox.setMarginRight(0);
					this.iconBox.setMarginTop(7);
					this.iconBox.setMarginBottom(7);
					this.icon1.setMarginTop(2);
					this.icon1.setMarginBottom(0);
					this.icon2.setMarginTop(1);
					this.icon2.setMarginBottom(1);
				}
				// content + text
				else if(this.content != undefined) {
					this.textBox.setMarginLeft(8);
					this.textBox.setMarginRight(8);
					this.textBox.setMarginTop(7);
					this.textBox.setMarginBottom(7);
					this.text1.setMargin(0);
					this.text1.setMarginTop(2);
					this.text2.setMargin(1);
					this.text1.setFontWeight('bold');
					this.text2.setFontWeight('bold');

					this.iconBox.setMarginLeft(8);
					this.iconBox.setMarginRight(0);
					this.iconBox.setMarginTop(8);
					this.iconBox.setMarginBottom(0);
				}
				// text only
				else {
					this.textBox.setMarginLeft(10);
					this.textBox.setMarginRight(10);
					this.textBox.setMarginTop(7);
					this.textBox.setMarginBottom(7);
					this.text1.setMargin(0);
					this.text1.setMarginTop(2);
					this.text2.setMargin(1);

					this.text1.setFontWeight('bold');
					this.text2.setFontWeight('bold');

					this.iconBox.setMargin(0);
				}
			}
			// icon only
			else {
				if(this.icon != undefined) {
					this.iconBox.setMarginLeft(8);
					this.iconBox.setMarginRight(8);
					this.iconBox.setMarginTop(7);
					this.iconBox.setMarginBottom(7);
					this.icon1.setMarginTop(2);
					this.icon1.setMarginBottom(0);
					this.icon2.setMarginTop(1);
					this.icon2.setMarginBottom(1);
				}
				else if(this.content != undefined) {
					this.iconBox.setMargin(8);
				}
			}
		}
	},

	getGradient: function() {
		var yuv = this.getStyleProperty('color').getYuv();
		return new Ui.LinearGradient({ stops: [
			{ offset: 0, color: new Ui.Color({ y: yuv.y + 0.10, u: yuv.u, v: yuv.v }) },
			{ offset: 1, color: new Ui.Color({ y: yuv.y - 0.10, u: yuv.u, v: yuv.v }) },
		] });
	},

	getGradientDown: function() {
		var yuv = this.getStyleProperty('color').getYuv();
		return new Ui.LinearGradient({ stops: [
			{ offset: 0, color: new Ui.Color({ y: yuv.y + 0.10 - 0.20, u: yuv.u, v: yuv.v }) },
			{ offset: 1, color: new Ui.Color({ y: yuv.y - 0.10 - 0.20, u: yuv.u, v: yuv.v }) },
		] });
	},

	getContentColor: function() {
		var yuv = this.getStyleProperty('color').getYuv();
		if(yuv.y < 0.4)
			return new Ui.Color({ y: yuv.y + 0.60, u: yuv.u, v: yuv.v });
		else
			return new Ui.Color({ y: yuv.y - 0.60, u: yuv.u, v: yuv.v });
	},

	getContentLightColor: function() {
		console.log(this+'.getContentLightColor before');
		var color = this.getStyleProperty('color');
		console.log(this+'.getContentLightColor '+color);

		var yuv = this.getStyleProperty('color').getYuv();
		if(yuv.y < 0.4)
			return new Ui.Color({ y: yuv.y - 0.20, u: yuv.u, v: yuv.v });
		else
			return new Ui.Color({ y: yuv.y + 0.10, u: yuv.u, v: yuv.v });
	},

	getContentLightColorDown: function() {
		var yuv = this.getStyleProperty('color').getYuv();
		if(yuv.y < 0.4)
			return new Ui.Color({ y: yuv.y - 0.20, u: yuv.u, v: yuv.v });
		else
			return new Ui.Color({ y: yuv.y + 0.10 - 0.20, u: yuv.u, v: yuv.v });
	},

	getLightColor: function() {
		var yuv = this.getStyleProperty('color').getYuv();
		if(yuv.y < 0.4)
			return new Ui.Color({ y: yuv.y + 0.10, u: yuv.u, v: yuv.v });
		else
			return new Ui.Color({ y: yuv.y + 0.30, u: yuv.u, v: yuv.v });
	},

	getLightColorDown: function() {
		var yuv = this.getStyleProperty('color').getYuv();
		if(yuv.y < 0.4)
			return new Ui.Color({ y: yuv.y + 0.10, u: yuv.u, v: yuv.v });
		else
			return new Ui.Color({ y: yuv.y, u: yuv.u, v: yuv.v });
	},

	onButtonDown: function() {
		this.rect1.setFill(this.getGradientDown());
		if(this.icon1 != undefined)
			this.icon1.setFill(this.getContentLightColorDown());
		if(this.text1 != undefined)
			this.text1.setColor(this.getContentLightColorDown());
		this.rect2.setFill(this.getLightColorDown());
	},

	onButtonUp: function() {
		this.rect1.setFill(this.getGradient());

		if(this.icon1 != undefined)
			this.icon1.setFill(this.getContentLightColor());
		if(this.text1 != undefined)
			this.text1.setColor(this.getContentLightColor());
		this.rect2.setFill(this.getLightColor());
	},
}, {
	onStyleChange: function() {
		var gradient;
		var contentColor;
		var contentLightColor;
		var contentLightColorDown;
		var lightColor;
		var gradientDown;

		var yuv = this.getStyleProperty('color').getYuv();

		gradient = new Ui.LinearGradient({ stops: [
			{ offset: 0, color: new Ui.Color({ y: yuv.y + 0.10, u: yuv.u, v: yuv.v }) },
			{ offset: 1, color: new Ui.Color({ y: yuv.y - 0.10, u: yuv.u, v: yuv.v }) },
		] });
		gradientDown = new Ui.LinearGradient({ stops: [
			{ offset: 0, color: new Ui.Color({ y: yuv.y + 0.10 - 0.20, u: yuv.u, v: yuv.v }) },
			{ offset: 1, color: new Ui.Color({ y: yuv.y - 0.10 - 0.20, u: yuv.u, v: yuv.v }) },
		] });
		if(yuv.y < 0.4) {
			contentColor = new Ui.Color({ y: yuv.y + 0.60, u: yuv.u, v: yuv.v });
			contentLightColor = new Ui.Color({ y: yuv.y - 0.20, u: yuv.u, v: yuv.v });
			contentLightColorDown = new Ui.Color({ y: yuv.y - 0.20, u: yuv.u, v: yuv.v });
			lightColor = new Ui.Color({ y: yuv.y + 0.30, u: yuv.u, v: yuv.v });
			lightColorDown = new Ui.Color({ y: yuv.y + 0.10, u: yuv.u, v: yuv.v });
		}
		else {
			contentColor = new Ui.Color({ y: yuv.y - 0.60, u: yuv.u, v: yuv.v });
			contentLightColor = new Ui.Color({ y: yuv.y + 0.10, u: yuv.u, v: yuv.v });
			contentLightColorDown = new Ui.Color({ y: yuv.y + 0.10 - 0.20, u: yuv.u, v: yuv.v });
			lightColor = new Ui.Color({ y: yuv.y + 0.30, u: yuv.u, v: yuv.v });
			lightColorDown = new Ui.Color({ y: yuv.y, u: yuv.u, v: yuv.v });
		}
		this.rect1.setFill(gradient);

		if(this.getIsDown()) {
			if(this.icon1 != undefined)
				this.icon1.setFill(contentLightColorDown);
			if(this.text1 != undefined)
				this.text1.setColor(contentLightColorDown);
			this.rect2.setFill(lightColorDown);
		}
		else {
			if(this.icon1 != undefined)
				this.icon1.setFill(contentLightColor);
			if(this.text1 != undefined)
				this.text1.setColor(contentLightColor);
			this.rect2.setFill(lightColor);
		}

		if(this.icon2 != undefined)
			this.icon2.setFill(contentColor);
		if(this.text2 != undefined)
			this.text2.setColor(contentColor);


		var radius = this.getStyleProperty('radius');
		this.lightShadow.setRadius(radius);
		this.darkShadow.setRadius(radius);
		this.rect2.setRadius(radius);
		this.rect1.setRadius(radius - 1);
	},

	onDisable: function() {
		Ui.Button.base.onDisable.call(this);
		this.contentBox.setOpacity(0.2);
	},

	onEnable: function() {
		Ui.Button.base.onEnable.call(this);
		this.contentBox.setOpacity(1);
	},
}, {
	style: {
		color: new Ui.Color({ r: 0.31, g: 0.66, b: 1 }),
//		color: new Ui.Color({ r: 0.89, g: 0.89, b: 0.89 }),
		radius: 4,
	},

});

