
Ui.Scrollable.extend('Ui.ScrollingArea', 
/**@lends Ui.ScrollingArea#*/
{
	horizontalScrollbar: undefined,
	verticalScrollbar: undefined,
	topShadow: undefined,
	bottomShadow: undefined,
	leftShadow: undefined,
	rightShadow: undefined,

	/**
     * @constructs
	 * @class
     * @extends Ui.Scrollable
	 */
	constructor: function(config) {
		this.horizontalScrollbar = new Ui.Rectangle({ radius: 4, width: 8, height: 8, margin: 10 });
		this.setScrollbarHorizontal(this.horizontalScrollbar);
		this.verticalScrollbar = new Ui.Rectangle({ radius: 4, width: 8, height: 8, margin: 10 });
		this.setScrollbarVertical(this.verticalScrollbar);

		this.topShadow = new Ui.Rectangle({ height: 5 });
		this.setTopShadow(this.topShadow);

		this.bottomShadow = new Ui.Rectangle({ height: 5 });
		this.setBottomShadow(this.bottomShadow);

		this.leftShadow = new Ui.Rectangle({ width: 5 });
		this.setLeftShadow(this.leftShadow);

		this.rightShadow = new Ui.Rectangle({ width: 5 });
		this.setRightShadow(this.rightShadow);
	}
}, 
/**@lends Ui.ScrollingArea#*/
{
	setShowScrollbar: function(show) {
		Ui.ScrollingArea.base.setShowScrollbar.call(this, show);
		if(show) {
			this.horizontalScrollbar.setOpacity(1);
			this.horizontalScrollbar.setMargin(10);
			this.horizontalScrollbar.setWidth(8);
			this.horizontalScrollbar.setHeight(8);
			this.horizontalScrollbar.setRadius(4);

			this.verticalScrollbar.setOpacity(1);
			this.verticalScrollbar.setMargin(10);
			this.verticalScrollbar.setWidth(8);
			this.verticalScrollbar.setHeight(8);
			this.verticalScrollbar.setRadius(4);
		}
		else {
			this.horizontalScrollbar.setOpacity(0.6);
			this.horizontalScrollbar.setMargin(2);
			this.horizontalScrollbar.setWidth(4);
			this.horizontalScrollbar.setHeight(4);
			this.horizontalScrollbar.setRadius(2);

			this.verticalScrollbar.setOpacity(0.6);
			this.verticalScrollbar.setMargin(2);
			this.verticalScrollbar.setWidth(4);
			this.verticalScrollbar.setHeight(4);
			this.verticalScrollbar.setRadius(2);
		}
	},


	onStyleChange: function() {
		var color = this.getStyleProperty('color');
		this.horizontalScrollbar.setFill(color);
		this.verticalScrollbar.setFill(color);

		var c = this.getStyleProperty('shadowColor').getRgb();
		var start = new Ui.Color({r:c.r,g:c.g,b:c.b,a:0});
		var end = new Ui.Color({r:c.r,g:c.g,b:c.b,a:0.3});
		var gradient = new Ui.LinearGradient({ orientation: 'vertical', stops: [
			{ offset: 0, color: end},	{ offset: 1, color: start} ] });
		this.topShadow.setFill(gradient);

		gradient = new Ui.LinearGradient({ orientation: 'vertical', stops: [
			{ offset: 0, color: start},	{ offset: 1, color: end} ] });
		this.bottomShadow.setFill(gradient);

		var gradient = new Ui.LinearGradient({ orientation: 'horizontal', stops: [
			{ offset: 0, color: end},	{ offset: 1, color: start} ] });
		this.leftShadow.setFill(gradient);

		var gradient = new Ui.LinearGradient({ orientation: 'horizontal', stops: [
			{ offset: 0, color: start},	{ offset: 1, color: end} ] });
		this.rightShadow.setFill(gradient);
	}
}, 
/**@lends Ui.ScrollingArea*/
{
	style: {
		color: new Ui.Color({ r: 0, g: 0.62, b: 0.88 }),
		shadowColor: new Ui.Color({ r: 0, g: 0, b: 0 })
	}
});
