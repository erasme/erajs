Core.Object.extend('Anim.AnimationManager', 
/**@lends Anim.TimeManager#*/
{
	clocks: undefined,
	start: 0,

	/**
    *   @constructs
	*	@class The TimeManager handle animations clocks
    *   @extends Core.Object
	*/
	constructor: function(config) {
		this.onTick.scope = this;
		this.clocks = [];
		this.start = new Date().getTime();
		this.addEvents('tick');
	},

	add: function(clock) {
		this.clocks.push(clock);
		if(this.clocks.length == 1) {
			if('webkitRequestAnimationFrame' in window)
				webkitRequestAnimationFrame(this.onTick);
			else if('mozRequestAnimationFrame' in window)
				mozRequestAnimationFrame(this.onTick);
			else if('msRequestAnimationFrame' in window)
				msRequestAnimationFrame(this.onTick);
			else
				setTimeout(this.onTick, 1/60);
		}
	},

	remove: function(clock) {
		var i = 0;
		while((i < this.clocks.length) && (this.clocks[i] != clock)) { i++ };
		if(i < this.clocks.length)
			this.clocks.splice(i, 1);
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

		if(scope.clocks.length > 0) {
			if('webkitRequestAnimationFrame' in window)
				webkitRequestAnimationFrame(scope.onTick);
			else if('mozRequestAnimationFrame' in window)
				mozRequestAnimationFrame(scope.onTick);
			else if('msRequestAnimationFrame' in window)
				msRequestAnimationFrame(scope.onTick);
			else {
				var endTime = (new Date().getTime())/1000;
				var deltaTime = endTime - startTime;
				if(deltaTime < 0)
					deltaTime = 0;
				setTimeout(scope.onTick, Math.max(1/60 - deltaTime, 0));
			}
		}
	}
});

Anim.AnimationManager.current = new Anim.AnimationManager();
