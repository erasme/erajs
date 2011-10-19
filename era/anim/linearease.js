Anim.EasingFunction.extend('Anim.LinearEase', 
/**@lends Anim.LinearEase#*/
{
	/**
    *   @constructs
	*	@class
    *   @extends Anim.EasingFunction
	*/
	constructor: function(config) {
	}
}, 
/**@lends Anim.LinearEase#*/
{
	easeInCore: function(normalizedTime) {
		return normalizedTime;
	}
},
/**@lends Anim.LinearEase*/
{
	constructor: function() {
		Anim.EasingFunction.register('linear', this);
	}
});

