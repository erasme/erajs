Ui.LBox.extend('Ui.TextAreaField', 
/**@lends Ui.TextAreaField#*/
{
	textarea: undefined,
	textholder: undefined,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.LBox
	 */
	constructor: function(config) {
		this.addEvents('change');

		this.setPadding(3);

		this.append(new Ui.Rectangle({ fill: new Ui.Color({ r: 1, g: 1, b: 1, a: 0.25 }), radius: 4, marginTop: 1 }));
		this.append(new Ui.Rectangle({ fill: new Ui.Color({ r: 0, g: 0, b: 0, a: 0.4 }), radius: 4, marginBottom: 1 }));
		this.append(new Ui.Rectangle({ fill: new Ui.Color({ r: 0.98, g: 0.98, b: 0.98 }), radius: 4, margin: 1, marginBottom: 2 }));

		this.textholder = new Ui.Label({ opacity: 0.5, horizontalAlign: 'center', color: new Ui.Color({ r: 0.4, g: 0.4, b: 0.4 }), margin: 3 });
		this.append(this.textholder);

		this.append(new Ui.Shadow({ shadowWidth: 2, inner: true, radius: 4, opacity: 0.2, margin: 1, marginBottom: 2 }));

		this.textarea = new Ui.TextArea({ margin: 4, fontSize: 16 });
		this.append(this.textarea);

		this.connect(this.textarea, 'focus', this.onTextAreaFocus);
		this.connect(this.textarea, 'blur', this.onTextAreaBlur);
		this.connect(this.textarea, 'change', this.onTextAreaChange);
	},

	setTextHolder: function(text) {
		this.textholder.setText(text);
	},

	getValue: function() {
		return this.textarea.getValue();
	},

	setValue: function(value) {
		this.textarea.setValue(value);
		if((value == undefined) || (value == ''))
			this.textholder.show();
	},

	/**#@+
	 * @private
	 */

	onTextAreaFocus: function() {
		this.textholder.hide();
	},

	onTextAreaBlur: function() {
		if(this.getValue() == '')
			this.textholder.show();			
	},

	onTextAreaChange: function(entry, value) {
		this.fireEvent('change', this, value);
	}
	/**#@-*/
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
		this.textarea.setOpacity(0.2);
	},

	onEnable: function() {
		Ui.TextAreaField.base.onEnable.call(this);
		this.textarea.setOpacity(1);
	}
	/**#@-*/
});

