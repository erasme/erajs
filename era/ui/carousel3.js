
Ui.Overable.extend('Ui.Carousel3', 
/**@lends Ui.Carousel3#*/
{
	carouselable: undefined,
	buttonNext: undefined,
	buttonNextIcon: undefined,
	buttonPrevious: undefined,
	buttonPreviousIcon: undefined,
	showClock: undefined,
//	hideClock: undefined,
	hideTimeout: undefined,

	showNext: false,
	showPrevious: false,

	/**
	 * @constructs
     * @class
	 * @extends Ui.Overable
     */
	constructor: function(config) {
		this.addEvents('change');

		this.setFocusable(true);

		this.connect(this, 'enter', this.onMouseEnter);
		this.connect(this, 'leave', this.onMouseLeave);
		this.connect(this, 'move', this.onMouseOverMove);

		this.carouselable = new Ui.Carouselable3();
		this.append(this.carouselable);
		this.connect(this, 'focus', this.onCarouselableFocus);
		this.connect(this, 'blur', this.onCarouselableBlur);
		this.connect(this.carouselable, 'change', this.onCarouselableChange);

		this.buttonPrevious = new Ui.Pressable({ horizontalAlign: 'left', verticalAlign: 'center', opacity: 0 });
		this.buttonPrevious.setFocusable(false);
		this.buttonPreviousIcon = new Ui.Icon({ icon: 'arrowleft', width: 48, height: 48 });
		this.buttonPrevious.append(this.buttonPreviousIcon);
		this.append(this.buttonPrevious);
//		this.buttonPrevious.hide();
		this.connect(this.buttonPrevious, 'press', this.onPreviousPress);

		this.buttonNext = new Ui.Pressable({ horizontalAlign: 'right', verticalAlign: 'center', opacity: 0 });
		this.buttonNext.setFocusable(false);
		this.buttonNextIcon = new Ui.Icon({ icon: 'arrowright', width: 48, height: 48 });
		this.buttonNext.append(this.buttonNextIcon);
		this.append(this.buttonNext);
//		this.buttonNext.hide();
		this.connect(this.buttonNext, 'press', this.onNextPress);

		this.connect(this.getDrawing(), 'keydown', this.onKeyDown);
	},

	setLoader: function(loader) {
		this.carouselable.setLoader(loader);
	},

	getLoader: function() {
		return this.carouselable.getLoader();
	},

	setAutoPlay: function(delay) {
		this.carouselable.setAutoPlay(delay);
	},

	next: function(source) {
		this.carouselable.next(source);
	},

	previous: function(source) {
		this.carouselable.previous(source);
	},

	getLogicalChildren: function() {
		return this.carouselable.getLogicalChildren();
	},

	getCurrentPosition: function() {
		return this.carouselable.getCurrentPosition();
	},

	getCurrent: function() {
		return this.carouselable.getCurrent();
	},

	setCurrentAt: function(position, noAnimation) {
		this.carouselable.setCurrentAt(position, noAnimation);
	},

	setCurrent: function(current, noAnimation) {
		this.carouselable.setCurrent(current, noAnimation);
	},

	getBufferingSize: function() {
		return this.carouselable.getBufferingSize();
	},

	setBufferingSize: function(size) {
		this.carouselable.setBufferingSize(size);
	},

	getIsDown: function() {
		return this.carouselable.getIsDown();
	},

	/**#@+
	* @private
	*/
	
	onCarouselableChange: function(carouselable, position, source) {
		this.showArrows();
		this.fireEvent('change', this, position, source);
	},

	onCarouselableFocus: function() {
		this.showArrows();
	},

	onCarouselableBlur: function() {
		this.hideArrows();
	},

	onPreviousPress: function() {
		this.focus();
		this.previous('user');
	},

	onNextPress: function() {
		this.focus();
		this.next('user');
	},

	onMouseEnter: function() {
		this.showArrows();
	},

	onMouseOverMove: function() {
		this.showArrows();
	},

	onMouseLeave: function() {
		this.hideArrows();
	},

	showArrows: function() {
		if(this.hideTimeout !== undefined) {
			this.hideTimeout.abort();
			this.hideTimeout = new Core.DelayedTask({ delay: 2, scope: this, callback: this.hideArrows });
		}
		else
			this.hideTimeout = new Core.DelayedTask({ delay: 2, scope: this, callback: this.hideArrows });

		var pos = this.carouselable.getCurrentPosition();

		this.showPrevious = (pos > this.getLoader().getMin());
		this.showNext = pos < this.getLoader().getMax();

		if(this.showClock === undefined) {
			this.showClock = new Anim.Clock({ duration: 'forever', target: this });
			this.connect(this.showClock, 'timeupdate', this.onShowTick);
			this.showClock.begin();
		}
	},

	hideArrows: function() {
		if(this.hideTimeout !== undefined) {
			this.hideTimeout.abort();
			this.hideTimeout = undefined;
		}
		this.showPrevious = false;
		this.showNext = false;
		if(this.showClock === undefined) {
			this.showClock = new Anim.Clock({ duration: 'forever', target: this });
			this.connect(this.showClock, 'timeupdate', this.onShowTick);
			this.showClock.begin();
		}
	},

	onShowTick: function(clock, progress, delta) {
		if(delta === 0)
			return;
		var opacity;
		var previousDone = false;
		if(this.showPrevious) {
			opacity = this.buttonPrevious.getOpacity();
			opacity = Math.min(opacity + delta, 1);
			this.buttonPrevious.setOpacity(opacity);
			if(opacity == 1)
				previousDone = true;
		}
		else {
			opacity = this.buttonPrevious.getOpacity();
			opacity = Math.max(opacity - (delta * 2), 0);
			this.buttonPrevious.setOpacity(opacity);
			if(opacity === 0)
				previousDone = true;
		}

		var nextDone = false;
		if(this.showNext) {
			opacity = this.buttonNext.getOpacity();
			opacity = Math.min(opacity + delta, 1);
			this.buttonNext.setOpacity(opacity);
			if(opacity == 1)
				nextDone = true;
		}
		else {
			opacity = this.buttonNext.getOpacity();
			opacity = Math.max(opacity - (delta * 2), 0);
			this.buttonNext.setOpacity(opacity);
			if(opacity === 0)
				nextDone = true;
		}

		if(previousDone && nextDone) {
			this.showClock.stop();
			this.showClock = undefined;
		}
	},

	onKeyDown: function(event) {
		if(this.getHasFocus()) {
			if(event.which == 39)
				this.next();
			else if(event.which == 37)
				this.previous();
		}
	}

	/**#@-*/
}, 
/**@lends Ui.Carousel3#*/
{
	onStyleChange: function() {
		var color = this.getStyleProperty('focusColor');
		this.buttonPreviousIcon.setFill(color);
		this.buttonNextIcon.setFill(color);
	}
}, {
	style: {
		focusColor: '#21d3ff'
	}
});


