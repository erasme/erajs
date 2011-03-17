//
// Define the Timeline class.
//
Anim.Timeline.extend('Anim.TimelineGroup', {
	children: undefined,

	constructor: function(config) {
		this.children = [];
	},

	appendChild: function(child) {
		this.children.push(child);
	},

}, {
	createClock: function() {
		return new Anim.ClockGroup({ timeline: this });
	},
});

