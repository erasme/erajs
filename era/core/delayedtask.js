Core.Object.extend('Core.DelayedTask', 
/**@lends Core.DelayedTask#*/
{
	delay: 1,
	scope: undefined,
	callback: undefined,
	arguments: undefined,
	isDone: false,
	handle: undefined,

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
		this.handle = setTimeout(this.onTimeout.bind(this), this.delay * 1000);
	},

	onTimeout: function() {
		this.handle = undefined;
		this.isDone = true;
		this.callback.apply(this.scope, [ this ]);
	},

	abort: function() {
		if(this.handle !== undefined) {
			clearTimeout(this.handle);
			this.handle = undefined;
		}
	}
});

