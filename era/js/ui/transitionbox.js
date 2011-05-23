

Ui.LBox.extend('Ui.TransitionBox', {
	transition: undefined,
	duration: 0.5,
	ease: undefined,
	position: -1,
	transitionClock: undefined,
	current: undefined,
	next: undefined,

	constructor: function(config) {
		if(config.duration != undefined)
			this.setDuration(config.duration);
		if(config.ease != undefined)
			this.setEase(config.ease);
		if(config.transition != undefined)
			this.setTransition(config.transition);
		else
			this.setTransition('fade');
		this.connect(this, 'load', this.onTransitionBoxLoad);
		this.connect(this, 'unload', this.onTransitionBoxUnload);
		this.addEvents('change');
	},

	setDuration: function(duration) {
		this.duration = duration;
	},

	setEase: function(ease) {
		this.ease = Anim.EasingFunction.create(ease);
	},

	setTransition: function(transition) {
		this.transition = Ui.Transition.create(transition);
	},

	setCurrent: function(child) {
		var pos = this.getChildPosition(child);
		if(pos != -1)
			this.setCurrentAt(pos);
	},

	setCurrentAt: function(position) {
		if(this.position != position) {
			if(this.transitionClock != undefined)
				this.transitionClock.stop();

			if(this.position != -1)
				this.current = this.getChildren()[this.position];
			else
				this.current = undefined;
			this.next = this.getChildren()[position];
			this.next.show();

			if(this.current != undefined)
				this.current.setClipToBounds(true);
			this.next.setClipToBounds(true);

			this.transition.run(this.current, this.next, 0);

			this.transitionClock = new Anim.Clock({ duration: this.duration, scope: this, callback: this.onTransitionTick, ease: this.ease });
			this.connect(this.transitionClock, 'complete', this.onTransitionComplete);
			this.transitionClock.begin();

			this.position = position;
		}
	},

	//
	// Private
	//
	getChildPosition: function(child) {
		for(var i = 0; i < this.getChildren().length; i++) {
			if(this.getChildren()[i].getChildren()[0] == child)
				return i;
		}
		return -1;
	},

	onTransitionBoxLoad: function() {
	},

	onTransitionBoxUnload: function() {
		if(this.transitionClock != undefined) {
			this.transitionClock.stop();
			this.transitionClock = undefined;
		}
	},

	onTransitionTick: function(clock, progress) {
		this.progress = progress;
		this.transition.run(this.current, this.next, progress);
	},

	onTransitionComplete: function(clock) {
		if(this.current != undefined) {
			this.current.setClipToBounds(false);
			this.current.hide();
		}
		this.next.setClipToBounds(false);
		this.fireEvent('change', this, this.position);
	},

}, {
	arrangeCore: function(width, height) {
		Ui.TransitionBox.base.arrangeCore.call(this, width, height);
		// update the transition if needed
		if(this.transitionClock != undefined)
			this.transition.run(this.current, this.next, this.transitionClock.getProgress());
	},

	append: function(child) {
		var content = new Ui.TransitionBoxContent();
		content.append(child);
		content.hide();
		Ui.TransitionBox.base.append.call(this, content);
	},

	prepend: function(child) {
		if(this.position != -1)
			this.position++;

		var content = new Ui.TransitionBoxContent();
		content.append(child);
		content.hide();
		Ui.TransitionBox.base.prepend.call(this, this.position);
	},

	remove: function(child) {
		for(var i = 0; i < this.getChildren().length; i++) {
			if(this.getChildren()[i].getChildren()[0] == child) {
				if(i < this.position)
					this.position--;
				this.getChildren()[i].remove(child);
				Ui.TransitionBox.base.remove.call(this, this.getChildren()[i]);
				break;
			}
		}
	},
});


Ui.LBox.extend('Ui.TransitionBoxContent', {
	constructor: function(config) {
	},
});

