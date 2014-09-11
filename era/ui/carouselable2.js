
/*
Ui.Scrollable.extend('Ui.Carouselable2', 
{
	ease: undefined,
	items: undefined,
	pos: 0,
	basePos: 0,
	lastPosition: undefined,
	activeItems: undefined,
	alignClock: undefined,
	animNext: undefined,
	animStart: undefined,
	hbox: undefined,
	snapTimer: undefined,
	
	constructor: function(config) {
		this.addEvents('change');
		this.setClipToBounds(true);
		this.setFocusable(true);
		this.setScrollVertical(false);
		this.items = [];
		this.activeItems = [];
		this.ease = Anim.EasingFunction.create({ type: Anim.PowerEase, mode: 'out' });
		this.hbox = new Ui.HBox({ uniform: true });
		this.setContent(this.hbox);

		this.connect(this.getDrawing(), 'keydown', this.onKeyDown);
		this.connect(this.getDrawing(), 'mousewheel', this.onMouseWheel);
		this.connect(this.getDrawing(), 'DOMMouseScroll', this.onMouseWheel);
	},
	
	getLogicalChildren: function() {
		return this.items;
	},
	
	getCurrentPosition: function() {
		return this.pos;
	},

	getCurrent: function() {
		return this.items[this.getCurrentPosition()];
	},

	setCurrentAt: function(position) {
		if(this.pos !== position) {
			this.pos = Math.min(this.items.length - 1, Math.max(0, position));
			// TODO: update
			this.updateItems();
		}
	},

	setCurrent: function(current) {
		for(var i = 0; i < this.items.length; i++) {
			if(this.items[i] == current) {
				this.setCurrentAt(i);
				break;
			}
		}
	},

	next: function() {
		if(this.alignClock === undefined) {
			if(this.pos < this.items.length-1)
				this.startAnimation(-3, this.pos + 1);
		}
	},

	previous: function() {
		if(this.alignClock === undefined) {
			if(this.pos > 0)
				this.startAnimation(3, this.pos - 1);
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
//			if(this.alignClock !== undefined)
//				this.animNext = Math.max(0, Math.min(this.animNext, this.items.length-1));
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
	
	onMouseWheel: function(event) {
		var deltaX = 0;
		var deltaY = 0;

		if((event.wheelDeltaX !== undefined) && (event.wheelDelaY !== undefined)) {
			deltaX = -event.wheelDeltaX / 5;
			deltaY = -event.wheelDeltaY / 5;
		}
		// Opera, Chrome, IE
		else if(event.wheelDelta !== undefined)
			deltaY = -event.wheelDelta / 2;
		// Firefox
		else if(event.detail !== undefined)
			deltaY = event.detail * 10;
		
		if(deltaX !== 0) {
			event.preventDefault();
			event.stopPropagation();
			if(deltaX < 0)
				this.previous();
			else
				this.next();
		}
	},

	onChange: function() {
		console.log('onChange currentPos: '+this.getCurrentPosition());

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

		console.log('onAlignTick pos: '+this.pos);

		this.setOffset((this.pos - this.basePos) * this.getLayoutWidth(), undefined ,true);
		if(this.alignClock === undefined)
			this.onChange();
	},

	snap: function() {
		console.log('snap ofsX: '+this.getOffsetX());
		this.snapTimer = undefined;
		this.snapLock = true;
		this.setOffset(Math.round(this.getOffsetX() / this.getLayoutWidth()) * this.getLayoutWidth(), undefined ,true);
		this.pos = this.basePos + (this.getOffsetX() / this.getLayoutWidth());
		this.onChange();
		this.snapLock = false;
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
		console.log(this+'.startAnimation');
		if(this.animStart != this.animNext) {
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

	updateItems: function() {
		if(!this.getIsLoaded())
			return;
		var i;

		for(i = 0; i < this.activeItems.length; i++)
			this.activeItems[i].carouselableSeen = undefined;
		
		var newItems = [];
		for(i = Math.max(0, Math.floor(this.pos-1)); i < Math.min(this.items.length,Math.floor(this.pos+1+1)); i++) {
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
				if(i < this.pos)
					this.hbox.prepend(item, true);
				else
					this.hbox.append(item, true);
			}
		}

		// remove unviewable items
		for(i = 0; i < this.activeItems.length; i++) {
			if(!this.activeItems[i].carouselableSeen)
				this.hbox.remove(this.activeItems[i]);
		}
		this.activeItems = newItems;

		// update base pos
		this.basePos = Math.max(0, this.pos-1);

		var w = this.getLayoutWidth();
		var h = this.getLayoutHeight();

		// update the offset
		this.hbox.measure(this.hbox.getChildren().length*w, h);
		this.hbox.arrange(0, 0, this.hbox.getChildren().length*w, h);
		this.setOffset((this.pos - this.basePos) * w, undefined ,true);
		new Core.DelayedTask({ scope: this, delay: 0.001, callback: function() {
			console.log('delay scroll');
			this.setOffset((this.pos - this.basePos) * w, undefined ,true);
		}});
	}
}, {
	onScroll: function() {
		Ui.Carouselable2.base.onScroll.apply(this, arguments);
		if(this.snapLock === true)
			return;
		console.log('onScroll');
		if(this.snapTimer !== undefined)
			this.snapTimer.abort();
		this.snapTimer = new Core.DelayedTask({ scope: this, callback: this.snap, delay: 0.3 });
	},

	onLoad: function() {
		Ui.Carouselable2.base.onLoad.call(this);
		this.updateItems();
	},

	measureCore: function(w, h) {
		var size = Ui.Carouselable2.base.measureCore.apply(this, arguments);
		this.hbox.measure(w*this.hbox.getChildren().length, h);
		return size;
	},

	arrangeCore: function(w, h) {
		Ui.Carouselable2.base.arrangeCore.apply(this, arguments);
		console.log(this+'.arrangeCore '+this.hbox.getChildren().length+' w: '+w);
		this.hbox.arrange(0, 0, w*this.hbox.getChildren().length, h);
	},

	onChildInvalidateMeasure: function(child, event) {
		console.log('onChildInvalidateMeasure');
	}
});*/


