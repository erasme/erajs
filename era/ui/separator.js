Ui.Rectangle.extend('Ui.Separator', 
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
		this.setFill(this.getStyleProperty('color'));
	}
}, 
/** @lends Ui.Separator */
{
	style: {
		color: '#444444'
	}
});

