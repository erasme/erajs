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

		this.connect(this, 'down', function() {	this.graphic.setIsDown(true); });
		this.connect(this, 'up', function() { this.graphic.setIsDown(this.getIsDown() || this.getIsToggled()); });
		this.connect(this, 'toggle', function() { this.graphic.setContentColor(this.getStyleProperty('toggleColor')); });
		this.connect(this, 'untoggle', function() { this.graphic.setContentColor(undefined);  this.graphic.setIsDown(this.getIsDown()); });
		this.connect(this, 'focus', function() { this.graphic.setColor(this.getStyleProperty('focusColor')); });
		this.connect(this, 'blur', function() { this.graphic.setColor(this.getStyleProperty('color')); });
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
	},

	onDisable: function() {
		Ui.Button.base.onDisable.call(this);
		this.graphic.setIsEnable(false);
	},

	onEnable: function() {
		Ui.Button.base.onEnable.call(this);
		this.graphic.setIsEnable(true);
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

