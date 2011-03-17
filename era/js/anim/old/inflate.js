
Era.Anims.Inflate = Era.extend('inflate', Era.Anims.Anim, {

	constructor: function(config) {
		this.superConstructor(config);
	},

	virtualBeforeRun: function(element) {
		element.ui.style.webkitAnimationName = 'none';
	},

	virtualOnRun: function(element) {
		element.ui.style.webkitAnimationName = 'inflate';
		element.ui.style.webkitAnimationDuration = this.duration+'s';
		element.ui.style.webkitAnimationDelay = this.delay+'s';
		element.ui.style.webkitAnimationIterationCount = '1';
		element.ui.style.webkitAnimationTimingFunction = 'cubic-bezier(0.25, 0.1, 0.25, 1)';
		element.ui.style.webkitAnimationDirection = 'normal';
	},

	virtualOnAbort: function(element) {
		element.ui.style.webkitAnimationName = 'none';
		element.ui.style.webkitAnimationDuration = '';
		element.ui.style.webkitAnimationDelay = '';
		element.ui.style.webkitAnimationIterationCount = '';
		element.ui.style.webkitAnimationTimingFunction = '';
		element.ui.style.webkitAnimationDirection = '';
	},

	virtualAfterRun: function(element) {
		element.ui.style.webkitAnimationName = 'none';
		element.ui.style.webkitAnimationDuration = '';
		element.ui.style.webkitAnimationDelay = '';
		element.ui.style.webkitAnimationIterationCount = '';
		element.ui.style.webkitAnimationTimingFunction = '';
		element.ui.style.webkitAnimationDirection = '';
	},
});

