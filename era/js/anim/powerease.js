//
// Define the PowerEase class.
//
Anim.EasingFunction.extend('Anim.PowerEase', {
	power: 2,

	constructor: function(config) {
		if(config.power != undefined)
			this.setPower(config.power);
	},

	setPower: function(power) {
		this.power = power;
	},

	getPower: function() {
		return this.power;
	}
}, {
	easeInCore: function(normalizedTime) {
		return Math.pow(normalizedTime, this.power);
	}
}, /* static */ {
	constructor: function() {
		Anim.EasingFunction.register('power', this);
	}
});

