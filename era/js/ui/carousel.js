
Ui.MouseOverable.extend('Ui.Carousel', 
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

	constructor: function(config) {
		this.addEvents('change');

		this.connect(this, 'enter', this.onMouseEnter);
		this.connect(this, 'leave', this.onMouseLeave);
		this.connect(this, 'move', this.onMouseOverMove);

		this.carouselable = new Ui.Carouselable();
		Ui.Carousel.base.append.call(this, this.carouselable);
		this.connect(this.carouselable, 'focus', this.onCarouselableFocus);
		this.connect(this.carouselable, 'blur', this.onCarouselableBlur);
		this.connect(this.carouselable, 'change', this.onCarouselableChange);
		
		this.buttonPrevious = new Ui.Pressable({ horizontalAlign: 'left', verticalAlign: 'center', opacity: 0 });
		this.buttonPrevious.setFocusable(false);
		this.buttonPreviousIcon = Ui.Icon.create('arrowleft', 48, 48);
		this.buttonPrevious.append(this.buttonPreviousIcon);
		Ui.Carousel.base.append.call(this, this.buttonPrevious);
//		this.buttonPrevious.hide();
		this.connect(this.buttonPrevious, 'press', this.onPreviousPress);

		this.buttonNext = new Ui.Pressable({ horizontalAlign: 'right', verticalAlign: 'center', opacity: 0 });
		this.buttonNext.setFocusable(false);
		this.buttonNextIcon = Ui.Icon.create('arrowright', 48, 48);
		this.buttonNext.append(this.buttonNextIcon);
		Ui.Carousel.base.append.call(this, this.buttonNext);
//		this.buttonNext.hide();
		this.connect(this.buttonNext, 'press', this.onNextPress);
	},

	next: function() {
		this.carouselable.next();
	},

	previous: function() {
		this.carouselable.previous();
	},

	/**#@+
	* @private
	*/

	onCarouselableChange: function(carouselable, position) {
		console.log('pos change current: '+position);
		this.showArrows();
	},

	onCarouselableFocus: function() {
		this.showArrows();
	},

	onCarouselableBlur: function() {
		this.hideArrows();
	},

	onPreviousPress: function() {
		this.carouselable.focus();
		this.previous();
	},

	onNextPress: function() {
		this.carouselable.focus();
		this.next();
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
		if(this.hideTimeout != undefined) {
			this.hideTimeout.abort();
			this.hideTimeout = new Core.DelayedTask({ delay: 2, scope: this, callback: this.hideArrows });
		}
		else
			this.hideTimeout = new Core.DelayedTask({ delay: 2, scope: this, callback: this.hideArrows });

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

		if(this.showClock == undefined) {
			this.showClock = new Anim.Clock({ duration: 'forever', target: this, callback: this.onShowTick });
			this.showClock.begin();
		}
	},

	hideArrows: function() {
		console.log('hideArrows');
		if(this.hideTimeout != undefined) {
			this.hideTimeout.abort();
			this.hideTimeout = undefined;
		}
		this.showPrevious = false;
		this.showNext = false;
		if(this.showClock == undefined) {
			this.showClock = new Anim.Clock({ duration: 'forever', target: this, callback: this.onShowTick });
			this.showClock.begin();
		}
	},

	onShowTick: function(clock, progress, delta) {
		if(delta == 0)
			return;

		var previousDone = false;
		if(this.showPrevious) {
			var opacity = this.buttonPrevious.getOpacity();
			opacity = Math.min(opacity + delta, 1);
			this.buttonPrevious.setOpacity(opacity);
			if(opacity == 1)
				previousDone = true;
		}
		else {
			var opacity = this.buttonPrevious.getOpacity();
			opacity = Math.max(opacity - (delta * 2), 0);
			this.buttonPrevious.setOpacity(opacity);
			if(opacity == 0)
				previousDone = true;
		}

		var nextDone = false;
		if(this.showNext) {
			var opacity = this.buttonNext.getOpacity();
			opacity = Math.min(opacity + delta, 1);
			this.buttonNext.setOpacity(opacity);
			if(opacity == 1)
				nextDone = true;
		}
		else {
			var opacity = this.buttonNext.getOpacity();
			opacity = Math.max(opacity - (delta * 2), 0);
			this.buttonNext.setOpacity(opacity);
			if(opacity == 0)
				nextDone = true;
		}

		if(previousDone && nextDone) {
			this.showClock.stop();
			this.showClock = undefined;
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

	onStyleChange: function() {
		var color = this.getStyleProperty('focusColor');
		this.buttonPreviousIcon.setFill(color);
		this.buttonNextIcon.setFill(color);
	}
}, {
	style: {
		focusColor: Ui.Color.create('#5d3109')
	}
});

