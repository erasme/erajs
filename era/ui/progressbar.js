
Ui.Container.extend('Ui.ProgressBar', 
{
	value: 0,
	bar: undefined,
	border: undefined,

	constructor: function(config) {
		this.bar = new Ui.Rectangle({ margin: 1, height: 4 });
		this.appendChild(this.bar);
		this.border = new Ui.Frame({ frameWidth: 2 });
		this.appendChild(this.border);
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

		size = this.border.measure(width, height);
		minHeight = Math.max(size.height, minHeight);
		minWidth = Math.max(size.width, minWidth);

		return { width: Math.max(minWidth, 12), height: minHeight };
	},

	arrangeCore: function(width, height) {
		this.border.arrange(0, 0, width, height);

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
		this.bar.setRadius(radius-1);
		this.bar.setFill(this.getStyleProperty('color'));
		this.border.setRadius(radius);
		this.border.setFill(this.getStyleProperty('color'));
	}
}, 
{
	style: {
		color: '#999999',
		radius: 4
	}
});

