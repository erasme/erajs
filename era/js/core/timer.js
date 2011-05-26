
Core.Object.extend('Core.Timer', {
	interval: 1,
	scope: undefined,
	callback: undefined,
	arguments: undefined,

	constructor: function(config) {
		if(config.interval != undefined)
			this.interval = config.interval;
		if(config.scope != undefined)
			this.scope = config.scope;
		if(config.arguments != undefined)
			this.arguments = config.arguments;
		else
			this.arguments = [];
		if(config.callback != undefined)
			this.callback = config.callback;
		else
			throw('callback MUST be given for a Timer');

		this.wrapper = function() {
			var startTime = (new Date().getTime())/1000;
			var timer = arguments.callee.timer;
			timer.callback.apply(timer.scope, timer.arguments);
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
	},
});

