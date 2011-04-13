
Ui.VBox.extend('Ui.ToolBar', {
	hbox: undefined,
	background: undefined,

	constructor: function(config) {
		this.topShadow = new Ui.Rectangle({ fill: this.getLightColor(), height: 1 });
		Ui.ToolBar.base.append.call(this, this.topShadow);

		var content = new Ui.LBox();
		Ui.ToolBar.base.append.call(this, content);

		this.background = new Ui.Rectangle({ fill: this.getGradient() });
		content.append(this.background);

		this.hbox = new Ui.HBox({ spacing: 8, margin: 4 });
		content.append(this.hbox);

		this.bottomShadow = new Ui.Rectangle({ fill: this.getDarkColor(), height: 1 });
		Ui.ToolBar.base.append.call(this, this.bottomShadow);
	},

	//
	// Private
	//

	getGradient: function() {
		return this.getStyleResource('ui-toolbar-gradient');
	},

	getLightColor: function() {
		return this.getStyleResource('ui-toolbar-light-color');
	},

	getDarkColor: function() {
		return this.getStyleResource('ui-toolbar-dark-color');
	},

}, {
	append: function(child, resizable) {
		this.hbox.append(child, resizable);
	},

	remove: function(child) {
		this.hbox.remove(child);
	},

	onStyleChange: function() {
		var gradient = this.getStyleResource('ui-toolbar-gradient');
		var lightColor;
		var darkColor;
		if(gradient == undefined) {
			var color = this.getStyleProperty('color');
			var yuv = color.getYuv();

			gradient = new Ui.LinearGradient({ stops: [
				{ offset: 0, color: new Ui.Color({ y: yuv.y + 0.10, u: yuv.u, v: yuv.v }) },
				{ offset: 1, color: new Ui.Color({ y: yuv.y - 0.10, u: yuv.u, v: yuv.v }) },
			] });
			this.setStyleResource('ui-toolbar-gradient', gradient);

			lightColor = new Ui.Color({ y: yuv.y + 0.30, u: yuv.u, v: yuv.v });
			this.setStyleResource('ui-toolbar-light-color', lightColor);

			darkColor = new Ui.Color({ y: yuv.y - 0.30, u: yuv.u, v: yuv.v });
			this.setStyleResource('ui-toolbar-dark-color', darkColor);
		}
		else {
			lightColor = this.getStyleResource('ui-toolbar-light-color');
			darkColor = this.getStyleResource('ui-toolbar-dark-color');
		}
		this.background.setFill(gradient);
		this.topShadow.setFill(lightColor);
		this.bottomShadow.setFill(darkColor);
	},
});

Ui.ToolBar.style = {
	color: new Ui.Color({ r: 0.11, g: 0.56, b: 1 }),

	"Ui.Button": {
		color: new Ui.Color({ r: 0.96, g: 0.96, b: 0.96 }),
	},
};

