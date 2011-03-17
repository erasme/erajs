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

	constructor: function(config) {
		if(config.moveHorizontal != undefined)
			this.setMoveHorizontal(config.moveHorizontal);
		if(config.moveVertical != undefined)
			this.setMoveVertical(config.moveVertical);
		if(config.inertia != undefined)
			this.setInertia(config.inertia);

		this.contentBox = new Ui.LBox();
		this.appendChild(this.contentBox);

		this.contentBox.getDrawing().style.setProperty('cursor', 'move', null);
		this.addEvents('move');

		this.connect(this.contentBox.getDrawing(), 'mousedown', this.onMouseDown);
		this.connect(this.contentBox.getDrawing(), 'touchstart', this.onTouchStart);
		this.connect(this.contentBox.getDrawing(), 'touchmove', this.onTouchMove);
		this.connect(this.contentBox.getDrawing(), 'touchend', this.onTouchEnd);
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
		if(x != undefined)
			this.posX = x;
		if(y != undefined)
			this.posY = y;
		this.contentBox.setTransform(Ui.Matrix.createTranslate(this.posX, this.posY));
	},

	getPositionX: function() {
		return this.posX;
	},

	getPositionY: function() {
		return this.posY;
	},

	onMouseDown: function(event) {
		if(event.button != 0)
			return;

		event.preventDefault();
		event.stopPropagation();

		this.connect(window, 'mouseup', this.onMouseUp, true);
		this.connect(window, 'mousemove', this.onMouseMove, true);

		this.mouseStart = this.pointFromPage({ x: event.pageX, y: event.pageY });
		this.startPosX = this.posX;
		this.startPosY = this.posY;
		if(this.inertia)
			this.startComputeInertia();
	},

	onMouseMove: function(event) {
		event.preventDefault();
		event.stopPropagation();

		var mousePos = this.pointFromPage({ x: event.pageX, y: event.pageY });
		var deltaX = mousePos.x - this.mouseStart.x;
		if(!this.moveHorizontal)
			deltaX = 0;
		var deltaY = mousePos.y - this.mouseStart.y;
		if(!this.moveVertical)
			deltaY = 0;
		this.setPosition(this.startPosX + deltaX, this.startPosY + deltaY);
		this.fireEvent('move', this);
	},

	onMouseUp: function(event) {
		event.preventDefault();
		event.stopPropagation();

		if(event.button != 0)
			return;

		this.disconnect(window, 'mousemove');
		this.disconnect(window, 'mouseup');

		if(this.measureSpeedTimer != undefined) {
			this.stopComputeInertia();
			this.startInertia();
		}
	},

	onTouchStart: function(event) {
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

		var touchPos = this.pointFromPage({ x: event.targetTouches[0].pageX, y: event.targetTouches[0].pageY });
		var deltaX = touchPos.x - this.touchStart.x;
		if(!this.moveHorizontal)
			deltaX = 0;
		var deltaY = touchPos.y - this.touchStart.y;
		if(!this.moveVertical)
			deltaY = 0;
		posX = this.startPosX + deltaX;
		posY = this.startPosY + deltaY;
		this.setPosition(posX, posY);
		this.hasMoved = true;
		this.fireEvent('move', this);
	},

	onTouchEnd: function(event) {
		if(!this.isMoving)
			return;

		event.preventDefault();
		event.stopPropagation();

		this.isMoving = false;

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
			var timeline = new Anim.Timeline({ duration: 'forever', target: this,
				callback: function(clock, progress, delta) {
					if(delta == 0)
						return;

					var oldPosX = this.posX;
					var oldPosY = this.posY;

					var posX = this.posX + (this.speedX * delta);
					var posY = this.posY + (this.speedY * delta);
					this.setPosition(posX, posY);

					this.fireEvent('move', this);

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
			this.inertiaClock = timeline.begin();
		}
	},

	stopInertia: function() {
		if(this.inertiaClock != undefined) {
			this.inertiaClock.stop();
			this.inertiaClock = undefined;
		}
	},

}, {
});
