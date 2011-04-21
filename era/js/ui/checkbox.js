//
// Define the CheckBox class.
//
Ui.Togglable.extend('Ui.CheckBox', {
	check: undefined,
	background: undefined,
	checkBox: undefined,
	contentBox: undefined,

	constructor: function(config) {
		this.setPadding(3);

		var hbox = new Ui.HBox();
		this.append(hbox);

		this.checkBox = new Ui.LBox();
		hbox.append(this.checkBox);

		this.background = new Ui.Rectangle({ radius: 4, fill: 'lightgrey', margin: 10 });
		this.checkBox.append(this.background);

		this.check = Ui.Icon.create('check', 42, 42, 'green');
		this.check.hide();
		this.checkBox.append(this.check);

		this.contentBox = new Ui.LBox();
		hbox.append(this.contentBox, true);

		this.connect(this, 'down', this.onCheckBoxDown);
		this.connect(this, 'up', this.onCheckBoxUp);
		this.connect(this, 'toggle', this.onCheckBoxToggle);
		this.connect(this, 'untoggle', this.onCheckBoxUntoggle);
	},

	//
	// Private
	//

	onCheckBoxDown: function() {
	},

	onCheckBoxUp: function() {
	},

	onCheckBoxToggle: function() {
		this.check.show();
	},

	onCheckBoxUntoggle: function() {
		this.check.hide();
	},

}, {
	onStyleChange: function() {
	},

	onDisable: function() {
		Ui.Button.base.onDisable.call(this);
//		this.contentBox.setOpacity(0.2);
	},

	onEnable: function() {
		Ui.Button.base.onEnable.call(this);
//		this.contentBox.setOpacity(1);
	},
});

Ui.CheckBox.style = {
	color: new Ui.Color({ r: 0.31, g: 0.66, b: 1 }),
//	color: new Ui.Color({ r: 0.89, g: 0.89, b: 0.89 }),
	radius: 4,
};

