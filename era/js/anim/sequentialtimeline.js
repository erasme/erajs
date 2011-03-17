//
// Define the SequentialTimeline class.
//
Anim.TimelineGroup.extend('Anim.SequentialTimeline', {

	constructor: function(config) {
	},
}, {
	createClock: function() {
		// TODO: change this
		return new Anim.ClockGroup({ timeline: this });
	},
});

