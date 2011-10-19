Core.Object.extend('Core.DelayedTask', 
/**@lends Core.DelayedTask#*/
{
	delay: 1,
	scope: undefined,
	callback: undefined,
	arguments: undefined,
	isDone: false,

	/**
    *   @constructs
	*	@class
    *   @extends Core.Object
	*	@param config.delay
	*	@param config.scope
	*	@param config.arguments
	*	@param config.callback
	*/
	constructor: function(config) {
		if('delay' in config) {
			this.delay = config.delay;
			delete(config.delay);
		}
		if('scope' in config) {
			this.scope = config.scope;
			delete(config.scope);
		}
		if('arguments' in config) {
			this.arguments = config.arguments;
			delete(config.arguments);
		}
		else
			this.arguments = [];
		if('callback' in config) {
			this.callback = config.callback;
			delete(config.callback);
		}
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
	}
});

