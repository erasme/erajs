Ui.Togglable.extend('Ui.ToggleButton', 
/**@lends Ui.ToggleButton#*/
{
	graphic: undefined,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.Togglable
	 */
	constructor: function(config) {
		this.graphic = new Ui.ButtonGraphic();
		this.append(this.graphic);

		this.connect(this, 'down', this.onToggleButtonDown);
		this.connect(this, 'up', this.onToggleButtonUp);
		this.connect(this, 'focus', this.onToggleButtonFocus);
		this.connect(this, 'blur', this.onToggleButtonBlur);
	},

	getText: function() {
		return this.graphic.getText();
	},

	setText: function(text) {
		this.graphic.setText(text);
	},

	getIcon: function() {
		return this.graphic.getIcon();
	},

	setIcon: function(icon) {
		this.graphic.setIcon(icon);
	},

	getOrientation: function() {
		return this.graphic.getOrientation();
	},

	setOrientation: function(orientation) {
		this.graphic.setOrientation(orientation);
	},
	
	onToggleButtonDown: function() {
		this.graphic.setIsDown(true);
	},
	
	onToggleButtonUp: function() {
		this.graphic.setIsDown(this.getIsDown() || this.getIsToggled());
	},

	onToggleButtonFocus: function() {
		this.graphic.setHasFocus(true);
	},
	
	onToggleButtonBlur: function() {
		this.graphic.setHasFocus(false);
	}
});

