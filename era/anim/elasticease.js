Anim.EasingFunction.extend('Anim.ElasticEase', 
/**@lends Anim.ElasticEase#*/
{
	oscillations: 3,
	springiness: 3.0,

	/**
    *   @constructs
	*	@class
    *   @extends Anim.EasingFunction
	*/
	constructor: function(config) {
	},

	setOscillations: function(oscillations) {
		this.oscillations = oscillations;
	},

	getOscillations: function() {
		return this.oscillations;
	},
	
	setSpringiness: function(springiness) {
		this.springiness = springiness;
	},

	getSpringiness: function() {
		return this.springiness;
	}
}, 
/**@lends Anim.ElasticEase#*/
{
	easeInCore: function(normalizedTime) {
		return Math.sin(normalizedTime * (this.oscillations * 2 + 0.5) * Math.PI) * Math.pow(normalizedTime, this.springiness);
	}
},
/**@lends Anim.ElasticEase*/
{
	constructor: function() {
		Anim.EasingFunction.register('elastic', this);
	}
});

