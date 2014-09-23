
Ui.Container.extend('Ui.Scrollable', {	
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
	relativeOffsetX: 0,
	relativeOffsetY: 0,
	viewWidth: 0,
	viewHeight: 0,
	contentWidth: 0,
	contentHeight: 0,
	overWatcher: undefined,
	scrollLock: false,

	constructor: function(config) {
		this.addEvents('scroll');
		this.contentBox = new Ui.ScrollableContent();
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

	setMaxScale: function(maxScale) {
		this.contentBox.setMaxScale(maxScale);
	},

	setContent: function(content) {
		this.contentBox.setContent(content);
	},

	getContent: function() {
		return this.contentBox.getContent();
	},

	getInertia: function() {
		return this.contentBox.getInertia();
	},

	setInertia: function(inertiaActive) {
		this.contentBox.setInertia(inertiaActive);
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

		if(this.contentWidth <= this.viewWidth)
			this.relativeOffsetX = 0;
		else
			this.relativeOffsetX = offsetX / (this.contentWidth - this.viewWidth);
		if(this.contentHeight <= this.viewHeight)
			this.relativeOffsetY = 0;
		else
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

	getScale: function() {
		return this.contentBox.getScale();
	},

	setScale: function(scale) {
		this.contentBox.setScale(scale);
	},

	getIsDown: function() {
		return this.contentBox.getIsDown();
	},

	getIsInertia: function() {
		return this.contentBox.getIsInertia();
	},

	onWheel: function(event) {
		if(this.setOffset(this.contentBox.getOffsetX() + event.deltaX*3, this.contentBox.getOffsetY() + event.deltaY*3, true)) {
			event.stopPropagation();
		}
	},

	autoShowScrollbars: function() {
		if(this.showClock === undefined) {
			this.showClock = new Anim.Clock({ duration: 'forever' });
			this.connect(this.showClock, 'timeupdate', this.onShowBarsTick);
			this.showClock.begin();
		}
	},

	autoHideScrollbars: function() {
		if(this.contentBox.getIsDown() || this.contentBox.getIsInertia() || this.isOver)
			return;
		if(this.showClock === undefined) {
			this.showClock = new Anim.Clock({ duration: 'forever' });
			this.connect(this.showClock, 'timeupdate', this.onShowBarsTick);
			this.showClock.begin();
		}
	},

	onShowBarsTick: function(clock, progress, delta) {
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

		if(this.contentWidth <= this.viewWidth)
			this.relativeOffsetX = 0;
		else
			this.relativeOffsetX = this.offsetX / (this.contentWidth - this.viewWidth);
		if(this.contentHeight <= this.viewHeight)
			this.relativeOffsetY = 0;
		else
			this.relativeOffsetY = this.offsetY / (this.contentHeight - this.viewHeight);

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
	onScrollIntoView: function(el) {
		var matrix = Ui.Matrix.createTranslate(this.offsetX, this.offsetY);
		matrix.multiply(el.transformToElement(this));
		var p0 = new Ui.Point({ x: 0, y: 0 });
		p0.matrixTransform(matrix);
		var p1 = new Ui.Point({ x: el.getLayoutWidth(), y: el.getLayoutHeight() });
		p1.matrixTransform(matrix);

		// test if scroll vertical is needed
		if((p0.y < this.offsetY) || (p0.y > this.offsetY + this.viewHeight) ||
		   (p1.y > this.offsetY + this.viewHeight)) {
			if(Math.abs(this.offsetY + this.viewHeight - p1.y) < Math.abs(this.offsetY - p0.y))
				this.setOffset(this.offsetX, p1.y - this.viewHeight, true);
			else
				this.setOffset(this.offsetX, p0.y, true);
			this.contentBox.stopInertia();
		}
		// test if scroll horizontal is needed
		if((p0.x < this.offsetX) || (p0.x > this.offsetX + this.viewWidth) ||
		   (p1.x > this.offsetX + this.viewWidth)) {
			if(Math.abs(this.offsetX + this.viewWidth - p1.x) < Math.abs(this.offsetX - p0.x))
				this.setOffset(p1.x - this.viewWidth, this.offsetY, true);
			else
				this.setOffset(p0.x, this.offsetY, true);
			this.contentBox.stopInertia();
		}
		Ui.Scrollable.base.onScrollIntoView.apply(this, arguments);
	},

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
	
Ui.Transformable.extend('Ui.ScrollableContent', {
	contentWidth: 0,
	contentHeight: 0,

	constructor: function(config) {
		this.addEvents('scroll');

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
		this.setTransformOrigin(0, 0);
		this.setInertia(true);
	},	

	getOffsetX: function() {
		return -this.getTranslateX();
	},

	getOffsetY: function() {
		return -this.getTranslateY();
	},

	setOffset: function(x, y) {
		this.setContentTransform(-x, -y, undefined, undefined);
	},

	getContentWidth: function() {
		return this.contentWidth;
	},

	getContentHeight: function() {
		return this.contentHeight;
	}

}, {
	arrangeCore: function(width, height) {
		Ui.ScrollableContent.base.arrangeCore.call(this, Math.max(width, this.getMeasureWidth()), Math.max(height, this.getMeasureHeight()));
		this.onContentTransform();
	},

	onContentTransform: function(testOnly) {
		var scale = this.getScale();
		if(this.translateX > 0)
			this.translateX = 0;
		if(this.translateY > 0)
			this.translateY = 0;
		
		var viewWidth = this.getLayoutWidth();
		var viewHeight = this.getLayoutHeight();

		this.contentWidth = this.getFirstChild().getLayoutWidth()*scale;
		this.contentHeight = this.getFirstChild().getLayoutHeight()*scale;

		this.translateX = Math.max(this.translateX, -(this.contentWidth - viewWidth));
		this.translateY = Math.max(this.translateY, -(this.contentHeight - viewHeight));

		Ui.ScrollableContent.base.onContentTransform.apply(this, arguments);
		//var content = this.scroll.getContent();
//		this.transformableContent.setTransform(Ui.Matrix.createScale(this.getScale(), this.getScale()));
//		// apply the translation part to the scrolling area
//		// this is possible because the 2D transform change the scrollWidth and scrollHeight
//		// but be carefull, 3D transform dont change the layout and the scroll size
//		// will not be update so this will not work.
//		// (-webkit-backface-visibility: hidden also break this).
//		this.scroll.setOffset(-this.getTranslateX(), -this.getTranslateY(), true);
//		this.scroll.updateOffset();
//		this.translateX = -this.scroll.getOffsetX();
//		this.translateY = -this.scroll.getOffsetY();

//		console.log(this+'.onContentTransform '+(this.getLayoutWidth()*scale)+'x'+(this.getLayoutHeight()*scale));
		this.contentWidth = this.getFirstChild().getLayoutWidth()*scale;
		this.contentHeight = this.getFirstChild().getLayoutHeight()*scale;
		if(testOnly !== true) {
			this.fireEvent('scroll', this);
		}
	}
});
	
