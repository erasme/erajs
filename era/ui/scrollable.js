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
	mouseButton: 0,
	measureSpeedTimer: undefined,
	speedX: 0,
	speedY: 0,
	speedComputed: false,
	isMoving: false,
	hasMoved: false,
	mouseStart: undefined,
	touchStart: undefined,
	verticalFingerStart: undefined,
	horizontalFingerStart: undefined,
	touchId: undefined,
	catcher: undefined,
	window: undefined,
	iframe: undefined,

	scrollHorizontal: true,
	scrollVertical: true,

	contentBox: undefined,

	scrollbarHorizontalBox: undefined,
	scrollbarHorizontal: undefined,

	scrollbarVerticalBox: undefined,
	scrollbarVertical: undefined,

	lock: false,
	overScroll: true,

	/**
     * @constructs
	 * @class
     * @extends Ui.Container
     * @param {Boolean} [config.scrollHorizontal] Whether or not the scrollable allow horizontal scrolling
     * @param {Boolean} [config.scrollVertical] Whether or not the scrollable allow vertical scrolling
	 * @param {Boolean} [config.overScroll] If true, let user scroll over the container content on touch devices. If false, oblige him to use the scrollbar.
	 */
	constructor: function(config) {
		this.scrollbarHorizontalBox = new Ui.LBox();
		this.appendChild(this.scrollbarHorizontalBox);

		this.scrollbarVerticalBox = new Ui.LBox();
		this.appendChild(this.scrollbarVerticalBox);

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
		this.appendChild(this.contentBox);
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

		this.contentBox.setOffset(offsetX, offsetY);

/*		if(!force) {
			if(offsetX < 0)
				offsetX = 0;
			else if(offsetX > this.contentWidth - this.viewWidth)
				offsetX = this.contentWidth - this.viewWidth;
			if(offsetY < 0)
				offsetY = 0;
			else if(offsetY > this.contentHeight - this.viewHeight)
				offsetY = this.contentHeight - this.viewHeight;
		}
	
		if(!this.scrollVertical)
			offsetY = 0;
		if(!this.scrollHorizontal)
			offsetX = 0;

		this.offsetX = offsetX;
		this.offsetY = offsetY;*/

//		this.updateOffset();
//		this.offsetLock = false;
	},

	/**#@+
	 * @private
	 */

	onContentBoxScroll: function(content, offsetX, offsetY) {
		this.offsetX = offsetX;
		this.offsetY = offsetY;
		this.updateOffset();

//		this.setOffset(offsetX, offsetY, true, true);
	},

	onMouseDownCtrl: function(event) {
		if(event.ctrlKey)
			this.onMouseDown(event);
	},

	onMouseDown: function(event) {
		if(this.lock || this.getIsDisabled())
			return;

		if((this.viewWidth >= this.contentWidth) && (this.viewHeight >= this.contentHeight))
			return;

		if(!((event.button == 1) || ((event.button == 0) && (event.ctrlKey))))
			return;

		this.focus();

		this.mouseButton = event.button;

		event.preventDefault();
		event.stopPropagation();

		this.stopInertia();

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
	},

	onMouseMove: function(event) {
		event.preventDefault();
		event.stopPropagation();

		this.hasMoved = true;
		var point = { x: event.clientX, y: event.clientY };
		if(this.iframe != undefined)
			point = Ui.Element.pointFromWindow(this.iframe, { x: event.clientX, y: event.clientY }, this.window);
		var mousePos = this.pointFromWindow(point);
		var deltaX = mousePos.x - this.mouseStart.x;
		var deltaY = mousePos.y - this.mouseStart.y;
		offsetX = this.startOffsetX - deltaX;
		offsetY = this.startOffsetY - deltaY;
		this.setOffset(offsetX, offsetY, true);
	},

	onMouseUp: function(event) {
		event.preventDefault();
		event.stopPropagation();

		if(event.button != this.mouseButton)
			return;

		this.window.document.body.removeChild(this.catcher);

		this.disconnect(this.window, 'mousemove', this.onMouseMove, true);
		this.disconnect(this.window, 'mouseup', this.onMouseUp, true);

		this.stopComputeInertia();
		this.startInertia();
	},

	onMouseWheel: function(event) {
		event.preventDefault();
		event.stopPropagation();

		this.stopInertia();

		var deltaX = 0;
		var deltaY = 0;

		if((event.wheelDeltaX != undefined) && (event.wheelDelaY != undefined)) {
			deltaX = -event.wheelDeltaX / 12;
			deltaY = -event.wheelDeltaY / 12;
		}
		// Opera, Chrome, IE
		else if(event.wheelDelta != undefined)
			deltaY = -event.wheelDelta / 4;
		// Firefox
		else if(event.detail != undefined)
			deltaY = event.detail * 10;
		this.setOffset(this.offsetX + deltaX, this.offsetY + deltaY, true);
	},


	onFingerDownCapture: function(event) {
//		console.log('onFingerDownCapture');
		this.stopInertia();
	},

	onFingerDown: function(event) {

//		console.log('onFingerDown');

		if(this.lock || this.getIsDisabled() || this.isMoving)
			return;
		if((this.viewWidth >= this.contentWidth) && (this.viewHeight >= this.contentHeight))
			return;

		this.connect(event.finger, 'fingermove', this.onFingerMove);
		this.connect(event.finger, 'fingerup', this.onFingerUp);

		this.isMoving = true;

		event.finger.capture(this.getDrawing());

		event.preventDefault();
		event.stopPropagation();

		this.stopInertia();

		this.touchStart = this.pointFromWindow({ x: event.finger.getX(), y: event.finger.getY() });
		this.startOffsetX = this.offsetX;
		this.startOffsetY = this.offsetY;
		this.startComputeInertia();
	},

	onFingerMove: function(event) {
		event.preventDefault();
		event.stopPropagation();

		var touchPos = this.pointFromWindow({ x: event.finger.getX(), y: event.finger.getY() });
		var deltaX = touchPos.x - this.touchStart.x;
		var deltaY = touchPos.y - this.touchStart.y;
		offsetX = this.startOffsetX - deltaX;
		offsetY = this.startOffsetY - deltaY;
		this.setOffset(offsetX, offsetY, true);
		this.hasMoved = true;
	},

	onFingerUp: function(event) {
		event.preventDefault();
		event.stopPropagation();

		this.isMoving = false;

		this.stopComputeInertia();
		this.startInertia();

		this.disconnect(event.finger, 'fingermove', this.onFingerMove);
		this.disconnect(event.finger, 'fingerup', this.onFingerUp);
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
		if(!this.hasMoved)
			return;

		// compute speed
		var currentTime = (new Date().getTime())/1000;
		var deltaTime = currentTime - this.lastTime;

		if(deltaTime < 0.025)
			return;

		var deltaOffsetX = this.offsetX - this.lastOffsetX;
		var deltaOffsetY = this.offsetY - this.lastOffsetY;
		this.speedX = deltaOffsetX / deltaTime;
		this.speedY = deltaOffsetY / deltaTime;
		this.lastTime = currentTime;

//		console.log('measureSpeed deltaTime: '+deltaTime+', deltaOffsetY: '+deltaOffsetY+', lastOffsetY: '+this.lastOffsetY+', new: '+this.offsetY);

		this.lastOffsetX = this.offsetX;
		this.lastOffsetY = this.offsetY;
		this.speedComputed = true;
	},

	startComputeInertia: function() {
		if(this.measureSpeedTimer != undefined)
			this.measureSpeedTimer.abort();

		this.lastOffsetX = this.offsetX;
		this.lastOffsetY = this.offsetY;
		this.lastTime = (new Date().getTime())/1000;
		this.speedX = 0;
		this.speedY = 0;
		this.speedComputed = false;
		this.hasMoved = false;
		this.measureSpeedTimer = new Core.Timer({ interval: 0.025, scope: this, onTimeupdate: this.measureSpeed });
	},

	stopComputeInertia: function() {
		if(this.measureSpeedTimer != undefined) {
			this.measureSpeedTimer.abort();
			this.measureSpeedTimer = undefined;
		}
		if(!this.speedComputed) {
			// compute speed
			var currentTime = (new Date().getTime())/1000;
			var deltaTime = currentTime - this.lastTime;
			var deltaOffsetX = this.offsetX - this.lastOffsetX;
			var deltaOffsetY = this.offsetY - this.lastOffsetY;
			this.speedX = deltaOffsetX / deltaTime;
			this.speedY = deltaOffsetY / deltaTime;

//			console.log('speed NOT computed, deltaTime: '+deltaTime+', speed: '+this.speedX+','+this.speedY);
		}
		else {
//			console.log('speed computed speed: '+this.speedX+','+this.speedY);
		}
	},

	startInertia: function() {
		if(this.inertiaClock === undefined) {
			this.inertiaClock = new Anim.Clock({ duration: 'forever', scope: this, target: this,
				onTimeupdate: function(clock, progress, delta) {
					if(delta == 0)
						return;

					var oldOffsetX = this.offsetX;
					var oldOffsetY = this.offsetY;

					var offsetX = this.offsetX + (this.speedX * delta);
					var offsetY = this.offsetY + (this.speedY * delta);
					this.setOffset(offsetX, offsetY, true);

					this.speedX -= this.speedX * delta * 3;
					this.speedY -= this.speedY * delta * 3;
					if(Math.abs(this.speedX) < 0.1)
						this.speedX = 0;
					if(Math.abs(this.speedY) < 0.1)
						this.speedY = 0;
					if((this.speedX == 0) && (this.speedY == 0))
						this.stopInertia();
				}
			});
			this.inertiaClock.begin();
		}
	},

	stopInertia: function() {
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

		event.preventDefault();
		event.stopPropagation();

		this.stopInertia();

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
		this.lastOffsetX = this.offsetX;
		this.lastOffsetY = this.offsetY;
		this.lastTime = (new Date().getTime())/1000;
		this.speedX = 0;
		this.speedY = 0;
		this.speedComputed = false;

//		this.measureSpeedTimer = new Core.Timer({ interval: 0.025, scope: this, callback: this.measureSpeed });
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

//		if(this.measureSpeedTimer != undefined) {
//			this.measureSpeedTimer.abort();
//			this.measureSpeedTimer = undefined;
//		}

		this.window.document.body.removeChild(this.catcher);

		this.disconnect(this.window, 'mousemove', this.onVerticalMouseMove, true);
		this.disconnect(this.window, 'mouseup', this.onVerticalMouseUp, true);
//		if(!this.speedComputed) {
//			// compute speed
//			var currentTime = (new Date().getTime())/1000;
//			var deltaTime = currentTime - this.lastTime;
//			var deltaOffsetX = this.offsetX - this.lastOffsetX;
//			var deltaOffsetY = this.offsetY - this.lastOffsetY;
//			this.speedX = deltaOffsetX / deltaTime;
//			this.speedY = deltaOffsetY / deltaTime;
//		}
//		this.startInertia();
	},

	onVerticalFingerDown: function(event) {
		if(this.lock || this.getIsDisabled() || this.isVerticalMoving)
			return;

		this.isVerticalMoving = true;

		this.connect(event.finger, 'fingermove', this.onVerticalFingerMove);
		this.connect(event.finger, 'fingerup', this.onVerticalFingerUp);

		event.finger.capture(this.getDrawing());

		event.preventDefault();
		event.stopPropagation();

		this.stopInertia();


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

		event.preventDefault();
		event.stopPropagation();

		this.stopInertia();

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
		this.lastOffsetX = this.offsetX;
		this.lastOffsetY = this.offsetY;
		this.lastTime = (new Date().getTime())/1000;
		this.speedX = 0;
		this.speedY = 0;
		this.speedComputed = false;

//		this.measureSpeedTimer = new Core.Timer({ interval: 0.025, scope: this, callback: this.measureSpeed });
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
		if(this.lock || this.getIsDisabled() || this.isHorizontalMoving)
			return;

		this.isHorizontalMoving = true;

		this.connect(event.finger, 'fingermove', this.onHorizontalFingerMove);
		this.connect(event.finger, 'fingerup', this.onHorizontalFingerUp);

		event.finger.capture(this.getDrawing());

		event.preventDefault();
		event.stopPropagation();

		this.stopInertia();

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

		if(this.scrollbarHorizontalNeeded) {
			var relOffsetX = this.offsetX / (this.contentWidth - this.viewWidth);
			this.scrollbarHorizontalBox.setTransform(Ui.Matrix.createTranslate((this.viewWidth - this.scrollbarHorizontalWidth) * relOffsetX, 0));
		}
		if(this.scrollbarVerticalNeeded) {
			var relOffsetY = this.offsetY / (this.contentHeight - this.viewHeight);
			this.scrollbarVerticalBox.setTransform(Ui.Matrix.createTranslate(0, (this.viewHeight - this.scrollbarVerticalHeight) * relOffsetY));
		}
//		this.contentBox.setTransform(Ui.Matrix.createTranslate(-this.offsetX, -this.offsetY));
//		this.contentBox.setClipRectangle(this.offsetX, this.offsetY, this.viewWidth, this.viewHeight);

//		console.log('updateOffset('+this.offsetX+','+this.offsetY+')');

//		this.disconnect(this.contentBox, 'scroll', this.onContentBoxScroll);
//		this.contentBox.setOffset(this.offsetX, this.offsetY);
//		this.connect(this.contentBox, 'scroll', this.onContentBoxScroll);
	}

	/**#@-*/
}, 
/**@lends Ui.Scrollable#*/
{
	measureCore: function(width, height) {
		if(this.contentBox === undefined)
			return { width: 0, height: 0 };

//		for(var i = 0; i < this.getChildren().length; i++) {
//			var child = this.getChildren()[i];
//			var size = child.measure(width, height);
//		}

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


	arrangeCore: function(width, height) {
		if(this.contentBox === undefined)
			return;

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
//		if(this.content != undefined)
//			this.content.arrange(0, 0, this.contentWidth, this.contentHeight);
//		this.contentBox.getDrawing().style.left = '0px';
//		this.contentBox.getDrawing().style.top = '0px';
//		this.contentBox.getDrawing().style.width = this.viewWidth+'px';
//		this.contentBox.getDrawing().style.height = this.viewHeight+'px';

//		console.log(this+'.arrangeCore view: ('+this.viewWidth+' x '+this.viewHeight+')');

		this.contentBox.arrange(0, 0, this.viewWidth, this.viewHeight);

//		this.contentBox.arrange(0, 0, this.contentWidth, this.contentHeight);
//		this.contentBox.setClipRectangle(this.offsetX, this.offsetY, this.viewWidth, this.viewHeight);

		this.updateOffset();
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

		this.connect(this.getDrawing(), 'scroll', function() {
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
		this.getDrawing().scrollLeft = offsetX;
		this.getDrawing().scrollTop = offsetY;
	},

	getOffsetX: function() {
		return this.getDrawing().scrollLeft;
	},

	getOffsetY: function() {
		return this.getDrawing().scrollLeft;
	}
}, 
/**@lends Ui.ScrollableContent#*/
{
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

