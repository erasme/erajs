Anim.EasingFunction.extend('Anim.PowerEase', 
/**@lends Anim.PowerEase#*/
{	
	power: 2,

	/**
    *   @constructs
	*	@class
    *   @extends Anim.EasingFunction
	*/
	constructor: function(config) {
		this.autoConfig(config, 'power');
	},

	setPower: function(power) {
		this.power = power;
	},

	getPower: function() {
		return this.power;
	}
}, 
/**@lends Anim.PowerEase#*/
{
	easeInCore: function(normalizedTime) {
		return Math.pow(normalizedTime, this.power);
	}
},
/**@lends Anim.PowerEase*/
{
	constructor: function() {
		Anim.EasingFunction.register('power', this);
	}
});

