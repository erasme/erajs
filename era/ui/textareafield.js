Ui.LBox.extend('Ui.TextAreaField', 
/**@lends Ui.TextAreaField#*/
{
	textarea: undefined,
	graphic: undefined,
	textholder: undefined,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.LBox
	 */
	constructor: function(config) {
		this.addEvents('change');

		this.setPadding(3);

		this.graphic = new Ui.TextBgGraphic();
		this.append(this.graphic);

		this.textholder = new Ui.Label({ opacity: 0.5, horizontalAlign: 'center', margin: 3 });
		if(!navigator.isIE7 && !navigator.isIE8)
			this.append(this.textholder);

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
		if((value === undefined) || (value === ''))
			this.textholder.show();
		else
			this.textholder.hide();
	},

	/**#@+
	 * @private
	 */

	onTextAreaFocus: function() {
		this.textholder.hide();
		this.graphic.setHasFocus(true);
	},

	onTextAreaBlur: function() {
		if(this.getValue() === '')
			this.textholder.show();	
		this.graphic.setHasFocus(false);
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
	}
	/**#@-*/
});

