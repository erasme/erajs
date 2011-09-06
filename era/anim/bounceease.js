Anim.EasingFunction.extend('Anim.BounceEase', 
/**@lends Anim.BounceEase#*/
{

	bounces: 3,
	bounciness: 2.0,

	/**
    *   @constructs
	*	@class
    *   @extends Anim.EasingFunction
	*	@param config.oscillations
	*/
	constructor: function(config) {
		if(config.oscillations != undefined)
			this.setOscillations(config.oscillations);
	},

	/**
	*	@param bounces
	*/
	setBounces: function(bounces) {
		this.bounces = bounces;
	},

	/**
	*	@return 
	*/
	getBounces: function() {
		return this.Bounces;
	},
	
	/**
	*	@param bounces
	*/
	setBounciness: function(bounciness) {
		this.bounciness = bounciness;
	},

	/**
	*	@return
	*/
	getBounciness: function() {
		return this.bounciness;
	}
}, 
/**@lends Anim.BounceEase#*/
{
	easeInCore: function(normalizedTime) {
		var sq = Math.exp((1.0 / this.bounciness) * Math.log(normalizedTime));
		var step = Math.floor(sq * (this.bounces + 0.5));
		var sinstep = (sq * (this.bounces + 0.5)) - step;
		return Math.sin(sinstep * Math.PI) / Math.exp(this.bounces - step);
	}
}, 
/**@lends Anim.BounceEase*/ 
{
	constructor: function() {
		Anim.EasingFunction.register('bounce', this);
	}
});

