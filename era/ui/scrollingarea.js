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
		this.horizontalScrollbar = new Ui.Rectangle({ fill: new Ui.Color({ r: 0, g: 0.62, b: 0.88 }), radius: 4, width: 8, height: 8, margin: 10 });
		this.setScrollbarHorizontal(this.horizontalScrollbar);
		this.verticalScrollbar = new Ui.Rectangle({ fill: new Ui.Color({ r: 0, g: 0.62, b: 0.88 }), radius: 4, width: 8, height: 8, margin: 10 });
		this.setScrollbarVertical(this.verticalScrollbar);
	}
}, 
/**@lends Ui.ScrollingArea#*/
{
	onStyleChange: function() {
		var color = this.getStyleProperty('color');
		this.horizontalScrollbar.setFill(color);
		this.verticalScrollbar.setFill(color);
	}
}, 
/**@lends Ui.ScrollingArea*/
{
	style: {
		color: new Ui.Color({ r: 0, g: 0.62, b: 0.88 })
	}
});
