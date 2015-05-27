Ui.DefaultButton.extend('Ui.TextFieldButton');

Ui.Form.extend('Ui.TextButtonField', 
/**@lends Ui.TextButtonField#*/
{
	entry: undefined,
	button: undefined,
	buttonIcon: undefined,
	buttonText: undefined,

	/**
     * @constructs
	 * @class 
     * @extends Ui.LBox
     * @param {String} [config.buttonText] Text display in the button
	 * @param {String} [config.buttonIcon] Name of the button icon
	 * @param {String} [config.value] Default TextField value
	 */
	constructor: function(config) {
		this.addEvents('change', 'validate', 'buttonpress');

		var hbox = new Ui.HBox();
		this.setContent(hbox);

		this.entry = new Ui.TextField();
		hbox.append(this.entry, true);
		
		this.button = new Ui.TextFieldButton({ orientation: 'horizontal' });
		hbox.append(this.button);
		
		this.connect(this.entry, 'change', this.onEntryChange);
		this.connect(this, 'submit', this.onFormSubmit);

		this.connect(this.button, 'press', this.onButtonPress);
	},

	setWidthText: function(nbchar) {
		this.entry.setWidth(nbchar * 16 * 2 / 3);
	},

	getButtonIcon: function() {
		return this.buttonIcon;
	},

	setButtonIcon: function(icon) {
		this.button.setIcon(icon);	
	},

	setButtonText: function(text) {
		this.button.setText(text);
	},

	getTextValue: function() {
		return this.entry.getValue();
	},

	setTextValue: function(value) {
		this.entry.setValue(value);
	},

	getValue: function() {
		return this.getTextValue();
	},

	setValue: function(value) {
		this.setTextValue(value);
	},

	onButtonPress: function() {
		this.fireEvent('buttonpress', this);
		this.fireEvent('validate', this, this.getValue());
	},

	onEntryChange: function(entry, value) {
		this.fireEvent('change', this, value);
	},

	onFormSubmit: function() {
		this.fireEvent('validate', this, this.getValue());
	}
});
