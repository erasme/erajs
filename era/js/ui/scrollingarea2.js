//
// Define the ScrollingArea2 class.
//
Ui.Scrollable2.extend('Ui.ScrollingArea2', {
	horizontalScrollbar: undefined,
	verticalScrollbar: undefined,

	constructor: function(config) {
		this.horizontalScrollbar = new Ui.Rectangle({ fill: new Ui.Color({ r: 0.2, g: 0.2, b: 0.2, a: 0.7 }), radius: 2, width: 4, height: 4, margin: 2 });
		this.setScrollbarHorizontal(this.horizontalScrollbar);
		this.verticalScrollbar = new Ui.Rectangle({ fill: new Ui.Color({ r: 0.2, g: 0.2, b: 0.2, a: 0.7 }), radius: 2, width: 4, height: 4, margin: 2 });
		this.setScrollbarVertical(this.verticalScrollbar);
	},
}, {
	onStyleChange: function() {
		var color = this.getStyleProperty('color');
		this.horizontalScrollbar.setFill(color);
		this.verticalScrollbar.setFill(color);
	}
}, {
	style: {
		color: new Ui.Color({ r: 0.2, g: 0.2, b: 0.2, a: 0.7 })
	}
});
