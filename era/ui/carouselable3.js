
Core.Object.extend('Ui.CarouselableLoader', {
	constructor: function(config) {
		this.addEvents('change');
	},

	getMin: function() {
		return 0;
	},

	getMax: function() {
		return -1;
	},

	getElementAt: function(position) {
		return undefined;
	}
});

Ui.CarouselableLoader.extend('Ui.CarouselableInfiniteLoader', {
	constructor: function(config) {
	}
}, {
	getMin: function() {
		if(Number.MIN_SAFE_INTEGER)
			return Number.MIN_SAFE_INTEGER;
		else
			return -9007199254740991;
	},

	getMax: function() {
		if(Number.MAX_SAFE_INTEGER)
			return Number.MAX_SAFE_INTEGER;
		else
			return 9007199254740991;
	},

	getElementAt: function(position) {
		var mod = position % 4;

		if(mod === 0)
			return new Ui.Rectangle({ fill: 'pink' });
		else if(mod === 1)
			return new Ui.Rectangle({ fill: 'lightgreen' });
		else if(mod === 2)
			return new Ui.Rectangle({ fill: 'orange' });
		else
			return new Ui.Rectangle({ fill: 'lightblue' });
	}
});

Ui.CarouselableLoader.extend('Ui.CarouselableElementsLoader', {
	elements: undefined,

	constructor: function(config) {
		if('elements' in config) {
			this.elements = config.elements;
			delete(config.elements);
		}
		else
			this.elements = [];
	},

	append: function(element) {
		this.elements.push(element);
	}

}, {
	getMin: function() {
		return 0;
	},

	getMax: function() {
		return this.elements.length-1;
	},

	getElementAt: function(position) {
		return this.elements[position];
	}
});

Ui.CarouselableLoader.extend('Ui.CarouselableDataLoader', {
	data: undefined,

	constructor: function(config) {
		if('data' in config) {
			this.data = config.data;
			delete(config.data);
		}
		else
			this.data = [];
	},

	append: function(data) {
		this.data.push(data);
	},

	buildUi: function(item, pos) {
		return new Ui.Label({
			verticalAlign: 'center', horizontalAlign: 'center',
			text: item
		});
	}

}, {
	getMin: function() {
		return 0;
	},

	getMax: function() {
		return this.data.length-1;
	},

	getElementAt: function(position) {
		return this.buildUi(this.data[position], position);
	}
});

