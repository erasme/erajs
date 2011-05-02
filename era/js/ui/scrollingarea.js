//
// Define the ScrollingArea class.
//
Ui.Scrollable.extend('Ui.ScrollingArea', {
	constructor: function(config) {
		this.setScrollbarHorizontal(new Ui.Rectangle({ fill: new Ui.Color({ r: 0.2, g: 0.2, b: 0.2, a: 0.7 }), radius: 2, width: 4, height: 4, margin: 2 }));
		this.setScrollbarVertical(new Ui.Rectangle({ fill: new Ui.Color({ r: 0.2, g: 0.2, b: 0.2, a: 0.7 }), radius: 2, width: 4, height: 4, margin: 2 }));
	},
}, {
});
