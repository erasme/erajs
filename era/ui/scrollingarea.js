
Ui.Scrollable.extend('Ui.ScrollingArea', 
/**@lends Ui.ScrollingArea#*/
{
	horizontalScrollbar: undefined,
	verticalScrollbar: undefined,

	/**
     * @constructs
	 * @class
     * @extends Ui.Scrollable
	 */
	constructor: function(config) {
		this.horizontalScrollbar = new Ui.Rectangle({ width: 30, height: 4, margin: 5 });
		this.setScrollbarHorizontal(this.horizontalScrollbar);
		this.verticalScrollbar = new Ui.Rectangle({ width: 4, height: 30, margin: 5 });
		this.setScrollbarVertical(this.verticalScrollbar);
	}
}, 
/**@lends Ui.ScrollingArea#*/
{
	onStyleChange: function() {
		var radius = this.getStyleProperty('radius');
		this.horizontalScrollbar.setRadius(radius);
		this.verticalScrollbar.setRadius(radius);
	
		var color = this.getStyleProperty('color');
		this.horizontalScrollbar.setFill(color);
		this.verticalScrollbar.setFill(color);
	}
}, 
/**@lends Ui.ScrollingArea*/
{
	style: {
		color: new Ui.Color({ r: 0, g: 0.62, b: 0.88 }),
		radius: 3
	}
});
