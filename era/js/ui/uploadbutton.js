Ui.Uploadable.extend('Ui.UploadButton', 
/**@lends Ui.UploadButton#*/
{
	graphic: undefined,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.Uploadable
	 */
	constructor: function(config) {
		this.graphic = new Ui.ButtonGraphic();
		this.setContent(this.graphic);

		if('text' in config)
			this.setText(config.text);
		if('icon' in config)
			this.setIcon(config.icon);
		if('orientation' in config)
			this.setOrientation(config.orientation);

		this.connect(this, 'down', function() { this.graphic.setIsDown(true); });
		this.connect(this, 'up', function() { this.graphic.setIsDown(false); });
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

    /** @return {String} Orientation */
	getOrientation: function() {
		return this.graphic.getOrientation();
	},
    
    /** @param {String} orientation can be 'vertical' or 'horizontal' */
	setOrientation: function(orientation) {
		this.graphic.setOrientation(orientation);
	}
}, 
/**@lends Ui.UploadButton#*/
{
	onStyleChange: function() {
		this.graphic.setRadius(this.getStyleProperty('radius'));
		this.graphic.setSpacing(this.getStyleProperty('spacing'));
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
/**@lends Ui.UploadButton*/
{
	style: {
		color: new Ui.Color({ r: 0.31, g: 0.66, b: 1 }),
		focusColor: Ui.Color.create('#f6caa2'),
		radius: 4,
		spacing: 3
	}
});

