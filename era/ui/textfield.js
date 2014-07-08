Ui.LBox.extend('Ui.TextField', 
/**@lends Ui.TextField#*/
{
	entry: undefined,
	graphic: undefined,
	textholder: undefined,

    /**
     * @constructs
	 * @class    
     * @extends Ui.LBox
     * @param {Boolean} [config.passwordMode] Whether or not the TextField is in password mode (hide the typed text)
     * @param {String} [config.value] TextField intial value
     */ 
	constructor: function(config) {
		this.addEvents('change');

		this.setPadding(3);
		
		this.graphic = new Ui.TextBgGraphic();
		this.append(this.graphic);

		this.textholder = new Ui.Label({ opacity: 0.5, horizontalAlign: 'center', margin: 3 });
		if(!navigator.isIE7 && !navigator.isIE8)
			this.append(this.textholder);

		this.entry = new Ui.Entry({ margin: 4, fontSize: 16 });
		this.connect(this.entry, 'focus', this.onEntryFocus);
		this.connect(this.entry, 'blur', this.onEntryBlur);
		this.append(this.entry);

		this.connect(this.entry, 'change', this.onEntryChange);
	},

	setTextHolder: function(text) {
		this.textholder.setText(text);
	},

	setPasswordMode: function(passwordMode) {
		this.entry.setPasswordMode(passwordMode);
	},

	getValue: function() {
		return this.entry.getValue();
	},

	setValue: function(value) {
		this.entry.setValue(value);
		if((value === undefined) || (value === ''))
			this.textholder.show();
		else
			this.textholder.hide();
	},

	/**#@+
	 * @private
	 */

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
}, 
/**@lends Ui.TextField#*/
{
	onStyleChange: function() {
	}
});