Ui.MovableBase.extend('Ui.Carouselable3', {
	ease: undefined,
	items: undefined,
	pos: 0,
	lastPosition: undefined,
	activeItems: undefined,
	activeItemsPos: 0,
	alignClock: undefined,
	animNext: undefined,
	animStart: undefined,
	animSource: undefined,
	bufferingSize: 1,
	loader: undefined,

	constructor: function(config) {
		this.addEvents('change');
		this.setClipToBounds(true);
		this.setFocusable(true);
		this.setMoveVertical(false);
		this.activeItems = [];
		this.ease = Anim.EasingFunction.create({ type: Anim.PowerEase, mode: 'out' });

		this.connect(this, 'down', this.onCarouselableDown);
		this.connect(this, 'up', this.onCarouselableUp);
		this.connect(this.getDrawing(), 'keydown', this.onKeyDown);
		this.connect(this, 'wheel', this.onWheel);
	},

	setLoader: function(loader) {
		this.loader = loader;
		while(this.getFirstChild() !== undefined)
			this.removeChild(this.getFirstChild());
		this.lastPosition = undefined;
		this.activeItems = [];
		this.activeItemsPos = 0;

		if(this.pos < this.loader.getMin())
			this.pos = this.loader.getMin();
		if(this.pos > this.loader.getMax())
			this.pos = this.loader.getMax();

		this.loadItems();
		this.updateItems();
	},

	getLoader: function() {
		return this.loader;
	},

	getBufferingSize: function() {
		return this.bufferingSize;
	},

	setBufferingSize: function(size) {
		if(this.bufferingSize !== size) {
			this.bufferingSize = size;
			this.updateItems();
		}
	},
	
	getCurrentPosition: function() {
		if(this.alignClock !== undefined)
			return this.animNext;
		else
			return this.pos;
	},

	getCurrent: function() {
		var pos = this.getCurrentPosition() - this.activeItemsPos;
		if((pos >= 0) && (pos < this.activeItems.length))
		   return this.activeItems[pos];
		else
			return undefined;
	},

	setCurrentAt: function(position, noAnimation) {
		position = Math.min(2*this.loader.getMax(), Math.max(this.loader.getMin()*2, position));
		if(noAnimation) {
			this.pos = position;
			this.setPosition(-this.pos * this.getLayoutWidth(), undefined);
			this.onChange();
		}
		else
			this.startAnimation(2*(this.pos-position), position, 'program');
	},

	next: function(source) {
		if(source === undefined)
			source = 'program';
		if(this.alignClock === undefined) {
			if(this.pos < this.loader.getMax())
				this.startAnimation(-2, this.pos + 1, source);
		}
		else {
			if(this.animNext > this.pos)
				this.startAnimation(-2 * (this.animNext+1-Math.floor(this.pos)), Math.min(this.animNext + 1, this.loader.getMax()), source);
			else
				this.startAnimation(-2, Math.min(Math.ceil(this.pos), this.loader.getMax()), source);
		}
	},

	previous: function(source) {
		if(source === undefined)
			source = 'program';
		if(this.alignClock === undefined) {
			if(this.pos > this.loader.getMin())
				this.startAnimation(2, this.pos - 1, source);
		}
		else {
			if(this.animNext < this.pos)
				this.startAnimation(2 * (Math.floor(this.pos) - (this.animNext-1)), Math.max(this.animNext - 1, 0), source);
			else
				this.startAnimation(2, Math.floor(this.pos), source);
		}
	},

	setEase: function(ease) {
		this.ease = Anim.EasingFunction.create(ease);
	},

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
			this.startAnimation(speedX / this.getLayoutWidth(), undefined, 'user');
	},

	onChange: function(source) {
		if(source === undefined)
			source = 'program';
		this.loadItems();
		this.updateItems();
//		var current = this.getCurrent();
//		if(current !== undefined)
//			current.enable();
		var currentPosition = this.getCurrentPosition();
		if((this.lastPosition === undefined) || (this.lastPosition !== currentPosition)) {
//			if((this.lastPosition !== undefined) && (this.items[this.lastPosition] !== undefined))
//				this.items[this.lastPosition].disable();
			this.lastPosition = currentPosition;
			this.fireEvent('change', this, currentPosition, source);
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
			this.onChange(this.animSource);
	},

	startAnimation: function(speed, next, source) {
		this.stopAnimation();
		this.speed = speed;
		this.animStart = this.pos;
		this.animSource = source;
		if(next === undefined) {
			if(this.speed < 0)
				this.animNext = Math.ceil(this.animStart);
			else
				this.animNext = Math.floor(this.animStart);
		}
		else
			this.animNext = next;
		if(this.animStart !== this.animNext) {
			this.alignClock = new Anim.Clock({ duration: 'forever', target: this });
			this.connect(this.alignClock, 'timeupdate', this.onAlignTick);
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

		var newItems = [];
		for(i = Math.max(this.loader.getMin(), Math.floor(this.pos-this.bufferingSize)); i < Math.min(this.loader.getMax()+1,Math.floor(this.pos+1+this.bufferingSize)); i++) {
			var item;
			// take from the active items if already loaded
			if((i >= this.activeItemsPos) && (i < this.activeItemsPos + this.activeItems.length))
				item = this.activeItems[i - this.activeItemsPos];
			// else, load with the loader
			else {
				item = this.loader.getElementAt(i);
				this.appendChild(item);
			}
			newItems.push(item);
		}

		// remove unviewable items
		for(i = 0; i < this.activeItems.length; i++) {
			if((this.activeItemsPos+i < Math.max(this.loader.getMin(), Math.floor(this.pos-this.bufferingSize))) ||
			   (this.activeItemsPos+i >= Math.min(this.loader.getMax()+1,Math.floor(this.pos+1+this.bufferingSize))))
				this.removeChild(this.activeItems[i]);
		}

		this.activeItems = newItems;
		this.activeItemsPos = Math.max(this.loader.getMin(), Math.floor(this.pos-this.bufferingSize));
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
			var ipos = this.activeItemsPos + i;
			// measure & arrange
			item.measure(w, h);
			item.arrange(0, 0, w, h);
			item.setTransform(Ui.Matrix.createTranslate((ipos - this.pos)*w, 0));
		}
	},

	getLogicalChildren: function() {
		return this.getChildren();
	}

}, {
	onLoad: function() {
		Ui.Carouselable3.base.onLoad.call(this);
		this.loadItems();
		this.updateItems();
	},

	onMove: function(x, y) {
		if(this.getLayoutWidth() <= 0)
			return;
		this.pos = -x / this.getLayoutWidth();
//		console.log('onMove pos: '+this.pos);
		if((this.pos < this.loader.getMin()) || (this.pos > this.loader.getMax())) {
			this.pos = Math.max(this.loader.getMin(), Math.min(this.pos, this.loader.getMax()));
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
