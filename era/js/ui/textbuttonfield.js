//
// Define the TextButtonField class.
//
Ui.LBox.extend('Ui.TextButtonField', {
	entry: undefined,
	button: undefined,
	buttonIcon: undefined,
	buttonText: undefined,

	constructor: function(config) {
		this.setPadding(3);

		this.lightShadow = new Ui.Rectangle({ fill: new Ui.Color({ r: 1, g: 1, b: 1, a: 0.25 }), radius: 4, marginTop: 1  });
		this.append(this.lightShadow);

		this.darkShadow = new Ui.Rectangle({ fill: new Ui.Color({ r: 0, g: 0, b: 0, a: 0.4}), radius: 4, marginBottom: 1  });
		this.append(this.darkShadow);

		var hbox = new Ui.HBox({ margin: 1 });
		this.append(hbox);

		var lbox = new Ui.LBox({ marginBottom: 1 });
		hbox.append(lbox, true);

		lbox.append(new Ui.Rectangle({ fill: new Ui.Color({ r: 0.98, g: 0.98, b: 0.98 }), radiusTopLeft: 4, radiusBottomLeft: 4, shadow: 'inset 0px 0px 1px 1px rgba(0, 0, 0, 0.20)'  }));

		this.entry = new Ui.Entry({ margin: 4, fontSize: 16 });
		lbox.append(this.entry);
		this.connect(this.entry, 'change', this.onEntryChange);
		this.connect(this.entry, 'validate', this.onEntryValidate);

		this.button = new Ui.Pressable();
		hbox.append(this.button);
		this.connect(this.button, 'press', this.onButtonPress);
		this.connect(this.button, 'down', this.onButtonDown);
		this.connect(this.button, 'up', this.onButtonUp);

		this.rect2 = new Ui.Rectangle({ radiusTopRight: 4, radiusBottomRight: 4, marginBottom: 1 });
		this.button.append(this.rect2);

		this.rect1 = new Ui.Rectangle({ radiusTopRight: 3, radiusBottomRight: 3, marginLeft: 1, marginTop: 1, marginBottom: 1 });
		this.button.append(this.rect1);

		this.buttonContentBox = new Ui.HBox({ verticalAlign: 'center', horizontalAlign: 'center' });
		this.button.append(this.buttonContentBox);

		this.iconBox = new Ui.LBox({ verticalAlign: 'center', horizontalAlign: 'center' });
		this.buttonContentBox.append(this.iconBox);

		if(config.buttonText != undefined)
			this.setButtonText(config.buttonText);
		if(config.buttonIcon != undefined)
			this.setButtonIcon(config.buttonIcon);

		this.addEvents('change', 'validate');
	},

	getButtonIcon: function() {
		return this.buttonIcon;
	},

	setButtonIcon: function(icon) {
		if(icon == undefined) {
			if(this.buttonIcon != undefined) {
				this.iconBox.remove(this.icon1);
				this.iconBox.remove(this.icon2);
				this.icon1 = undefined;
				this.icon2 = undefined;
				this.buttonIcon = undefined;
			}
			if(this.buttonContent != undefined) {
				this.iconBox.remove(this.buttonContent);
				this.buttonContent = undefined;
			}
		}
		else {
			if(typeof(icon) == 'string') {
				if(this.buttonContent != undefined) {
					this.iconBox.remove(this.buttonContent);
					this.buttonContent = undefined;
				}
				if(this.buttonIcon != icon) {
					this.buttonIcon = icon;
					if(this.icon1 != undefined)
						this.iconBox.remove(this.icon1);
					if(this.icon2 != undefined)
						this.iconBox.remove(this.icon2);
					this.icon1 = Ui.Icon.create(icon, 24, 24, new Ui.Color({ r: 1, g: 1, b: 1 }));
					this.icon2 = Ui.Icon.create(icon, 24, 24,  new Ui.Color({ r: 0, g: 0, b: 0 }));
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
				this.buttonIcon = undefined;
				if(this.buttonContent != icon) {
					if(this.buttonContent != undefined)
						this.iconBox.remove(this.buttonContent);
					this.buttonContent = icon;
					this.iconBox.append(this.buttonContent);
				}
			}
		}
		this.updateSizes();
	},

	setButtonText: function(text) {
		if(this.buttonText != text) {
			this.buttonText = text;
			if(this.buttonText == undefined) {
				if(this.textBox != undefined) {
					this.buttonContentBox.remove(this.textBox);
					this.textBox = undefined;
					this.text1 = undefined;
					this.text2 = undefined;
				}
			}
			else {
				if(this.textBox == undefined) {
					this.textBox = new Ui.LBox({ verticalAlign: 'center', horizontalAlign: 'center' });
					this.buttonContentBox.append(this.textBox);
					this.text1 = new Ui.Label({ text: this.buttonText, color: new Ui.Color({ r: 0.96, g: 0.96, b: 0.96 }) });
					this.text2 = new Ui.Label({ text: this.buttonText, color: new Ui.Color({ r: 0.38, g: 0.38, b: 0.38 }) });
					this.textBox.append(this.text1);
					this.textBox.append(this.text2);
				}
				else {
					this.text1.setText(this.buttonText);
					this.text2.setText(this.buttonText);
				}
			}
			this.updateSizes();
		}
	},

	getValue: function() {
		return this.entry.getValue();
	},

	setValue: function(value) {
		this.entry.setValue(value);
	},

	//
	// Private
	//
	updateSizes: function() {
		var spacing = this.getStyleProperty('spacing');
		if(this.buttonText != undefined) {
			// icon + text
			if(this.buttonIcon != undefined) {
				this.textBox.setMarginLeft(spacing + 2);
				this.textBox.setMarginRight(spacing + 2);
				this.textBox.setMarginTop(spacing + 1);
				this.textBox.setMarginBottom(spacing + 1);
				this.text1.setMargin(0);
				this.text1.setMarginTop(2);
				this.text2.setMargin(1);
				this.text1.setFontWeight('bold');
				this.text2.setFontWeight('bold');

				this.iconBox.setMarginLeft(spacing + 2);
				this.iconBox.setMarginRight(0);
				this.iconBox.setMarginTop(spacing + 1);
				this.iconBox.setMarginBottom(spacing + 1);
				this.icon1.setMarginTop(2);
				this.icon1.setMarginBottom(0);
				this.icon2.setMarginTop(1);
				this.icon2.setMarginBottom(1);
			}
			// content + text
			else if(this.content != undefined) {
				this.textBox.setMarginLeft(spacing + 2);
				this.textBox.setMarginRight(spacing + 2);
				this.textBox.setMarginTop(spacing + 1);
				this.textBox.setMarginBottom(spacing + 1);
				this.text1.setMargin(0);
				this.text1.setMarginTop(2);
				this.text2.setMargin(1);
				this.text1.setFontWeight('bold');
				this.text2.setFontWeight('bold');

				this.iconBox.setMarginLeft(spacing + 2);
				this.iconBox.setMarginRight(0);
				this.iconBox.setMarginTop(spacing + 2);
				this.iconBox.setMarginBottom(0);
			}
			// text only
			else {
				this.textBox.setMarginLeft(spacing + 4);
				this.textBox.setMarginRight(spacing + 4);
				this.textBox.setMarginTop(spacing + 1);
				this.textBox.setMarginBottom(spacing + 1);
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
			if(this.buttonIcon != undefined) {
				this.iconBox.setMarginLeft(spacing + 2);
				this.iconBox.setMarginRight(spacing + 2);
				this.iconBox.setMarginTop(spacing + 1);
				this.iconBox.setMarginBottom(spacing + 1);
				this.icon1.setMarginTop(2);
				this.icon1.setMarginBottom(0);
				this.icon2.setMarginTop(1);
				this.icon2.setMarginBottom(1);
			}
			else if(this.content != undefined) {
				this.iconBox.setMargin(spacing + 2);
			}
		}
	},

	getGradient: function() {
		var yuv = this.getStyleProperty('color').getYuv();
		return new Ui.LinearGradient({ stops: [
			{ offset: 0, color: new Ui.Color({ y: yuv.y + 0.10, u: yuv.u, v: yuv.v }) },
			{ offset: 1, color: new Ui.Color({ y: yuv.y - 0.10, u: yuv.u, v: yuv.v }) }
		] });
	},

	getGradientDown: function() {
		var yuv = this.getStyleProperty('color').getYuv();
		return new Ui.LinearGradient({ stops: [
			{ offset: 0, color: new Ui.Color({ y: yuv.y + 0.10 - 0.20, u: yuv.u, v: yuv.v }) },
			{ offset: 1, color: new Ui.Color({ y: yuv.y - 0.10 - 0.20, u: yuv.u, v: yuv.v }) }
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
		var color = this.getStyleProperty('color');
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

	onButtonPress: function() {
		this.fireEvent('validate', this);
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

	onEntryChange: function(entry, value) {
		this.fireEvent('change', this, value);
	},

	onEntryValidate: function(entry) {
		this.fireEvent('validate', this);
	}
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
			{ offset: 1, color: new Ui.Color({ y: yuv.y - 0.10, u: yuv.u, v: yuv.v }) }
		] });
		gradientDown = new Ui.LinearGradient({ stops: [
			{ offset: 0, color: new Ui.Color({ y: yuv.y + 0.10 - 0.20, u: yuv.u, v: yuv.v }) },
			{ offset: 1, color: new Ui.Color({ y: yuv.y - 0.10 - 0.20, u: yuv.u, v: yuv.v }) }
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

		if(this.button.getIsDown()) {
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

		this.updateSizes();
	},


	onDisable: function() {
		Ui.TextField.base.onDisable.call(this);
	},

	onEnable: function() {
		Ui.TextField.base.onEnable.call(this);
	}
}, {
	style: {
		color: new Ui.Color({ r: 0.31, g: 0.66, b: 1 }),
		radius: 4,
		spacing: 3
	}
});

