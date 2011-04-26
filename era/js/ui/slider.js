//
// Define the Slider class.
//
Ui.Container.extend('Ui.Slider', {
	value: 0,
	background: undefined,
	button: undefined,

	constructor: function(config) {
		if(config.value != undefined)
			this.value = config.value;

		this.lightShadow = new Ui.Rectangle({ fill: new Ui.Color({ r: 1, g: 1, b: 1, a: 0.25 }), radius: 7 });
		this.appendChild(this.lightShadow);

		this.darkShadow = new Ui.Rectangle({ fill: new Ui.Color({ r: 0, g: 0, b: 0, a: 0.4}), radius: 7 });
		this.appendChild(this.darkShadow);

		this.background = new Ui.Rectangle({ fill: new Ui.Color({ r: 0.85, g: 0.85, b: 0.85 }), radius: 7, shadow: 'inset 0px 0px 1px 1px rgba(0, 0, 0, 0.20)' });
		this.appendChild(this.background);

		this.barBox = new Ui.LBox();
		this.appendChild(this.barBox);

		this.barBackground = new Ui.Rectangle({ radius: 6 });
		this.barBox.append(this.barBackground);

		this.bar = new Ui.Rectangle({ margin: 1, radius: 6 });
		this.barBox.append(this.bar);

		this.button = new Ui.Movable({ moveVertical: false });
		this.appendChild(this.button);
		this.connect(this.button, 'move', this.onButtonMove);

		var buttonBox = new Ui.LBox();
		this.button.setContent(buttonBox);

		this.buttonContentBorder = new Ui.Rectangle({ radius: 20, fill: 'black' });
		buttonBox.append(this.buttonContentBorder);

		this.buttonContent = new Ui.Rectangle({ radius: 20, fill: 'lightblue', margin: 3 });
		buttonBox.append(this.buttonContent);

		this.addEvents('change');
	},

	getValue: function() {
		return this.value;
	},

	setValue: function(value) {
		if(this.value != value) {
			this.value = value;
			this.updateValue();
			this.fireEvent('change', this);
		}
	},

	//
	// Private
	//

	onButtonMove: function(button) {
		var posX = this.button.getPositionX();
		var width = this.getLayoutWidth();
		var maxX = width - 44;
		if(posX < 0)
			posX = 0;
		else if(posX > maxX)
			posX = maxX;

		var oldValue = this.value;
		this.value = posX / maxX;
		this.updateValue();
		if(oldValue != this.value)
			this.fireEvent('change', this);
	},

	updateValue: function() {
		var width = this.getLayoutWidth();
		var height = this.getLayoutHeight();
		var maxX = width - 44;
		this.button.setPosition(maxX * this.value, undefined);
		var y = (height - 44)/2;
		this.barBox.arrange(18, y + 15, (width - 36) * this.value, 15);
	},

	getGradient: function() {
		var yuv = this.getStyleProperty('color').getYuv();
		return new Ui.LinearGradient({ stops: [
			{ offset: 0, color: new Ui.Color({ y: yuv.y + 0.10, u: yuv.u, v: yuv.v }) },
			{ offset: 1, color: new Ui.Color({ y: yuv.y - 0.10, u: yuv.u, v: yuv.v }) },
		] });
	},

	getBarBorderColor: function() {
		var yuv = this.getStyleProperty('color').getYuv();
		return new Ui.Color({ y: yuv.y - 0.20, u: yuv.u, v: yuv.v });
	},

	getContentBorderColor: function() {
		var yuv = this.getStyleProperty('color').getYuv();
		return new Ui.Color({ y: yuv.y - 0.40, u: yuv.u, v: yuv.v });
	},


}, {
	measureCore: function(width, height) {
		this.lightShadow.measure(width - 34, 16);
		this.darkShadow.measure(width - 34, 16);
		this.background.measure(width - 36, 16);
		this.barBox.measure(width - 38, 12);
		this.button.measure(40, 40);
		return { width: 88, height: 44 };
	},

	arrangeCore: function(width, height) {
		var y = (height - 44)/2;
		this.lightShadow.arrange(17, y + 15, width - 34, 16);
		this.darkShadow.arrange(17, y + 14, width - 34, 16);
		this.background.arrange(18, y + 15, width - 36, 16);
		this.button.arrange(2, y + 2, 40, 40);
		this.updateValue();
	},

	onStyleChange: function() {
		this.bar.setFill(this.getGradient());
		this.barBackground.setFill(this.getBarBorderColor());

		this.buttonContent.setFill(this.getGradient());
		this.buttonContentBorder.setFill(this.getContentBorderColor());
	},
}, {
	style: {
		color: new Ui.Color({ r: 0.31, g: 0.66, b: 1 }),
	},
});

