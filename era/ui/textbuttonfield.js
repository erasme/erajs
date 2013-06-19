Ui.HBox.extend('Ui.TextButtonField', 
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
		
		this.entry = new Ui.TextField();
		this.append(this.entry, true);
		
		this.button = new Ui.Button({ orientation: 'horizontal' });
		this.append(this.button);
		
		this.connect(this.entry, 'change', this.onEntryChange);
		this.connect(this.entry, 'validate', this.onEntryValidate);

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

	getValue: function() {
		return this.entry.getValue();
	},

	setValue: function(value) {
		this.entry.setValue(value);
	},

	onButtonPress: function() {
		this.fireEvent('buttonpress', this);
		this.fireEvent('validate', this);
	},

	onEntryChange: function(entry, value) {
		this.fireEvent('change', this, value);
	},

	onEntryValidate: function(entry) {
		this.fireEvent('validate', this);
	}
});
