
Core.Object.extend('Core.DelayedTask', {
	delay: 1,
	scope: undefined,
	callback: undefined,
	arguments: undefined,
	isDone: false,

	constructor: function(config) {
		if(config.delay != undefined)
			this.delay = config.delay;
		if(config.scope != undefined)
			this.scope = config.scope;
		if(config.arguments != undefined)
			this.arguments = config.arguments;
		if(config.callback != undefined)
			this.callback = config.callback;
		else
			throw('callback MUST be given for a DelayedTask');

		var wrapper = function() {
			arguments.callee.delayedtask.handle = undefined;
			arguments.callee.delayedtask.callback.apply(arguments.callee.delayedtask.scope, arguments.callee.delayedtask.arguments);
			arguments.callee.delayedtask.isDone = true;
		}
		wrapper.delayedtask = this;
		this.handle = setTimeout(wrapper, this.delay * 1000);
	},

	abort: function() {
		if(this.handle != undefined) {
			clearTimeout(this.handle);
			this.handle = undefined;
		}
	},
});

