Core.Object.extend('Anim.TimeManager', 
/**@lends Anim.TimeManager#*/
{
	clocks: undefined,
	timer: undefined,
	start: 0,

	/**
    *   @constructs
	*	@class The TimeManager handle animations clocks
    *   @extends Core.Object
	*/
	constructor: function(config) {
		this.clocks = [];
		this.start = new Date().getTime();
		this.addEvents('tick');
	},

	add: function(clock) {
		this.clocks.push(clock);
		if(this.clocks.length == 1)
			this.timer = new Core.Timer({ callback: this.onTick, scope: this, interval: 1/60 });
	},

	remove: function(clock) {
		var i = 0;
		while((i < this.clocks.length) && (this.clocks[i] != clock)) { i++ };
		if(i < this.clocks.length)
			this.clocks.splice(i, 1);
		if(this.clocks.length == 0) {
			this.timer.abort();
			this.timer = undefined;
		}
	},

	
	/**	@Private*/
	onTick: function() {
		var current = (new Date().getTime()) - this.start;
		current /= 1000;
		for(var i = 0; i < this.clocks.length; i++)
			this.clocks[i].update(current);
		this.fireEvent('tick');
	}
});

Anim.TimeManager.current = new Anim.TimeManager();
