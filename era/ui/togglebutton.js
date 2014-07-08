Ui.Button.extend('Ui.ToggleButton', 
/**@lends Ui.ToggleButton#*/
{
	isToggled: false,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.Button
	 */
	constructor: function(config) {
		this.addEvents('toggle', 'untoggle');
		this.setRole('checkbox');
		this.getDrawing().setAttribute('aria-checked', 'false');
		this.connect(this, 'press', this.onToggleButtonPress);
	},
	
	getIsToggled: function() {
		return this.isToggled;
	},

	onToggleButtonPress: function() {
		if(!this.isToggled)
			this.onToggle();
		else
			this.onUntoggle();
	},
	
	onToggle: function() {
		if(!this.isToggled) {
			this.isToggled = true;
			this.setIsActive(true);
			this.getDrawing().setAttribute('aria-checked', 'true');
			this.fireEvent('toggle', this);
		}
	},

	onUntoggle: function() {
		if(this.isToggled) {
			this.isToggled = false;
			this.setIsActive(false);
			this.getDrawing().setAttribute('aria-checked', 'false');
			this.fireEvent('untoggle', this);
		}
	},

	toggle: function() {
		this.onToggle();
	},

	untoggle: function() {
		this.onUntoggle();
	}
});

