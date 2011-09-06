Ui.Rectangle.extend('Ui.Separator', 
/** @lends Ui.Separator# */
{
	constructor: function(config) {
		this.setMargin(3);
		this.setHeight(1);
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
		color: new Ui.Color({ r: 0, g: 0, b: 0 })
	}
});

