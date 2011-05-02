//
// Define the ScrollingArea2 class.
//
Ui.Scrollable2.extend('Ui.ScrollingArea2', {
	constructor: function(config) {
		this.setScrollbarHorizontal(new Ui.Rectangle({ fill: '#009ee0', radius: 4, width: 8, height: 8, margin: 5 }));
		this.setScrollbarVertical(new Ui.Rectangle({ fill: '#009ee0', radius: 4, width: 8, height: 8, margin: 5 }));
	},
}, {
});
