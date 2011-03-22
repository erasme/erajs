//
// Define the ClockGroup class.
//
Anim.Clock.extend('Anim.ClockGroup', {
	children: undefined,

	constructor: function(config) {
		this.children = [];
	},

	appendChild: function(child) {
		child.setParent(this);
		this.children.push(child);
	},

}, {
	begin: function() {
		Anim.ClockGroup.base.begin.call(this);
		for(var i = 0; i < this.children.length; i++)
			this.children[i].begin();
	},

	pause: function() {
		Anim.ClockGroup.base.pause.call(this);
		for(var i = 0; i < this.children.length; i++)
			this.children[i].pause();
	},

	resume: function() {
		Anim.ClockGroup.base.resume.call(this);
		for(var i = 0; i < this.children.length; i++)
			this.children[i].resume();
	},

	stop: function() {
		Anim.ClockGroup.base.stop.call(this);
		for(var i = 0; i < this.children.length; i++)
			this.children[i].stop();
	},

	onCompleted: function() {
		Anim.ClockGroup.base.onCompleted.call(this);
		for(var i = 0; i < this.children.length; i++)
			this.children[i].onCompleted();
	},

	update: function(parentGlobalTime) {
		do {
			Anim.ClockGroup.base.update.call(this, parentGlobalTime);
			// update children clock
			var childStopped = true;
			for(var i = 0; i < this.children.length; i++) {
				var childClock = this.children[i];
				childClock.update(this.getGlobalTime());
				if(childClock.getIsActive())
					childStopped = false;
			}
			if(this.getIsActive() && childStopped)
				this.pendingState = 'stopped';
		} while(this.pendingState != 'none');
	},
});
