
Era.Anims.Fade = Era.extend('fade', Era.Anims.Anim, {
	constructor: function(config) {
		this.superConstructor(config);
	},

	virtualBeforeRun: function(element) {
		if(this.mode == 'in')
			element.ui.style.opacity = 0;
		else
			element.ui.style.opacity = '';
	},

	virtualOnRun: function(element) {
		if(this.mode == 'in') {
			element.ui.style.webkitTransitionProperty = 'opacity';
			element.ui.style.webkitTransitionDuration = this.duration+'s';
			element.ui.style.webkitTransitionDelay = this.delay+'s';
			element.ui.style.opacity = '';
		}
		else {
			element.ui.style.webkitTransitionProperty = 'opacity';
			element.ui.style.webkitTransitionDuration = this.duration+'s';
			element.ui.style.webkitTransitionDelay = this.delay+'s';
			element.ui.style.opacity = 0;
		}
	},

	virtualOnAbort: function(element) {
		element.ui.style.webkitTransitionDuration = '';
		element.ui.style.webkitTransitionDelay = '';
		element.ui.style.webkitTransitionProperty = '';
		element.ui.style.opacity = '';
	},

	virtualAfterRun: function(element) {
		if(this.mode == 'in') {
			element.ui.style.webkitTransitionDuration = '';
			element.ui.style.webkitTransitionDelay = '';
			element.ui.style.webkitTransitionProperty = '';
			element.ui.style.opacity = '';
		}
		else {
			element.ui.style.webkitTransitionDuration = '';
			element.ui.style.webkitTransitionDelay = '';
			element.ui.style.webkitTransitionProperty = '';
			element.ui.style.opacity = 0;
		}
	},
});

