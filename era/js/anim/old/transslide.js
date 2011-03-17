
Era.Anims.TransSlide = Era.extend('transslide', Era.Anims.Transition, {
	direction: 'left',

	constructor: function(config) {
		this.superConstructor(config);
		if(config && (config.direction != undefined))
			this.direction = config.direction;
	},

	virtualBeforeRun: function(elementIn, elementOut) {
		this.transInAnim = Era.create({ type: 'slide', direction: this.direction, invert: this.invert, duration: this.duration, delay: this.delay });
		this.transOutAnim = Era.create({ type: 'slide', direction: this.direction, invert: !this.invert, duration: this.duration, delay: this.delay });
	},

	virtualOnRun: function(elementIn, elementOut) {
		elementIn.show(this.transInAnim);
		elementOut.hide(this.transOutAnim);
	},

	virtualOnAbort: function(elementIn, elementOut) {
		if(this.transInAnim != undefined) {
			this.transInAnim.abort();
			this.transInAnim = undefined;
		}
		if(this.transOutAnim != undefined) {
			this.transOutAnim.abort();
			this.transOutAnim = undefined;
		}
	},

	virtualAfterRun: function(elementIn, elementOut) {
		this.transInAnim = undefined;
		this.transOutAnim = undefined;
	},
});

