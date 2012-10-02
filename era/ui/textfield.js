Ui.LBox.extend('Ui.TextField', 
/**@lends Ui.TextField#*/
{
	entry: undefined,
	textholder: undefined,

    /**
     * @constructs
	 * @class    
     * @extends Ui.LBox
     * @param {Boolean} [config.passwordMode] Whether or not the TextField is in password mode (hide the typed text)
     * @param {String} [config.value] TextField intial value
     */ 
	constructor: function(config) {
		this.setPadding(3);

		this.append(new Ui.Rectangle({ fill: new Ui.Color({ r: 1, g: 1, b: 1, a: 0.25 }), radius: 4, marginTop: 1  }));
		this.append(new Ui.Rectangle({ fill: new Ui.Color({ r: 0, g: 0, b: 0, a: 0.4}), radius: 4, marginBottom: 1  }));

		this.append(new Ui.Rectangle({ fill: new Ui.Color({ r: 0.98, g: 0.98, b: 0.98 }), radius: 4, margin: 1, marginBottom: 2  }));

		this.textholder = new Ui.Label({ opacity: 0.5, horizontalAlign: 'center', color: new Ui.Color({ r: 0.4, g: 0.4, b: 0.4 }), margin: 3 });
		this.append(this.textholder);

		this.append(new Ui.Shadow({ shadowWidth: 2, inner: true, radius: 4, opacity: 0.2, margin: 1, marginBottom: 2 }));

		this.entry = new Ui.Entry({ margin: 4, fontSize: 16 });
		this.connect(this.entry, 'focus', this.onEntryFocus);
		this.connect(this.entry, 'blur', this.onEntryBlur);
		this.append(this.entry);

		this.connect(this.entry, 'change', this.onEntryChange);
		this.connect(this.entry, 'validate', this.onEntryValidate);

		this.addEvents('change', 'validate');
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
	},

	/**#@+
	 * @private
	 */

	onEntryFocus: function() {
		this.textholder.hide();
	},

	onEntryBlur: function() {
		if(this.getValue() == '')
			this.textholder.show();			
	},

	onEntryChange: function(entry, value) {
		this.fireEvent('change', this, value);
	},

	onEntryValidate: function(entry) {
		this.fireEvent('validate', this);
	}
	/**#@-*/
}, 
/**@lends Ui.TextField#*/
{
	onStyleChange: function() {
	},

	onDisable: function() {
		Ui.TextField.base.onDisable.call(this);
		this.entry.setOpacity(0.2);
	},

	onEnable: function() {
		Ui.TextField.base.onEnable.call(this);
		this.entry.setOpacity(1);
	}
});

