
Ui.MovableBase.extend('Ui.Carouselable', 
/**@lends Ui.Carouselable#*/
{
	ease: undefined,
	items: undefined,
	pos: 0,
	lastPosition: undefined,
	activeItems: undefined,
	alignClock: undefined,
	animNext: undefined,
	animStart: undefined,
	bufferingSize: 1,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.MovableBase
	 */
	constructor: function(config) {
		this.addEvents('change');
		this.setClipToBounds(true);
		this.setFocusable(true);
		this.setMoveVertical(false);
		this.items = [];
		this.activeItems = [];
		this.ease = Anim.EasingFunction.create({ type: Anim.PowerEase, mode: 'out' });

		this.connect(this, 'down', this.onCarouselableDown);
		this.connect(this, 'up', this.onCarouselableUp);
		this.connect(this.getDrawing(), 'keydown', this.onKeyDown);
		this.connect(this, 'wheel', this.onWheel);
	},

	getBufferingSize: function() {
		return this.bufferingSize;
	},

	setBufferingSize: function(size) {
		if(this.bufferingSize != size) {
			this.bufferingSize = size;
			this.updateItems();
		}
	},

	getLogicalChildren: function() {
		return this.items;
	},
	
	getCurrentPosition: function() {
		if(this.alignClock !== undefined)
			return this.animNext;
		else
			return this.pos;
	},

	getCurrent: function() {
		return this.items[this.getCurrentPosition()];
	},

	setCurrentAt: function(position, noAnimation) {
		position = Math.min(2*(this.items.length - 1), Math.max(0, position));
		if(noAnimation) {
			this.pos = position;
			this.setPosition(-this.pos * this.getLayoutWidth(), undefined);
			this.onChange();
		}
		else
			this.startAnimation(2*(this.pos-position), position);
	},

	setCurrent: function(current, noAnimation) {
		for(var i = 0; i < this.items.length; i++) {
			if(this.items[i] == current) {
				this.setCurrentAt(i, noAnimation);
				break;
			}
		}
	},

	next: function() {
		if(this.alignClock === undefined) {
			if(this.pos < this.items.length-1)
				this.startAnimation(-2, this.pos + 1);
		}
		else {
			if(this.animNext > this.pos)
				this.startAnimation(-2 * (this.animNext+1-Math.floor(this.pos)), Math.min(this.animNext + 1, this.items.length - 1));
			else
				this.startAnimation(-2, Math.min(Math.ceil(this.pos), this.items.length - 1));
		}
	},

	previous: function() {
		if(this.alignClock === undefined) {
			if(this.pos > 0)
				this.startAnimation(2, this.pos - 1);
		}
		else {
			if(this.animNext < this.pos)
				this.startAnimation(2 * (Math.floor(this.pos) - (this.animNext-1)), Math.max(this.animNext - 1, 0));
			else
				this.startAnimation(2, Math.floor(this.pos));
		}
	},

	setEase: function(ease) {
		this.ease = Anim.EasingFunction.create(ease);
	},

	append: function(child) {
		this.items.push(child);
		this.onChange();
	},

	remove: function(child) {
		var i = 0;
		while((i < this.items.length) && (this.items[i] !== child)) { i++; }
		if(i < this.items.length) {
			this.items.splice(i, 1);
			if((this.pos < 0) || (this.pos > this.items.length-1))
				this.pos = Math.max(0, Math.min(this.pos, this.items.length-1));
			if(this.alignClock !== undefined)
				this.animNext = Math.max(0, Math.min(this.animNext, this.items.length-1));
			this.setPosition(-this.pos * this.getLayoutWidth(), undefined, true);
			this.onChange();
		}
	},

	insertAt: function(child, position) {
		if(position < 0)
			position = this.items.length + position;
		if(position < 0)
			position = 0;
		if(position >= this.items.length)
			position = this.items.length;
		this.items.splice(position, 0, child);
		this.onChange();
	},
	
	moveAt: function(child, position) {
		if(position < 0)
			position = this.items.length + position;
		if(position < 0)
			position = 0;
		if(position >= this.items.length)
			position = this.items.length;
		var i = 0;
		while((i < this.items.length) && (this.items[i] != child)) { i++; }
		if(i < this.items.length) {
			this.items.splice(i, 1);
			this.items.splice(position, 0, child);
		}
		this.onChange();
	},

	/**#@+
	* @private
	*/

	onKeyDown: function(event) {
		if(this.getIsDisabled())
			return;
		var key = event.which;
		if((key == 37) || (key == 39)) {
			event.stopPropagation();
			event.preventDefault();

			if(key == 37)
				this.previous();
			else if(key == 39)
				this.next();
		}
	},
	
	onWheel: function(event) {
		if(event.deltaX !== 0) {
			event.stopPropagation();
			if(event.deltaX < 0)
				this.previous();
			else
				this.next();
		}
	},

	onCarouselableDown: function() {
		this.stopAnimation();
	},

	onCarouselableUp: function(el, speedX, speedY, deltaX, deltaY, cumulMove, abort) {
		var mod;

		if(abort === true) {
			// just re-align the content
			mod = this.pos % 1;
			if(mod > 0.5)
				speedX = -400;
			else
				speedX = 400;
		}
		else {
			// if too slow
			if(Math.abs(speedX) < 50) {
				// if we have done 20% on the move or 100 units, continue in this direction
				if((deltaX > 0.2 * this.getLayoutWidth()) || (Math.abs(deltaX) > 100)) {
					if(deltaX < 0)
						speedX = -400;
					else
						speedX = 400;
				}
				// else just re-align the content
				else {
					mod = this.pos % 1;
					if(mod > 0.5)
						speedX = -400;
					else
						speedX = 400;
				}
			}
		}
		// if slow set a minimun speed
		if(Math.abs(speedX) < 800) {
			if(speedX < 0)
				speedX = -800;
			else
				speedX = 800;
		}
		if(speedX !== 0)
			this.startAnimation(speedX / this.getLayoutWidth());
	},

	onChange: function() {
		this.loadItems();
		this.updateItems();
		var current = this.getCurrent();
		if(current !== undefined)
			current.enable();
		var currentPosition = this.getCurrentPosition();
		if((this.lastPosition === undefined) || (this.lastPosition !== currentPosition)) {
			if((this.lastPosition !== undefined) && (this.items[this.lastPosition] !== undefined))
				this.items[this.lastPosition].disable();
			this.lastPosition = currentPosition;
			this.fireEvent('change', this, currentPosition);
		}
	},

	onAlignTick: function(clock, progress, delta) {
		if(delta === 0)
			return;	
		var relprogress = -(clock.getTime() * this.speed) / (this.animNext - this.animStart);
		if(relprogress >= 1) {
			this.alignClock.stop();
			this.alignClock = undefined;
			relprogress = 1;
		}
		relprogress = this.ease.ease(relprogress);
		this.pos = (this.animStart + relprogress * (this.animNext - this.animStart));
		this.setPosition(-this.pos * this.getLayoutWidth(), undefined);
		if(this.alignClock === undefined)
			this.onChange();
	},

	startAnimation: function(speed, next) {
		this.stopAnimation();
		this.speed = speed;
		this.animStart = this.pos;
		if(next === undefined) {
			if(this.speed < 0)
				this.animNext = Math.ceil(this.animStart);
			else
				this.animNext = Math.floor(this.animStart);
		}
		else
			this.animNext = next;
		if(this.animStart !== this.animNext) {
			this.alignClock = new Anim.Clock({ duration: 'forever', scope: this, target: this, onTimeupdate: this.onAlignTick });
			this.alignClock.begin();
		}
	},

	stopAnimation: function() {
		if(this.alignClock !== undefined) {
			this.alignClock.stop();
			this.alignClock = undefined;
		}
	},
	
	loadItems: function() {
		if(!this.getIsLoaded())
			return;
		var i;

		for(i = 0; i < this.activeItems.length; i++)
			this.activeItems[i].carouselableSeen = undefined;

		var newItems = [];
		for(i = Math.max(0, Math.floor(this.pos-this.bufferingSize)); i < Math.min(this.items.length,Math.floor(this.pos+1+this.bufferingSize)); i++) {
			var item = this.items[i];
			var active = false;
			for(var i2 = 0; !active && (i2 < this.activeItems.length); i2++) {
				if(this.activeItems[i2] === item) {
					active = true;
					this.activeItems[i2].carouselableSeen = true;
				}
			}
			newItems.push(item);
			if(!active) {
				item.disable();
				this.appendChild(item);
			}
		}

		// remove unviewable items
		for(i = 0; i < this.activeItems.length; i++) {
			if(!this.activeItems[i].carouselableSeen)
				this.removeChild(this.activeItems[i]);
		}
		this.activeItems = newItems;
	},

	updateItems: function() {
		if(!this.getIsLoaded())
			return;

		var w = this.getLayoutWidth();
		var h = this.getLayoutHeight();

		if(this.animClock !== undefined)
			target = this.animNext;

		for(var i = 0; i < this.activeItems.length; i++) {
			var item = this.activeItems[i];
			var ipos = -1;
			for(ipos = 0; (ipos < this.items.length) && (this.items[ipos] !== item); ipos++) {}
			if(ipos < this.items.length) {
				// measure & arrange
				item.measure(w, h);
				item.arrange(0, 0, w, h);
				item.setTransform(Ui.Matrix.createTranslate((ipos - this.pos)*w, 0));
			}
		}
	}
	/**#@-*/
}, {
	onLoad: function() {
		Ui.Carouselable.base.onLoad.call(this);
		this.loadItems();
		this.updateItems();
	},

	onMove: function(x, y) {
		if(this.getLayoutWidth() <= 0)
			return;
		this.pos = -x / this.getLayoutWidth();
//		console.log('onMove pos: '+this.pos);
		if((this.pos < 0) || (this.pos > this.items.length-1)) {
			this.pos = Math.max(0, Math.min(this.pos, this.items.length-1));
			this.setPosition(-this.pos * this.getLayoutWidth());
		}
		//console.log('onMove('+x+','+y+') => '+this.pos);
		this.updateItems();
	},

	arrangeCore: function(w, h) {
		this.setPosition(-this.pos * w, undefined);
	},

	onChildInvalidateMeasure: function(child, event) {
	}
});
