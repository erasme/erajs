Core.Object.extend('Anim.AnimationManager', 
/**@lends Anim.AnimationManager#*/
{
	clocks: undefined,
	start: 0,

	/**
    *   @constructs
	*	@class The TimeManager handle animations clocks
    *   @extends Core.Object
	*/
	constructor: function(config) {
		this.addEvents('tick');
		this.onTick.scope = this;
		this.clocks = [];
		this.start = new Date().getTime();
	},

	add: function(clock) {	
		this.clocks.push(clock);
		if(this.clocks.length == 1)
			requestAnimationFrame(this.onTick);
	},

	remove: function(clock) {
		var i = 0;
		while((i < this.clocks.length) && (this.clocks[i] != clock)) { i++ };
		if(i < this.clocks.length)
			this.clocks.splice(i, 1);
	},

	forceTick: function() {
		if(this.clocks.length > 0)
			this.onTick();
	},
	
	/**	@Private*/
	onTick: function() {
		var scope = arguments.callee.scope;
		var startTime = (new Date().getTime())/1000;

		var current = (new Date().getTime()) - scope.start;
		current /= 1000;
		for(var i = 0; i < scope.clocks.length; i++)
			scope.clocks[i].update(current);
		scope.fireEvent('tick');

		if(scope.clocks.length > 0)
			requestAnimationFrame(scope.onTick);
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
		window.requestAnimationFrame = function(cb) { setTimeout(cb, 1/60);	}
}

Anim.AnimationManager.current = new Anim.AnimationManager();
