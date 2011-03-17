
Era.Anims.Bounce = Era.extend('bounce', Era.Anims.Anim, {
	direction: 'top',

	constructor: function(config) {
		this.superConstructor(config);
		if(config && (config.direction != undefined))
			this.direction = config.direction;
	},

	virtualBeforeRun: function(element) {
		element.ui.style.webkitAnimationName = 'none';
	},

	virtualOnRun: function(element) {
		var direction = this.direction;
		if(this.invert) {
			if(this.direction == 'left')
				direction = 'right';
			else if(this.direction == 'right')
				direction = 'left';
			else if(this.direction == 'top')
				direction = 'bottom';
			else if(this.direction == 'bottom')
				direction = 'top';
		}
		element.ui.style.webkitAnimationName = 'bounce'+this.direction;
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

