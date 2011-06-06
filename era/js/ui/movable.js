//
// Define the Movable class.
//
Ui.LBox.extend('Ui.Movable', {
	moveHorizontal: true,
	moveVertical: true,
	mouseStart: undefined,
	contentBox: undefined,
	content: undefined,
	posX: 0,
	posY: 0,
	isMoving: false,
	hasMoved: false,
	measureSpeedTimer: undefined,
	speedX: 0,
	speedY: 0,
	speedComputed: false,
	lastPosX: undefined,
	lastPosY: undefined,
	lastTime: undefined,
	inertiaClock: undefined,
	inertia: false,
	touchId: undefined,
	touchStart: undefined,
	isDown: false,

	constructor: function(config) {
		this.addEvents('down', 'up', 'move');
		this.setFocusable(true);

		if(config.moveHorizontal != undefined)
			this.setMoveHorizontal(config.moveHorizontal);
		if(config.moveVertical != undefined)
			this.setMoveVertical(config.moveVertical);
		if(config.inertia != undefined)
			this.setInertia(config.inertia);

		this.contentBox = new Ui.LBox();
		this.appendChild(this.contentBox);

		this.contentBox.getDrawing().style.cursor = 'move';

		this.connect(this.contentBox.getDrawing(), 'mousedown', this.onMouseDown);
		this.connect(this.contentBox.getDrawing(), 'touchstart', this.onTouchStart);
		this.connect(this.contentBox.getDrawing(), 'touchmove', this.onTouchMove);
		this.connect(this.contentBox.getDrawing(), 'touchend', this.onTouchEnd);

		// handle keyboard
		this.connect(this.getDrawing(), 'keydown', this.onKeyDown);
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

	setContent: function(content) {
		if(content != this.content) {
			if(this.content != undefined)
				this.contentBox.removeChild(this.content);
			this.content = content;
			if(this.content != undefined)
				this.contentBox.appendChild(this.content);
		}
	},

	setPosition: function(x, y) {
		if((x != undefined) && (this.moveHorizontal))
			this.posX = x;
		if((y != undefined) && (this.moveVertical))
			this.posY = y;
		this.contentBox.setTransform(Ui.Matrix.createTranslate(this.posX, this.posY));
		this.fireEvent('move', this);
	},

	getPositionX: function() {
		return this.posX;
	},

	getPositionY: function() {
		return this.posY;
	},

	//
	// Private
	//

	onDown: function() {
		this.isDown = true;
		this.focus();
		this.fireEvent('down', this);
	},

	onUp: function() {
 		this.isDown = false;
		this.fireEvent('up', this);
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
		if(this.getIsDisabled())
			return;

		if(event.button != 0)
			return;

		event.preventDefault();
		event.stopPropagation();

		this.onDown();

		this.connect(window, 'mouseup', this.onMouseUp, true);
		this.connect(window, 'mousemove', this.onMouseMove, true);

		this.mouseStart = this.pointFromWindow({ x: event.clientX, y: event.clientY });
		this.startPosX = this.posX;
		this.startPosY = this.posY;
		if(this.inertia)
			this.startComputeInertia();
	},

	onMouseMove: function(event) {
		event.preventDefault();
		event.stopPropagation();

		var mousePos = this.pointFromWindow({ x: event.clientX, y: event.clientY });
		var deltaX = mousePos.x - this.mouseStart.x;
		var deltaY = mousePos.y - this.mouseStart.y;
		this.setPosition(this.startPosX + deltaX, this.startPosY + deltaY);
	},

	onMouseUp: function(event) {
		event.preventDefault();
		event.stopPropagation();

		if(event.button != 0)
			return;

		this.disconnect(window, 'mousemove', this.onMouseMove);
		this.disconnect(window, 'mouseup', this.onMouseUp);

		this.onUp();

		if(this.measureSpeedTimer != undefined) {
			this.stopComputeInertia();
			this.startInertia();
		}
	},

	onTouchStart: function(event) {
		if(this.getIsDisabled())
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

		this.onDown();

		this.touchStart = this.pointFromWindow({ x: event.targetTouches[0].clientX, y: event.targetTouches[0].clientY });
		this.startPosX = this.posX;
		this.startPosY = this.posY;
		if(this.inertia)
			this.startComputeInertia();
	},

	onTouchMove: function(event) {
		if(!this.isMoving)
			return;
		if(event.targetTouches[0].identifier != this.touchId)
			return;

		event.preventDefault();
		event.stopPropagation();

		var touchPos = this.pointFromWindow({ x: event.targetTouches[0].clientX, y: event.targetTouches[0].clientY });
		var deltaX = touchPos.x - this.touchStart.x;
		var deltaY = touchPos.y - this.touchStart.y;
		posX = this.startPosX + deltaX;
		posY = this.startPosY + deltaY;
		this.setPosition(posX, posY);
		this.hasMoved = true;
	},

	onTouchEnd: function(event) {
		if(!this.isMoving)
			return;

		event.preventDefault();
		event.stopPropagation();

		this.isMoving = false;

		this.onUp();

		if(this.measureSpeedTimer != undefined) {
			this.stopComputeInertia();
			this.startInertia();
		}
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
		this.measureSpeedTimer = new Core.Timer({ interval: 0.025, scope: this, callback: this.measureSpeed });
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
		if(this.inertiaClock == undefined) {
			this.inertiaClock = new Anim.Clock({ duration: 'forever', target: this,
				callback: function(clock, progress, delta) {
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
}, {
});
