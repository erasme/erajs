Ui.LBox.extend('Ui.TextAreaField', 
/**@lends Ui.TextAreaField#*/
{
	textarea: undefined,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.LBox
	 */
	constructor: function(config) {
		this.addEvents('change');

		this.setPadding(3);

		this.append(new Ui.Rectangle({ fill: new Ui.Color({ r: 1, g: 1, b: 1, a: 0.25 }), radius: 4, marginTop: 1  }));
		this.append(new Ui.Rectangle({ fill: new Ui.Color({ r: 0, g: 0, b: 0, a: 0.4}), radius: 4, marginBottom: 1  }));

		this.append(new Ui.Rectangle({ fill: new Ui.Color({ r: 0.98, g: 0.98, b: 0.98 }), radius: 4, marginTop: 1, marginBottom: 1 }));
		this.append(new Ui.Shadow({ inner: true, radius: 4, marginTop: 1, marginBottom: 1, opacity: 0.2 }));

		this.textarea = new Ui.TextArea({ margin: 4, fontSize: 16 });
		this.connect(this.textarea, 'change', function(textarea, value) {
			this.fireEvent('change', this, value);
		});
		this.append(this.textarea);
	},

	getValue: function() {
		return this.textarea.getValue();
	},

	setValue: function(value) {
		this.textarea.setValue(value);
	}

}, 
/**@lends Ui.TextAreaField#*/
{
	/**#@+
     * @private
     */
	onStyleChange: function() {
	},

	onDisable: function() {
		Ui.TextAreaField.base.onDisable.call(this);
	},

	onEnable: function() {
		Ui.TextAreaField.base.onEnable.call(this);
	}

	/**#@-*/
});

