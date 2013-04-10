
Ui.Container.extend('Ui.MovableBase', 
/**@lends Ui.MovableBase#*/
{
	moveHorizontal: true,
	moveVertical: true,
	mouseStart: undefined,
	mouseLast: undefined,
	posX: 0,
	posY: 0,
	isMoving: false,
	measureSpeedTimer: undefined,
	speedX: 0,
	speedY: 0,
	speedComputed: false,
	lastPosX: undefined,
	lastPosY: undefined,
	startPosX: undefined,
	startPosY: undefined,
	lastTime: undefined,
	inertiaClock: undefined,
	inertia: false,
	touchStart: undefined,
	touchLast: undefined,
	isDown: false,
	lock: false,
	isInMoveEvent: false,
	cumulMove: 0,
	catcher: undefined,
	window: undefined,
	iframe: undefined,
	directionLock: false,
	directionRelease: false,
	speedBuffer: undefined,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.LBox
	 */
	constructor: function(config) {
		this.addEvents('down', 'up', 'move');

		this.connect(this.getDrawing(), 'mousedown', this.onMouseDown);
		this.connect(this.getDrawing(), 'fingerdown', this.onFingerDown);
	},

	setDirectionRelease: function(release) {
		this.directionRelease = release;
	},

	getDirectionRelease: function() {
		return this.directionRelease;
	},

	setLock: function(lock) {
		this.lock = lock;
		if(lock)
			this.stopInertia();
	},

	getLock: function() {
		return this.lock;
	},

	getIsDown: function() {
		return this.isDown;
	},

	getInertia: function() {
		return this.inertia;
	},

	setInertia: function(inertiaActive) {
		this.inertia = inertiaActive;
	},

	getMoveHorizontal: function() {
		return this.moveHorizontal;
	},

	setMoveHorizontal: function(moveHorizontal) {
		this.moveHorizontal = moveHorizontal;
	},

	getMoveVertical: function() {
		return this.moveVertical;
	},

	setMoveVertical: function(moveVertical) {
		this.moveVertical = moveVertical;
	},

	setPosition: function(x, y, dontSignal) {
		if((x !== undefined) && (this.moveHorizontal)) {
			if(isNaN(x))
				this.posX = 0;
			else
				this.posX = x;
		}
		if((y !== undefined) && (this.moveVertical)) {
			if(isNaN(y))
				this.posY = 0;
			else
				this.posY = y;
		}
		if(!this.isInMoveEvent && !(dontSignal === true)) {
			this.isInMoveEvent = true;
			this.onMove(this.posX, this.posY);
			this.fireEvent('move', this);
			this.isInMoveEvent = false;
		}
	},

	getPositionX: function() {
		return this.posX;
	},

	getPositionY: function() {
		return this.posY;
	},

	getContent: function() {
		return this.contentBox.getChildren()[0];
	},

	onMove: function(x, y) {
	},

	/**#@+
	 * @private
	 */

	onDown: function() {
		this.cumulMove = 0;
		this.isDown = true;
		this.fireEvent('down', this);
	},

	onUp: function(abort) {
 		this.isDown = false;
		this.fireEvent('up', this, this.speedX, this.speedY, (this.posX - this.startPosX), (this.posY - this.startPosY), this.cumulMove, abort);
	},

	onMouseDown: function(event) {
		if(this.lock || this.getIsDisabled())
			return;

		if(event.button != 0)
			return;

		this.directionLock = false;

		event.preventDefault();
		event.stopPropagation();

		this.onDown();

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
		this.mouseLast = this.mouseStart;
		this.startPosX = this.posX;
		this.startPosY = this.posY;
		this.startComputeInertia();
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
				if((this.directionRelease) &&((horizontal && !this.moveHorizontal) || (!horizontal && !this.moveVertical))) {
					if('createEvent' in document) {
						this.window.document.body.removeChild(this.catcher);

						this.disconnect(this.window, 'mousemove', this.onMouseMove, true);
						this.disconnect(this.window, 'mouseup', this.onMouseUp, true);

						this.stopComputeInertia();

						var mouseDownEvent = document.createEvent('MouseEvents');
						mouseDownEvent.initMouseEvent('mousedown', true, true, window, 1, event.screenX, event.screenY,
							event.clientX, event.clientY,
							event.ctrlKey, event.altKey, event.shiftKey,
							event.metaKey, 0, event.target);
						this.getDrawing().offsetParent.dispatchEvent(mouseDownEvent);

						this.onUp(true);
						return;
					}
				}
				this.directionLock = true;
			}
		}

		var dX = mousePos.x - this.mouseLast.x;
		var dY = mousePos.y - this.mouseLast.y;
		this.mouseLast = mousePos;
		this.cumulMove += Math.sqrt(dX * dX + dY * dY);

		this.setPosition(this.startPosX + deltaX, this.startPosY + deltaY);
		this.measureSpeed();
	},

	onMouseUp: function(event) {
		event.preventDefault();
		event.stopPropagation();

		if(event.button != 0)
			return;

		this.window.document.body.removeChild(this.catcher);

		this.disconnect(this.window, 'mousemove', this.onMouseMove, true);
		this.disconnect(this.window, 'mouseup', this.onMouseUp, true);

		this.stopComputeInertia();
		if(this.inertia)
			this.startInertia();
		this.onUp(false);
	},

	onFingerDown: function(event) {
		if(this.isMoving || this.lock || this.getIsDisabled())
			return;

		this.directionLock = false;
		this.isMoving = true;

		this.connect(event.finger, 'fingermove', this.onFingerMove);
		this.connect(event.finger, 'fingerup', this.onFingerUp);

		event.finger.capture(this.getDrawing());

		event.preventDefault();
		event.stopPropagation();

		this.stopInertia();

		this.onDown();

		this.touchStart = this.pointFromWindow({ x: event.finger.getX(), y: event.finger.getY() });
		this.touchLast = this.touchStart;
		this.startPosX = this.posX;
		this.startPosY = this.posY;
		this.startComputeInertia();
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
				if((this.directionRelease) &&((horizontal && !this.moveHorizontal) || (!horizontal && !this.moveVertical))) {

					this.isMoving = false;
					this.stopComputeInertia();
					this.disconnect(event.finger, 'fingermove', this.onFingerMove);
					this.disconnect(event.finger, 'fingerup', this.onFingerUp);

					event.finger.release();
					this.onUp(true);
					return;
				}
				this.directionLock = true;
			}
		}

		posX = this.startPosX + deltaX;
		posY = this.startPosY + deltaY;

		var dX = touchPos.x - this.touchLast.x;
		var dY = touchPos.y - this.touchLast.y;
		this.touchLast = touchPos;
		this.cumulMove += Math.sqrt(dX * dX + dY * dY);

		this.setPosition(posX, posY);
		this.measureSpeed();
	},

	onFingerUp: function(event) {
		this.disconnect(event.finger, 'fingermove', this.onFingerMove);
		this.disconnect(event.finger, 'fingerup', this.onFingerUp);

		event.preventDefault();
		event.stopPropagation();

		this.isMoving = false;

		this.stopComputeInertia();
		if(this.inertia)
			this.startInertia();
		this.onUp(false);
	},

	measureSpeed: function() {		
		if(this.speedBuffer.length > 20)
			this.speedBuffer.shift();
		this.speedBuffer.push({ time: (new Date().getTime())/1000, x: this.posX, y: this.posY });
	},

	startComputeInertia: function() {
		this.speedBuffer = [];
		this.speedBuffer.push({ time: (new Date().getTime())/1000, x: this.posX, y: this.posY });
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
		this.speedX = (this.posX - measure.x) / deltaTime;
		this.speedY = (this.posY - measure.y) / deltaTime;
	},

	startInertia: function() {
		if(this.inertiaClock === undefined) {
			this.inertiaClock = new Anim.Clock({ duration: 'forever', scope: this, target: this,
				onTimeupdate: function(clock, progress, delta) {
					if(delta == 0)
						return;

					var oldPosX = this.posX;
					var oldPosY = this.posY;

					var posX = this.posX + (this.speedX * delta);
					var posY = this.posY + (this.speedY * delta);
					this.setPosition(posX, posY);

					if((this.posX == oldPosX) && (this.posY == oldPosY)) {
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
	}
	/**#@-*/
});

