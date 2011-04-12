//
// Define the TextAreaField class.
//
Ui.LBox.extend('Ui.TextAreaField', {
	textarea: undefined,

	constructor: function(config) {

		this.append(new Ui.Rectangle({ fill: new Ui.Color({ r: 1, g: 1, b: 1, a: 0.25 }), radius: 4, marginTop: 1  }));
		this.append(new Ui.Rectangle({ fill: new Ui.Color({ r: 0, g: 0, b: 0, a: 0.4}), radius: 4, marginBottom: 1  }));

		this.append(new Ui.Rectangle({ fill: new Ui.Color({ r: 0.96, g: 0.96, b: 0.96 }), radius: 4, marginTop: 1, marginBottom: 1, shadow: 'inset 0px 0px 2px 1px rgba(0, 0, 0, 0.15)'  }));

		this.textarea = new Ui.TextArea({ margin: 4 });
		this.append(this.textarea);
	},

	//
	// Private
	//
}, {
	onStyleChange: function() {
	},

	onDisable: function() {
		Ui.TextAreaField.base.onDisable.call(this);
	},

	onEnable: function() {
		Ui.TextAreaField.base.onEnable.call(this);
	},
});

