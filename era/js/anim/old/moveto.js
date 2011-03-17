
Era.Anims.MoveTo = Era.extend('moveto', Era.Anims.Anim, {
	x: 0,
	y: 0,

	constructor: function(config) {
		this.superConstructor(config);
		if(config && (config.x != undefined))
			this.x = config.x;
		if(config && (config.y != undefined))
			this.y = config.y;
	},

	virtualBeforeRun: function(element) {
	},

	virtualOnRun: function(element) {
		element.ui.style.webkitTransitionProperty = '-webkit-transform';
		element.ui.style.webkitTransitionDuration = this.duration+'s';
		element.ui.style.webkitTransitionDelay = this.delay+'s';
		element.ui.style.webkitTransform = 'translate3d('+this.x+'px,'+this.y+'px,0px)';
	},

	virtualOnAbort: function(element) {
		element.ui.style.webkitTransitionDuration = '';
		element.ui.style.webkitTransitionDelay = '';
		element.ui.style.webkitTransitionProperty = '';
	},

	virtualAfterRun: function(element) {
		element.ui.style.webkitTransitionDuration = '';
		element.ui.style.webkitTransitionDelay = '';
		element.ui.style.webkitTransitionProperty = '';
		element.setPosition(this.x, this.y);
	},
});

