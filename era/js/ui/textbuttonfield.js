//
// Define the TextButtonField class.
//
Ui.LBox.extend('Ui.TextButtonField', {
	entry: undefined,
	button: undefined,
	buttonIcon: undefined,
	buttonText: undefined,

	constructor: function(config) {

		this.append(new Ui.Rectangle({ fill: new Ui.Color({ r: 1, g: 1, b: 1, a: 0.25 }), radius: 4, marginTop: 1  }));
		this.append(new Ui.Rectangle({ fill: new Ui.Color({ r: 0, g: 0, b: 0, a: 0.4}), radius: 4, marginBottom: 1  }));

		var hbox = new Ui.HBox({ margin: 1 });
		this.append(hbox);

		var lbox = new Ui.LBox();
		hbox.append(lbox, true);

		lbox.append(new Ui.Rectangle({ fill: new Ui.Color({ r: 0.96, g: 0.96, b: 0.96 }), radiusTopLeft: 4, radiusBottomLeft: 4, shadow: 'inset 0px 0px 2px 1px rgba(0, 0, 0, 0.15)'  }));

		this.entry = new Ui.Entry({ margin: 4 });
		lbox.append(this.entry);

		this.buttonAllContent = new Ui.Pressable();
		hbox.append(this.buttonAllContent);

		this.rect2 = new Ui.Rectangle({ fill: 'white', radiusTopRight: 4, radiusBottomRight: 4, marginBottom: 1 });
		this.buttonAllContent.append(this.rect2);

		this.rect1 = new Ui.Rectangle({ fill: this.getGradient(), radiusTopRight: 3, radiusBottomRight: 3, marginLeft: 1, marginTop: 1, marginBottom: 1 });
		this.buttonAllContent.append(this.rect1);

		this.buttonContentBox = new Ui.Box({ verticalAlign: 'center', horizontalAlign: 'center' });
		this.buttonAllContent.append(this.buttonContentBox);

		this.iconBox = new Ui.LBox({ verticalAlign: 'center', horizontalAlign: 'center' });
		this.buttonContentBox.append(this.iconBox);

		if(config.buttonText != undefined)
			this.setButtonText(config.buttonText);
		if(config.buttonIcon != undefined)
			this.setButtonIcon(config.buttonIcon);
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
	},

	//
	// Private
	//
	updateSizes: function() {
			if(this.text != undefined) {
				// icon + text
				if(this.buttonIcon != undefined) {
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
			if(this.buttonIcon != undefined) {
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
	},

	getGradient: function() {
		var gradient = this.getStyleResource('ui-textbuttonfield-gradient');
		if(gradient == undefined)
			return Ui.Button.gradient;
		else
			return gradient;
	},

}, {
	onStyleChange: function() {
	},

	onDisable: function() {
		Ui.TextField.base.onDisable.call(this);
	},

	onEnable: function() {
		Ui.TextField.base.onEnable.call(this);
	},
});

