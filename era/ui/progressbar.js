
Ui.Container.extend('Ui.ProgressBar', {
	value: 0,
	bar: undefined,
	background: undefined,

	constructor: function(config) {
		this.background = new Ui.Rectangle({ height: 4 });
		this.appendChild(this.background);
		this.bar = new Ui.Rectangle({ height: 4 });
		this.appendChild(this.bar);
	},

	setValue: function(value) {
		if(value != this.value) {
			this.value = value;
			var barWidth = this.getLayoutWidth() * this.value;
			if(barWidth < 2)
				this.bar.hide();
			else {
				this.bar.show();
				this.bar.arrange(0, 0, barWidth, this.getLayoutHeight());
			}
		}
	},

	getValue: function() {
		return this.value;
	}
}, 
{
	measureCore: function(width, height) {
		var minHeight = 0;
		var minWidth = 0;
		var size;

		size = this.bar.measure(width, height);
		minHeight = Math.max(size.height, minHeight);
		minWidth = Math.max(size.width, minWidth);

		size = this.background.measure(width, height);
		minHeight = Math.max(size.height, minHeight);
		minWidth = Math.max(size.width, minWidth);

		return { width: Math.max(minWidth, 12), height: minHeight };
	},

	arrangeCore: function(width, height) {
		this.background.arrange(0, 0, width, height);

		var barWidth = width * this.value;
		if(barWidth < 2)
			this.bar.hide();
		else {
			this.bar.show();
			this.bar.arrange(0, 0, barWidth, this.getLayoutHeight());
		}
	},

	onStyleChange: function() {
		var radius = this.getStyleProperty('radius');
		this.bar.setRadius(radius);
		this.bar.setFill(this.getStyleProperty('foreground'));
		this.background.setRadius(radius);
		this.background.setFill(this.getStyleProperty('background'));
	}
}, {
	style: {
		background: '#999',
		foreground: '#0cc',
		color: '#999999',
		radius: 0
	}
});

