Core.Object.extend('Anim.AnimationManager', 
/**@lends Anim.AnimationManager#*/
{
	clocks: undefined,
	start: 0,
	onTickBind: undefined,

	/**
    *   @constructs
	*	@class The TimeManager handle animations clocks
    *   @extends Core.Object
	*/
	constructor: function(config) {
		this.addEvents('tick');
		this.clocks = [];
		this.start = new Date().getTime();
		this.onTickBind = this.onTick.bind(this);
	},

	add: function(clock) {	
		this.clocks.push(clock);
		if(this.clocks.length == 1)
			requestAnimationFrame(this.onTickBind);
	},

	remove: function(clock) {
		var i = 0;
		while((i < this.clocks.length) && (this.clocks[i] != clock)) { i++; }
		if(i < this.clocks.length)
			this.clocks.splice(i, 1);
	},

	forceTick: function() {
		if(this.clocks.length > 0)
			this.onTickBind();
	},
	
	/**	@private*/
	onTick: function() {	
		var startTime = (new Date().getTime())/1000;

		var current = (new Date().getTime()) - this.start;
		current /= 1000;
		for(var i = 0; i < this.clocks.length; i++)
			this.clocks[i].update(current);
		this.fireEvent('tick');

		if(this.clocks.length > 0)
			requestAnimationFrame(this.onTickBind);
	}
});

if(!('requestAnimationFrame' in window)) {
	if('webkitRequestAnimationFrame' in window)
		window.requestAnimationFrame = window.webkitRequestAnimationFrame;
	else if('mozRequestAnimationFrame' in window)
		window.requestAnimationFrame = window.mozRequestAnimationFrame;
	else if('msRequestAnimationFrame' in window)
		window.requestAnimationFrame = window.msRequestAnimationFrame;
	else
		window.requestAnimationFrame = function(cb) { setTimeout(cb, 1/60);	};
}

Anim.AnimationManager.current = new Anim.AnimationManager();

