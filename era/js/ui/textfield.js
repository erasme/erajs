//
// Define the TextField class.
//
Ui.LBox.extend('Ui.TextField', {
	entry: undefined,

	constructor: function(config) {
		this.setPadding(3);

		this.append(new Ui.Rectangle({ fill: new Ui.Color({ r: 1, g: 1, b: 1, a: 0.25 }), radius: 4, marginTop: 1  }));
		this.append(new Ui.Rectangle({ fill: new Ui.Color({ r: 0, g: 0, b: 0, a: 0.4}), radius: 4, marginBottom: 1  }));

		this.append(new Ui.Rectangle({ fill: new Ui.Color({ r: 0.98, g: 0.98, b: 0.98 }), radius: 4, margin: 1, marginBottom: 2, shadow: 'inset 0px 0px 1px 1px rgba(0, 0, 0, 0.20)'  }));

		this.entry = new Ui.Entry({ margin: 4, fontSize: 16 });
		this.append(this.entry);

		this.connect(this.entry, 'change', this.onEntryChange);
		this.connect(this.entry, 'validate', this.onEntryValidate);

		this.addEvents('change', 'validate');
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

	onEntryChange: function(entry, value) {
		this.fireEvent('change', this, value);
	},

	onEntryValidate: function(entry) {
		this.fireEvent('validate', this);
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

