
Era.Anims.Boing = Era.extend('boing', Era.Anims.Anim, {

	constructor: function(config) {
		this.superConstructor(config);
	},

	virtualBeforeRun: function(element) {
		element.ui.style.webkitAnimationName = 'none';
		if(this.mode == 'in')
			element.ui.style.webkitTransform = 'scale(0)';
		else
			element.ui.style.webkitTransform = 'scale(1)';
	},

	virtualOnRun: function(element) {
		if(this.mode == 'in') {
			element.ui.style.webkitAnimationName = 'inflateshow';
		}
		else {
			element.ui.style.webkitAnimationName = 'inflatehide';
		}
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
		element.ui.style.webkitTransform = '';
	},

	virtualAfterRun: function(element) {
		element.ui.style.webkitAnimationName = 'none';
		element.ui.style.webkitAnimationDuration = '';
		element.ui.style.webkitAnimationDelay = '';
		element.ui.style.webkitAnimationIterationCount = '';
		element.ui.style.webkitAnimationTimingFunction = '';
		element.ui.style.webkitAnimationDirection = '';
		element.ui.style.webkitTransform = '';
	},
});

