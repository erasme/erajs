//
// Define the ScrollingArea class.
//
Ui.Scrollable.extend('Ui.ScrollingArea', {
	constructor: function(config) {
		this.setScrollbarHorizontal(new Ui.Rectangle({ fill: '#009ee0', radius: 4, width: 8, height: 8, margin: 5 }));
		this.setScrollbarVertical(new Ui.Rectangle({ fill: '#009ee0', radius: 4, width: 8, height: 8, margin: 5 }));
	},
}, {
});
