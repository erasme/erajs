
Ui.VBox.extend('Ui.ToolBar', {
	hbox: undefined,
	background: undefined,

	constructor: function(config) {
		this.topShadow = new Ui.Rectangle({ fill: this.getLightColor(), height: 1 });
		Ui.ToolBar.base.append.call(this, this.topShadow);

		var content = new Ui.LBox();
		Ui.ToolBar.base.append.call(this, content);

//		this.background = new Ui.Rectangle({ fill: Ui.ToolBar.gradient, marginBottom: 1, marginRight: 1 });
		this.background = new Ui.Rectangle({ fill: Ui.ToolBar.gradient });
		content.append(this.background);

		this.hbox = new Ui.HBox({ spacing: 8, margin: 4 });
		content.append(this.hbox);

		this.bottomShadow = new Ui.Rectangle({ fill: this.getDarkColor(), height: 1 });
		Ui.ToolBar.base.append.call(this, this.bottomShadow);

		


//		this.topShadow = Ui.ToolBar.base.append.call(this, new Ui.Rectangle({ fill: 'white', height: '1',  }));

//		Ui.ToolBar.base.append.call(this, new Ui.Rectangle({ fill: '#bdbdbd' }));

//		this.background = new Ui.Rectangle({ fill: Ui.ToolBar.gradient, marginBottom: 1, marginRight: 1 });
//		Ui.ToolBar.base.append.call(this, this.background);

//		this.hbox = new Ui.HBox({ spacing: 8, margin: 4 });
//		Ui.ToolBar.base.append.call(this, this.hbox);
	},

	//
	// Private
	//

	getGradient: function() {
		var gradient = this.getStyleResource('ui-toolbar-gradient');
		if(gradient == undefined)
			return Ui.ToolBar.gradient;
		else
			return gradient;
	},

	getLightColor: function() {
		var lightColor = this.getStyleResource('ui-toolbar-light-color');
		if(lightColor == undefined)
			return Ui.ToolBar.lightColor;
		else
			return lightColor;
	},

	getDarkColor: function() {
		var darkColor = this.getStyleResource('ui-toolbar-dark-color');
		if(darkColor == undefined)
			return Ui.ToolBar.darkColor;
		else
			return darkColor;
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
			var color = this.getStyleProperty('backgroundColor');
			if(color == undefined)
				color = new Ui.Color({ r: 0.89, g: 0.89, b: 0.89 });
			var hsl = color.getHsl();

			var yuv = color.getYuv();

			gradient = new Ui.LinearGradient({ stops: [
//				{ offset: 0, color: new Ui.Color({ h: hsl.h, s: hsl.s, l: 0.91 }) },
//				{ offset: 1, color: new Ui.Color({ h: hsl.h, s: hsl.s, l: 0.84 }) },

				{ offset: 0, color: new Ui.Color({ y: yuv.y + 0.10, u: yuv.u, v: yuv.v }) },
				{ offset: 1, color: new Ui.Color({ y: yuv.y - 0.10, u: yuv.u, v: yuv.v }) },
			] });
			this.setStyleResource('ui-toolbar-gradient', gradient);

//			lightColor = new Ui.Color({ h: hsl.h, s: hsl.s, l: 1.1 });
			lightColor = new Ui.Color({ y: yuv.y + 0.30, u: yuv.u, v: yuv.v });
			this.setStyleResource('ui-toolbar-light-color', lightColor);

//			darkColor = new Ui.Color({ h: hsl.h, s: hsl.s, l: 0.64 });
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

Ui.ToolBar.gradient = new Ui.LinearGradient({ stops: [
	{ offset: 0, color: new Ui.Color({ r: 0.91, g: 0.91, b: 0.91 }) },
	{ offset: 1, color: new Ui.Color({ r: 0.84, g: 0.84, b: 0.84 }) },
] });
Ui.ToolBar.lightColor = new Ui.Color({ r: 0.94, g: 0.94, b: 0.94 });
Ui.ToolBar.darkColor = new Ui.Color({ r: 0.64, g: 0.64, b: 0.64 });

