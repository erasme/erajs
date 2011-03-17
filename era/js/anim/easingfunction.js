//
// Define the EasingFunction class.
//
Object.extend('Anim.EasingFunction', {
	// [in|out|inout]
	mode: 'in',

	constructor: function(config) {
		if(config.mode != undefined)
			this.setMode(config.mode);
	},

	setMode: function(mode) {
		this.mode = mode;
	},

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
	
	//
	// Override this method to provide the easing method
	//
	easeInCore: function(normalizedTime) {
		return normalizedTime;
	},
});

