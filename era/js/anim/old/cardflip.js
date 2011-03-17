
Era.Anims.CardFlip = Era.extend('cardflip', Era.Anims.Transition, {
	orientation: 'horizontal',

	constructor: function(config) {
		this.superConstructor(config);
		if(config && (config.orientation != undefined))
			this.orientation = config.orientation;
	},

	virtualBeforeRun: function(elementIn, elementOut) {
		this.transInAnim = Era.create({ type: 'flip', orientation: this.orientation, invert: !this.invert, duration: (this.duration/2), delay: (this.delay+(this.duration/2)) });
		this.transOutAnim = Era.create({ type: 'flip', orientation: this.orientation, invert: this.invert, duration: (this.duration/2), delay: this.delay });
	},

	virtualOnRun: function(elementIn, elementOut) {
		elementOut.hide(this.transOutAnim);
		elementIn.show(this.transInAnim);
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

