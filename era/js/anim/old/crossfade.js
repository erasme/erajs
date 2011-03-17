
Era.Anims.CrossFade = Era.extend('crossfade', Era.Anims.Transition, {
	constructor: function(config) {
		this.superConstructor(config);
	},

	virtualBeforeRun: function(elementIn, elementOut) {
		elementIn.ui.style.opacity = 0;
		elementOut.ui.style.opacity = '';
	},

	virtualOnRun: function(elementIn, elementOut) {
		elementIn.ui.style.webkitTransitionProperty = 'opacity';
		elementIn.ui.style.webkitTransitionDuration = this.duration+'s';
		elementIn.ui.style.webkitTransitionDelay = this.delay+'s';
		elementIn.ui.style.opacity = '';

		elementOut.ui.style.webkitTransitionProperty = 'opacity';
		elementOut.ui.style.webkitTransitionDuration = this.duration+'s';
		elementOut.ui.style.webkitTransitionDelay = this.delay+'s';
		elementOut.ui.style.opacity = 0;
	},

	virtualOnAbort: function(elementIn, elementOut) {
		elementIn.ui.style.webkitTransitionDuration = '';
		elementIn.ui.style.webkitTransitionDelay = '';
		elementIn.ui.style.webkitTransitionProperty = '';
		elementIn.ui.style.opacity = '';

		elementOut.ui.style.webkitTransitionDuration = '';
		elementOut.ui.style.webkitTransitionDelay = '';
		elementOut.ui.style.webkitTransitionProperty = '';
		elementOut.ui.style.opacity = '';
	},

	virtualAfterRun: function(elementIn, elementOut) {
		elementIn.ui.style.webkitTransitionDuration = '';
		elementIn.ui.style.webkitTransitionDelay = '';
		elementIn.ui.style.webkitTransitionProperty = '';
		elementIn.ui.style.opacity = '';

		elementOut.ui.style.webkitTransitionDuration = '';
		elementOut.ui.style.webkitTransitionDelay = '';
		elementOut.ui.style.webkitTransitionProperty = '';
		elementOut.ui.style.opacity = 0;
	},
});

