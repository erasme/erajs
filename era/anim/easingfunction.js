/**
*	@name Anim
*	@namespace Regroup all the Animation related classes : clock, easing function etc.
*/

Core.Object.extend('Anim.EasingFunction', 
/**@lends Anim.EasingFunction#*/
{
	// [in|out|inout]
	mode: 'in',
	
	/**
    *   @constructs
	*	@class
    *   @extends Core.Object
	*	@param config.mode
	*/
	constructor: function(config) {
		this.autoConfig(config, 'mode');
	},

	/** 
	*	@param {String} mode 	
	*/
	setMode: function(mode) {
		this.mode = mode;
	},

	/**@return {String} */
	getMode: function() {
		return this.mode;
	},

	ease: function(normalizedTime) {
		if(this.mode == 'in')
			return this.easeInCore(normalizedTime);
		else if(this.mode == 'out')
			return 1 - this.easeInCore(1 - normalizedTime);
		else {
			if(normalizedTime <= 0.5)
				return this.easeInCore(normalizedTime * 2.0) / 2.0;
			else
				return 0.5 + ((1 - this.easeInCore(2.0 - (normalizedTime * 2.0))) / 2.0);
		}
	},
	
	/**
	* Override this method to provide the easing method
	*/
	easeInCore: function(normalizedTime) {
		return normalizedTime;
	}
}, {
},
/**@lends Anim.EasingFunction*/
{
	eases: {},

	register: function(easeName, classType) {
		this.eases[easeName] = classType;
	},

	create: function(ease) {
		if(ease == undefined)
			return undefined;
		if(typeof(ease) == 'string')
			return new this.eases[ease]();
		else if(typeof(ease) == 'object') {
			if(Anim.EasingFunction.hasInstance(ease))
				return ease;
			else if(ease.type != undefined) {
				var type = ease.type;
				ease.type = undefined;
				return new this.eases[type](ease);
			}
		}
		throw('invalid easing function ('+ease+')');
	}
});

