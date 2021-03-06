
Ui.Overable.extend('Ui.Carousel', 
/**@lends Ui.Carousel#*/
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

		this.carouselable = new Ui.Carouselable();
		Ui.Carousel.base.append.call(this, this.carouselable);
		this.connect(this, 'focus', this.onCarouselableFocus);
		this.connect(this, 'blur', this.onCarouselableBlur);
		this.connect(this.carouselable, 'change', this.onCarouselableChange);

		this.buttonPrevious = new Ui.Pressable({ horizontalAlign: 'left', verticalAlign: 'center', opacity: 0 });
		this.buttonPrevious.setFocusable(false);
		this.buttonPreviousIcon = new Ui.Icon({ icon: 'arrowleft', width: 48, height: 48 });
		this.buttonPrevious.append(this.buttonPreviousIcon);
		Ui.Carousel.base.append.call(this, this.buttonPrevious);
//		this.buttonPrevious.hide();
		this.connect(this.buttonPrevious, 'press', this.onPreviousPress);

		this.buttonNext = new Ui.Pressable({ horizontalAlign: 'right', verticalAlign: 'center', opacity: 0 });
		this.buttonNext.setFocusable(false);
		this.buttonNextIcon = new Ui.Icon({ icon: 'arrowright', width: 48, height: 48 });
		this.buttonNext.append(this.buttonNextIcon);
		Ui.Carousel.base.append.call(this, this.buttonNext);
//		this.buttonNext.hide();
		this.connect(this.buttonNext, 'press', this.onNextPress);

		this.connect(this.getDrawing(), 'keydown', this.onKeyDown);
	},
	
	setAutoPlay: function(delay) {
		this.carouselable.setAutoPlay(delay);
	},

	next: function() {
		this.carouselable.next();
	},

	previous: function() {
		this.carouselable.previous();
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

	/**#@+
	* @private
	*/
	
	onCarouselableChange: function(carouselable, position) {
		this.showArrows();
		this.fireEvent('change', this, position);
	},

	onCarouselableFocus: function() {
		this.showArrows();
	},

	onCarouselableBlur: function() {
		this.hideArrows();
	},

	onPreviousPress: function() {
		this.focus();
		this.previous();
	},

	onNextPress: function() {
		this.focus();
		this.next();
	},

	onMouseEnter: function() {
		this.showArrows();
		this.carouselable.stopAutoPlay();
	},

	onMouseOverMove: function() {
		this.showArrows();
	},

	onMouseLeave: function() {
		this.hideArrows();
		this.carouselable.startAutoPlay();
	},

	showArrows: function() {
//		if(this.hideTimeout !== undefined) {
//			this.hideTimeout.abort();
//			this.hideTimeout = new Core.DelayedTask({ delay: 2, scope: this, callback: this.hideArrows });
//		}
//		else
//			this.hideTimeout = new Core.DelayedTask({ delay: 2, scope: this, callback: this.hideArrows });

		var pos = this.carouselable.getCurrentPosition();
		var children = this.carouselable.getLogicalChildren();

		if(children.length > 0) {
			this.showPrevious = (pos > 0);
			this.showNext = (pos < children.length - 1);
		}
		else {
			this.showPrevious = false;
			this.showNext = false;
		}

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
/**@lends Ui.Carousel#*/
{
	append: function(child) {
		this.carouselable.append(child);
	},

	remove: function(child) {
		this.carouselable.remove(child);
	},
	
	insertAt: function(child, pos) {
		this.carouselable.insertAt(child, pos);
	},
	
	moveAt: function(child, pos) {
		this.carouselable.moveAt(child, pos);
	},

	setContent: function(content) {
		this.carouselable.setContent(content);
	},

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

