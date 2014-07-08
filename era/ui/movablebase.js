
Ui.Container.extend('Ui.MovableBase', 
/**@lends Ui.MovableBase#*/
{
	moveHorizontal: true,
	moveVertical: true,
	posX: 0,
	posY: 0,
	isMoving: false,
	speedX: 0,
	speedY: 0,
	startPosX: undefined,
	startPosY: undefined,
	inertiaClock: undefined,
	inertia: false,
	isDown: false,
	lock: false,
	isInMoveEvent: false,
	cumulMove: 0,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.Container
	 */
	constructor: function(config) {
		this.addEvents('down', 'up', 'move');
		this.connect(this.getDrawing(), 'ptrdown', this.onPointerDown);
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
		if(!this.isInMoveEvent && (dontSignal !== true)) {
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

	onDown: function() {
		this.cumulMove = 0;
		this.isDown = true;
		this.fireEvent('down', this);
	},

	onUp: function(abort) {
		this.isDown = false;
		this.fireEvent('up', this, this.speedX, this.speedY, (this.posX - this.startPosX), (this.posY - this.startPosY), this.cumulMove, abort);
	},

	onPointerDown: function(event) {
		if(this.isDown || this.getIsDisabled() || this.lock)
			return;
		
		this.stopInertia();
		this.startPosX = this.posX;
		this.startPosY = this.posY;

		this.onDown(false);

		var watcher = event.pointer.watch(this.getDrawing());
		this.connect(watcher, 'move', function() {
			if(!watcher.getIsCaptured()) {
				if(watcher.pointer.getIsMove()) {

					var deltaObj = watcher.getDelta();
					var delta = Math.sqrt(deltaObj.x * deltaObj.x + deltaObj.y * deltaObj.y);

					this.setPosition(this.startPosX + deltaObj.x, this.startPosY + deltaObj.y);

					var deltaPosX = this.posX - this.startPosX;
					var deltaPosY = this.posY - this.startPosY;
					var deltaPos = Math.sqrt(deltaPosX * deltaPosX + deltaPosY * deltaPosY);

					var test = 0;
					if(delta > 0)
						test = deltaPos / delta;

					if(test > 0.7)
						watcher.capture();
					else {
						this.setPosition(this.startPosX, this.startPosY);
						watcher.cancel();
					}
				}
			}
			else {
				var delta = watcher.getDelta();
				this.setPosition(this.startPosX + delta.x, this.startPosY + delta.y);
			}
		});
		this.connect(watcher, 'up', function() {
			this.cumulMove = watcher.pointer.getCumulMove();
			var speed = watcher.getSpeed();
			this.speedX = speed.x;
			this.speedY = speed.y;
			if(this.inertia)
				this.startInertia();
			this.onUp(false);
		});
		this.connect(watcher, 'cancel', function() {
			this.onUp(true);
		});
	},

	startInertia: function() {
		if(this.inertiaClock === undefined) {
			this.inertiaClock = new Anim.Clock({ duration: 'forever', scope: this, target: this,
				onTimeupdate: function(clock, progress, delta) {
					if(delta === 0)
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
					if((this.speedX === 0) && (this.speedY === 0))
						this.stopInertia();
				}
			});
			this.inertiaClock.begin();
		}
	},

	stopInertia: function() {
		if(this.inertiaClock !== undefined) {
			this.inertiaClock.stop();
			this.inertiaClock = undefined;
		}
	}
	/**#@-*/
});

