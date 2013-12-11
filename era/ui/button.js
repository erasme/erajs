Ui.Pressable.extend('Ui.Button', 
/** @lends Ui.Button# */
{
	graphic: undefined,

    /**
     * @constructs
	 * @class A Button is a pressable element that looks like a rounded rectangle (by default) with some text and/or icon.        
     * @extends Ui.Pressable
     * @param {String} [config.text] Button's text
     * @param {String} [config.icon] SVG Icon name
     * @param {String} [config.orientation] 'vertical' or 'horizontal'
	 * @param {mixed} [config] see {@link Ui.Pressable} constructor for more options.  
     * @see <a href="http://daniel.erasme.lan:8080/era/samples/button/">Button sample</a>.
     */ 
	constructor: function(config) {
		this.graphic = new Ui.ButtonGraphic();
		this.append(this.graphic);

		this.connect(this, 'down', this.onButtonDown);
		this.connect(this, 'up', this.onButtonUp);
		this.connect(this, 'focus', this.onButtonFocus);
		this.connect(this, 'blur', this.onButtonBlur);
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
	
	onButtonDown: function() {
		this.graphic.setIsDown(true);
	},
	
	onButtonUp: function() {
		this.graphic.setIsDown(false);
	},
	
	onButtonFocus: function() {
		this.graphic.setHasFocus(true);
	},
	
	onButtonBlur: function() {
		this.graphic.setHasFocus(false);
	}
});

