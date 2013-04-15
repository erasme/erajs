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
		Ui.UploadButton.base.setContent.call(this, this.graphic);

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
		Ui.UploadButton.base.onDisable.call(this);
		this.graphic.setIsEnable(false);
	},

	onEnable: function() {
		Ui.UploadButton.base.onEnable.call(this);
		this.graphic.setIsEnable(true);
	}
}, 
/**@lends Ui.UploadButton*/
{
	style: {
		color: '#4fa8ff',
		focusColor: '#f6caa2',
		radius: 4,
		spacing: 3,
		iconSize: 24,
		fontSize: 16,
		fontFamily: 'Sans-serif',
		fontWeight: 'bold'
	}
});

