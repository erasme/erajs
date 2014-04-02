Ui.Element.extend('Ui.Separator', 
/** @lends Ui.Separator# */
{
	/**
	 * @constructs
	 * @class
	 * @extends Ui.Rectangle
	 */
	constructor: function(config) {
		this.setHeight(1);
		this.setWidth(1);
	}
}, 
/** @lends Ui.Separator# */
{
	onStyleChange: function() {
		this.setBackground(this.getStyleProperty('color'));
	}
}, 
/** @lends Ui.Separator */
{
	style: {
		color: new Ui.Color({ r: 0, g: 0, b: 0 })
	}
});

