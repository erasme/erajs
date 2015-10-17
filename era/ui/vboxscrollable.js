
Core.Object.extend('Ui.ScrollLoader', {
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

Ui.Container.extend('Ui.VBoxScrollable', {	
	contentBox: undefined,
	scrollHorizontal: true,
	scrollVertical: true,
	scrollbarHorizontalBox: undefined,
	scrollbarVerticalBox: undefined,
	showShadows: false,
	lock: false,
	isOver: false,
	showClock: undefined,
	offsetX: 0,
	offsetY: 0,
	viewWidth: 0,
	viewHeight: 0,
	contentWidth: 0,
	contentHeight: 0,
	overWatcher: undefined,
	scrollLock: false,

	constructor: function(config) {
		this.addEvents('scroll');
		this.contentBox = new Ui.VBoxScrollableContent();
		this.connect(this.contentBox, 'scroll', this.onScroll);
		this.connect(this.contentBox, 'down', this.autoShowScrollbars);
		this.connect(this.contentBox, 'inertiaend', this.autoHideScrollbars);
		this.appendChild(this.contentBox);

		this.scrollbarHorizontalBox = new Ui.Movable({ moveVertical: false });
		this.connect(this.scrollbarHorizontalBox, 'down', this.autoShowScrollbars);
		this.connect(this.scrollbarHorizontalBox, 'up', this.autoHideScrollbars);
		this.connect(this.scrollbarHorizontalBox, 'move', this.onScrollbarHorizontalMove);
		this.appendChild(this.scrollbarHorizontalBox);

		this.scrollbarVerticalBox = new Ui.Movable({ moveHorizontal: false });
		this.connect(this.scrollbarVerticalBox, 'down', this.autoShowScrollbars);
		this.connect(this.scrollbarVerticalBox, 'up', this.autoHideScrollbars);
		this.connect(this.scrollbarVerticalBox, 'move', this.onScrollbarVerticalMove);
		this.appendChild(this.scrollbarVerticalBox);

		// handle mouse auto-hide bars
		this.scrollbarHorizontalBox.setOpacity(0);
		this.scrollbarVerticalBox.setOpacity(0);

		this.connect(this, 'ptrmove', function(event) {
			if(!this.getIsDisabled() && !event.pointer.getIsDown() && (this.overWatcher === undefined)) {
				this.overWatcher = event.pointer.watch(this);
				this.isOver = true;
				// enter
				this.autoShowScrollbars();

				this.connect(this.overWatcher, 'move', function() {
					if(!this.overWatcher.getIsInside())
						this.overWatcher.cancel();
				});
				this.connect(this.overWatcher, 'down', function() {
					this.overWatcher.cancel();
				});
				this.connect(this.overWatcher, 'up', function() {
					this.overWatcher.cancel();
				});
				this.connect(this.overWatcher, 'cancel', function() {
					this.overWatcher = undefined;
					this.isOver = false;
					// leave
					this.autoHideScrollbars();
				});
			}
		});

		this.connect(this, 'wheel', this.onWheel);
	},

	reload: function() {
		this.contentBox.reload();
	},

	getActiveItems: function() {
		return this.contentBox.getActiveItems();
	},

	setLoader: function(loader) {
		this.contentBox.setLoader(loader);
	},

	setMaxScale: function(maxScale) {
		this.contentBox.setMaxScale(maxScale);
	},

	setContent: function(content) {
		this.contentBox.setContent(content);
	},

	getContent: function() {
		return this.contentBox.getContent();
	},

	getScrollHorizontal: function() {
		return this.scrollHorizontal;
	},
	
	setScrollHorizontal: function(scroll) {
		if(scroll !== this.scrollHorizontal) {
			this.scrollHorizontal = scroll;
			this.invalidateMeasure();
		}
	},

	getScrollVertical: function() {
		return this.scrollVertical;
	},

	setScrollVertical: function(scroll) {
		if(scroll !== this.scrollVertical) {
			this.scrollVertical = scroll;
			this.invalidateMeasure();
		}
	},

	setScrollbarVertical: function(scrollbarVertical) {
		this.scrollbarVerticalBox.setContent(scrollbarVertical);
	},

	setScrollbarHorizontal: function(scrollbarHorizontal) {
		this.scrollbarHorizontalBox.setContent(scrollbarHorizontal);
	},
	
	setOffset: function(offsetX, offsetY, absolute, force) {

		if(absolute === undefined)
			absolute = false;
		if(offsetX === undefined)
			offsetX = this.offsetX;
		else if(!absolute)
			offsetX *= this.contentWidth - this.viewWidth;
		if(offsetY === undefined)
			offsetY = this.offsetY;
		else if(!absolute)
			offsetY *= this.contentHeight - this.viewHeight;

		if(offsetX < 0)
			offsetX = 0;
		else if(this.viewWidth + offsetX > this.contentWidth)
			offsetX = this.contentWidth - this.viewWidth;
		if(offsetY < 0)
			offsetY = 0;
		else if(this.viewHeight + offsetY > this.contentHeight)
			offsetY = this.contentHeight - this.viewHeight;
			
		this.relativeOffsetX = offsetX / (this.contentWidth - this.viewWidth);
		this.relativeOffsetY = offsetY / (this.contentHeight - this.viewHeight);

		if((this.offsetX !== offsetX) || (this.offsetY !== offsetY)) {
			this.offsetX = offsetX;
			this.offsetY = offsetY;
			this.contentBox.setOffset(offsetX, offsetY);
			return true;
		}
		else
			return false;
	},

	getOffsetX: function() {
		return this.contentBox.getOffsetX();
	},

	getRelativeOffsetX: function() {
		return this.relativeOffsetX;
	},

	getOffsetY: function() {
		return this.contentBox.getOffsetY();
	},
	
	getRelativeOffsetY: function() {
		return this.relativeOffsetY;
	},

	onWheel: function(event) {
		if(this.setOffset(this.contentBox.getOffsetX() + event.deltaX*3, this.contentBox.getOffsetY() + event.deltaY*3, true)) {
			event.stopPropagation();
		}
	},

	autoShowScrollbars: function() {
//		console.log('autoShowScrollbars');
		if(this.showClock === undefined) {
			this.showClock = new Anim.Clock({ duration: 'forever' });
			this.connect(this.showClock, 'timeupdate', this.onShowBarsTick);
			this.showClock.begin();
		}
	},

	autoHideScrollbars: function() {
//		console.log('autoHideScrollbars '+this.scrollbarVerticalBox.getIsDown());

		if(this.contentBox.getIsDown() || this.contentBox.getIsInertia() || this.isOver ||
		   this.scrollbarVerticalBox.getIsDown() || this.scrollbarHorizontalBox.getIsDown())
			return;
		if(this.showClock === undefined) {
			this.showClock = new Anim.Clock({ duration: 'forever' });
			this.connect(this.showClock, 'timeupdate', this.onShowBarsTick);
			this.showClock.begin();
		}
	},

	onShowBarsTick: function(clock, progress, delta) {
		var show = (this.contentBox.getIsDown() || this.contentBox.getIsInertia() || this.isOver);
		var show = (this.contentBox.getIsDown() || this.contentBox.getIsInertia() || this.isOver ||
		   this.scrollbarVerticalBox.getIsDown() || this.scrollbarHorizontalBox.getIsDown());

		var stop = false;
		var speed = 2;

		var opacity = this.scrollbarHorizontalBox.getOpacity();
		if(show) {
			opacity += (delta * speed);
			if(opacity >= 1) {
				opacity = 1;
				stop = true;
			}
		}
		else {
			opacity -= (delta * speed);
			if(opacity <= 0) {
				opacity = 0;
				stop = true;
			}
		}
		this.scrollbarHorizontalBox.setOpacity(opacity);
		this.scrollbarVerticalBox.setOpacity(opacity);
		if(stop) {
			this.showClock.stop();
			this.showClock = undefined;
		}
	},

	onScroll: function() {
		this.updateOffset();
		this.fireEvent('scroll', this, this.offsetX, this.offsetY);
	},

	updateOffset: function() {
		if(this.contentBox === undefined)
			return;

//		console.log('updateOffset');

		this.offsetX = this.contentBox.getOffsetX();
		this.offsetY = this.contentBox.getOffsetY();

		this.viewWidth = this.getLayoutWidth();
		this.viewHeight = this.getLayoutHeight();

//		this.viewWidth = this.contentBox.getDrawing().clientWidth;
//		this.viewHeight = this.contentBox.getDrawing().clientHeight;

		//this.contentWidth = this.contentBox.getContent().getLayoutWidth();
		//this.contentHeight = this.contentBox.getContent().getLayoutHeight();

		this.contentWidth = this.contentBox.getContentWidth();
		this.contentHeight = this.contentBox.getContentHeight();

//		this.contentWidth = this.contentBox.getDrawing().scrollWidth;
//		this.contentHeight = this.contentBox.getDrawing().scrollHeight;

		this.relativeOffsetX = this.offsetX / (this.contentWidth - this.viewWidth);
		this.relativeOffsetY = this.offsetY / (this.contentHeight - this.viewHeight);

//		console.log(this+'.updateOffset content: '+this.contentWidth+'x'+this.contentHeight+
//			' ofs: '+this.offsetX+','+this.offsetY+', view: '+this.viewWidth+'x'+this.viewHeight);

		if(this.contentHeight > this.viewHeight)
			this.scrollbarVerticalNeeded = true;
		else
			this.scrollbarVerticalNeeded = false;
		if(this.contentWidth > this.viewWidth)
			this.scrollbarHorizontalNeeded = true;
		else
			this.scrollbarHorizontalNeeded = false;
	
//		console.log('updateOffset content size: '+this.contentWidth+'x'+this.contentHeight+', scroll vert: '+this.scrollbarVerticalNeeded);

		if(this.scrollbarVerticalNeeded) {
			this.scrollbarVerticalHeight = Math.max((this.viewHeight / this.contentHeight) * this.viewHeight, this.scrollbarVerticalBox.getMeasureHeight());
//			console.log('vert scroll bar size: '+this.scrollbarVerticalBox.getMeasureWidth());
			this.scrollbarVerticalBox.arrange(this.getLayoutWidth() - this.scrollbarVerticalBox.getMeasureWidth(), 0,
				this.scrollbarVerticalBox.getMeasureWidth(), this.scrollbarVerticalHeight);
			this.scrollbarVerticalBox.show();//setOpacity(1);
		}
		else {
			this.scrollbarVerticalBox.hide(); //setOpacity(0);
			this.offsetY = 0;
		}
		if(this.scrollbarHorizontalNeeded) {
			this.scrollbarHorizontalWidth = Math.max((this.viewWidth / this.contentWidth) * this.viewWidth, this.scrollbarHorizontalBox.getMeasureWidth());
			this.scrollbarHorizontalBox.arrange(0, this.getLayoutHeight() - this.scrollbarHorizontalBox.getMeasureHeight(),
				this.scrollbarHorizontalWidth, this.scrollbarHorizontalBox.getMeasureHeight());
			this.scrollbarHorizontalBox.show();//setOpacity(1);
		}
		else {
			this.scrollbarHorizontalBox.hide();//setOpacity(0);
			this.offsetX = 0;
		}


		this.scrollLock = true;
		if(this.scrollbarHorizontalNeeded) {
			var relOffsetX = this.offsetX / (this.contentWidth - this.viewWidth);
			if(relOffsetX > 1) {
				relOffsetX = 1;
				this.setOffset(relOffsetX, undefined);
			}
			this.scrollbarHorizontalBox.setPosition((this.viewWidth - this.scrollbarHorizontalWidth) * relOffsetX, undefined);
		}
		if(this.scrollbarVerticalNeeded) {
			var relOffsetY = this.offsetY / (this.contentHeight - this.viewHeight);
			if(relOffsetY > 1) {
				relOffsetY = 1;
				this.setOffset(undefined, relOffsetY);
			}
			this.scrollbarVerticalBox.setPosition(undefined, (this.viewHeight - this.scrollbarVerticalHeight) * relOffsetY);
		}
		this.scrollLock = false;
	},

	onScrollbarHorizontalMove: function(movable) {
		if(this.scrollLock)
			return;

		var totalWidth = this.viewWidth - this.scrollbarHorizontalBox.getLayoutWidth();
		var offsetX = Math.min(1, Math.max(0, movable.getPositionX() / totalWidth));
		this.setOffset(offsetX, undefined);
		movable.setPosition(offsetX * totalWidth, undefined);
	},

	onScrollbarVerticalMove: function(movable) {
		if(this.scrollLock)
			return;

		var totalHeight = this.viewHeight - this.scrollbarVerticalBox.getLayoutHeight();
		var offsetY = Math.min(1, Math.max(0, movable.getPositionY() / totalHeight));
		this.setOffset(undefined, offsetY);
		movable.setPosition(undefined, offsetY * totalHeight);
	}
}, {
	measureCore: function(width, height) {
		var size = { width: 0, height: 0 };

		this.scrollbarHorizontalBox.measure(width, height);
		var sSize = this.scrollbarVerticalBox.measure(width, height);

		var contentSize = this.contentBox.measure(width, height);
		if(contentSize.width < width)
			size.width = contentSize.width;
		else
			size.width = width;
		if(contentSize.height < height)
			size.height = contentSize.height;
		else
			size.height = height;
		if(!this.scrollVertical)
			size.height = contentSize.height;
		if(!this.scrollHorizontal)
			size.width = contentSize.width;
		return size;
	},

	arrangeCore: function(width, height) {
		this.viewWidth = width;
		this.viewHeight = height;
		this.contentBox.arrange(0, 0, this.viewWidth, this.viewHeight);
		this.contentWidth = this.contentBox.getContentWidth();
		this.contentHeight = this.contentBox.getContentHeight();
		this.updateOffset();
	}
});

Ui.Transformable.extend('Ui.VBoxScrollableContent', {
	contentWidth: 0,
	contentHeight: 0,
	estimatedHeight: 36,
	estimatedHeightNeeded: true,
	loader: undefined,
	activeItems: undefined,
	activeItemsPos: 0,
	activeItemsY: 0,
	activeItemsHeight: 0,

	constructor: function(config) {
		this.addEvents('scroll');

		this.activeItems = [];

		this.setClipToBounds(true);
		this.connect(this.getDrawing(), 'scroll', function() {
			this.translateX -= this.getDrawing().scrollLeft;
			this.translateY -= this.getDrawing().scrollTop;
			this.getDrawing().scrollLeft = 0;
			this.getDrawing().scrollTop = 0;
			this.onContentTransform();
		});
		this.setAllowTranslate(true);
		this.setAllowRotate(false);
		this.setMinScale(1);
		this.setMaxScale(1);
		this.setInertia(true);
		this.setTransformOrigin(0, 0);

		this.removeChild(this.contentBox);
//		this.contentBox = new Ui.Container();
//		this.contentBox.setTransformOrigin(0, 0);
//		this.appendChild(this.contentBox);
	},

	setLoader: function(loader) {
		if(this.loader !== loader) {
			if(this.loader !== undefined)
				this.disconnect(this.loader, 'change', this.onLoaderChange);
			this.loader = loader;
			if(this.loader !== undefined)
				this.connect(this.loader, 'change', this.onLoaderChange);
			this.reload();
		}
	},

	getActiveItems: function() {
		return this.activeItems;
	},

	getOffsetX: function() {
		return -this.getTranslateX();
	},

	getOffsetY: function() {
		return Math.max(0, (((-this.getTranslateY())/this.getScale()) - this.getMinY()) * this.getScale());
	},

	setOffset: function(x, y) {
		var minY = this.getMinY();
		var translateY = -(((y / this.getScale()) + minY)*this.getScale());

//		console.log(this+'.setOffset('+x+','+y+') content: '+this.getContentWidth()+'x'+this.getContentHeight()+
//			' view: '+this.getLayoutWidth()+'x'+this.getLayoutHeight()+
//			', transY: '+translateY+', activeY: '+this.activeItemsY+', activePos: '+this.activeItemsPos+
//			', minY: '+minY);
		
//		this.translateX = -x;
//		this.translateY = translateY;
//		this.loadItems();

//		return (((-this.getTranslateY())/this.getScale()) - minY) * this.getScale();

//		var itemsBefore = (this.activeItemsPos-this.loader.getMin());
//		var minY = this.activeItemsY - (itemsBefore * this.estimatedHeight);
//		minY *= this.getScale();
//		console.log('setOffset minY: '+minY+', activeItemsPos: '+this.activeItemsPos+', activeItemsY: '+this.activeItemsY+', estimatedHeight: '+this.estimatedHeight);
//		y -= minY;
		this.setContentTransform(-x, translateY, undefined, undefined);
	},

	getContentWidth: function() {
		return this.contentWidth;
	},

	getContentHeight: function() {
		return this.getEstimatedContentHeight() * this.getScale();
	},

	getEstimatedContentHeight: function() {
		var itemsBefore = (this.activeItemsPos-this.loader.getMin());
		var itemsAfter = (this.loader.getMax() + 1 - (this.activeItemsPos+this.activeItems.length));
		var minY = this.activeItemsY - (itemsBefore * this.estimatedHeight);
		var maxY = this.activeItemsY + this.activeItemsHeight + (itemsAfter * this.estimatedHeight);
		return maxY - minY;
	},

	getMinY: function() {
		var itemsBefore = (this.activeItemsPos-this.loader.getMin());
		var minY = this.activeItemsY - (itemsBefore * this.estimatedHeight);
		return minY;
	},

	getMaxY: function() {
		var itemsAfter = (this.loader.getMax() + 1 - (this.activeItemsPos+this.activeItems.length));
		var maxY = this.activeItemsY + this.activeItemsHeight + (itemsAfter * this.estimatedHeight);
		return maxY;
	},

	loadItems: function() {
		if(this.loader.getMax() - this.loader.getMin() < 0)
			return;
		var w = this.getLayoutWidth();
		var h = this.getLayoutHeight();
		if((w === 0) || (h === 0))
			return;
		
		// find the visible part
		var matrix = this.getMatrix();

		var invMatrix = matrix.inverse();

		var p0 = (new Ui.Point({ x: 0, y: 0 })).multiply(invMatrix);
		var p1 = (new Ui.Point({ x: w, y: h })).multiply(invMatrix);

		var refPos;
		var refY;
		var stillActiveItems = [];
		var stillActiveHeight = 0;

		// find active items still visible
		var y = this.activeItemsY;
		for(i = 0; i < this.activeItems.length; i++) {
			var activeItem = this.activeItems[i];
			var itemHeight = activeItem.getMeasureHeight();
			// still active
			if(((y >= p0.y) && (y <= p1.y)) || ((y+itemHeight >= p0.y) && (y+itemHeight <= p1.y)) ||
			   ((y <= p0.y) && (y+itemHeight >= p1.y))) {

				if(refPos === undefined) {
					refPos = (i+this.activeItemsPos);
					refY = y;
				}
				stillActiveItems.push(activeItem);
				stillActiveHeight += activeItem.getMeasureHeight();
			}
			// no more visible, remove it
			else {
				this.removeChild(activeItem);
			}
			y += itemHeight;
		}

		if(refPos === undefined) {
//			console.log('NO REFPOS');
			refPos = Math.floor((-this.translateY) / (this.estimatedHeight * this.getScale()));
			refPos = Math.max(this.loader.getMin(), Math.min(this.loader.getMax(), refPos));
//			refY = (-this.translateY) - (refPos * this.estimatedHeight);
			refY = -this.translateY / this.getScale();
//			console.log('refPos: '+refPos+', refY: '+refY);
			this.activeItemsPos = refPos;
			this.activeItems = [];

			var item = this.loader.getElementAt(refPos);
			this.appendChild(item);
			var size = item.measure(w, h);
//			console.log('measure item refPos: '+refPos+', size: '+size+', item: '+item+', w: '+w+', h: '+h);
			item.arrange(0, 0, w, size.height);
			item.setTransformOrigin(0, 0);

			this.activeItems.push(item);
			this.activeItemsHeight = size.height;
//			this.estimatedHeight = undefined;
		}
		else {
			this.activeItemsPos = refPos;
			this.activeItems = stillActiveItems;
			this.activeItemsHeight = stillActiveHeight;
			refMatrix = matrix.clone().translate(0, refY);
		}
//		console.log('refPos: '+refPos+', refY: '+refY);

		// build what is missing before the active items
		while(refY > p0.y) {
			var pos = this.activeItemsPos - 1;
			if(pos < this.loader.getMin())
				break;
			
			var item = this.loader.getElementAt(pos);
			this.prependChild(item);
			var size = item.measure(w, h);
			item.arrange(0, 0, w, size.height);
			item.setTransformOrigin(0, 0);

			this.activeItems.unshift(item);
			this.activeItemsHeight += size.height;
			refY -= size.height;
			this.activeItemsPos = pos;
		}

		// build what is missing after the active items
		while(refY + this.activeItemsHeight < p1.y) {
			var pos = this.activeItemsPos + this.activeItems.length;
			if(pos > this.loader.getMax())
				break;

			var item = this.loader.getElementAt(pos);
			this.appendChild(item);
			var size = item.measure(w, h);
			item.arrange(0, 0, w, size.height);
			item.setTransformOrigin(0, 0);

			this.activeItems.push(item);
			this.activeItemsHeight += size.height;
		}

		this.activeItemsY = refY;
		this.activeItemsHeight = 0;
		for(var i = 0; i < this.activeItems.length; i++) {
			var item = this.activeItems[i];
			item.setTransform(matrix.clone().translate(0, this.activeItemsY + this.activeItemsHeight));
			this.activeItemsHeight += item.getMeasureHeight();
		}


		if(this.estimatedHeightNeeded) {
			this.estimatedHeightNeeded = false;
			this.estimatedHeight = this.activeItemsHeight / this.activeItems.length;
		}

//		console.log('loadItems '+p0.y+' <=> '+p1.y+', activeY: '+this.activeItemsY+
//			', estimatedHeight: '+this.estimatedHeight+', minY: '+this.getMinY()+
//			', maxY: '+this.getMaxY()+', ofsY: '+this.getOffsetY()+', transY: '+this.translateY);
	},

	updateItems: function() {
		var w = this.getLayoutWidth();
		var h = this.getLayoutHeight();

	},

	reload: function() {
		for(var i = 0; i < this.activeItems.length; i++)
			this.removeChild(this.activeItems[i]);
		this.activeItems = [];
		this.activeItemsPos = 0;
		this.activeItemsY = 0;
		this.activeItemsHeight = 0;
		this.estimatedHeightNeeded = true;
		this.setContentTransform(0, 0, 1, 0);
	},

	onLoaderChange: function() {
		this.reload();
	}
}, {
	measureCore: function(width, height)  {
//		console.log(this+'.measureCore('+width+','+height+')');
//		Ui.VBoxScrollableContent.base.measureCore.call(this, width, height);


		var y = 0;
		for(var i = 0; i < this.activeItems.length; i++) {
			var item = this.activeItems[i];
			var size = item.measure(width, 0);
			y += size.height;
		}
		this.activeItemsHeight = y;
//		this.estimatedHeight = this.activeItemsHeight / this.activeItems.length;*/

		return { width: width, height: this.getEstimatedContentHeight() };
	},

	arrangeCore: function(width, height) {
//		console.log(this+'.arrangeCore('+width+','+height+')');
//		Ui.VBoxScrollableContent.base.arrangeCore.call(this, Math.max(width, this.getMeasureWidth()), Math.max(height, this.getMeasureHeight()));
		for(var i = 0; i < this.activeItems.length; i++) {
			var activeItem = this.activeItems[i];
			activeItem.arrange(0, 0, width, activeItem.getMeasureHeight());
		}
		this.loadItems();
//		this.onContentTransform();
	},

	onContentTransform: function(testOnly) {
		var scale = this.getScale();

		if(this.translateX > 0)
			this.translateX = 0;
		
		// TEST
		var itemsBefore = (this.activeItemsPos-this.loader.getMin());
		var itemsAfter = (this.loader.getMax() + 1 - (this.activeItemsPos+this.activeItems.length));

//		console.log('items before: '+itemsBefore);
//		console.log('items after: '+itemsAfter);
		
		var minY = this.activeItemsY - (itemsBefore * this.estimatedHeight);
		var maxY = this.activeItemsY + this.activeItemsHeight + (itemsAfter * this.estimatedHeight);
//		var minY = this.translateY + this.activeItemsY - ((this.loader.getMin() - this.activeItemsPos-1) * this.estimatedHeight);
//		var maxY = this.translateY + this.activeItemsY + this.activeItemsHeight + ((this.loader.getMax() + 1 - (this.activeItemsPos+this.activeItems.length)) * this.estimatedHeight);
//		console.log('minY: '+minY+', maxY: '+maxY+', estimated: '+this.estimatedHeight);

		minY *= scale;
		maxY *= scale;

		var viewWidth = this.getLayoutWidth();
		var viewHeight = this.getLayoutHeight();

		this.contentWidth = this.getLayoutWidth()*scale;
		this.contentHeight = this.getEstimatedContentHeight()*scale;

//		console.log(this+'.onContentTransform contentWidth: '+this.contentWidth+', viewWidth: '+viewWidth+', translateY: '+this.translateY);

//		this.contentHeight = this.estimatedHeight * (this.loader.getMax() + 1);
//		this.contentHeight = this.getFirstChild().getLayoutHeight()*scale;

		this.translateX = Math.max(this.translateX, -(this.contentWidth - viewWidth));
//		this.translateY = Math.max(this.translateY, -(this.contentHeight - viewHeight));

		if(this.translateY < -(maxY-viewHeight))
			this.translateY = -(maxY-viewHeight);
		if(this.translateY > -minY)
			this.translateY = -minY;


		// find the corresponding pos

//		Ui.VBoxScrollableContent.base.onContentTransform.apply(this, arguments);

		this.loadItems();

//		console.log(this+'.onContentTransform '+(this.getLayoutWidth()*scale)+'x'+(this.getLayoutHeight()*scale));
		this.contentWidth = this.getLayoutWidth()*scale;
		this.contentHeight = this.getEstimatedContentHeight()*scale;

		if(testOnly !== true)
			this.fireEvent('scroll', this);
	},

	onChildInvalidateMeasure: function(child, event) {
//		console.log(this+'.onChildInvalidateMeasure event: '+event);
//		Ui.VBoxScrollableContent.base.onChildInvalidateMeasure.apply(this, arguments);
		this.invalidateLayout();
//		if(this.loader !== undefined)
//			this.loadItems();
	}
});

Ui.VBoxScrollable.extend('Ui.VBoxScrollingArea', {
	horizontalScrollbar: undefined,
	verticalScrollbar: undefined,

	constructor: function(config) {
		this.horizontalScrollbar = new Ui.Rectangle({ width: 30, height: 4, margin: 5 });
		this.setScrollbarHorizontal(this.horizontalScrollbar);
		this.verticalScrollbar = new Ui.Rectangle({ width: 4, height: 30, margin: 5 });
		this.setScrollbarVertical(this.verticalScrollbar);
	}
}, {
	onStyleChange: function() {
		var radius = this.getStyleProperty('radius');
		this.horizontalScrollbar.setRadius(radius);
		this.verticalScrollbar.setRadius(radius);
	
		var color = this.getStyleProperty('color');
		this.horizontalScrollbar.setFill(color);
		this.verticalScrollbar.setFill(color);
	}
}, {
	style: {
		color: '#999999',
		radius: 0
	}
});
