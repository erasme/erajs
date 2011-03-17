//
// Define the Clock class.
//
Object.extend('Anim.Clock', {
	parent: undefined,
	timeline: undefined,
	time: undefined,
	iteration: undefined,
	progress: undefined,
	isActive: false,
	globalTime: 0,
	startTime: 0,
	lastTick: 0,
	beginTime: 0,
	isPaused: false,
	speed: 1,
	// [forever|automatic|nbsec]
	duration: 'forever',
	// [none|active|paused|resumed|stopped|none]
	pendingState: 'none',

	constructor: function(config) {
		if(config.timeline != undefined)
			this.timeline = config.timeline;
		else
			throw('timeline MUST BE SET for a Clock');
		if(config.parent != undefined)
			this.parent = config.parent;

		this.duration = this.timeline.duration;
		if(this.duration == 'automatic')
			this.duration = 'forever';
		this.speed = this.timeline.speed;
		this.beginTime = this.timeline.beginTime;

		this.addEvents('complete');
	},

	getTimeline: function() {
		return this.timeline;
	},

	setParent: function(parent) {
		this.parent = parent;
	},

	getParent: function() {
		return this.parent;
	},

	getGlobalTime: function() {
		return this.globalTime + (this.lastTick - this.startTime) * this.speed;
	},

	getIsActive: function() {
		return this.isActive;
	},

	getTime: function() {
		return this.time;
	},

	getIteration: function() {
		return this.iteration;
	},

	getProgress: function() {
		return this.progress;
	},

	begin: function() {
		// if this clock is the root clock, add to the TimeManager
		if(this.parent == undefined)
			Anim.TimeManager.current.add(this);
		this.pendingState = 'active';
	},

	pause: function() {
		this.pendingState = 'paused';
	},

	resume: function() {
		this.pendingState = 'resumed';
	},

	stop: function() {
		this.pendingState = 'stopped';
	},

	onComplete: function() {
		// if the current clock is the root clock, remove it from the timemanager
		if(this.parent == undefined)
			Anim.TimeManager.current.remove(this);
		this.fireEvent('complete');
		// signal to the timeline
		this.timeline.fireEvent('complete', this);
	},

	onTimeUpdate: function(deltaTick) {
		this.timeline.onTimeUpdate(this, deltaTick);
	},

	update: function(parentGlobalTime) {
		var state;
		do {
			state = this.pendingState;
			this.pendingState = 'none';
			
			// handle pending state
			if(state == 'none') {
				if(this.isActive && !this.isPaused) {
					// update time
					var deltaTick = parentGlobalTime - this.lastTick;
					this.lastTick = parentGlobalTime;
					var globalTime = this.getGlobalTime();
					globalTime -= this.beginTime;

					if(globalTime >= 0) {
						if((this.duration != 'forever') && (this.duration != 'automatic')) {
							var iteration = globalTime / this.duration;
							var iterationRounded = Math.floor(iteration+1);
							var time = globalTime % this.duration;

							if(this.timeline.autoReverse) {
								if((iterationRounded & 1) == 0)
									time = this.duration - time;
								iteration /= 2;
								iterationRounded = Math.floor(iteration+1);
							}
							if(this.timeline.repeat == 'forever') {
								this.iteration = iterationRounded;
								this.time = time;
								this.progress = time / this.duration;
								this.onTimeUpdate(deltaTick);
							}
							else {
								if(iteration >= this.timeline.repeat) {
									// goto to stopped state
									this.pendingState = 'stopped';
									// force last anim state
									this.iteration = this.timeline.repeat;
									this.time = this.duration;
									if(this.timeline.autoReverse)
										this.progress = 0;
									else
										this.progress = 1;
									this.onTimeUpdate(0);
								}
								else {
									this.iteration = iterationRounded;
									this.time = time;
									this.progress = time / this.duration;
									this.onTimeUpdate(deltaTick);
								}
							}
						}
						else {
							this.time = globalTime;
							this.progress = 0;
							this.iteration = undefined;
							this.onTimeUpdate(deltaTick);
						}
					}
				}
			}
			else if(state == 'active') {
				if(!this.isActive) {
					this.isActive = true;
					this.globalTime = 0;
					this.startTime = parentGlobalTime;
					this.lastTick = this.startTime;
					if(this.beginTime > 0) {
						this.time = undefined;
						this.progress = undefined;
						this.iteration = undefined;
					}
					else {
						this.time = 0;
						this.progress = 0;
						this.iteration = 1;
						this.onTimeUpdate(0);
					}
				}
			}
			else if(state == 'paused') {
				if(!this.isPaused && this.isActive) {
					this.isPaused = true;
					this.globalTime = this.getGlobalTime();
					this.startTime = 0;
					this.lastTick = 0;
				}
			}
			else if(state == 'resumed') {
				if(this.isPaused && this.isActive) {
					this.isPaused = false;
					this.startTime = parentGlobalTime;
					this.lastTick = parentGlobalTime;
				}
			}
			else if(state == 'stopped') {
				if(this.isActive) {
					this.progress = undefined;
					this.time = undefined;
					this.iteration = undefined;
					this.isActive = false;
				}
			}
		} while(this.pendingState != 'none');
		// check if clock completed (= root and no more active)
		if((this.parent == undefined) && !this.isActive)
			this.onComplete();
	},
});
