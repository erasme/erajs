
Ui.Container.extend('Ui.Carouselable', 
/**@lends Ui.Carouselable#*/
{
	movable: undefined,
	box: undefined,
	alignClock: undefined,
	speed: 0,
	animNext: 0,
	animStart: 0,
	ease: undefined,
	autoPlay: undefined,
	autoTask: undefined,
	pos: 0,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.Container
	 */
	constructor: function(config) {
		this.addEvents('change');

		this.setClipToBounds(true);
		this.setFocusable(true);
		this.connect(this.getDrawing(), 'keydown', this.onKeyDown);

		this.movable = new Ui.Movable({ inertia: false, moveVertical: false, directionRelease: true });
		this.movable.setFocusable(false);
		this.connect(this.movable, 'move', this.onMove);
		this.connect(this.movable, 'down', this.onDown);
		this.connect(this.movable, 'up', this.onUp);
		this.appendChild(this.movable);

		this.box = new Ui.CarouselableBox();
		this.movable.setContent(this.box);

		this.ease = Anim.EasingFunction.create({ type: Anim.PowerEase, mode: 'out' });
	},

	setAutoPlay: function(delay) {
		if(this.autoPlay != delay) {
			if(this.autoTask != undefined) {
				this.autoTask.abort();
				this.autoTask = undefined;
			}
			this.autoPlay = delay;
			if(this.autoPlay != undefined) {
				this.autoTask = new Core.DelayedTask({ delay: this.autoPlay, scope: this, callback: this.onAutoPlay });
			}
		}
	},

	getLock: function() {
		return this.movable.getLock();
	},

	setLock: function(lock) {
		this.movable.setLock(lock);
	},

	getCurrent: function() {
		return this.box.getChildren()[this.getCurrentPosition()];
	},

	getCurrentPosition: function() {
		return Math.min(this.box.getChildren().length - 1, Math.max(0, Math.round(-this.movable.getPositionX() / this.getLayoutWidth())));
	},

	setCurrentAt: function(position) {
		position = Math.min(this.box.getChildren().length - 1, Math.max(0, position));
		if(position < this.getCurrentPosition())
			this.startAnimation(1, position);
		else
			this.startAnimation(-1, position);
	},

	setCurrent: function(current) {
		for(var i = 0; i < this.box.getChildren().length; i++) {
			if(this.box.getChildren()[i] == current) {
				this.setCurrentAt(i);
				break;
			}
		}
	},

	next: function() {
		if(this.alignClock === undefined) {
			var currentPos = this.getCurrentPosition();
			if(currentPos < this.box.getChildren().length - 1)
				this.startAnimation(-1, currentPos + 1);
		}
		else {
			var pos = -this.movable.getPositionX() / this.getLayoutWidth();
			if(this.animNext > pos)
				this.startAnimation(-1 * (this.animNext+1-this.getCurrentPosition()), Math.min(this.animNext + 1, this.box.getChildren().length - 1));
			else
				this.startAnimation(-1, Math.min(Math.ceil(pos), this.box.getChildren().length - 1));
		}
	},

	previous: function() {
		if(this.alignClock === undefined) {
			var currentPos = this.getCurrentPosition();
			if(currentPos > 0)
				this.startAnimation(1, this.getCurrentPosition() - 1);
		}
		else {
			var pos = -this.movable.getPositionX() / this.getLayoutWidth();
			if(this.animNext < pos)
				this.startAnimation(1 * (this.getCurrentPosition() - (this.animNext-1)), Math.max(this.animNext - 1, 0));
			else
				this.startAnimation(1, Math.floor(pos));
		}
	},

	setEase: function(ease) {
		this.ease = Anim.EasingFunction.create(ease);
	},

	append: function(child) {
		this.box.append(child);
	},

	remove: function(child) {
		this.box.remove(child);
		// TODO: provide animation
	},

	getLogicalChildren: function() {
		return this.box.getChildren();
	},

	/**#@+
	* @private
	*/

	onKeyDown: function(event) {
		if(this.getIsDisabled())
			return;
		var key = event.which;

		if((key == 32) || (key == 37) || (key == 39)) {
			event.stopPropagation();
			event.preventDefault();
		}
		if(key == 32)
			this.next();
		else if(key == 37)
			this.previous();
		else if(key == 39)
			this.next();
	},

	onMove: function(movable) {
		if(this.box.getChildren().length < 2)
			movable.setPosition(0, 0);
		else {
			var x = undefined;
			if(movable.getPositionX() > 0)
				x = 0;
			if(movable.getPositionX() < -(this.getLayoutWidth() * (this.box.getChildren().length - 1)))
				x = -(this.getLayoutWidth() * (this.box.getChildren().length - 1));
			movable.setPosition(x, 0);
		}
		this.updateShow();
	},

	onDown: function(movable) {
		this.focus();
		this.stopAnimation();
	},

	onUp: function(movable, speedX, speedY, deltaX, deltaY) {
		if(Math.abs(speedX) < 100) {
			var mod = (-this.movable.getPositionX() / this.getLayoutWidth()) % 1;
			if(mod > 0.5)
				speedX = -400;
			else
				speedX = 400;
		}
		if(speedX != 0)
			this.startAnimation(speedX / this.getLayoutWidth());
	},

	onChange: function() {
		var current = this.getCurrentPosition();
		this.pos = -current;
		for(var i = 0; i < this.box.getChildren().length; i++) {
			if(i == current)
				this.box.getChildren()[i].show();
			else
				this.box.getChildren()[i].hide();
		}
		this.fireEvent('change', this, this.getCurrentPosition());
	},

	updateShow: function() {
		var pos = Math.floor(-this.movable.getPositionX() / this.getLayoutWidth());
		for(var i = 0; i < this.box.getChildren().length; i++) {
			if((i == pos - 1) || (i == pos) || (i == pos +1))
				this.box.getChildren()[i].show();
			else
				this.box.getChildren()[i].hide();
		}
	},

	onAlignTick: function(clock, progress, delta) {
		if(delta == 0)
			return;

		var relprogress = -(clock.getTime() * this.speed) / (this.animNext - this.animStart);
		if(relprogress >= 1) {
			this.alignClock.stop();
			this.alignClock = undefined;
			relprogress = 1;
		}
		relprogress = this.ease.ease(relprogress);
		this.pos = -(this.animStart + relprogress * (this.animNext - this.animStart));
		this.movable.setPosition(this.pos * this.getLayoutWidth(), undefined);		

		if(relprogress >= 1)
			this.onChange();
		else
			this.updateShow();
	},

	startAnimation: function(speed, next) {
		this.stopAnimation();
		this.speed = speed;
		this.animStart = -this.movable.getPositionX() / this.getLayoutWidth();
		if(next === undefined) {
			if(this.speed < 0)
				this.animNext = Math.ceil(this.animStart);
			else
				this.animNext = Math.floor(this.animStart);
		}
		else
			this.animNext = next;
		if(this.animStart != this.animNext) {
			this.alignClock = new Anim.Clock({ duration: 'forever', scope: this, target: this, onTimeupdate: this.onAlignTick });
			this.alignClock.begin();
		}
	},

	stopAnimation: function() {
		if(this.alignClock != undefined) {
			this.alignClock.stop();
			this.alignClock = undefined;
		}
	},

	onAutoPlay: function() {
		this.autoTask = new Core.DelayedTask({ delay: this.autoPlay, scope: this, callback: this.onAutoPlay });
		if(this.getCurrentPosition() >= this.getLogicalChildren().length - 1)
			this.setCurrentAt(0);
		else
			this.next();
	}

	/**#@-*/
}, 
/**@lends Ui.Carouselable#*/
{
	measureCore: function(width, height) {
		this.movable.measure(width, height);
		return { width: this.box.getElementWidth(), height: this.box.getElementHeight() };
	},

	arrangeCore: function(width, height) {
		var res = this.movable.arrange(0, 0, width * this.box.getChildren().length, height);
		this.movable.setPosition(this.pos * width, undefined);
		return res;
	}
});

Ui.Container.extend('Ui.CarouselableBox', {
	elementWidth: 0,
	elementHeight: 0,

	constructor: function() {
	},

	append: function(child) {
		this.appendChild(child);
	},

	remove: function(child) {
		this.removeChild(child);
	},

	getElementWidth: function() {
		return this.elementWidth;
	},

	getElementHeight: function() {
		return this.elementHeight;
	}

}, {
	measureCore: function(width, height) {
		var minWidth = 0;
		var minHeight = 0;
		for(var i = 0; i < this.getChildren().length; i++) {
			var size = this.getChildren()[i].measure(width, height);
			if(size.width > minWidth)
				minWidth = size.width;
			if(size.height > minHeight)
				minHeight = size.height;
		}
		this.elementWidth = minWidth;
		this.elementHeight = minHeight;
		return { width: minWidth * this.getChildren().length, height: minHeight };
	},

	arrangeCore: function(width, height) {
		var x = 0;
		width /= this.getChildren().length;
		for(var i = 0; i < this.getChildren().length; i++) {
			this.getChildren()[i].arrange(x, 0, width, height);
			x += width;
		}
	}
});

