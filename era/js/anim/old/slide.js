
Era.Anims.Slide = Era.extend('slide', Era.Anims.Anim, {
	direction: 'left',

	constructor: function(config) {
		this.superConstructor(config);
		if(config && (config.direction != undefined))
			this.direction = config.direction;
	},

	virtualBeforeRun: function(element) {
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
		if(this.mode == 'in') {
			var size = element.getTotalSize();

			if(direction == 'left')
				element.ui.style.webkitTransform = 'translate3d('+(-size.width)+'px, 0px, 0px)';
			else if(direction == 'right')
				element.ui.style.webkitTransform = 'translate3d('+size.width+'px, 0px, 0px)';
			else if(direction == 'top')
				element.ui.style.webkitTransform = 'translate3d(0px, '+(-size.height)+'px, 0px)';
			else if(direction == 'bottom')
				element.ui.style.webkitTransform = 'translate3d(0px, '+size.height+'px, 0px)';
		}
		else {
			element.ui.style.webkitTransform = 'translate3d(0px, 0px, 0px)';
		}
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

		if(this.mode == 'in') {
			element.ui.style.webkitTransitionProperty = '-webkit-transform';
			element.ui.style.webkitTransitionDuration = this.duration+'s';
			element.ui.style.webkitTransitionDelay = this.delay+'s';
			element.ui.style.webkitTransform = 'translate3d(0px, 0px, 0px)';
		}
		else {
			element.ui.style.webkitTransitionProperty = '-webkit-transform';
			element.ui.style.webkitTransitionDuration = this.duration+'s';
			element.ui.style.webkitTransitionDelay = this.delay+'s';

			var size = element.getTotalSize();

			if(direction == 'left')
				element.ui.style.webkitTransform = 'translate3d('+(-size.width)+'px, 0px, 0px)';
			else if(direction == 'right')
				element.ui.style.webkitTransform = 'translate3d('+size.width+'px, 0px, 0px)';
			else if(direction == 'top')
				element.ui.style.webkitTransform = 'translate3d(0px, '+(-size.height)+'px, 0px)';
			else if(direction == 'bottom')
				element.ui.style.webkitTransform = 'translate3d(0px, '+size.height+'px, 0px)';
		}
	},

	virtualOnAbort: function(element) {
		element.ui.style.webkitTransitionDuration = '';
		element.ui.style.webkitTransitionDelay = '';
		element.ui.style.webkitTransitionProperty = '';
		element.ui.style.webkitTransform = '';
	},

	virtualAfterRun: function(element) {
		element.ui.style.webkitTransitionDuration = '';
		element.ui.style.webkitTransitionDelay = '';
		element.ui.style.webkitTransitionProperty = '';
		element.ui.style.webkitTransform = '';
	},
});

