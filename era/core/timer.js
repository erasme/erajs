Core.Object.extend('Core.Timer', 
/**@lends Core.Timer#*/
{
	interval: 1,
	arguments: undefined,

	/**
	*	@constructs
	*	@class
	*	@extends Core.Object
	*/
	constructor: function(config) {
		this.addEvents('timeupdate');

		if('interval' in config) {
			this.interval = config.interval;
			delete(config.interval);
		}
		if('arguments' in config) {
			this.arguments = config.arguments;
			delete(config.arguments);
		}
		else
			this.arguments = [];

		this.wrapper = function() {
			var startTime = (new Date().getTime())/1000;
			var timer = arguments.callee.timer;
			timer.fireEvent('timeupdate', timer, timer.arguments);
			var endTime = (new Date().getTime())/1000;
			var deltaTime = endTime - startTime;
			if(deltaTime < 0)
				deltaTime = 0;

			var interval = (timer.interval * 1000) - deltaTime;
			if(interval < 0)
				interval = 0;

			if(timer.handle != undefined)
				timer.handle = setTimeout(timer.wrapper, interval);
		}
		this.wrapper.timer = this;
		this.handle = setTimeout(this.wrapper, 0);
	},

	abort: function() {
		if(this.handle != undefined) {
			clearTimeout(this.handle);
			this.handle = undefined;
		}
	}
});

