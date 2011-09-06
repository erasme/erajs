//
// Define the ProgressBar class.
//
Ui.Container.extend('Ui.ProgressBar', {
	value: 0,
	barBox: undefined,
	barBackground: undefined,
	bar: undefined,

	lightShadow: undefined,
	darkShadow: undefined,
	lightBorder: undefined,
	background: undefined,

	constructor: function(config) {
		this.lightShadow = new Ui.Rectangle({ fill: new Ui.Color({ r: 1, g: 1, b: 1, a: 0.25 }), radius: 4, marginTop: 1  });
		this.appendChild(this.lightShadow);

		this.darkShadow = new Ui.Rectangle({ fill: new Ui.Color({ r: 0, g: 0, b: 0, a: 0.4}), radius: 4, marginBottom: 1  });
		this.appendChild(this.darkShadow);

		this.lightBorder = new Ui.Rectangle({ fill: 'lightgray', radius: 4, marginTop: 1, marginBottom: 2, marginLeft: 1, marginRight: 1  });
		this.appendChild(this.lightBorder);

		this.background = new Ui.Shadow({ shadowWidth: 2, inner: true, radius: 3, opacity: 0.2, margin: 1, marginBottom: 2 });
		this.appendChild(this.background);

		this.barBox = new Ui.LBox();
		this.appendChild(this.barBox);

		this.barBackground = new Ui.Rectangle();
		this.barBox.append(this.barBackground);

		this.bar = new Ui.Rectangle({ margin: 1 });
		this.barBox.append(this.bar);

		if(config.value != undefined)
			this.setValue(config.value);
	},

	setValue: function(value) {
		if(value != this.value) {
			this.value = value;
			var barWidth = (this.getLayoutWidth() - 4) * this.value;
			if(barWidth < 2)
				this.barBox.hide();
			else {
				this.barBox.show();
				this.barBox.arrange(2, 2, barWidth, this.getLayoutHeight() - 5);
			}
		}
	},

	getValue: function() {
		return this.value;
	},

	//
	// Private
	//

	getGradient: function() {
		var yuv = this.getStyleProperty('color').getYuv();
		return new Ui.LinearGradient({ stops: [
			{ offset: 0, color: new Ui.Color({ y: yuv.y + 0.10, u: yuv.u, v: yuv.v }) },
			{ offset: 1, color: new Ui.Color({ y: yuv.y - 0.10, u: yuv.u, v: yuv.v }) }
		] });
	},

	getBarBorderColor: function() {
		var yuv = this.getStyleProperty('color').getYuv();
		return new Ui.Color({ y: yuv.y - 0.20, u: yuv.u, v: yuv.v });
	},

	getLightBorderColor: function() {
		var yuv = this.getStyleProperty('color').getYuv();
		return new Ui.Color({ y: yuv.y + 0.30, u: yuv.u, v: yuv.v });
	}
}, {
	measureCore: function(width, height) {
		var minHeight = 0;
		var minWidth = 0;
		var size;

		size = this.lightShadow.measure(width, height);
		minHeight = Math.max(size.height, minHeight);
		minWidth = Math.max(size.width, minWidth);

		size = this.darkShadow.measure(width, height);
		minHeight = Math.max(size.height, minHeight);
		minWidth = Math.max(size.width, minWidth);

		size = this.lightBorder.measure(width, height);
		minHeight = Math.max(size.height, minHeight);
		minWidth = Math.max(size.width, minWidth);

		size = this.background.measure(width, height);
		minHeight = Math.max(size.height, minHeight);
		minWidth = Math.max(size.width, minWidth);

		this.barBox.measure(width, height);

		return { width: Math.max(minWidth, 12), height: Math.max(minHeight, 12) };
	},

	arrangeCore: function(width, height) {
		this.lightShadow.arrange(0, 0, width, height);
		this.darkShadow.arrange(0, 0, width, height);
		this.lightBorder.arrange(0, 0, width, height);
		this.background.arrange(0, 0, width, height);

		var barWidth = (width - 4) * this.value;
		if(barWidth < 2)
			this.barBox.hide();
		else {
			this.barBox.show();
			this.barBox.arrange(2, 2, barWidth, this.getLayoutHeight() - 5);
		}
	},

	onStyleChange: function() {
		var radius = this.getStyleProperty('radius');
		this.bar.setRadius(radius);
		this.bar.setFill(this.getGradient());
		this.barBackground.setRadius(radius);
		this.barBackground.setFill(this.getBarBorderColor());
	}
}, {
	style: {
		color: new Ui.Color({ r: 0.39, g: 0.92, b: 0.39 }),
		radius: 4
	}
});


