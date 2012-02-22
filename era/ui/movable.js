Ui.LBox.extend('Ui.Movable', 
/**@lends Ui.Movable#*/
{
	moveHorizontal: true,
	moveVertical: true,
	mouseStart: undefined,
	mouseLast: undefined,
	contentBox: undefined,
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
	touchId: undefined,
	touchStart: undefined,
	touchLast: undefined,
	isDown: false,
	lock: false,
	isInMoveEvent: false,
	cumulMove: 0,
	catcher: undefined,
	window: undefined,
	iframe: undefined,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.LBox
	 */
	constructor: function(config) {
		this.addEvents('down', 'up', 'move');
		this.setFocusable(true);

		this.contentBox = new Ui.LBox();
		this.appendChild(this.contentBox);

		this.contentBox.getDrawing().style.cursor = 'move';

		this.connect(this.contentBox.getDrawing(), 'mousedown', this.onMouseDown);
		this.connect(this.contentBox.getDrawing(), 'fingerdown', this.onFingerDown);
		this.connect(this.getDrawing(), 'keydown', this.onKeyDown);
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

	setPosition: function(x, y) {
		if((x != undefined) && (this.moveHorizontal))
			this.posX = x;
		if((y != undefined) && (this.moveVertical))
			this.posY = y;
		this.contentBox.setTransform(Ui.Matrix.createTranslate(this.posX, this.posY));

		if(!this.isInMoveEvent) {
			this.isInMoveEvent = true;
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

	/**#@+
	 * @private
	 */

	onDown: function() {
		this.cumulMove = 0;
		this.isDown = true;
		this.focus();
		this.fireEvent('down', this);
	},

	onUp: function() {
 		this.isDown = false;
		this.fireEvent('up', this, this.speedX, this.speedY, (this.posX - this.startPosX), (this.posY - this.startPosY), this.cumulMove);
	},

	onKeyDown: function(event) {
		if(this.getIsDisabled())
			return;
		var key = event.which;
		// horizontal move
		if(((key == 37) || (key == 39)) && this.moveHorizontal) {
			event.preventDefault();
			event.stopPropagation();
			if(key == 37)
				this.setPosition(this.posX - 10, undefined);
			if(key == 39)
				this.setPosition(this.posX + 10, undefined);
		}
		// vertical move
		if(((key == 38) || (key == 40)) && this.moveVertical) {
			event.preventDefault();
			event.stopPropagation();
			if(key == 38)
				this.setPosition(undefined, this.posY - 10);
			if(key == 40)
				this.setPosition(undefined, this.posY + 10);
		}
	},

	onMouseDown: function(event) {
		if(this.lock || this.getIsDisabled())
			return;

		if(event.button != 0)
			return;

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

		var dX = mousePos.x - this.mouseLast.x;
		var dY = mousePos.y - this.mouseLast.y;
		this.mouseLast = mousePos;
		this.cumulMove += Math.sqrt(dX * dX + dY * dY);

		this.setPosition(this.startPosX + deltaX, this.startPosY + deltaY);
		this.hasMoved = true;
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
		this.onUp();
	},

	onFingerDown: function(event) {
		if(this.isMoving || this.lock || this.getIsDisabled())
			return;

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
		posX = this.startPosX + deltaX;
		posY = this.startPosY + deltaY;

		var dX = touchPos.x - this.touchLast.x;
		var dY = touchPos.y - this.touchLast.y;
		this.touchLast = touchPos;
		this.cumulMove += Math.sqrt(dX * dX + dY * dY);

		this.setPosition(posX, posY);
		this.hasMoved = true;
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
		this.onUp();
	},

	measureSpeed: function() {
		if(!this.hasMoved)
			return;

		// compute speed
		var currentTime = (new Date().getTime())/1000;
		var deltaTime = currentTime - this.lastTime;

		if(deltaTime < 0.025)
			return;

		var deltaPosX = this.posX - this.lastPosX;
		var deltaPosY = this.posY - this.lastPosY;
		this.speedX = deltaPosX / deltaTime;
		this.speedY = deltaPosY / deltaTime;
		this.lastTime = currentTime;

		this.lastPosX = this.posX;
		this.lastPosY = this.posY;
		this.speedComputed = true;
	},

	startComputeInertia: function() {
		if(this.measureSpeedTimer != undefined)
			this.measureSpeedTimer.abort();

		this.lastPosX = this.posX;
		this.lastPosY = this.posY;
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
			var deltaPosX = this.posX - this.lastPosX;
			var deltaPosY = this.posY - this.lastPosY;
			this.speedX = deltaPosX / deltaTime;
			this.speedY = deltaPosY / deltaTime;
		}
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
}, {
	arrangeCore: function(width, height) {
		this.getDrawing().style.width = '0px';
		this.getDrawing().style.height = '0px';
		Ui.Movable.base.arrangeCore.call(this, width, height);
	},

	setContent: function(content) {
		this.contentBox.setContent(content);
	}
});
