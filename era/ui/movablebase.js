
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
	speedBuffer: undefined,
	startTime: undefined,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.Container
	 */
	constructor: function(config) {
		this.addEvents('down', 'up', 'move');

		this.getDrawing().style.touchAction = 'none';

		this.connect(this.getDrawing(), 'mousedown', this.onMouseDown);
		this.connect(this.getDrawing(), 'touchstart', this.onTouchStart);
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
		this.updateTouchAction();
	},

	getMoveVertical: function() {
		return this.moveVertical;
	},

	setMoveVertical: function(moveVertical) {
		this.moveVertical = moveVertical;
		this.updateTouchAction();
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
			this.fireEvent('move', this);
			this.onMove(this.posX, this.posY);
			this.isInMoveEvent = false;
		}
	},

	getPositionX: function() {
		return this.posX;
	},

	getPositionY: function() {
		return this.posY;
	},

	onMove: function(x, y) {
	},

	/**#@+
	 * @private
	 */

	updateTouchAction: function() {
		console.log(this+'.updateTouchAction');
/*		if(this.moveHorizontal && this.moveVertical)
			this.getDrawing().style.touchAction = 'none';
		else if(this.moveHorizontal && !this.moveVertical) {
			this.getDrawing().style.touchAction = 'pan-y';
			this.getDrawing().style.background = 'blue';
		}
		else if(!this.moveHorizontal && this.moveVertical) {
			this.getDrawing().style.touchAction = 'pan-x';
			this.getDrawing().style.background = 'red';
		}*/
	},

	onDown: function() {
		//console.log('onDown');
		this.cumulMove = 0;
		this.isDown = true;
		this.fireEvent('down', this);
	},

	onUp: function(abort) {
		//console.log('onUp');
 		this.isDown = false;
		this.fireEvent('up', this, this.speedX, this.speedY, (this.posX - this.startPosX), (this.posY - this.startPosY), this.cumulMove, abort);
	},

	onMouseDown: function(event) {
		//console.log(this+'.onMouseDown isDown: '+this.isDown);

		if(this.isDown || this.lock || this.getIsDisabled() || (event.button != 0))
			return;
		
		this.startTime = (new Date().getTime())/1000;
		this.directionLock = false;
//		this.directionLock = true;
//		event.preventDefault();
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

/*		this.catcher = document.createElement('div');
		this.catcher.style.position = 'absolute';
		this.catcher.style.left = '0px';
		this.catcher.style.right = '0px';
		this.catcher.style.top = '0px';
		this.catcher.style.bottom = '0px';
		this.catcher.style.zIndex = 1000;
		this.catcher.style.cursor = 'move';
		this.window.document.body.appendChild(this.catcher);*/

		this.mouseStart = this.pointFromWindow({ x: event.clientX, y: event.clientY });
		this.mouseLast = this.mouseStart;
		this.startPosX = this.posX;
		this.startPosY = this.posY;
		this.startComputeInertia();
	},

	onMouseMove: function(event) {		
		event.stopPropagation();

		var deltaTime = ((new Date().getTime())/1000) - this.startTime;

		// auto lock if we move the element since 0.5s or on a cumulated move of 20 unit
		if((deltaTime >= 0.5) || (this.cumulMove > 20))
			this.directionLock = true;

		var oldX = this.posX;
		var oldY = this.posY;

		var point = { x: event.clientX, y: event.clientY };
		if(this.iframe != undefined)
			point = Ui.Element.pointFromWindow(this.iframe, { x: event.clientX, y: event.clientY }, this.window);
		var mousePos = this.pointFromWindow(point);
		var deltaX = mousePos.x - this.mouseStart.x;
		var deltaY = mousePos.y - this.mouseStart.y;
		var delta = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

		var dX = mousePos.x - this.mouseLast.x;
		var dY = mousePos.y - this.mouseLast.y;
		var d = Math.sqrt(dX * dX + dY * dY);
		this.mouseLast = mousePos;
		this.cumulMove += d;

		this.setPosition(this.startPosX + deltaX, this.startPosY + deltaY);
		this.measureSpeed();

		var deltaPosX = this.posX - this.startPosX;
		var deltaPosY = this.posY - this.startPosY;
		var deltaPos = Math.sqrt(deltaPosX * deltaPosX + deltaPosY * deltaPosY);

		var test = 1;
		if(delta !== 0)
			test = deltaPos / delta;

		if(this.directionLock) {
			event.preventDefault();
		}
		else {
			// preventDefault if the move is mainly in the right direction
			if(test >= 0.7) {
				event.preventDefault();
			}
			else {
				console.log('ABORT MOUSE MOVE');
				this.onMouseUp(event, true);
			}
		}
	},

	onMouseUp: function(event, abort) {
		//console.log(this+'.onMouseUp');

		if(this.directionLock)
			event.preventDefault();
		event.stopPropagation();

		if(event.button != 0)
			return;
		
		abort = (abort === true);

//		this.window.document.body.removeChild(this.catcher);

		this.disconnect(this.window, 'mousemove', this.onMouseMove, true);
		this.disconnect(this.window, 'mouseup', this.onMouseUp, true);

		this.stopComputeInertia();
		if(!abort && this.inertia)
			this.startInertia();
		this.onUp(abort);
	},

	onTouchStart: function(event) {
		//console.log(this+'.onTouchStart isDown: '+this.isDown);

		if(this.isDown || (event.changedTouches.length !== 1) || this.getIsDisabled() || this.lock)
			return;
		
		this.startTime = (new Date().getTime())/1000;

		this.directionLock = false;
		this.isMoving = true;

		this.connect(this.getDrawing(), 'touchcancel', this.onTouchCancel);
		this.connect(this.getDrawing(), 'touchend', this.onTouchEnd);
		this.connect(this.getDrawing(), 'touchmove', this.onTouchMove);

//		event.stopPropagation();

		this.stopInertia();
		this.onDown();

		this.touchStart = this.pointFromWindow({ x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY });
		this.touchLast = this.touchStart;
		this.startPosX = this.posX;
		this.startPosY = this.posY;
		this.startComputeInertia();
	},

	onTouchMove: function(event) {
//		event.stopPropagation();

		var deltaTime = ((new Date().getTime())/1000) - this.startTime;

		// auto lock if we move the element since 0.5s or on a cumulated move of 20 unit
		if((deltaTime >= 0.5) || (this.cumulMove > 20))
			this.directionLock = true;
		
		var oldX = this.posX;
		var oldY = this.posY;

		var touchPos = this.pointFromWindow({ x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY });
		var deltaX = touchPos.x - this.touchStart.x;
		var deltaY = touchPos.y - this.touchStart.y;

		var delta = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

		var posX = this.startPosX + deltaX;
		var posY = this.startPosY + deltaY;

		var dX = touchPos.x - this.touchLast.x;
		var dY = touchPos.y - this.touchLast.y;
		this.touchLast = touchPos;
		var d = Math.sqrt(dX * dX + dY * dY);
		this.cumulMove += d;

		this.setPosition(posX, posY);

		var deltaPosX = this.posX - this.startPosX;
		var deltaPosY = this.posY - this.startPosY;
		var deltaPos = Math.sqrt(deltaPosX * deltaPosX + deltaPosY * deltaPosY);

		this.measureSpeed();

		var test = deltaPos / delta;

		//console.log(this+'.onTouchMove test: '+test+', cumulMove: '+this.cumulMove);

		if(this.directionLock) {
			event.preventDefault();
			event.stopPropagation();
		}
		else {
			// preventDefault if the move is mainly in the right direction
			if(test >= 0.7) {
				event.preventDefault();
				event.stopPropagation();
			}
			else
				this.onTouchCancel(event);
		}
	},

	onTouchCancel: function(event) {
		this.disconnect(this.getDrawing(), 'touchcancel', this.onTouchCancel);
		this.disconnect(this.getDrawing(), 'touchend', this.onTouchEnd);
		this.disconnect(this.getDrawing(), 'touchmove', this.onTouchMove);

		if(this.directionLock)
			event.preventDefault();
		event.stopPropagation();

		this.isMoving = false;
		this.stopComputeInertia();
		this.onUp(true);
	},

	onTouchEnd: function(event) {
		//console.log(this+'.onTouchEnd');

		this.disconnect(this.getDrawing(), 'touchcancel', this.onTouchCancel);
		this.disconnect(this.getDrawing(), 'touchend', this.onTouchEnd);
		this.disconnect(this.getDrawing(), 'touchmove', this.onTouchMove);

		event.preventDefault();
		event.stopPropagation();

		var oldX = this.posX;
		var oldY = this.posY;

		var touchPos = this.pointFromWindow({ x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY });
		var deltaX = touchPos.x - this.touchStart.x;
		var deltaY = touchPos.y - this.touchStart.y;

		var delta = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

		var posX = this.startPosX + deltaX;
		var posY = this.startPosY + deltaY;

		var dX = touchPos.x - this.touchLast.x;
		var dY = touchPos.y - this.touchLast.y;
		this.touchLast = touchPos;
		var d = Math.sqrt(dX * dX + dY * dY);
		this.cumulMove += d;

		this.setPosition(posX, posY);

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
		var measure = this.speedBuffer[0];
		do {
			measure = this.speedBuffer[--i];
		}
		while((i > 0) && ((now - measure.time) < 0.15));
		var deltaTime = now - measure.time;

		this.speedX = (this.posX - measure.x) / deltaTime;
		this.speedY = (this.posY - measure.y) / deltaTime;

		//console.log(this+'.stopComputeInertia buffer.length: '+this.speedBuffer.length+
		//	', posX: '+this.posX+',mX: '+measure.x+', deltaTime: '+deltaTime+', speedX: '+this.speedX);
		//console.log(this.speedBuffer);
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

