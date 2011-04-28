//
// Define the ElasticEase class.
//
Anim.EasingFunction.extend('Anim.ElasticEase', {
	oscillations: 3,
	springiness: 3.0,

	constructor: function(config) {
		if(config.oscillations != undefined)
			this.setOscillations(config.oscillations);
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
	},

}, {
	easeInCore: function(normalizedTime) {
		return Math.sin(normalizedTime * (this.oscillations * 2 + 0.5) * Math.PI) * Math.pow(normalizedTime, this.springiness);
	},
}, /* static */ {
	constructor: function() {
		Anim.EasingFunction.register('elastic', this);
	},
});

