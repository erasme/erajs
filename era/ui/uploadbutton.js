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
		this.graphic.setHasFocus(true);
	},
		
	onUploadButtonBlur: function() {
		this.graphic.setHasFocus(false);
	}
});

