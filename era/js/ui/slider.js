//
// Define the Slider class.
//
Ui.LBox.extend('Ui.Slider', {
	isDown: false,
	value: 0,
	background: undefined,
	button: undefined,

	constructor: function(config) {
		if(config.value != undefined)
			this.value = config.value;
		this.setFocusable(true);

		this.background = new Ui.Rectangle({ width: 100, height: 16, verticalAlign: 'center', margin: 14, marginLeft: 17, marginRight: 17, radius: 8 });
		this.appendChild(this.background);

		this.foreground = new Ui.Rectangle({ width: 10, height: 10, verticalAlign: 'center', horizontalAlign: 'left', margin: 17, marginLeft: 20, marginRight: 20, radius: 8, fill: 'white' });
		this.appendChild(this.foreground);

		this.button = new Ui.Movable({ moveVertical: false });
		this.connect(this.button, 'move', this.onButtonMove);
		this.button.setContent(new Ui.Rectangle({ width: 40, height: 40, verticalAlign: 'center', horizontalAlign: 'left', radius: 20, margin: 2, fill: 'lightblue' }));
		this.appendChild(this.button);

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
		var maxX = this.getLayoutWidth() - this.button.getMeasureWidth();
		if(posX < 0)
			posX = 0;
		else if(posX > maxX)
			posX = maxX;

		this.setValue(posX / maxX);
		this.value = posX / maxX;
		this.updateValue();
		this.fireEvent('change', this);
	},

	updateValue: function() {
		var maxX = this.getLayoutWidth() - this.button.getMeasureWidth();
		this.button.setPosition(maxX * this.value, undefined);
		this.foreground.setWidth((this.getLayoutWidth() - 40)*this.value);
	},

}, {
	arrangeCore: function(width, height) {
		this.updateValue();
		Ui.Slider.base.arrangeCore.call(this, width, height);
	},
});
