//
// Define the TextAreaField class.
//
Ui.LBox.extend('Ui.TextAreaField', {
	textarea: undefined,
	scroll: undefined,

	constructor: function(config) {
		this.setPadding(3);

		this.append(new Ui.Rectangle({ fill: new Ui.Color({ r: 1, g: 1, b: 1, a: 0.25 }), radius: 4, marginTop: 1  }));
		this.append(new Ui.Rectangle({ fill: new Ui.Color({ r: 0, g: 0, b: 0, a: 0.4}), radius: 4, marginBottom: 1  }));

		this.append(new Ui.Rectangle({ fill: new Ui.Color({ r: 0.96, g: 0.96, b: 0.96 }), radius: 4, marginTop: 1, marginBottom: 1 }));
		this.append(new Ui.Shadow({ inner: true, radius: 4, marginTop: 1, marginBottom: 1, opacity: 0.2 }));

		this.scroll = new Ui.ScrollingArea();
		this.append(this.scroll);

		this.textarea = new Ui.TextArea({ margin: 4, fontSize: 16 });
//		this.scroll.setContent(this.textarea);
		this.scroll.setScrollingContent(this.textarea);
	},

	getValue: function() {
		return this.textarea.getValue();
	},

	setValue: function(value) {
		this.textarea.setValue(value);
	}

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
	}
});

