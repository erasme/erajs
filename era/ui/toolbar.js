Ui.LBox.extend('Ui.ToolBar', 
/**@lends Ui.ToolBar*/
{
	hbox: undefined,
	scroll: undefined,
	background: undefined,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.VBox
	 */
	constructor: function(config) {
		this.topShadow = new Ui.Rectangle({ height: 1, verticalAlign: 'top' });
		Ui.ToolBar.base.append.call(this, this.topShadow);

		this.bottomShadow = new Ui.Rectangle({ height: 1, verticalAlign: 'bottom' });
		Ui.ToolBar.base.append.call(this, this.bottomShadow);

		var content = new Ui.LBox({ marginTop: 1, marginBottom: 1 });
		Ui.ToolBar.base.append.call(this, content);

		this.background = new Ui.Rectangle({ });
		content.append(this.background);

		this.scroll = new Ui.ScrollingArea({ scrollVertical: false, verticalAlign: 'center' });
		content.append(this.scroll);

		this.hbox = new Ui.HBox();
		this.scroll.setContent(this.hbox);
	},

	/**#@+
	 * @private
	 */

	getGradient: function() {
		var yuv = this.getStyleProperty('color').getYuv();
		return new Ui.LinearGradient({ stops: [
			{ offset: 0, color: new Ui.Color({ y: yuv.y + 0.10, u: yuv.u, v: yuv.v }) },
			{ offset: 1, color: new Ui.Color({ y: yuv.y - 0.10, u: yuv.u, v: yuv.v }) }
		] });
	},

	getLightColor: function() {
		var yuv = this.getStyleProperty('color').getYuv();
		return new Ui.Color({ y: yuv.y + 0.30, u: yuv.u, v: yuv.v });
	},

	getDarkColor: function() {
		var yuv = this.getStyleProperty('color').getYuv();
		return new Ui.Color({ y: yuv.y - 0.30, u: yuv.u, v: yuv.v });
	}

	/**#@-*/
}, 
/**@lends Ui.ToolBar#*/
{
	append: function(child, resizable) {
		this.hbox.append(child, resizable);
	},

	remove: function(child) {
		this.hbox.remove(child);
	},

	setContent: function(content) {
		this.hbox.setContent(content);
	},

	onStyleChange: function() {
		var gradient;
		var lightColor;
		var darkColor;
		var yuv = this.getStyleProperty('color').getYuv();
		gradient = new Ui.LinearGradient({ stops: [
			{ offset: 0, color: new Ui.Color({ y: yuv.y + 0.10, u: yuv.u, v: yuv.v }) },
			{ offset: 1, color: new Ui.Color({ y: yuv.y - 0.10, u: yuv.u, v: yuv.v }) }
		] });
		lightColor = new Ui.Color({ y: yuv.y + 0.30, u: yuv.u, v: yuv.v });
		darkColor = new Ui.Color({ y: yuv.y - 0.30, u: yuv.u, v: yuv.v });
		this.background.setFill(gradient);
		this.topShadow.setFill(lightColor);
		this.bottomShadow.setFill(darkColor);

		var spacing = this.getStyleProperty('spacing');
		this.hbox.setMargin(spacing);
		this.hbox.setSpacing(spacing);

	}
}, 
/**@lends Ui.ToolBar*/
{
	style: {
		color: new Ui.Color({ r: 0.11, g: 0.56, b: 1 }),
		spacing: 3
	}
});

