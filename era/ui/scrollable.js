Ui.Container.extend('Ui.Scrollable', 
/**@lends Ui.Scrollable#*/
{
	viewWidth: 0,
	viewHeight: 0,
	contentWidth: 0,
	contentHeight: 0,
	horizontalBarWidth: 0,
	verticalBarHeight: 0,
	offsetX: 0,
	offsetY: 0,
	relativeOffsetX: 0,
	relativeOffsetY: 0,
	mouseButton: 0,
	speedX: 0,
	speedY: 0,
	isMoving: false,
	mouseStart: undefined,
	touchStart: undefined,
	verticalFingerStart: undefined,
	horizontalFingerStart: undefined,
	touchId: undefined,
	catcher: undefined,
	window: undefined,
	iframe: undefined,
	speedBuffer: undefined,

	scrollHorizontal: true,
	scrollVertical: true,

	contentBox: undefined,

	scrollbarHorizontalBox: undefined,
	scrollbarHorizontal: undefined,

	scrollbarVerticalBox: undefined,
	scrollbarVertical: undefined,

	showShadows: false,
	topShadowBox: undefined,
	bottomShadowBox: undefined,
	leftShadowBox: undefined,
	rightShadowBox: undefined,

	lock: false,
	overScroll: true,

	showScrollbar: true,
	showClock: undefined,
	nextShow: true,
	hideTimeout: undefined,
	directionLock: false,
	directionRelease: false,

	/**
     * @constructs
	 * @class
     * @extends Ui.Container
     * @param {Boolean} [config.scrollHorizontal] Whether or not the scrollable allow horizontal scrolling
     * @param {Boolean} [config.scrollVertical] Whether or not the scrollable allow vertical scrolling
	 * @param {Boolean} [config.overScroll] If true, let user scroll over the container content on touch devices. If false, oblige him to use the scrollbar.
	 */
	constructor: function(config) {
		this.addEvents('scroll');
	
		this.scrollbarHorizontalBox = new Ui.LBox();
		this.appendChild(this.scrollbarHorizontalBox);

		this.scrollbarVerticalBox = new Ui.LBox();
		this.appendChild(this.scrollbarVerticalBox);

		this.topShadowBox = new Ui.LBox();
		this.appendChild(this.topShadowBox);

		this.bottomShadowBox = new Ui.LBox();
		this.appendChild(this.bottomShadowBox);

		this.leftShadowBox = new Ui.LBox();
		this.appendChild(this.leftShadowBox);

		this.rightShadowBox = new Ui.LBox();
		this.appendChild(this.rightShadowBox);

//		this.setFocusable(true);
		this.connect(this.getDrawing(), 'mousedown', this.onMouseDown);
		this.connect(this.getDrawing(), 'mousedown', this.onMouseDownCtrl, true);
		this.connect(this.getDrawing(), 'mousewheel', this.onMouseWheel);
		this.connect(this.getDrawing(), 'DOMMouseScroll', this.onMouseWheel);

		this.connect(this.getDrawing(), 'fingerdown', this.onFingerDown);
		this.connect(this.getDrawing(), 'fingerdown', this.onFingerDownCapture, true);

		this.connect(this.scrollbarHorizontalBox.getDrawing(), 'mousedown', this.onHorizontalMouseDown);
		this.connect(this.scrollbarVerticalBox.getDrawing(), 'mousedown', this.onVerticalMouseDown);

		this.connect(this.scrollbarHorizontalBox.getDrawing(), 'fingerdown', this.onHorizontalFingerDown);
		this.connect(this.scrollbarVerticalBox.getDrawing(), 'fingerdown', this.onVerticalFingerDown);

//		this.connect(this, 'keydown', this.onKeyDown);
	},

	setDirectionRelease: function(release) {
		this.directionRelease = release;
	},

	getDirectionRelease: function() {
		return this.directionRelease;
	},

	setShowShadows: function(showShadows) {
		this.showShadows = showShadows;
		if(this.showShadows) {
			this.topShadowBox.show();
			this.bottomShadowBox.show();
			this.leftShadowBox.show();
			this.rightShadowBox.show();
		}
		else {
			this.topShadowBox.hide();
			this.bottomShadowBox.hide();
			this.leftShadowBox.hide();
			this.rightShadowBox.hide();
		}
	},

	setTopShadow: function(content) {
		this.topShadowBox.setContent(content);
	},

	setBottomShadow: function(content) {
		this.bottomShadowBox.setContent(content);
	},

	setLeftShadow: function(content) {
		this.leftShadowBox.setContent(content);
	},

	setRightShadow: function(content) {
		this.rightShadowBox.setContent(content);
	},

	setShowScrollbar: function(show) {			
		if(this.showScrollbar != show) {
			this.showScrollbar = show;
			if(this.showClock != undefined) {
				this.showClock.abort();
				this.showClock = undefined;
			}
			if(this.hideTimeout != undefined) {
				this.hideTimeout.abort();
				this.hideTimeout = undefined;
			}
			this.invalidateMeasure();
			if(show) {
				this.scrollbarHorizontalBox.setOpacity(1);
				this.scrollbarVerticalBox.setOpacity(1);

			}
			else {
				this.scrollbarHorizontalBox.setOpacity(0);
				this.scrollbarVerticalBox.setOpacity(0);
			}
		}
	},

	getShowScrollbar: function() {
		return this.showScrollbar;
	},

	setOverScroll: function(overScroll) {
		if(overScroll != this.overScroll) {
			this.overScroll = overScroll;
			if(!this.overScroll)
				this.disconnect(this.getDrawing(), 'fingerdown', this.onFingerDown);
			else
				this.connect(this.getDrawing(), 'fingerdown', this.onFingerDown);
		}
	},

	setLock: function(lock) {
		this.lock = lock;
		if(lock) {
			this.stopInertia();
		}
	},

	getLock: function() {
		return this.lock;
	},

	setContent: function(content) {
		var scrollingContent = new Ui.ScrollableContent();
		scrollingContent.setContent(Ui.Element.create(content));
		this.setScrollingContent(scrollingContent);
	},

	getContent: function() {
		return this.contentBox.getFirstChild();
	},

	setScrollingContent: function(scrollingContent) {
		if(this.contentBox != undefined) {
			this.disconnect(this.contentBox, 'scroll', this.onContentBoxScroll);
			this.removeChild(this.contentBox);
		}
		this.contentBox = scrollingContent;
		this.prependChild(this.contentBox);
		this.connect(this.contentBox, 'scroll', this.onContentBoxScroll);
	},

	getScrollHorizontal: function() {
		return this.scrollHorizontal;
	},

	setScrollHorizontal: function(scroll) {
		if(scroll != this.scrollHorizontal) {
			this.scrollHorizontal = scroll;
			this.invalidateMeasure();
		}
	},

	getScrollVertical: function() {
		return this.scrollVertical;
	},

	setScrollVertical: function(scroll) {
		if(scroll != this.scrollVertical) {
			this.scrollVertical = scroll;
			this.invalidateMeasure();
		}
	},

	setScrollbarVertical: function(scrollbarVertical) {
		if(this.scrollbarVertical != scrollbarVertical) {
			if(this.scrollbarVertical != undefined)
				this.scrollbarVerticalBox.remove(this.scrollbarVertical);
			this.scrollbarVertical = scrollbarVertical;
			if(this.scrollbarVertical != undefined)
				this.scrollbarVerticalBox.append(this.scrollbarVertical);
		}
	},

	setScrollbarHorizontal: function(scrollbarHorizontal) {
		if(this.scrollbarHorizontal != scrollbarHorizontal) {
			if(this.scrollbarHorizontal != undefined)
				this.scrollbarHorizontalBox.remove(this.scrollbarHorizontal);
			this.scrollbarHorizontal = scrollbarHorizontal;
			if(this.scrollbarHorizontal != undefined)
				this.scrollbarHorizontalBox.append(this.scrollbarHorizontal);
		}
	},

	setOffsetX: function(offset, absolute) {
		this.setOffset(offset, undefined, absolute);
	},

	setOffsetY: function(offset, absolute) {
		this.setOffset(undefined, offset, absolute);
	},

	setOffset: function(offsetX, offsetY, absolute, force) {
//		if(this.offsetLock)
//			return;
//		this.offsetLock = true;

//		if(!this.measureValid) {
//			console.log('setOffset with INVALID MEASURE');
//		var size = this.measure(this.getMeasureWidth(), this.getMeasureHeight());
//		this.arrange(0, 0, size.width, size.height);
//		}

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

	/**#@+
	 * @private
	 */

	onContentBoxScroll: function(content, offsetX, offsetY) {	
//		console.log('onContentBoxScroll isMoving: '+this.isMoving);
		
		if(!this.isMoving) {
			this.offsetX = offsetX;
			this.offsetY = offsetY;
			this.updateOffset();
		}
		
		this.fireEvent('scroll', this);
//		this.setOffset(offsetX, offsetY, true, true);
	},

	onMouseDownCtrl: function(event) {
		if(event.button == 0)
			this.stopInertia();

		if(event.ctrlKey)
			this.onMouseDown(event);
	},

	onMouseDown: function(event) {
		if(this.lock || this.getIsDisabled())
			return;

		if((this.viewWidth >= this.contentWidth) && (this.viewHeight >= this.contentHeight))
			return;

		if(!((event.button == 1) || ((event.button == 0) && (event.ctrlKey || !this.showScrollbar))))
			return;

		this.stopInertia();

		this.directionLock = false;
		this.mouseButton = event.button;
		this.isMoving = true;

		event.preventDefault();
		event.stopPropagation();

		this.window = window;
		this.iframe = undefined;
		if(navigator.isWebkit || navigator.isFirefox3) {
			var rootWindow = Ui.App.getRootWindow();
			if(rootWindow != window) {
				this.window = rootWindow;
				this.iframe = Ui.App.getWindowIFrame();
			}
		}

		this.connect(this.window, 'mouseup', this.onMouseUp, true);
		this.connect(this.window, 'mousemove', this.onMouseMove, true);

		this.catcher = document.createElement('div');
		this.catcher.style.position = 'absolute';
		this.catcher.style.left = '0px';
		this.catcher.style.right = '0px';
		this.catcher.style.top = '0px';
		this.catcher.style.bottom = '0px';
		this.catcher.style.zIndex = 1000;
		this.window.document.body.appendChild(this.catcher);

		this.mouseStart = this.pointFromWindow({ x: event.clientX, y: event.clientY });
		this.startOffsetX = this.offsetX;
		this.startOffsetY = this.offsetY;
		this.startComputeInertia();

		this.showScrollbars();
	},

	onMouseMove: function(event) {
		event.preventDefault();
		event.stopPropagation();

		var point = { x: event.clientX, y: event.clientY };
		if(this.iframe != undefined)
			point = Ui.Element.pointFromWindow(this.iframe, { x: event.clientX, y: event.clientY }, this.window);
		var mousePos = this.pointFromWindow(point);
		var deltaX = mousePos.x - this.mouseStart.x;
		var deltaY = mousePos.y - this.mouseStart.y;

		if(!this.directionLock) {
			var delta = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
			if(delta > 10) {
				var horizontal = Math.abs(deltaX)>Math.abs(deltaY);
				// check if we need to abort the scroll and release the mouse
				if((this.directionRelease) &&((horizontal && !this.scrollHorizontal) || (!horizontal && !this.scrollVertical))) {
					if('createEvent' in document) {
						this.window.document.body.removeChild(this.catcher);

						this.disconnect(this.window, 'mousemove', this.onMouseMove, true);
						this.disconnect(this.window, 'mouseup', this.onMouseUp, true);

						this.stopComputeInertia();
						this.isMoving = false;

						var mouseDownEvent = document.createEvent('MouseEvents');
						mouseDownEvent.initMouseEvent('mousedown', true, true, window, 1, event.screenX, event.screenY,
							event.clientX, event.clientY,
							event.ctrlKey, event.altKey, event.shiftKey,
							event.metaKey, 0, event.target);
						this.getDrawing().offsetParent.dispatchEvent(mouseDownEvent);

						this.hideScrollbars();
						return;
					}
				}
				this.directionLock = true;
			}
		}

		offsetX = this.startOffsetX - deltaX;
		offsetY = this.startOffsetY - deltaY;
		this.setOffset(offsetX, offsetY, true);
		this.measureSpeed();
		this.updateOffset();
	},

	onMouseUp: function(event) {
		event.preventDefault();
		event.stopPropagation();

		if(event.button != this.mouseButton)
			return;

		// last position update
		var point = { x: event.clientX, y: event.clientY };
		if(this.iframe != undefined)
			point = Ui.Element.pointFromWindow(this.iframe, { x: event.clientX, y: event.clientY }, this.window);
		var mousePos = this.pointFromWindow(point);
		var deltaX = mousePos.x - this.mouseStart.x;
		var deltaY = mousePos.y - this.mouseStart.y;
		offsetX = this.startOffsetX - deltaX;
		offsetY = this.startOffsetY - deltaY;
		this.setOffset(offsetX, offsetY, true);

		this.window.document.body.removeChild(this.catcher);

		this.disconnect(this.window, 'mousemove', this.onMouseMove, true);
		this.disconnect(this.window, 'mouseup', this.onMouseUp, true);

		this.isMoving = false;

		this.stopComputeInertia();
		this.startInertia();

		this.hideScrollbars();
	},

	onMouseWheel: function(event) {
		var deltaX = 0;
		var deltaY = 0;

		if((event.wheelDeltaX != undefined) && (event.wheelDelaY != undefined)) {
			deltaX = -event.wheelDeltaX / 5;
			deltaY = -event.wheelDeltaY / 5;
		}
		// Opera, Chrome, IE
		else if(event.wheelDelta != undefined)
			deltaY = -event.wheelDelta / 2;
		// Firefox
		else if(event.detail != undefined)
			deltaY = event.detail * 20;
			
		// scroll horizontaly if vertical not possible
		if(!this.scrollVertical && this.scrollHorizontal && (deltaX === 0))
			deltaX = deltaY;
			
		this.stopInertia();

		if(this.setOffset(this.offsetX + deltaX, this.offsetY + deltaY, true)) {
			event.preventDefault();
			event.stopPropagation();
			this.showScrollbars();
			this.hideTimeoutScrollbars();
		}
	},

	onFingerDownCapture: function(event) {
//		console.log('onFingerDownCapture');
		this.stopInertia();
	},

	onFingerDown: function(event) {
		if(this.lock || this.getIsDisabled() || this.isMoving)
			return;
		if((this.viewWidth >= this.contentWidth) && (this.viewHeight >= this.contentHeight))
			return;

		this.stopInertia();

		this.directionLock = false;

		event.finger.capture(this.getDrawing());
		this.connect(event.finger, 'fingermove', this.onFingerMove);
		this.connect(event.finger, 'fingerup', this.onFingerUp);

		this.isMoving = true;

		event.preventDefault();
		event.stopPropagation();

		this.touchStart = this.pointFromWindow({ x: event.finger.getX(), y: event.finger.getY() });
		this.startOffsetX = this.offsetX;
		this.startOffsetY = this.offsetY;
		
//		console.log('onFingerDown offsetY: '+this.offsetY);
		this.startComputeInertia();

		this.showScrollbars();
	},

	onFingerMove: function(event) {
		event.preventDefault();
		event.stopPropagation();

		var touchPos = this.pointFromWindow({ x: event.finger.getX(), y: event.finger.getY() });
		var deltaX = touchPos.x - this.touchStart.x;
		var deltaY = touchPos.y - this.touchStart.y;

		if(!this.directionLock) {
			var delta = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
			if(delta > 10) {
				var horizontal = Math.abs(deltaX)>Math.abs(deltaY);
				// check if we need to abort the scroll and release the mouse
				if((this.directionRelease) &&((horizontal && !this.scrollHorizontal) || (!horizontal && !this.scrollVertical))) {
					this.isMoving = false;
					this.stopComputeInertia();
					this.disconnect(event.finger, 'fingermove', this.onFingerMove);
					this.disconnect(event.finger, 'fingerup', this.onFingerUp);

					event.finger.release();
					this.hideScrollbars();
					return;
				}
				this.directionLock = true;
			}
		}

		offsetX = this.startOffsetX - deltaX;
		offsetY = this.startOffsetY - deltaY;
		this.setOffset(offsetX, offsetY, true);
		this.measureSpeed();
		this.updateOffset();
	},

	onFingerUp: function(event) {
		event.preventDefault();
		event.stopPropagation();

		// last position update
		var touchPos = this.pointFromWindow({ x: event.finger.getX(), y: event.finger.getY() });
		var deltaX = touchPos.x - this.touchStart.x;
		var deltaY = touchPos.y - this.touchStart.y;
		offsetX = this.startOffsetX - deltaX;
		offsetY = this.startOffsetY - deltaY;
		this.setOffset(offsetX, offsetY, true);

		this.isMoving = false;

//		console.log('onFingerUp offsetY: '+this.offsetY+' (deltaY: '+deltaY+')');
		this.stopComputeInertia();
		this.startInertia();

		this.disconnect(event.finger, 'fingermove', this.onFingerMove);
		this.disconnect(event.finger, 'fingerup', this.onFingerUp);

		this.hideScrollbars();
	},

	onKeyDown: function(keyboard, key) {
		// arrow left
		if(key == 37)
			this.setOffset(this.offsetX - 10, undefined, true);
		// arrow right
		else if(key == 39)
			this.setOffset(this.offsetX + 10, undefined, true);
		// arrow up
		else if(key == 38)
			this.setOffset(undefined, this.offsetY - 10, true);
		// arrow down
		else if(key == 40)
			this.setOffset(undefined, this.offsetY + 10, true);
		// home
		else if(key == 36)
			this.setOffset(0, 0, true);
		// end line
		else if(key == 35)
			this.setOffset(1, 1, false);
//		else
//			console.log('key: '+key);
	},

	measureSpeed: function() {		
		if(this.speedBuffer.length > 20)
			this.speedBuffer.shift();
		this.speedBuffer.push({ time: (new Date().getTime())/1000, x: this.offsetX, y: this.offsetY });
	},

	startComputeInertia: function() {	
		this.speedBuffer = [];
		this.speedBuffer.push({ time: (new Date().getTime())/1000, x: this.offsetX, y: this.offsetY });
		this.speedX = 0;
		this.speedY = 0;
	},

	stopComputeInertia: function() {
		var now = (new Date().getTime())/1000;
		var i = this.speedBuffer.length;
		do {
			var measure = this.speedBuffer[--i];
		}
		while((i > 0) && ((now - measure.time) < 0.08));
		var deltaTime = now - measure.time;
		this.speedX = (this.offsetX - measure.x) / deltaTime;
		this.speedY = (this.offsetY - measure.y) / deltaTime;
	},

	startInertia: function() {
//		console.log('startInertia ('+this.speedX+','+this.speedY+')');
		
		this.isMoving = true;
		
		if(this.inertiaClock === undefined) {
//			var startOffsetX = this.offsetX;
//			var startOffsetY = this.offsetY;
		
			this.inertiaClock = new Anim.Clock({ duration: 'forever', scope: this, target: this,
				onTimeupdate: function(clock, progress, delta) {
//					console.log('onTimeupdate delta: '+delta+', clock: '+clock.getTime());
					///
/*					var t = clock.getTime();
					var x = startOffsetX + (this.speedX * t);
					var y = startOffsetY + (this.speedY * t);
					this.setOffset(x, y, true);
					this.updateOffset();*/
					///					
					if(delta === 0)
						return;

					var oldOffsetX = this.offsetX;
					var oldOffsetY = this.offsetY;

					var offsetX = this.offsetX + (this.speedX * delta);
					var offsetY = this.offsetY + (this.speedY * delta);
					this.setOffset(offsetX, offsetY, true);
					this.updateOffset();

					this.speedX -= this.speedX * delta * 3;
					this.speedY -= this.speedY * delta * 3;
					
//					console.log('speed: '+this.speedY);
					
					if(Math.abs(this.speedX) < 1)
						this.speedX = 0;
					if(Math.abs(this.speedY) < 1)
						this.speedY = 0;
					
					if((this.speedX == 0) && (this.speedY == 0))
						this.stopInertia();
				}
			});
			this.inertiaClock.begin();
		}
	},

	stopInertia: function() {
		this.isMoving = false;
		if(this.inertiaClock != undefined) {
			this.inertiaClock.stop();
			this.inertiaClock = undefined;
		}
	},

	onVerticalMouseDown: function(event) {
		if(this.lock || this.getIsDisabled())
			return;

		if(event.button != 0)
			return;

		this.stopInertia();

		event.preventDefault();
		event.stopPropagation();

		this.window = window;
		this.iframe = undefined;
		if(navigator.isWebkit || navigator.isFirefox3) {
			var rootWindow = Ui.App.getRootWindow();
			if(rootWindow != window) {
				this.window = rootWindow;
				this.iframe = Ui.App.getWindowIFrame();
			}
		}

		this.connect(this.window, 'mouseup', this.onVerticalMouseUp, true);
		this.connect(this.window, 'mousemove', this.onVerticalMouseMove, true);

		this.catcher = document.createElement('div');
		this.catcher.style.position = 'absolute';
		this.catcher.style.left = '0px';
		this.catcher.style.right = '0px';
		this.catcher.style.top = '0px';
		this.catcher.style.bottom = '0px';
		this.catcher.style.zIndex = 1000;
		this.window.document.body.appendChild(this.catcher);

		this.mouseStart = this.pointFromWindow({ x: event.clientX, y: event.clientY });
		this.startOffsetX = this.offsetX;
		this.startOffsetY = this.offsetY;
		this.speedX = 0;
		this.speedY = 0;
	},

	onVerticalMouseMove: function(event) {
		event.preventDefault();
		event.stopPropagation();

		var point = { x: event.clientX, y: event.clientY };
		if(this.iframe != undefined)
			point = Ui.Element.pointFromWindow(this.iframe, { x: event.clientX, y: event.clientY }, this.window);
		var mousePos = this.pointFromWindow(point);
		var deltaY = mousePos.y - this.mouseStart.y;
		offsetY = this.startOffsetY + deltaY * this.contentHeight / this.viewHeight;
		this.setOffset(undefined, offsetY, true);
	},

	onVerticalMouseUp: function(event) {
		event.preventDefault();
		event.stopPropagation();

		if(event.button != 0)
			return;

		this.window.document.body.removeChild(this.catcher);

		this.disconnect(this.window, 'mousemove', this.onVerticalMouseMove, true);
		this.disconnect(this.window, 'mouseup', this.onVerticalMouseUp, true);
	},

	onVerticalFingerDown: function(event) {
		if(this.lock || this.getIsDisabled() || this.isVerticalMoving || !this.showScrollbar)
			return;

		this.stopInertia();

		this.isVerticalMoving = true;

		this.connect(event.finger, 'fingermove', this.onVerticalFingerMove);
		this.connect(event.finger, 'fingerup', this.onVerticalFingerUp);

		event.finger.capture(this.getDrawing());

		event.preventDefault();
		event.stopPropagation();

		this.verticalFingerStart = this.pointFromWindow({ x: event.finger.getX(), y: event.finger.getY() });
		this.startOffsetX = this.offsetX;
		this.startOffsetY = this.offsetY;
//		this.startComputeInertia();
	},

	onVerticalFingerMove: function(event) {
		event.preventDefault();
		event.stopPropagation();

		var touchPos = this.pointFromWindow({ x: event.finger.getX(), y: event.finger.getY() });
		var deltaY = touchPos.y - this.verticalFingerStart.y;
		offsetY = this.startOffsetY + deltaY * this.contentHeight / this.viewHeight;
		this.setOffset(this.startOffsetX, offsetY, true);
	},

	onVerticalFingerUp: function(event) {
		event.preventDefault();
		event.stopPropagation();

		this.isVerticalMoving = false;

//		this.stopComputeInertia();
//		this.startInertia();

		this.disconnect(event.finger, 'fingermove', this.onVerticalFingerMove);
		this.disconnect(event.finger, 'fingerup', this.onVerticalFingerUp);
	},

	onHorizontalMouseDown: function(event) {
		if(this.lock || this.getIsDisabled())
			return;

		if(event.button != 0)
			return;

		this.stopInertia();

		event.preventDefault();
		event.stopPropagation();

		this.window = window;
		this.iframe = undefined;
		if(navigator.isWebkit || navigator.isFirefox3) {
			var rootWindow = Ui.App.getRootWindow();
			if(rootWindow != window) {
				this.window = rootWindow;
				this.iframe = Ui.App.getWindowIFrame();
			}
		}

		this.connect(this.window, 'mouseup', this.onHorizontalMouseUp, true);
		this.connect(this.window, 'mousemove', this.onHorizontalMouseMove, true);

		this.catcher = document.createElement('div');
		this.catcher.style.position = 'absolute';
		this.catcher.style.left = '0px';
		this.catcher.style.right = '0px';
		this.catcher.style.top = '0px';
		this.catcher.style.bottom = '0px';
		this.catcher.style.zIndex = 1000;
		this.window.document.body.appendChild(this.catcher);

		this.mouseStart = this.pointFromWindow({ x: event.clientX, y: event.clientY });
		this.startOffsetX = this.offsetX;
		this.startOffsetY = this.offsetY;
		this.speedX = 0;
		this.speedY = 0;
	},

	onHorizontalMouseMove: function(event) {
		event.preventDefault();
		event.stopPropagation();

		var point = { x: event.clientX, y: event.clientY };
		if(this.iframe != undefined)
			point = Ui.Element.pointFromWindow(this.iframe, { x: event.clientX, y: event.clientY }, this.window);
		var mousePos = this.pointFromWindow(point);
		var deltaX = mousePos.x - this.mouseStart.x;
		offsetX = this.startOffsetX + deltaX * this.contentWidth / this.viewWidth;
		this.setOffset(offsetX, this.startOffsetY, true);
	},

	onHorizontalMouseUp: function(event) {
		event.preventDefault();
		event.stopPropagation();

		if(event.button != 0)
			return;

		this.window.document.body.removeChild(this.catcher);

		this.disconnect(this.window, 'mousemove', this.onHorizontalMouseMove, true);
		this.disconnect(this.window, 'mouseup', this.onHorizontalMouseUp, true);
	},

	onHorizontalFingerDown: function(event) {
		if(this.lock || this.getIsDisabled() || this.isHorizontalMoving || !this.showScrollbar)
			return;

		this.stopInertia();

		this.isHorizontalMoving = true;

		this.connect(event.finger, 'fingermove', this.onHorizontalFingerMove);
		this.connect(event.finger, 'fingerup', this.onHorizontalFingerUp);

		event.finger.capture(this.getDrawing());

		event.preventDefault();
		event.stopPropagation();

		this.horizontalFingerStart = this.pointFromWindow({ x: event.finger.getX(), y: event.finger.getY() });
		this.startOffsetX = this.offsetX;
		this.startOffsetY = this.offsetY;
//		this.startComputeInertia();
	},

	onHorizontalFingerMove: function(event) {
		event.preventDefault();
		event.stopPropagation();

		var touchPos = this.pointFromWindow({ x: event.finger.getX(), y: event.finger.getY() });
		var deltaX = touchPos.x - this.horizontalFingerStart.x;
		offsetX = this.startOffsetX + deltaX * this.contentWidth / this.viewWidth;
		this.setOffset(offsetX, undefined, true);
	},

	onHorizontalFingerUp: function(event) {
		event.preventDefault();
		event.stopPropagation();

		this.isHorizontalMoving = false;

//		this.stopComputeInertia();
//		this.startInertia();

		this.disconnect(event.finger, 'fingermove', this.onHorizontalFingerMove);
		this.disconnect(event.finger, 'fingerup', this.onHorizontalFingerUp);
	},

	updateOffset: function() {
		if(this.contentBox === undefined)
			return;

		this.relativeOffsetX = this.offsetX / (this.contentWidth - this.viewWidth);
		this.relativeOffsetY = this.offsetY / (this.contentHeight - this.viewHeight);

		if(this.scrollbarHorizontalNeeded) {
			var relOffsetX = this.offsetX / (this.contentWidth - this.viewWidth);
			this.scrollbarHorizontalBox.setTransform(Ui.Matrix.createTranslate((this.viewWidth - this.scrollbarHorizontalWidth) * relOffsetX, 0));

			if(relOffsetX > 0) {
				this.leftShadowBox.show();
				this.leftShadowBox.setOpacity(1);
			}
			else {
				this.leftShadowBox.hide();
				this.leftShadowBox.setOpacity(0);
			}
			if(relOffsetX < 1) {
				this.rightShadowBox.show();
				this.rightShadowBox.setOpacity(1);
			}
			else {
				this.rightShadowBox.hide();
				this.rightShadowBox.setOpacity(0);
			}
		}
		else {
			this.leftShadowBox.setOpacity(0);
			this.leftShadowBox.hide();
			this.rightShadowBox.setOpacity(0);
			this.rightShadowBox.hide();
		}
		if(this.scrollbarVerticalNeeded) {
			var relOffsetY = this.offsetY / (this.contentHeight - this.viewHeight);
			this.scrollbarVerticalBox.setTransform(Ui.Matrix.createTranslate(0, (this.viewHeight - this.scrollbarVerticalHeight) * relOffsetY));

			if(relOffsetY > 0) {
				this.topShadowBox.show();
				this.topShadowBox.setOpacity(1);
			}
			else {
				this.topShadowBox.setOpacity(0);
				this.topShadowBox.hide();
			}
			if(relOffsetY < 1) {
				this.bottomShadowBox.show();
				this.bottomShadowBox.setOpacity(1);
			}
			else {
				this.bottomShadowBox.setOpacity(0);
				this.bottomShadowBox.hide();
			}
		}
		else {
			this.topShadowBox.setOpacity(0);
			this.topShadowBox.hide();
			this.bottomShadowBox.setOpacity(0);
			this.bottomShadowBox.hide();
		}
//		this.contentBox.setTransform(Ui.Matrix.createTranslate(-this.offsetX, -this.offsetY));
//		this.contentBox.setClipRectangle(this.offsetX, this.offsetY, this.viewWidth, this.viewHeight);

//		console.log('updateOffset('+this.offsetX+','+this.offsetY+')');

//		this.disconnect(this.contentBox, 'scroll', this.onContentBoxScroll);
//		this.contentBox.setOffset(this.offsetX, this.offsetY);
//		this.connect(this.contentBox, 'scroll', this.onContentBoxScroll);
	},

	showScrollbars: function() {	
		if(this.showScrollbar)
			return;
		this.nextShow = true;
				
		if(this.hideTimeout != undefined)
			this.hideTimeout.abort();
		if(this.showClock === undefined) {
			this.showClock = new Anim.Clock({ duration: 'forever', scope: this, onTimeupdate: this.onShowTick });
			this.showClock.begin();
		}
	},

	hideTimeoutScrollbars: function() {
		if(this.showScrollbar)
			return;
		if(this.hideTimeout != undefined) {
			this.hideTimeout.abort();
			this.hideTimeout = new Core.DelayedTask({ delay: 1, scope: this, callback: this.hideScrollbars });
		}
		else
			this.hideTimeout = new Core.DelayedTask({ delay: 1, scope: this, callback: this.hideScrollbars });
	},

	hideScrollbars: function() {
		if(this.showScrollbar)
			return;
					
		this.nextShow = false;
		if(this.hideTimeout != undefined) {
			this.hideTimeout.abort();
			this.hideTimeout = undefined;
		}
		if(this.showClock === undefined) {
			this.showClock = new Anim.Clock({ duration: 'forever', scope: this, onTimeupdate: this.onShowTick });
			this.showClock.begin();
		}
	},

	onShowTick: function(clock, progress, delta) {
//		console.log('onShowTick');
	
		if(delta == 0)
			return;
		if(!this.nextShow)
			delta = -delta;
		delta *= 5;

		var opacityVertical = this.scrollbarVerticalBox.getOpacity();
		opacityVertical = Math.max(0, Math.min(opacityVertical + delta, 1));
		this.scrollbarVerticalBox.setOpacity(opacityVertical);

		var opacityHorizontal = this.scrollbarHorizontalBox.getOpacity();
		opacityHorizontal = Math.max(0, Math.min(opacityHorizontal + delta, 1));
		this.scrollbarHorizontalBox.setOpacity(opacityHorizontal);

		if((this.nextShow && (opacityHorizontal == 1) && (opacityVertical == 1)) ||
		   (!this.nextShow && (opacityHorizontal == 0) && (opacityVertical == 0))) {
			this.showClock.stop();
			this.showClock = undefined;			
		}
	}

	/**#@-*/
}, 
/**@lends Ui.Scrollable#*/
{
	measureCoreWithScrollbar: function(width, height) {
//		console.log(this+'.measureCore('+width+','+height+')');

		this.scrollbarVerticalBox.measure(width, height);
		this.scrollbarHorizontalBox.measure(width, height);
		this.contentBox.measure(width, height);

//		console.log(this+'.measureCore contentBox first measure: ('+this.contentBox.getMeasureWidth()+','+this.contentBox.getMeasureHeight()+')');

		var contentWidth = width;
		var contentHeight = height;
		this.scrollbarVerticalNeeded = false;
		this.scrollbarHorizontalNeeded = false;

		var minWidth = this.scrollbarVerticalBox.getMeasureWidth()*2+this.scrollbarHorizontalBox.getMeasureWidth();
		var minHeight = this.scrollbarHorizontalBox.getMeasureHeight()*2+this.scrollbarVerticalBox.getMeasureHeight();

		if((this.contentBox.getMeasureHeight() > height) && this.scrollVertical) {
			contentWidth = width - this.scrollbarVerticalBox.getMeasureWidth();
			this.scrollbarVerticalNeeded = true;
		}
		if((this.contentBox.getMeasureWidth() > contentWidth) && this.scrollHorizontal) {
			contentHeight = height - this.scrollbarHorizontalBox.getMeasureHeight();
			this.scrollbarHorizontalNeeded = true;
			if((this.contentBox.getMeasureHeight() > contentHeight) && this.scrollVertical) {
				contentWidth = width - this.scrollbarVerticalBox.getMeasureWidth();
				this.scrollbarVerticalNeeded = true;
			}
		}
//		console.log(this+'.measureCore('+width+','+height+') scrollbarVertical: '+this.scrollbarVerticalNeeded+', scrollbarHorizontal: '+this.scrollbarHorizontalNeeded);
		if(this.scrollbarHorizontalNeeded || this.scrollbarVerticalNeeded) {
			this.scrollbarVerticalNeeded = false;
			this.scrollbarHorizontalNeeded = false;

			this.contentBox.measure(contentWidth, contentHeight);

			var contentWidth = width;
			var contentHeight = height;

			if(this.scrollVertical) {
				if(this.contentBox.getMeasureHeight() > height) {
					contentWidth = width - this.scrollbarVerticalBox.getMeasureWidth();
					this.scrollbarVerticalNeeded = true;
				}
			}
			else
				minHeight = this.contentBox.getMeasureHeight();

			if(this.scrollHorizontal) {
				if(this.contentBox.getMeasureWidth() > contentWidth) {
					contentHeight = height - this.scrollbarHorizontalBox.getMeasureHeight();
					this.scrollbarHorizontalNeeded = true;
					if((this.contentBox.getMeasureHeight() > contentHeight) && this.scrollVertical) {
						contentWidth = width - this.scrollbarVerticalBox.getMeasureWidth();
						this.scrollbarVerticalNeeded = true;
					}
				}
			}
			else {
				minWidth = this.contentBox.getMeasureWidth();
				if(this.scrollbarVerticalNeeded)
					minWidth += this.scrollbarVerticalBox.getMeasureWidth();
			}
			if(!this.scrollVertical && this.scrollbarHorizontalNeeded)
				minHeight += this.scrollbarHorizontalBox.getMeasureHeight();

//			console.log('contentBox measure: ('+contentWidth+','+contentHeight+') = ('+this.contentBox.getMeasureWidth()+','+this.contentBox.getMeasureHeight()+')');

//			console.log(this+'.measureCore('+width+','+height+') => min ('+minWidth+' x '+minHeight+')');

			var resWidth;
			var resHeight;

			if(this.contentBox.getMeasureWidth() <= contentWidth)
				resWidth = this.contentBox.getMeasureWidth();
			else
				resWidth = contentWidth;
			if(this.scrollbarVerticalNeeded)
				resWidth += this.scrollbarVerticalBox.getMeasureWidth();
			resWidth = Math.max(resWidth, minWidth);

			if(this.contentBox.getMeasureHeight() <= contentHeight)
				resHeight = this.contentBox.getMeasureHeight();
			else
				resHeight = contentHeight;
			if(this.scrollbarHorizontalNeeded)
				resHeight += this.scrollbarHorizontalBox.getMeasureHeight();
			resHeight = Math.max(resHeight, minHeight);

			return { width: resWidth, height: resHeight };

//			return {
//				width: (this.contentBox.getMeasureWidth() <= contentWidth)?(this.contentBox.getMeasureWidth() + (this.scrollbarVerticalNeeded?this.scrollbarVerticalBox.getMeasureWidth():0)):contentWidth,
//				height: (this.contentBox.getMeasureHeight() <= contentHeight)?this.contentBox.getMeasureHeight():contentHeight };
//			return { width: minWidth, height: minHeight };
		}
		else {
//			console.log(this+'.measureCore('+width+','+height+') => full ('+this.contentBox.getMeasureWidth()+' x '+this.contentBox.getMeasureHeight()+')');
			return { width: this.contentBox.getMeasureWidth(), height: this.contentBox.getMeasureHeight() };
		}
	},

	measureCoreWithoutScrollbar: function(width, height) {

		this.topShadowBox.measure(width, height);
		this.bottomShadowBox.measure(width, height);
		this.leftShadowBox.measure(width, height);
		this.rightShadowBox.measure(width, height);

		this.scrollbarVerticalBox.measure(width, height);
		this.scrollbarHorizontalBox.measure(width, height);
		this.contentBox.measure(width, height);

		var contentWidth = width;
		var contentHeight = height;
		this.scrollbarVerticalNeeded = false;
		this.scrollbarHorizontalNeeded = false;

		var minWidth = this.scrollbarVerticalBox.getMeasureWidth()*2+this.scrollbarHorizontalBox.getMeasureWidth();
		var minHeight = this.scrollbarHorizontalBox.getMeasureHeight()*2+this.scrollbarVerticalBox.getMeasureHeight();
		var resWidth;
		var resHeight;

		if((this.contentBox.getMeasureHeight() > height) && this.scrollVertical) {
			this.scrollbarVerticalNeeded = true;
			resHeight = height;
		}
		else
			resHeight = this.contentBox.getMeasureHeight();

		if((this.contentBox.getMeasureWidth() > contentWidth) && this.scrollHorizontal) {
			this.scrollbarHorizontalNeeded = true;
			resWidth = width;
		}
		else
			resWidth = this.contentBox.getMeasureWidth();

		if(resWidth < minWidth)
			minWidth = resWidth;
		if(resHeight < minHeight)
			minHeight = resHeight;

		return { width: Math.max(resWidth, minWidth), height: Math.max(resHeight, minHeight) };
	},

	arrangeCoreWithScrollbar: function(width, height) {
//		console.log(this+'.arrangeCore('+width+','+height+') verticalNeeded: '+this.scrollbarVerticalNeeded+', horizontalNeeded: '+this.scrollbarHorizontalNeeded);

		var contentWidth = width;
		if(this.contentBox.getMeasureHeight() > height) {
			this.scrollbarVerticalNeeded = true;
			contentWidth = width - this.scrollbarVerticalBox.getMeasureWidth();
		}
		else
			this.scrollbarVerticalNeeded = false;
		if(this.contentBox.getMeasureWidth() > contentWidth)
			this.scrollbarHorizontalNeeded = true;
		else
			this.scrollbarHorizontalNeeded = false;

		if(this.scrollbarVerticalNeeded)
			this.scrollbarVerticalBox.show();
		else {
			this.scrollbarVerticalBox.hide();
			this.offsetY = 0;
		}
		if(this.scrollbarHorizontalNeeded)
			this.scrollbarHorizontalBox.show();
		else {
			this.scrollbarHorizontalBox.hide();
			this.offsetX = 0;
		}

		if(!this.scrollbarVerticalNeeded && !this.scrollbarHorizontalNeeded) {
			this.contentWidth = width;
			this.contentHeight = height;
			this.viewWidth = width;
			this.viewHeight = height;
		}
		else {
//			console.log('scroll needed');
			this.contentWidth = width;
			this.contentHeight = height;
			this.viewWidth = width;
			this.viewHeight = height;
			if(this.scrollbarVerticalNeeded) {
				this.contentHeight = this.contentBox.getMeasureHeight();
				this.viewWidth -= this.scrollbarVerticalBox.getMeasureWidth();
				if(!this.scrollbarHorizontalNeeded)
					this.contentWidth -= this.scrollbarVerticalBox.getMeasureWidth();
			}
			if(this.scrollbarHorizontalNeeded) {
				this.contentWidth = this.contentBox.getMeasureWidth();
				this.viewHeight -= this.scrollbarHorizontalBox.getMeasureHeight();
			}
			else if(!this.scrollbarVerticalNeeded)
				this.contentHeight -= this.scrollbarHorizontalBox.getMeasureHeight();

//			console.log('contentBox arrange: '+this.contentWidth+'x'+this.contentHeight);

			if(this.scrollbarVerticalNeeded) {
				this.scrollbarVerticalHeight = Math.max((this.viewHeight / this.contentHeight) * this.viewHeight, this.scrollbarVerticalBox.getMeasureHeight());
				this.scrollbarVerticalBox.arrange(width - this.scrollbarVerticalBox.getMeasureWidth(), 0,
					this.scrollbarVerticalBox.getMeasureWidth(), this.scrollbarVerticalHeight);
			}
			if(this.scrollbarHorizontalNeeded) {
				this.scrollbarHorizontalWidth = Math.max((this.viewWidth / this.contentWidth) * this.viewWidth, this.scrollbarHorizontalBox.getMeasureWidth());
				this.scrollbarHorizontalBox.arrange(0, height - this.scrollbarHorizontalBox.getMeasureHeight(),
					this.scrollbarHorizontalWidth, this.scrollbarHorizontalBox.getMeasureHeight());
			}
		}
//		console.log(this+'.arrangeCore view: ('+this.viewWidth+' x '+this.viewHeight+')');

		this.contentBox.arrange(0, 0, this.viewWidth, this.viewHeight);

		this.updateOffset();
	},

	arrangeCoreWithoutScrollbar: function(width, height) {
		
		var contentWidth = width;
		if(this.contentBox.getMeasureHeight() > height)
			this.scrollbarVerticalNeeded = true;
		else
			this.scrollbarVerticalNeeded = false;
		if(this.contentBox.getMeasureWidth() > contentWidth)
			this.scrollbarHorizontalNeeded = true;
		else
			this.scrollbarHorizontalNeeded = false;

		if(this.scrollbarVerticalNeeded)
			this.scrollbarVerticalBox.show();
		else {
			this.scrollbarVerticalBox.hide();
			this.offsetY = 0;
		}
		if(this.scrollbarHorizontalNeeded)
			this.scrollbarHorizontalBox.show();
		else {
			this.scrollbarHorizontalBox.hide();
			this.offsetX = 0;
		}
		
		// update the offset if need due to new sizes
		this.setOffset(this.offsetX, this.offsetY, true);

		this.viewWidth = width;
		this.viewHeight = height;
		this.contentWidth = width;
		this.contentHeight = height;

		if(this.scrollbarVerticalNeeded) {
			this.contentHeight = this.contentBox.getMeasureHeight();
			this.scrollbarVerticalHeight = Math.max((this.viewHeight / this.contentHeight) * this.viewHeight, this.scrollbarVerticalBox.getMeasureHeight());			
			this.scrollbarVerticalBox.arrange(width - this.scrollbarVerticalBox.getMeasureWidth(), 0,
				this.scrollbarVerticalBox.getMeasureWidth(), this.scrollbarVerticalHeight);
		}
		if(this.scrollbarHorizontalNeeded) {
			this.contentWidth = this.contentBox.getMeasureWidth();
			this.scrollbarHorizontalWidth = Math.max((this.viewWidth / this.contentWidth) * this.viewWidth, this.scrollbarHorizontalBox.getMeasureWidth());
			this.scrollbarHorizontalBox.arrange(0, height - this.scrollbarHorizontalBox.getMeasureHeight(),
				this.scrollbarHorizontalWidth, this.scrollbarHorizontalBox.getMeasureHeight());
		}
		this.contentBox.arrange(0, 0, this.viewWidth, this.viewHeight);

		this.topShadowBox.arrange(0, 0, this.viewWidth, this.topShadowBox.getMeasureHeight());
		this.bottomShadowBox.arrange(0, this.viewHeight - this.bottomShadowBox.getMeasureHeight(), width, this.bottomShadowBox.getMeasureHeight());
		this.leftShadowBox.arrange(0, 0, this.leftShadowBox.getMeasureWidth(), this.viewHeight);
		this.rightShadowBox.arrange(this.viewWidth - this.rightShadowBox.getMeasureWidth(), 0, this.rightShadowBox.getMeasureWidth(), this.viewHeight);

		this.updateOffset();
	},

	measureCore: function(width, height) {	
		if(this.contentBox === undefined)
			return { width: 0, height: 0 };

		if(this.showScrollbar)
			return this.measureCoreWithScrollbar(width, height);
		else
			return this.measureCoreWithoutScrollbar(width, height);
	},

	arrangeCore: function(width, height) {		
		if(this.contentBox === undefined)
			return;

		if(this.showScrollbar)
			this.arrangeCoreWithScrollbar(width, height);
		else
			this.arrangeCoreWithoutScrollbar(width, height);
	}
});

Ui.Container.extend('Ui.ScrollableContent', 
/**@lends Ui.ScrollableContent#*/
{
	viewWidth: 0,
	viewHeight: 0,
	content: undefined,
	contentWidth: 0,
	contentHeight: 0,

	/**
	* @constructs
	* @class
	* @extends Ui.Container
	*/
	constructor: function(config) {
		this.getDrawing().style.overflow = 'hidden';
		this.addEvents('scroll');

		this.connect(this.getDrawing(), 'scroll', function(event) {
			this.fireEvent('scroll', this, this.getDrawing().scrollLeft, this.getDrawing().scrollTop);
		});
	},

	setContent: function(content) {
//		console.log(this+'.setContent('+content+')');

		if(this.content != content) {
			if(this.content != undefined)
				this.removeChild(this.content);
			this.content = content;
			if(this.content != undefined)
				this.appendChild(this.content);
		}
	},

	setOffset: function(offsetX, offsetY) {
//		var matrix = Ui.Matrix.createTranslate(-offsetX, -offsetY);
//		this.content.setTransform();
//		this.content.getDrawing().style.webkitTransform = matrix.toString();
//		this.content.getDrawing().style.webkitTransformOrigin = '0% 0%';

		this.getDrawing().scrollLeft = offsetX;
		this.getDrawing().scrollTop = offsetY;
	},

	getOffsetX: function() {
		return this.getDrawing().scrollLeft;
	},

	getOffsetY: function() {
		return this.getDrawing().scrollTop;
	}
}, 
/**@lends Ui.ScrollableContent#*/
{
	renderDrawing: function() {
		var drawing = Ui.Scrollable.base.renderDrawing.call(this);
		if(navigator.isIE) {
			if(!navigator.isIE7 && !navigator.isIE8)
				drawing.style.backgroundColor = 'rgba(255,255,255,0.01)';
		}
		return drawing;
	},

	measureCore: function(width, height) {
		var size;
		if(this.content != undefined)
			 size = this.content.measure(width, height);
		else
			size = { width: 0, height: 0 };
		this.contentWidth = size.width;
		this.contentHeight = size.height;
		return size;
	},

	arrangeCore: function(width, height) {	
		if(this.content != undefined)
			this.content.arrange(0, 0, Math.max(width, this.contentWidth), Math.max(height, this.contentHeight));
	}
});
