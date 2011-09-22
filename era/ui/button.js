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

		this.autoConfig(config, 'text', 'icon', 'orientation');

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
/** @lends Ui.Button# */
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
/** @lends Ui.Button */
{
	style: {
		color: new Ui.Color({ r: 0.31, g: 0.66, b: 1 }),
		focusColor: Ui.Color.create('#f6caa2'),
		radius: 4,
		spacing: 3
	}
});

