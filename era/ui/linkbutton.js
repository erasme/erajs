Ui.Linkable.extend('Ui.LinkButton', 
/** @lends Ui.LinkButton# */
{
	graphic: undefined,

    /**
     * @constructs
	 * @class A LinkButton is a button that is an hyper link
     * @extends Ui.Linkable
     * @param {String} [config.text] Button's text
     * @param {String} [config.icon] Icon name
     * @param {String} [config.orientation] 'vertical' or 'horizontal'
	 * @param {mixed} [config] see {@link Ui.Linkable} constructor for more options.
     */ 
	constructor: function(config) {
		this.graphic = new Ui.ButtonGraphic();
		this.setContent(this.graphic);

		this.connect(this, 'down', this.onLinkButtonDown);
		this.connect(this, 'up', this.onLinkButtonUp);
		this.connect(this, 'focus', this.onLinkButtonFocus);
		this.connect(this, 'blur', this.onLinkButtonBlur);
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

	onLinkButtonDown: function() {	
		this.graphic.setIsDown(true);
	},
	
	onLinkButtonUp: function() {	
		this.graphic.setIsDown(false);
	},
		
	onLinkButtonFocus: function() {	
		this.graphic.setHasFocus(true);
	},
		
	onLinkButtonBlur: function() {	
		this.graphic.setHasFocus(false);
	}
});

