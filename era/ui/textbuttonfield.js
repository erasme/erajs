Ui.Button.extend('Ui.TextFieldButton', {}, {}, {
	style: {
		padding: 4,
		background: 'rgba(250,250,250,0)',
		backgroundBorder: 'rgba(140,140,140,0)'
	}
});

Ui.Form.extend('Ui.TextButtonField', 
/**@lends Ui.TextButtonField#*/
{
	graphic: undefined,
	entry: undefined,
	textholder: undefined,
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

		this.setPadding(3);
		
		this.graphic = new Ui.TextBgGraphic();
		this.append(this.graphic);

		this.textholder = new Ui.Label({ opacity: 0.5, horizontalAlign: 'center', margin: 3 });
		this.append(this.textholder);

		var hbox = new Ui.HBox();
		this.append(hbox);

		this.entry = new Ui.Entry({ margin: 4, fontSize: 16 });
		this.connect(this.entry, 'focus', this.onEntryFocus);
		this.connect(this.entry, 'blur', this.onEntryBlur);
		hbox.append(this.entry, true);

		this.connect(this.entry, 'change', this.onEntryChange);


//		this.entry = new Ui.TextField();
//		hbox.append(this.entry, true);
		
		this.button = new Ui.TextFieldButton({ orientation: 'horizontal', margin: 1 });
		hbox.append(this.button);
		
//		this.connect(this.entry, 'change', this.onEntryChange);
		this.connect(this, 'submit', this.onFormSubmit);

		this.connect(this.button, 'press', this.onButtonPress);
	},

	setTextHolder: function(text) {
		this.textholder.setText(text);
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

	/**#@+
	 * @private
	 */
	
	onButtonPress: function() {
		this.fireEvent('buttonpress', this);
		this.fireEvent('validate', this, this.getValue());
	},

	onEntryChange: function(entry, value) {
		this.fireEvent('change', this, value);
	},

	onFormSubmit: function() {
		this.fireEvent('validate', this, this.getValue());
	},

	onEntryFocus: function() {
		this.textholder.hide();
		this.graphic.setHasFocus(true);
	},

	onEntryBlur: function() {
		if(this.getValue() === '')
			this.textholder.show();
		this.graphic.setHasFocus(false);
	},

	onEntryChange: function(entry, value) {
		this.fireEvent('change', this, value);
	}
	/**#@-*/
});
