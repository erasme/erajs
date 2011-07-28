
Ui.Container.extend('Ui.Carousel', 
/**@lends Ui.Carousel#*/
{
	movable: undefined,
	box: undefined,
	alignClock: undefined,
	speed: 0,
	animNext: 0,
	animStart: 0,
	ease: undefined,

	constructor: function(config) {
		this.movable = new Ui.Movable({ clipToBounds: true, inertia: false });
		this.connect(this.movable, 'move', this.onMove);
		this.connect(this.movable, 'down', this.onDown);
		this.connect(this.movable, 'up', this.onUp);
		this.appendChild(this.movable);

		this.box = new Ui.CarouselBox();
		this.movable.setContent(this.box);

		if('ease' in config)
			this.setEase(config.ease);
		else
			this.ease = Anim.EasingFunction.create({ type: 'power', mode: 'out' });
	},

	getCurrentPosition: function() {
		return Math.round(-this.movable.getPositionX() / this.movable.getLayoutWidth());
	},

	next: function() {
		if(this.alignClock == undefined)
			this.startAnimation(-0.8, this.getCurrentPosition() + 1);
		else {
			var pos = -this.movable.getPositionX() / this.movable.getLayoutWidth();
			if(this.animNext > pos)
				this.startAnimation(-0.8, Math.min(this.animNext + 1, this.box.getChildren().length - 1));
			else
				this.startAnimation(-0.8, Math.min(Math.ceil(pos), this.box.getChildren().length - 1));
		}
	},

	previous: function() {
		if(this.alignClock == undefined)
			this.startAnimation(0.8, this.getCurrentPosition() - 1);
		else {
			var pos = -this.movable.getPositionX() / this.movable.getLayoutWidth();
			if(this.animNext < pos)
				this.startAnimation(0.8, Math.max(this.animNext - 1, 0));
			else
				this.startAnimation(0.8, Math.floor(pos));
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
	},

	/**#@+
	* @private
	*/

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
	},

	onDown: function(movable) {
		this.stopAnimation();
	},

	onUp: function(movable, speedX, speedY, deltaX, deltaY) {
		if(Math.abs(speedX) < 200) {
			var mod = (-this.movable.getPositionX() / this.movable.getLayoutWidth()) % 1;
			if(mod > 0.5)
				speedX = -200;
			else
				speedX = 200;
		}
		if(speedX != 0)
			this.startAnimation(speedX / this.movable.getLayoutWidth());
	},

	onAlignTick: function(clock, progress, delta) {
		if(delta == 0)
			return;

		var relprogress = -(clock.getTime() * this.speed) / (this.animNext - this.animStart);
		if(relprogress > 1) {
			this.alignClock.stop();
			this.alignClock = undefined;
			relprogress = 1;
		}
		relprogress = this.ease.ease(relprogress);
		var newX = -(this.animStart + relprogress * (this.animNext - this.animStart))*this.movable.getLayoutWidth();
		this.movable.setPosition(newX, undefined);
	},

	startAnimation: function(speed, next) {
		this.stopAnimation();
		this.speed = speed;
		this.animStart = -this.movable.getPositionX() / this.movable.getLayoutWidth();
		if(next == undefined) {
			if(this.speed < 0)
				this.animNext = Math.ceil(this.animStart);
			else
				this.animNext = Math.floor(this.animStart);
		}
		else
			this.animNext = next;
		if(this.animStart != this.animNext) {
			this.alignClock = new Anim.Clock({ duration: 'forever', target: this, callback: this.onAlignTick });
			this.alignClock.begin();
		}
	},

	stopAnimation: function() {
		if(this.alignClock != undefined) {
			this.alignClock.stop();
			this.alignClock = undefined;
		}
	}

	/**#@-*/
}, 
/**@lends Ui.Carousel#*/
{
	measureCore: function(width, height) {
		return this.movable.measure(width, height);
	},

	arrangeCore: function(width, height) {
		return this.movable.arrange(0, 0, width, height);
	}
});

Ui.Container.extend('Ui.CarouselBox', {
	constructor: function() {
	},

	append: function(child) {
		this.appendChild(child);
	},

	remove: function(child) {
		this.removeChild(child);
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
		return { width: minWidth, height: minHeight };
	},

	arrangeCore: function(width, height) {
		var x = 0;
		for(var i = 0; i < this.getChildren().length; i++) {
			this.getChildren()[i].arrange(x, 0, width, height);
			x += width;
		}
	}
});

