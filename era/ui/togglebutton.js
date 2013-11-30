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
		this.connect(this, 'toggle', this.onToggleButtonToggle);
		this.connect(this, 'untoggle', this.onToggleButtonUntoggle);
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
	
	onToggleButtonToggle: function() {
		this.graphic.setContentColor(this.getStyleProperty('toggleColor'));
	},
	
	onToggleButtonUntoggle: function() {
		this.graphic.setContentColor(undefined);  this.graphic.setIsDown(this.getIsDown());
	},
	
	onToggleButtonFocus: function() {
		this.graphic.setColor(this.getStyleProperty('focusColor'));
	},
	
	onToggleButtonBlur: function() {
		this.graphic.setColor(this.getStyleProperty('color'));
	}
}, 
/**@lends Ui.ToggleButton#*/
{
	onStyleChange: function() {
		this.graphic.setRadius(this.getStyleProperty('radius'));
		this.graphic.setSpacing(this.getStyleProperty('spacing'));
		this.graphic.setIconSize(this.getStyleProperty('iconSize'));
		this.graphic.setFontFamily(this.getStyleProperty('fontFamily'));
		this.graphic.setFontSize(this.getStyleProperty('fontSize'));
		this.graphic.setFontWeight(this.getStyleProperty('fontWeight'));
		if(this.getHasFocus())
			this.graphic.setColor(this.getStyleProperty('focusColor'));
		else
			this.graphic.setColor(this.getStyleProperty('color'));
		if(this.getIsToggled())
			this.graphic.setContentColor(this.getStyleProperty('toggleColor'));
		else
			this.graphic.setContentColor(undefined);
	}
}, 
/**@lends Ui.ToggleButton*/
{
	style: {
		color: new Ui.Color({ r: 0.31, g: 0.66, b: 1 }),
		focusColor: '#f6caa2',
		toggleColor: '#fdf636',
		radius: 4,
		spacing: 3,
		iconSize: 24,
		fontSize: 16,
		fontFamily: 'Sans-serif',
		fontWeight: 'normal'
	}
});

