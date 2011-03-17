//
// Define the Timeline class.
//
Object.extend('Anim.Timeline', {
	autoReverse: false,
	beginTime: 0,
	duration: 'automatic',
	// [forever|count]
	repeat: 1,
	speed: 1,
	target: undefined,
	scope: undefined,
	callback: undefined,
	ease: undefined,

	constructor: function(config) {
		if(config.beginTime != undefined)
			this.beginTime = config.beginTime;
		if(config.autoReverse != undefined)
			this.autoReverse = config.autoReverse;
		if(config.duration != undefined)
			this.duration = config.duration;
		if(config.repeat != undefined)
			this.repeat = config.repeat;
		if(config.speed != undefined)
			this.speed = config.speed;
		if(config.callback != undefined)
			this.callback = config.callback;
		if(config.target != undefined)
			this.target = config.target;
		if(config.scope != undefined)
			this.scope = config.scope;
		else
			this.scope = this.target;
		if(config.ease != undefined)
			this.ease = config.ease;

		this.addEvents('complete', 'timeupdate');
	},

	begin: function() {
		var clock = this.createClock();
		if((this.target != undefined) && (this.target.setAnimClock != undefined))
			this.target.setAnimClock(clock);
		clock.begin();
		return clock;
	},

	createClock: function() {
		return new Anim.Clock({ timeline: this });
	},

	onTimeUpdate: function(clock, deltaTick) {
		var progress = clock.getProgress();
		if(this.ease != undefined)
			progress = this.ease.ease(progress);
		if(this.callback != undefined)
			this.callback.call(this.scope, clock, progress, deltaTick);
		this.fireEvent('timeupdate', clock, progress, deltaTick);
	},

});

