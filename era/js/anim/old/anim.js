
Era.namespace('Era.Anims');

Era.Anims.Anim = Era.extend('anim', Era.Object, {
	delay: 0,
	duration: 0.25,
	invert: false,
	mode: 'in',

	constructor: function(config) {
		this.superConstructor(config);
		if(config && (config.duration != undefined))
			this.duration = config.duration;
		if(config && (config.delay != undefined))
			this.delay = config.delay;
		if(config && (config.invert != undefined))
			this.invert = config.invert;
		if(config && (config.mode != undefined))
			this.mode = config.mode;
		this.addEvents('done', 'abort');
	},

	virtualBeforeRun: function(element) {
	},

	virtualOnRun: function(element) {
		throw('virtualOnRun MUST be implemented in each Anim');
	},

	virtualOnAbort: function(element) {
	},

	virtualAfterRun: function(element) {
	},

	run: function(element) {
		if(this.element != undefined)
			throw('an Anim can\'t be run on several element at a time');

		this.element = element;
		this.virtualBeforeRun(element);
		this.runTask = new Era.DelayedTask({ scope: this, delay: 0, callback: function() {
			this.virtualOnRun(this.element);
			this.runTask = undefined;
			var delay = this.delay + this.duration;
			this.afterTask = new Era.DelayedTask({ scope: this, delay: delay, callback: function() {
				this.virtualAfterRun(this.element);
				this.element = undefined;
				this.afterTask = undefined;
				this.fireEvent('done');
			}});
		}});
	},

	abort: function() {
		if(this.element != undefined) {
			if(this.runTask != undefined) {
				this.runTask.abort();
				this.runTask = undefined;
			}
			if(this.afterTask != undefined) {
				this.afterTask.abort();
				this.afterTask = undefined;
			}
			this.virtualOnAbort(this.element);
			this.element = undefined;
			this.fireEvent('abort');
		}
	},

	setMode: function(mode) {
		this.mode = mode;
	},

	getMode: function() {
		return this.mode;
	},

	setInvert: function(invert) {
		this.invert = invert;
	},

	getInvert: function() {
		return this.invert;
	},
});


Era.Anims.Transition = Era.extend('transition', Era.Object, {
	delay: 0,
	duration: 0.25,
	invert: false,

	constructor: function(config) {
		this.superConstructor(config);
		if(config && (config.duration != undefined))
			this.duration = config.duration;
		if(config && (config.delay != undefined))
			this.delay = config.delay;
		if(config && (config.invert != undefined))
			this.invert = config.invert;
		this.addEvents('done', 'abort');
	},

	virtualBeforeRun: function(elementIn, elementOut) {
	},

	virtualOnRun: function(elementIn, elementOut) {
		throw('virtualOnRun MUST be implemented in each Anim');
	},

	virtualOnAbort: function(elementIn, elementOut) {
	},

	virtualAfterRun: function(elementIn, elementOut) {
	},

	run: function(elementIn, elementOut) {
		if((this.elementIn != undefined) || (this.elementOut != undefined))
			throw('an Anim can\'t be run on several element at a time');

		this.elementIn = elementIn;
		this.elementOut = elementOut;

		this.virtualBeforeRun(elementIn, elementOut);
		this.runTask = new Era.DelayedTask({ scope: this, delay: 0, callback: function() {
			this.virtualOnRun(this.elementIn, this.elementOut);
			this.runTask = undefined;
			var delay = this.delay + this.duration;
			this.afterTask = new Era.DelayedTask({ scope: this, delay: delay, callback: function() {
				this.virtualAfterRun(this.elementIn, this.elementOut);
				this.elementIn.show(undefined);
				this.elementOut.hide(undefined);
				this.elementIn = undefined;
				this.elementOut = undefined;
				this.afterTask = undefined;
				this.fireEvent('done');
			}});
		}});
	},

	abort: function() {
		if((this.elementIn != undefined) || (this.elementOut != undefined)) {
			if(this.runTask != undefined) {
				this.runTask.abort();
				this.runTask = undefined;
			}
			if(this.afterTask != undefined) {
				this.afterTask.abort();
				this.afterTask = undefined;
			}
			this.virtualOnAbort(this.elementIn, this.elementOut);
			this.elementIn = undefined;
			this.elementOut = undefined;
			this.fireEvent('abort');
		}
	},

	setInvert: function(invert) {
		this.invert = invert;
	},

	getInvert: function() {
		return this.invert;
	},
});

