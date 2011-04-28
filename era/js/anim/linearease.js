//
// Define the LinearEase class.
//
Anim.EasingFunction.extend('Anim.LinearEase', {
	constructor: function(config) {
	},
}, {
	easeInCore: function(normalizedTime) {
		return normalizedTime;
	},
}, /* static */ {
	constructor: function() {
		Anim.EasingFunction.register('linear', this);
	},
});

