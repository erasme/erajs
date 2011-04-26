
Ui.VBox.extend('Ui.ToolBar', {
	hbox: undefined,
	background: undefined,

	constructor: function(config) {
		this.topShadow = new Ui.Rectangle({ height: 1 });
		Ui.ToolBar.base.append.call(this, this.topShadow);

		var content = new Ui.LBox();
		Ui.ToolBar.base.append.call(this, content);

		this.background = new Ui.Rectangle({ });
		content.append(this.background);

		this.hbox = new Ui.HBox({ spacing: 8, margin: 4 });
		content.append(this.hbox);

		this.bottomShadow = new Ui.Rectangle({ height: 1 });
		Ui.ToolBar.base.append.call(this, this.bottomShadow);
	},

	//
	// Private
	//

	getGradient: function() {
		var yuv = this.getStyleProperty('color').getYuv();
		return new Ui.LinearGradient({ stops: [
			{ offset: 0, color: new Ui.Color({ y: yuv.y + 0.10, u: yuv.u, v: yuv.v }) },
			{ offset: 1, color: new Ui.Color({ y: yuv.y - 0.10, u: yuv.u, v: yuv.v }) },
		] });
	},

	getLightColor: function() {
		var yuv = this.getStyleProperty('color').getYuv();
		return new Ui.Color({ y: yuv.y + 0.30, u: yuv.u, v: yuv.v });
	},

	getDarkColor: function() {
		var yuv = this.getStyleProperty('color').getYuv();
		return new Ui.Color({ y: yuv.y - 0.30, u: yuv.u, v: yuv.v });
	},

}, {
	append: function(child, resizable) {
		this.hbox.append(child, resizable);
	},

	remove: function(child) {
		this.hbox.remove(child);
	},

	onStyleChange: function() {
		var gradient;
		var lightColor;
		var darkColor;
		var yuv = this.getStyleProperty('color').getYuv();
		gradient = new Ui.LinearGradient({ stops: [
			{ offset: 0, color: new Ui.Color({ y: yuv.y + 0.10, u: yuv.u, v: yuv.v }) },
			{ offset: 1, color: new Ui.Color({ y: yuv.y - 0.10, u: yuv.u, v: yuv.v }) },
		] });
		lightColor = new Ui.Color({ y: yuv.y + 0.30, u: yuv.u, v: yuv.v });
		darkColor = new Ui.Color({ y: yuv.y - 0.30, u: yuv.u, v: yuv.v });
		this.background.setFill(gradient);
		this.topShadow.setFill(lightColor);
		this.bottomShadow.setFill(darkColor);
	},
}, {
	style: {
		color: new Ui.Color({ r: 0.11, g: 0.56, b: 1 }),

		"Ui.Button": {
			color: new Ui.Color({ r: 0.96, g: 0.96, b: 0.96 }),
		},
	},
});