Ui.Scrollable.extend('Ui.Carouselable2', {
	hbox: undefined,
	snapTimer: undefined,
	ease: undefined,
	animStart: undefined,
	animNext: undefined,
	alignClock: undefined,
	bufferingSize: 1,
	current: undefined,
	supportCssSnap: false,
	pos: 0,
	isDown: false,

	constructor: function() {
		this.addEvents('change');
		this.setScrollVertical(false);
		this.ease = Anim.EasingFunction.create({ type: Anim.PowerEase, mode: 'out' });

		// test is CSS scroll snapping is allowed
		this.supportCssSnap = false;
		if('getComputedStyle' in window) {
			var styles = window.getComputedStyle(this.contentBox.getDrawing());
			this.supportCssSnap = ('msScrollSnapPointsX' in styles) || ('scrollSnapPointsX' in styles);
		}

		if(this.supportCssSnap) {
			this.contentBox.getDrawing().style.msScrollSnapType = 'mandatory';
			this.contentBox.getDrawing().style.msScrollSnapPointsX = 'snapInterval(0px, 100%)';
			this.contentBox.getDrawing().style.scrollSnapType = 'mandatory';
			this.contentBox.getDrawing().style.scrollSnapPointsX = 'snapInterval(0px, 100%)';
			// disable scroll chaining (perhaps a bad idea but more usable)
			this.contentBox.getDrawing().style.msScrollChaining = 'none';
		}

		this.hbox = new Ui.FixedBox();
		this.setContent(this.hbox);
	},

	append: function(page) {
		page.hide();
		this.hbox.append(page, true);
		this.updateItems();
	},

	insertAt: function(page, pos) {
		page.hide();
		this.hbox.insertAt(page, pos);
		this.updateItems();
	},

	moveAt: function(child, position) {
		this.hbox.moveAt(child, position);
		this.updateItems();
	},

	remove: function(page) {
		this.hbox.remove(page);
		page.show();
		this.updateItems();
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

	setAutoPlay: function(delay) {
	},
	
	next: function() {
		if(this.alignClock === undefined) {
			if(this.getCurrentPosition() < this.hbox.getChildren().length-1)
				this.startAnimation(-3, this.getCurrentPosition() + 1);
		}
		else {
			var pos = this.getOffsetX() / this.getLayoutWidth();
			if(this.animNext > pos)
				this.startAnimation(-3 * (this.animNext+1-Math.floor(pos)),
					Math.min(this.animNext + 1, this.hbox.getChildren().length - 1));
			else
				this.startAnimation(-3, Math.min(Math.ceil(pos), this.hbox.getChildren().length - 1));
		}
	},

	previous: function() {
		if(this.alignClock === undefined) {
			if(this.getCurrentPosition() > 0)
				this.startAnimation(3, this.getCurrentPosition() - 1);
		}
		else {
			var pos = this.getOffsetX() / this.getLayoutWidth();
			if(this.animNext < pos)
				this.startAnimation(3 * (Math.floor(pos) - (this.animNext-1)), Math.max(this.animNext - 1, 0));
			else
				this.startAnimation(3, Math.floor(pos));
		}
	},

	setEase: function(ease) {
		this.ease = Anim.EasingFunction.create(ease);
	},

	getLogicalChildren: function() {
		return this.hbox.getChildren();
	},

	getCurrentPosition: function() {
		if(this.alignClock !== undefined)
			return this.animNext;
		else
			return this.pos;
//		if(this.getOffsetX() === 0)
//			return 0;
//		else
//			return Math.round(this.getOffsetX() / this.getLayoutWidth());
	},

	getCurrent: function() {
		return this.hbox.getChildren()[this.getCurrentPosition()];
	},

	setCurrentAt: function(position) {
		//console.log(this+'.setCurrentAt('+position+') '+this.hbox.getChildren().length+' '+this.getLayoutWidth());

		if(this.animClock !== undefined)
			this.stopAnimation();
		if(this.snapTimer !== undefined) {
			this.snapTimer.abort();
			this.snapTimer = undefined;
		}
		this.pos = Math.min(this.hbox.getChildren().length-1, Math.max(position,0));
		this.setOffset(this.getLayoutWidth()*this.pos, undefined, true);
	},

	setCurrent: function(current) {
		for(var i = 0; i < this.hbox.getChildren().length; i++) {
			if(this.hbox.getChildren()[i] === current) {
				this.setCurrentAt(i);
				break;
			}
		}
	},

	startAnimation: function(speed, next) {
		if(this.snapTimer !== undefined) {
			this.snapTimer.abort();
			this.snapTimer = undefined;
		}
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

	onAlignTick: function(clock, progress, delta) {
		//console.log(this+'.onAlignTick');

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

		this.setOffset(this.pos * this.getLayoutWidth(), undefined ,true);
		if(this.alignClock === undefined)
			this.snap();
	},
	
	snap: function() {
		//console.log(this+'.snap '+this.getOffsetX()+' '+this.getLayoutWidth());

		if(this.snapTimer !== undefined) {
			this.snapTimer.abort();
			this.snapTimer = undefined;
		}
		this.setOffset(Math.round(this.getOffsetX() / this.getLayoutWidth()) * this.getLayoutWidth(), undefined ,true);

		this.updateItems();

		if(this.current !== this.getCurrent()) {
			this.current = this.getCurrent();
			this.fireEvent('change', this, this.getCurrentPosition());
		}
	},

	updateItems: function() {
		var i;
		var pos = this.getCurrentPosition();
		for(i = 0; i < this.hbox.getChildren().length; i++) {
			if((i >= pos-this.bufferingSize) & (i <= pos+this.bufferingSize))
				this.hbox.getChildren()[i].show();
			else
				this.hbox.getChildren()[i].hide();
		}
	}

}, {
//	invalidateArrange: function() {
//		console.log(this+'.invalidateArrange');
//		Ui.Carouselable2.base.invalidateArrange.apply(this, arguments);
//	},

	onScroll: function() {
		Ui.Carouselable2.base.onScroll.apply(this, arguments);	

		//console.log('onScroll '+this.getOffsetX()+' '+this.getLayoutWidth());

		if(this.animClock !== undefined)
			return;
		// update the position
		if(this.getLayoutWidth() > 0)
			this.pos = Math.round(this.getOffsetX() / this.getLayoutWidth());
		this.updateItems();
		// if CSS snapping is not supported, do it with a timer
		if(!this.supportCssSnap) {
			if(this.snapTimer !== undefined)
				this.snapTimer.abort();
			this.snapTimer = new Core.DelayedTask({ scope: this, callback: this.snap, delay: 0.3 });
		}
		if(this.current !== this.getCurrent()) {
			this.current = this.getCurrent();
			this.fireEvent('change', this, this.getCurrentPosition());
		}
	},

	measureCore: function(w, h) {
		//console.log(this+'.measureCore('+w+','+h+')');
		this.hbox.setItemWidth(w);
		this.hbox.setItemHeight(h);
		var size = Ui.Carouselable2.base.measureCore.apply(this, arguments);
		return size;
	},

	onChildInvalidateMeasure: function(child, type) {
//		console.log(this+'.onChildInvalidateMeasure('+child+','+type+')');
//		Ui.Carouselable2.base.onChildInvalidateMeasure.apply(this, arguments);
//		child.measure(this.getLayoutWidth(), this.getLayoutHeight());
		this.invalidateLayout();
	},

	onChildInvalidateArrange: function(child) {
//		console.log(this+'.onChildInvalidateArrange('+child+')');
//		child.arrange(0, 0, this.getLayoutWidth(), this.getLayoutHeight());
		this.invalidateLayout();
	},

	arrangeCore: function(w, h) {
		//console.log(this+'.arrangeCore('+w+','+h+') '+this.pos);

		Ui.Carouselable2.base.arrangeCore.apply(this, arguments);
		// CSS snapping
		if(this.supportCssSnap) {
			this.contentBox.getDrawing().style.msScrollSnapPointsX = 'snapInterval(0px,'+w+'px)';
			this.contentBox.getDrawing().style.scrollSnapPointsX = 'snapInterval(0px,'+w+'px)';
		}
		this.setOffset(this.pos * w, 0, true);

//		else {
//			if(this.snapTimer === undefined)
//				this.snap();
//		}
	}
});

Ui.Container.extend('Ui.FixedBox', {
	vertical: false,
	itemWidth: 100,
	itemHeight: 100,

	constructor: function(config) {
	},

	setItemWidth: function(itemWidth) {
		if(this.itemWidth !== itemWidth) {
			this.itemWidth = itemWidth;
//			this.invalidateMeasure();
		}
	},

	setItemHeight: function(itemHeight) {
		//console.log(this+'.setItemHeight('+itemHeight+') current: '+this.itemHeight);
		if(this.itemHeight !== itemHeight) {
			this.itemHeight = itemHeight;
//			this.invalidateMeasure();
		}
	},

	setContent: function(content) {
		while(this.getFirstChild() !== undefined)
			this.removeChild(this.getFirstChild());
		if((content !== undefined) && (typeof(content) === 'object')) {
			if(content.constructor == Array) {
				for(var i = 0; i < content.length; i++)
					this.append(content[i]);
			}
			else
				this.append(content);
		}
	},
	
	getOrientation: function() {
		if(this.vertical)
			return 'vertical';
		else
			return 'horizontal';
	},
	
	setOrientation: function(orientation) {
		var vertical = true;
		if(orientation !== 'vertical')
			vertical = false;
		if(this.vertical !== vertical) {
			this.vertical = vertical;
			this.invalidateMeasure();
		}
	},

	append: function(child, resizable) {
		this.appendChild(child);
	},
	
	prepend: function(child, resizable) {
		this.prependChild(child);
	},
	
	insertAt: function(child, position, resizable) {
		this.insertChildAt(child, position);
	},

	moveAt: function(child, position) {
		this.moveChildAt(child, position);
	},
	
	remove: function(child) {
		this.removeChild(child);
	}
}, {
	measureCore: function(width, height) {
		//console.log(this+'.measureCore('+width+','+height+')');

		for(var i = 0; i < this.getChildren().length; i++)
			this.getChildren()[i].measure(this.itemWidth, this.itemHeight);
		if(this.vertical)
			return { width: this.itemWidth, height: this.itemHeight * this.getChildren().length };
		else
			return { width: this.itemWidth * this.getChildren().length, height: this.itemHeight };
	},

	arrangeCore: function(width, height) {
		//console.log(this+'.arrangeCore('+width+','+height+') '+this.itemWidth);
		for(var i = 0; i < this.getChildren().length; i++) {
			if(this.vertical)
				this.getChildren()[i].arrange(0, i * this.itemHeight, this.itemWidth, this.itemHeight);
			else
				this.getChildren()[i].arrange(i * this.itemWidth, 0, this.itemWidth, this.itemHeight);
		}
	},

	layoutCore: function() {
		//console.log(this+'.layoutCore');
		for(var i = 0; i < this.getChildren().length; i++) {
			var child = this.getChildren()[i];
			child.measure(this.itemWidth, this.itemHeight);
			if(this.vertical)
				child.arrange(0, i * this.itemHeight, this.itemWidth, this.itemHeight);
			else
				child.arrange(i * this.itemWidth, 0, this.itemWidth, this.itemHeight);
		}
	}/*,

	onChildInvalidateMeasure: function(child, type) {
//		console.log(this+'.onChildInvalidateMeasure('+child+','+type+')');
//		Ui.FixedBox.base.onChildInvalidateMeasure.apply(this, arguments);
//		child.measure(this.getLayoutWidth(), this.getLayoutHeight());
		this.invalidateLayout();
//		child.invalidateLayout();
	},

	onChildInvalidateArrange: function(child) {
//		console.log(this+'.onChildInvalidateArrange('+child+')');
//		Ui.FixedBox.base.onChildInvalidateArrange.apply(this, arguments);
//		child.arrange(0, 0, this.getLayoutWidth(), this.getLayoutHeight());
		this.invalidateLayout();
//		child.invalidateLayout();
	}*/
});
