//
// Define the Scrollable class.
//
Ui.Container.extend('Ui.Scrollable', {
	viewWidth: 0,
	viewHeight: 0,
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
	touchId: undefined,

	scrollHorizontal: true,
	scrollVertical: true,

	contentBox: undefined,
	content: undefined,

	scrollbarHorizontalBox: undefined,
	scrollbarHorizontal: undefined,

	scrollbarVerticalBox: undefined,
	scrollbarVertical: undefined,

	constructor: function(config) {
		if(config.scrollHorizontal != undefined)
			this.setScrollHorizontal(config.scrollHorizontal);
		if(config.scrollVertical != undefined)
			this.setScrollVertical(config.scrollVertical);

		this.contentBox = new Ui.LBox();
		this.appendChild(this.contentBox);

		this.scrollbarHorizontalBox = new Ui.LBox();
		this.scrollbarHorizontalBox.getDrawing().style.setProperty('cursor', 'move', null);
		this.appendChild(this.scrollbarHorizontalBox);

		this.scrollbarVerticalBox = new Ui.LBox();
		this.scrollbarVerticalBox.getDrawing().style.setProperty('cursor', 'move', null);
		this.appendChild(this.scrollbarVerticalBox);

//		this.setFocusable(true);
		this.connect(this.contentBox.getDrawing(), 'mousedown', this.onMouseDown);
		this.connect(this.contentBox.getDrawing(), 'mousedown', this.onMouseDownCtrl, true);
		this.connect(this.contentBox.getDrawing(), 'mousewheel', this.onMouseWheel);
		this.connect(this.contentBox.getDrawing(), 'DOMMouseScroll', this.onMouseWheel);
		this.connect(this.contentBox.getDrawing(), 'touchstart', this.onTouchStart);
		this.connect(this.contentBox.getDrawing(), 'touchmove', this.onTouchMove);
		this.connect(this.contentBox.getDrawing(), 'touchend', this.onTouchEnd);

		this.connect(this.scrollbarHorizontalBox.getDrawing(), 'mousedown', this.onHorizontalMouseDown);
		this.connect(this.scrollbarVerticalBox.getDrawing(), 'mousedown', this.onVerticalMouseDown);

//		this.connect(this, 'keydown', this.onKeyDown);
	},

	setContent: function(content) {
		if(this.content != content) {
			if(this.content != undefined)
				this.contentBox.removeChild(this.content);
			this.content = content;
			if(this.content != undefined)
				this.contentBox.appendChild(this.content);
		}
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
				this.scrollbarVerticalBox.removeChild(this.scrollbarVertical);
			this.scrollbarVertical = scrollbarVertical;
			if(this.scrollbarVertical != undefined)
				this.scrollbarVerticalBox.appendChild(this.scrollbarVertical);
		}
	},

	setScrollbarHorizontal: function(scrollbarHorizontal) {
		if(this.scrollbarHorizontal != scrollbarHorizontal) {
			if(this.scrollbarHorizontal != undefined)
				this.scrollbarHorizontalBox.removeChild(this.scrollbarHorizontal);
			this.scrollbarHorizontal = scrollbarHorizontal;
			if(this.scrollbarHorizontal != undefined)
				this.scrollbarHorizontalBox.appendChild(this.scrollbarHorizontal);
		}
	},

	setOffsetX: function(offset, absolute) {
		this.setOffset(offset, undefined, absolute);
	},

	setOffsetY: function(offset, absolute) {
		this.setOffset(undefined, offset, absolute);
	},

	setOffset: function(offsetX, offsetY, absolute) {
		if(absolute == undefined)
			absolute = false;
		if(offsetX == undefined)
			offsetX = this.offsetX;
		else if(!absolute)
			offsetX *= this.contentWidth - this.viewWidth;
		if(offsetY == undefined)
			offsetY = this.offsetY;
		else if(!absolute)
				offsetY *= this.contentHeight - this.viewHeight;
		if(offsetX < 0)
			offsetX = 0;
		else if(offsetX > this.contentWidth - this.viewWidth)
			offsetX = this.contentWidth - this.viewWidth;
		if(offsetY < 0)
			offsetY = 0;
		else if(offsetY > this.contentHeight - this.viewHeight)
			offsetY = this.contentHeight - this.viewHeight

		if(!this.scrollVertical)
			offsetY = 0;
		if(!this.scrollHorizontal)
			offsetX = 0;

		this.offsetX = offsetX;
		this.offsetY = offsetY;

		this.updateOffset();
	},

	//
	// Private
	//

	onMouseDownCtrl: function(event) {
		if(event.ctrlKey)
			this.onMouseDown(event);
	},

	onMouseDown: function(event) {
		if((this.viewWidth >= this.contentWidth) && (this.viewHeight >= this.contentHeight))
			return;

		this.focus();

		this.mouseButton = event.button;

		event.preventDefault();
		event.stopPropagation();

		this.stopInertia();

		this.connect(window, 'mouseup', this.onMouseUp, true);
		this.connect(window, 'mousemove', this.onMouseMove, true);

		this.mouseStart = this.pointFromPage({ x: event.pageX, y: event.pageY });
		this.startOffsetX = this.offsetX;
		this.startOffsetY = this.offsetY;
		this.startComputeInertia();
	},

	onMouseMove: function(event) {
		event.preventDefault();
		event.stopPropagation();

		this.hasMoved = true;
		var mousePos = this.pointFromPage({ x: event.pageX, y: event.pageY });
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

		this.disconnect(window, 'mousemove', this.onMouseMove);
		this.disconnect(window, 'mouseup', this.onMouseUp);

		this.stopComputeInertia();
		this.startInertia();
	},

	onMouseWheel: function(event) {
		event.preventDefault();
		event.stopPropagation();

		var deltaX = 0;
		var deltaY = 0;

		if((event.wheelDeltaX != undefined) && (event.wheelDelaY != undefined)) {
			deltaX = -event.wheelDeltaX / 12;
			deltaY = -event.wheelDeltaY / 12;
		}
		else if(event.wheelDelta != undefined)
			deltaY = -event.wheelDelta / 8;
		else if(event.detail != undefined)
			deltaY = event.detail * 10 / 3;
		this.setOffset(this.offsetX + deltaX, this.offsetY + deltaY, true);
	},

	onTouchStart: function(event) {
		if((this.viewWidth >= this.contentWidth) && (this.viewHeight >= this.contentHeight))
			return;

		if(event.targetTouches.length != 1)
			return;

		if(this.isMoving)
			return;

		this.touchId = event.targetTouches[0].identifier;

		this.isMoving = true;

		event.preventDefault();
		event.stopPropagation();

		this.stopInertia();

		this.touchStart = this.pointFromPage({ x: event.targetTouches[0].pageX, y: event.targetTouches[0].pageY });
		this.startOffsetX = this.offsetX;
		this.startOffsetY = this.offsetY;
		this.startComputeInertia();
	},

	onTouchMove: function(event) {
		if(!this.isMoving)
			return;
		if(event.targetTouches[0].identifier != this.touchId)
			return;

		event.preventDefault();
		event.stopPropagation();

		var touchPos = this.pointFromPage({ x: event.targetTouches[0].pageX, y: event.targetTouches[0].pageY });
		var deltaX = touchPos.x - this.touchStart.x;
		var deltaY = touchPos.y - this.touchStart.y;
		offsetX = this.startOffsetX - deltaX;
		offsetY = this.startOffsetY - deltaY;
		this.setOffset(offsetX, offsetY, true);
		this.hasMoved = true;

//		console.log('onTouchMove offsetY: '+offsetY);
	},

	onTouchEnd: function(event) {
		if(!this.isMoving)
			return;

		event.preventDefault();
		event.stopPropagation();

		this.isMoving = false;

		this.stopComputeInertia();
		this.startInertia();
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
		else
			console.log('key: '+key);
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
//		console.log('startComputeInertia');

		if(this.measureSpeedTimer != undefined)
			this.measureSpeedTimer.abort();

		this.lastOffsetX = this.offsetX;
		this.lastOffsetY = this.offsetY;
		this.lastTime = (new Date().getTime())/1000;
		this.speedX = 0;
		this.speedY = 0;
		this.speedComputed = false;
		this.hasMoved = false;
		this.measureSpeedTimer = new Core.Timer({ interval: 0.025, scope: this, callback: this.measureSpeed });
	},

	stopComputeInertia: function() {
//		console.log('stopComputeInertia');

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
		if(this.inertiaClock == undefined) {
			this.inertiaClock = new Anim.Clock({ duration: 'forever', target: this,
				callback: function(clock, progress, delta) {
					if(delta == 0)
						return;

					var oldOffsetX = this.offsetX;
					var oldOffsetY = this.offsetY;

					var offsetX = this.offsetX + (this.speedX * delta);
					var offsetY = this.offsetY + (this.speedY * delta);
					this.setOffset(offsetX, offsetY, true);

					if((this.offsetX == oldOffsetX) && (this.offsetY == oldOffsetY)) {
						this.stopInertia();
						return;
					}
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
		if(event.button != 0)
			return;

		event.preventDefault();
		event.stopPropagation();

		this.stopInertia();

		this.connect(window, 'mouseup', this.onVerticalMouseUp, true);
		this.connect(window, 'mousemove', this.onVerticalMouseMove, true);

		this.mouseStart = this.pointFromPage({ x: event.pageX, y: event.pageY });
		this.startOffsetX = this.offsetX;
		this.startOffsetY = this.offsetY;
		this.lastOffsetX = this.offsetX;
		this.lastOffsetY = this.offsetY;
		this.lastTime = (new Date().getTime())/1000;
		this.speedX = 0;
		this.speedY = 0;
		this.speedComputed = false;

		this.measureSpeedTimer = new Core.Timer({ interval: 0.025, scope: this, callback: this.measureSpeed });
	},

	onVerticalMouseMove: function(event) {
		event.preventDefault();
		event.stopPropagation();

		var mousePos = this.pointFromPage({ x: event.pageX, y: event.pageY });
		var deltaY = mousePos.y - this.mouseStart.y;
		offsetY = this.startOffsetY + deltaY * this.contentHeight / this.viewHeight;
		this.setOffset(this.startOffsetX, offsetY, true);
	},

	onVerticalMouseUp: function(event) {
		event.preventDefault();
		event.stopPropagation();

		if(event.button != 0)
			return;

		if(this.measureSpeedTimer != undefined) {
			this.measureSpeedTimer.abort();
			this.measureSpeedTimer = undefined;
		}

		this.disconnect(window, 'mousemove', this.onVerticalMouseMove);
		this.disconnect(window, 'mouseup', this.onVerticalMouseUp);
		if(!this.speedComputed) {
			// compute speed
			var currentTime = (new Date().getTime())/1000;
			var deltaTime = currentTime - this.lastTime;
			var deltaOffsetX = this.offsetX - this.lastOffsetX;
			var deltaOffsetY = this.offsetY - this.lastOffsetY;
			this.speedX = deltaOffsetX / deltaTime;
			this.speedY = deltaOffsetY / deltaTime;
		}
		this.startInertia();
	},

	onHorizontalMouseDown: function(event) {
		if(event.button != 0)
			return;

		event.preventDefault();
		event.stopPropagation();

		this.stopInertia();

		this.connect(window, 'mouseup', this.onHorizontalMouseUp, true);
		this.connect(window, 'mousemove', this.onHorizontalMouseMove, true);

		this.mouseStart = this.pointFromPage({ x: event.pageX, y: event.pageY });
		this.startOffsetX = this.offsetX;
		this.startOffsetY = this.offsetY;
		this.lastOffsetX = this.offsetX;
		this.lastOffsetY = this.offsetY;
		this.lastTime = (new Date().getTime())/1000;
		this.speedX = 0;
		this.speedY = 0;
		this.speedComputed = false;

		this.measureSpeedTimer = new Core.Timer({ interval: 0.025, scope: this, callback: this.measureSpeed });
	},

	onHorizontalMouseMove: function(event) {
		event.preventDefault();
		event.stopPropagation();

		var mousePos = this.pointFromPage({ x: event.pageX, y: event.pageY });
		var deltaX = mousePos.x - this.mouseStart.x;
		offsetX = this.startOffsetX + deltaX * this.contentWidth / this.viewWidth;
		this.setOffset(offsetX, this.startOffsetY, true);
	},

	onHorizontalMouseUp: function(event) {
		event.preventDefault();
		event.stopPropagation();

		if(event.button != 0)
			return;

		if(this.measureSpeedTimer != undefined) {
			this.measureSpeedTimer.abort();
			this.measureSpeedTimer = undefined;
		}

		this.disconnect(window, 'mousemove', this.onHorizontalMouseMove);
		this.disconnect(window, 'mouseup', this.onHorizontalMouseUp);
		if(!this.speedComputed) {
			// compute speed
			var currentTime = (new Date().getTime())/1000;
			var deltaTime = currentTime - this.lastTime;
			var deltaOffsetX = this.offsetX - this.lastOffsetX;
			var deltaOffsetY = this.offsetY - this.lastOffsetY;
			this.speedX = deltaOffsetX / deltaTime;
			this.speedY = deltaOffsetY / deltaTime;
		}
		this.startInertia();
	},

	updateOffset: function() {
		if(this.scrollbarHorizontalNeeded) {
			var relOffsetX = this.offsetX / (this.contentWidth - this.viewWidth);
			this.scrollbarHorizontalBox.setTransform(Ui.Matrix.createTranslate((this.viewWidth - this.scrollbarHorizontalWidth) * relOffsetX, 0));
		}
		if(this.scrollbarVerticalNeeded) {
			var relOffsetY = this.offsetY / (this.contentHeight - this.viewHeight);
			this.scrollbarVerticalBox.setTransform(Ui.Matrix.createTranslate(0, (this.viewHeight - this.scrollbarVerticalHeight) * relOffsetY));
		}
		this.contentBox.setTransform(Ui.Matrix.createTranslate(-this.offsetX, -this.offsetY));
		this.contentBox.setClipRectangle(this.offsetX, this.offsetY, this.viewWidth, this.viewHeight);
	},

}, {
	measureCore: function(width, height) {
		for(var i = 0; i < this.getChildren().length; i++) {
			var child = this.getChildren()[i];
			var size = child.measure(width, height);
		}
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

			return { width: minWidth, height: minHeight };
		}
		else
			return { width: this.contentBox.getMeasureWidth(), height: this.contentBox.getMeasureHeight() };
	},


	arrangeCore: function(width, height) {
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
		this.contentBox.arrange(0, 0, this.contentWidth, this.contentHeight);
		this.updateOffset();
	},
});
