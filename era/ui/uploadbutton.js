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

		this.connect(this, 'down', this.onUploadButtonDown);
		this.connect(this, 'up', this.onUploadButtonUp);
		this.connect(this, 'focus', this.onUploadButtonFocus);
		this.connect(this, 'blur', this.onUploadButtonBlur);
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
	},
	
	onUploadButtonDown: function() {
		this.graphic.setIsDown(true);
	},
		
	onUploadButtonUp: function() {
		this.graphic.setIsDown(false);
	},
		
	onUploadButtonFocus: function() {
		this.graphic.setColor(this.getStyleProperty('focusColor'));
	},
		
	onUploadButtonBlur: function() {
		this.graphic.setColor(this.getStyleProperty('color'));
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
	}
}, 
/**@lends Ui.UploadButton*/
{
	style: {
		color: '#4fa8ff',
		focusColor: '#f6caa2',
		radius: 3,
		spacing: 5,
		iconSize: 24,
		fontSize: 16,
		fontFamily: 'Sans-serif',
		fontWeight: 'normal'
	}
});

