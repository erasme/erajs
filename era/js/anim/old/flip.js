
Era.Anims.Flip = Era.extend('flip', Era.Anims.Anim, {
	orientation: 'horizontal',

	constructor: function(config) {
		this.superConstructor(config);
		if(config && (config.orientation != undefined))
			this.orientation = config.orientation;
	},

	virtualBeforeRun: function(element) {
		element.getParent().ui.style.overflow = 'visible';
		element.ui.style.zIndex = element.ui.style.zIndex+1;
		if(this.mode == 'in') {
			if(this.orientation == 'horizontal')
				element.ui.style.webkitTransform = 'rotateY(-90deg)';
			else
				element.ui.style.webkitTransform = 'rotateX(-90deg)';
		}
		else {
			if(this.orientation == 'horizontal')
				element.ui.style.webkitTransform = 'rotateY(0deg)';
			else
				element.ui.style.webkitTransform = 'rotateX(0deg)';
		}
	},

	virtualOnRun: function(element) {
		if(this.mode == 'in') {
			element.ui.style.webkitTransitionProperty = '-webkit-transform';
			element.ui.style.webkitTransitionDuration = this.duration+'s';
			element.ui.style.webkitTransitionDelay = this.delay+'s';

			if(this.orientation == 'horizontal')
				element.ui.style.webkitTransform = 'rotateY(0deg)';
			else
				element.ui.style.webkitTransform = 'rotateX(0deg)';
		}
		else {
			element.ui.style.webkitTransitionProperty = '-webkit-transform';
			element.ui.style.webkitTransitionDuration = this.duration+'s';
			element.ui.style.webkitTransitionDelay = this.delay+'s';
			if(this.orientation == 'horizontal')
				element.ui.style.webkitTransform = 'rotateY(90deg)';
			else
				element.ui.style.webkitTransform = 'rotateX(90deg)';
		}
	},

	virtualOnAbort: function(element) {
		element.ui.style.webkitTransitionDuration = '';
		element.ui.style.webkitTransitionDelay = '';
		element.ui.style.webkitTransitionProperty = '';
		element.ui.style.webkitTransform = '';
		element.ui.style.zIndex = element.ui.style.zIndex-1;
	},

	virtualAfterRun: function(element) {
		element.ui.style.webkitTransitionDuration = '';
		element.ui.style.webkitTransitionDelay = '';
		element.ui.style.webkitTransitionProperty = '';
		element.ui.style.webkitTransform = '';
		element.ui.style.zIndex = element.ui.style.zIndex-1;
	},
});

