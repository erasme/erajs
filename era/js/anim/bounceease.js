//
// Define the BounceEase class.
//
Anim.EasingFunction.extend('Anim.BounceEase', {
	bounces: 3,
	bounciness: 2.0,

	constructor: function(config) {
		if(config.oscillations != undefined)
			this.setOscillations(config.oscillations);
	},

	setBounces: function(bounces) {
		this.bounces = bounces;
	},

	getBounces: function() {
		return this.Bounces;
	},
	
	setBounciness: function(bounciness) {
		this.bounciness = bounciness;
	},

	getBounciness: function() {
		return this.bounciness;
	},
	
}, {
	easeInCore: function(normalizedTime) {
		var sq = Math.exp((1.0 / this.bounciness) * Math.log(normalizedTime));
		var step = Math.floor(sq * (this.bounces + 0.5));
		var sinstep = (sq * (this.bounces + 0.5)) - step;
		return Math.sin(sinstep * Math.PI) / Math.exp(this.bounces - step);
	},
});

