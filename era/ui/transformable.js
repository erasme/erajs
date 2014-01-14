Ui.LBox.extend('Ui.Transformable', 
/**@lends Ui.Transformable#*/
{
	inertia: true,
	mouseStart: undefined,
	contentBox: undefined,
	mouseStart: undefined,

	speedComputed: false,
	lastTranslateX: undefined,
	lastTranslateY: undefined,
	lastAngle: 0,
	isDown: false,
	transformDone: false,

	finger1: undefined,
	finger2: undefined,

	angle: 0,
	scale: 1,
	translateX: 0,
	translateY: 0,

	startAngle: 0,
	startScale: 0,
	startTranslateX: 0,
	startTranslateY: 0,

	speedX: 0,
	speedY: 0,
	speedAngle: 0,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.LBox
	 */
	constructor: function(config) {
		this.addEvents('down', 'up', 'transform');
		this.setFocusable(true);

		this.contentBox = new Ui.LBox();
		this.appendChild(this.contentBox);

		this.contentBox.getDrawing().style.cursor = 'move';

		this.connect(this.contentBox.getDrawing(), 'fingerdown', this.onFingerDown);
		this.connect(this.contentBox.getDrawing(), 'mousedown', this.onMouseDown);
		this.connect(this.contentBox.getDrawing(), 'mousewheel', this.onMouseWheel);
		this.connect(this.contentBox.getDrawing(), 'DOMMouseScroll', this.onMouseWheel);
	},

	getIsDown: function() {
		return this.isDown;
	},

	getAngle: function() {
		return this.angle;
	},

	setAngle: function(angle) {
		this.setContentTransform(undefined, undefined, undefined, angle);
	},

	getScale: function() {
		return this.scale;
	},

	setScale: function(scale) {
		this.setContentTransform(undefined, undefined, scale, undefined);
	},

	getTranslateX: function() {
		return this.translateX;
	},

	setTranslateX: function(translateX) {
		this.setContentTransform(translateX, undefined, undefined, undefined);
	},

	getTranslateY: function() {
		return this.translateY;
	},

	setTranslateY: function(translateY) {
		this.setContentTransform(undefined, translateY, undefined, undefined);
	},

	getMatrix: function() {
		var matrix = new Ui.Matrix();
		matrix.translate(this.getLayoutWidth() / 2, this.getLayoutHeight() / 2);
		matrix.translate(this.translateX, this.translateY);
		matrix.scale(this.scale, this.scale);
		matrix.rotate(this.angle);
		matrix.translate(-this.getLayoutWidth() / 2, -this.getLayoutHeight() / 2);
		return matrix;
	},

	setContentTransform: function(translateX, translateY, scale, angle) {
		if(translateX === undefined)
			translateX = this.translateX;
		if(translateY === undefined)
			translateY = this.translateY;
		if(scale === undefined)
			scale = this.scale;
		if(angle === undefined)
			angle = this.angle;
		this.translateX = translateX;
		this.translateY = translateY;
		this.scale = scale;
		this.angle = angle;

		this.contentBox.setTransformOrigin(0, 0);
		this.contentBox.setTransform(this.getMatrix());

		this.fireEvent('transform', this);
	},

	/**#@+
	 * @private
	 */

	onDown: function() {
		this.isDown = true;
		this.transformDone = false;
		this.fireEvent('down', this);
	},

	onUp: function() {
 		this.isDown = false;
		this.fireEvent('up', this);
	},

	onMouseDown: function(event) {
		if(this.lock || this.getIsDisabled())
			return;

		if(event.button !== 0)
			return;
		
		event.preventDefault();
		event.stopPropagation();

		this.onDown();

		this.connect(window, 'mouseup', this.onMouseUp, true);
		this.connect(window, 'mousemove', this.onMouseMove, true);

		this.mouseStart = this.pointFromWindow({ x: event.clientX, y: event.clientY });
		this.mouseStartClientX = event.clientX;
		this.mouseStartClientY = event.clientY;
		this.mouseStartScreenX = event.screenX;
		this.mouseStartScreenY = event.screenY;

		this.startAngle = this.angle;
		this.startScale = this.scale;
		this.startTranslateX = this.translateX;
		this.startTranslateY = this.translateY;

//		this.startComputeInertia();
	},

	onMouseMove: function(event) {
		event.preventDefault();
		event.stopPropagation();

		var point = { x: event.clientX, y: event.clientY };
		var mousePos = this.pointFromWindow(point);
		var deltaX = mousePos.x - this.mouseStart.x;
		var deltaY = mousePos.y - this.mouseStart.y;
		var delta = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

		this.setContentTransform(this.startTranslateX + deltaX, this.startTranslateY + deltaY, undefined, undefined);

		// if the user move to much without transform success, release the mouse
		if((this.translateX == 0) && (this.translateY == 0) && (this.angle == 0) && (this.scale == 1)) {

			if(!this.transformDone && (delta > 20)) {

				this.disconnect(window, 'mousemove', this.onMouseMove, true);
				this.disconnect(window, 'mouseup', this.onMouseUp, true);

				this.onUp();

				if('createEvent' in document) {
					var mouseDownEvent = document.createEvent('MouseEvents');
					mouseDownEvent.initMouseEvent('mousedown', true, true, window, 1, this.mouseStartScreenX, this.mouseStartScreenY,
						this.mouseStartClientX, this.mouseStartClientY,
						event.ctrlKey, event.altKey, event.shiftKey,
						event.metaKey, 0, event.target);
					this.getDrawing().offsetParent.dispatchEvent(mouseDownEvent);
				}
			}
		}
		else
			this.transformDone = true;
	},

	onMouseUp: function(event) {
		event.preventDefault();
		event.stopPropagation();

		if(event.button != 0)
			return;
		
		this.disconnect(window, 'mousemove', this.onMouseMove, true);
		this.disconnect(window, 'mouseup', this.onMouseUp, true);

//		this.stopComputeInertia();
//		this.startInertia();

		this.focus();
		this.onUp();
	},

	onFingerDown: function(event) {
		if(this.lock || this.getIsDisabled())
			return;

		if(this.finger1 === undefined) {
			this.onDown();

			var start = new Ui.Point({ x: event.finger.getX(), y: event.finger.getY() });
			this.finger1 = { finger: event.finger, start: start };

			this.startAngle = this.angle;
			this.startScale = this.scale;
			this.startTranslateX = this.translateX;
			this.startTranslateY = this.translateY;

			this.startComputeInertia();

			event.preventDefault();
			event.stopPropagation();
			
			this.connect(event.finger, 'fingermove', this.onFingerMove);
			this.connect(event.finger, 'fingerup', this.onFingerUp);

			event.finger.capture(this.getDrawing());
		}
		else if(this.finger2 === undefined) {
			this.finger1.start = new Ui.Point({ x: this.finger1.finger.getX(), y: this.finger1.finger.getY() });

			var start = new Ui.Point({ x: event.finger.getX(), y: event.finger.getY() });
			this.finger2 = { finger: event.finger, start: start };

			this.startAngle = this.angle;
			this.startScale = this.scale;
			this.startTranslateX = this.translateX;
			this.startTranslateY = this.translateY;

			event.preventDefault();
			event.stopPropagation();
			
			this.connect(event.finger, 'fingermove', this.onFingerMove);
			this.connect(event.finger, 'fingerup', this.onFingerUp);

			event.finger.capture(this.getDrawing());
		}
	},

	onFingerMove: function(event) {
		event.preventDefault();
		event.stopPropagation();

		// 2 fingers
		if((this.finger1 !== undefined) && (this.finger2 !== undefined)) {
			var pos1 = this.pointFromWindow({ x: this.finger1.finger.getX(), y: this.finger1.finger.getY() });
			var pos2 = this.pointFromWindow({ x: this.finger2.finger.getX(), y: this.finger2.finger.getY() });

			var start1 = this.pointFromWindow({ x: this.finger1.start.x, y: this.finger1.start.y });
			var start2 = this.pointFromWindow({ x: this.finger2.start.x, y: this.finger2.start.y });

			var startVector = { x: start2.x - start1.x, y: start2.y - start1.y };
			var endVector = { x: pos2.x - pos1.x, y: pos2.y - pos1.y };
			startVector.norm = Math.sqrt((startVector.x * startVector.x) + (startVector.y * startVector.y));
			endVector.norm = Math.sqrt((endVector.x * endVector.x) + (endVector.y * endVector.y));

			var scale = endVector.norm / startVector.norm;

			startVector.x /= startVector.norm;
			startVector.y /= startVector.norm;

			endVector.x /= endVector.norm;
			endVector.y /= endVector.norm;

			var divVector = {
				x: (startVector.x * endVector.x + startVector.y * endVector.y),
				y: (startVector.y * endVector.x - startVector.x * endVector.y) };
			var angle = -(Math.atan2(divVector.y, divVector.x) * 180.0) / Math.PI;

//			console.log('lets transform scale: '+scale+', angle: '+angle);

//			console.log('pos1 start: ('+start1.x+','+start1.y+') , current: ('+pos1.x+','+pos1.y+')');

			var deltaMatrix = new Ui.Matrix();
			deltaMatrix.translate(pos1.x - start1.x, pos1.y - start1.y);
			deltaMatrix.translate(start1.x, start1.y);
			deltaMatrix.scale(scale, scale);
			deltaMatrix.rotate(angle);
			deltaMatrix.translate(-start1.x, -start1.y);

			deltaMatrix.translate(this.getLayoutWidth() / 2, this.getLayoutHeight() / 2);
			deltaMatrix.translate(this.startTranslateX, this.startTranslateY);
			deltaMatrix.scale(this.startScale, this.startScale);
			deltaMatrix.rotate(this.startAngle);
			deltaMatrix.translate(-this.getLayoutWidth() / 2, -this.getLayoutHeight() / 2);

			var center = new Ui.Point({ x: this.getLayoutWidth() / 2, y: this.getLayoutHeight() / 2 });
			center.matrixTransform(deltaMatrix);

			this.setContentTransform(center.x - this.getLayoutWidth() / 2, center.y - this.getLayoutHeight() / 2,
				this.startScale * scale, this.startAngle + angle);
		}
		// 1 finger
		else if(this.finger1 !== undefined) {
			var pos1 = this.pointFromWindow({ x: this.finger1.finger.getX(), y: this.finger1.finger.getY() });
			var start1 = this.pointFromWindow({ x: this.finger1.start.x, y: this.finger1.start.y });

			this.setContentTransform(this.startTranslateX + (pos1.x - start1.x), this.startTranslateY + (pos1.y - start1.y),
				this.startScale, this.startAngle);
		}

		// if the user move to much without transform success, release the finger(s)
		if((this.translateX == 0) && (this.translateY == 0) && (this.angle == 0) && (this.scale == 1)) {
			var deltaX = this.finger1.finger.getX() - this.finger1.start.x;
			var deltaY = this.finger1.finger.getY() - this.finger1.start.y;
			var delta = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

			console.log(this+'.onFingerMove tranformDone: '+this.transformDone+', delta: '+delta);

			if(!this.transformDone && (delta > 40)) {
				this.onUp();

				if(this.finger2 !== undefined) {
					this.disconnect(this.finger2.finger, 'fingermove', this.onFingerMove);
					this.disconnect(this.finger2.finger, 'fingerup', this.onFingerUp);
					this.finger2.finger.release();
					this.finger2 = undefined;
				}
				this.disconnect(this.finger1.finger, 'fingermove', this.onFingerMove);
				this.disconnect(this.finger1.finger, 'fingerup', this.onFingerUp);
				this.finger1.finger.release();
				this.finger1 = undefined;
			}
		}
		else
			this.transformDone = true;
	},


	onFingerUp: function(event) {
		event.preventDefault();
		event.stopPropagation();

		this.disconnect(event.finger, 'fingermove', this.onFingerMove);
		this.disconnect(event.finger, 'fingerup', this.onFingerUp);

		if((this.finger1 !== undefined) && (this.finger1.finger === event.finger)) {
			this.finger1 = undefined;
			if(this.finger2 !== undefined) {
				this.finger1 = this.finger2;
				this.finger2 = undefined;
				this.finger1.start = new Ui.Point({ x: this.finger1.finger.getX(), y: this.finger1.finger.getY() });
				this.startAngle = this.angle;
				this.startScale = this.scale;
				this.startTranslateX = this.translateX;
				this.startTranslateY = this.translateY;
			}
			else {
				this.focus();
				this.onUp();

				this.stopComputeInertia();
				this.startInertia();
			}
		}
		if((this.finger2 !== undefined) && (this.finger2.finger === event.finger)) {
			this.finger2 = undefined;
			this.finger1.start = new Ui.Point({ x: this.finger1.finger.getX(), y: this.finger1.finger.getY() });
			this.startAngle = this.angle;
			this.startScale = this.scale;
			this.startTranslateX = this.translateX;
			this.startTranslateY = this.translateY;
		}
	},

	onMouseWheel: function(event) {
		event.preventDefault();
		event.stopPropagation();

		var delta = 0;

		if((event.wheelDeltaX !== undefined) && (event.wheelDelaY !== undefined)) {
			delta = Math.sqrt(event.wheelDeltaX * event.wheelDeltaX + event.wheelDelaY * event.wheelDelaY);
			delta /= 5;
		}
		// Opera, Chrome, IE
		else if(event.wheelDelta !== undefined)
			delta = -event.wheelDelta / 2;
		// Firefox
		else if(event.detail !== undefined)
			delta = event.detail * 10;
		
		if(event.altKey)
			this.setAngle(this.angle + delta/5);
		else
			this.setScale(Math.max(0.1, this.scale - delta/120));
	},

	measureSpeed: function() {
		// compute speed
		var currentTime = (new Date().getTime())/1000;
		var deltaTime = currentTime - this.lastTime;

		if(deltaTime < 0.025)
			return;

		var deltaAngle = this.angle - this.lastAngle;
		var deltaTranslateX = this.translateX - this.lastTranslateX;
		var deltaTranslateY = this.translateY - this.lastTranslateY;
		this.speedX = deltaTranslateX / deltaTime;
		this.speedY = deltaTranslateY / deltaTime;
		this.speedAngle = deltaAngle / deltaTime;

		this.lastTime = currentTime;

		this.lastAngle = this.angle;
		this.lastTranslateX = this.translateX;
		this.lastTranslateY = this.translateY;
		this.speedComputed = true;
	},

	getInertia: function() {
		return this.inertia;
	},

	setInertia: function(inertiaActive) {
		this.inertia = inertiaActive;
	},

	startComputeInertia: function() {
		this.stopInertia();

		if(this.measureSpeedTimer != undefined)
			this.measureSpeedTimer.abort();

		this.lastTranslateX = this.translateX;
		this.lastTranslateY = this.translateY;
		this.lastTime = (new Date().getTime())/1000;
		this.speedX = 0;
		this.speedY = 0;
		this.speedAngle = 0;
		this.speedComputed = false;
		this.measureSpeedTimer = new Core.Timer({ interval: 0.025, onTimeupdate: this.measureSpeed });
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
			var deltaAngle = this.angle - this.lastAngle;
			var deltaTranslateX = this.translateX - this.lastTranslateX;
			var deltaTranslateY = this.translateY - this.lastTranslateY;
			this.speedX = deltaTranslateX / deltaTime;
			this.speedY = deltaTranslateY / deltaTime;
			this.speedAngle = deltaAngle / deltaTime;
		}
	},

	startInertia: function() {
		if((this.inertiaClock === undefined) && this.inertia) {
			this.inertiaClock = new Anim.Clock({
				duration: 'forever', scope: this, target: this, onTimeupdate: this.onTimeupdate
			});
			this.inertiaClock.begin();
		}
	},

	onTimeupdate: function(clock, progress, delta) {
		if(delta == 0)
			return;

		var oldTranslateX = this.translateX;
		var oldTranslateY = this.translateY;

		var translateX = this.translateX + (this.speedX * delta);
		var translateY = this.translateY + (this.speedY * delta);

		var angle = this.angle + (this.speedAngle * delta);

		this.setContentTransform(translateX, translateY, undefined, angle);

		if((this.translateX == oldTranslateX) && (this.translateY == oldTranslateY)) {
			this.stopInertia();
			return;
		}
		this.speedX -= this.speedX * delta * 3;
		this.speedY -= this.speedY * delta * 3;

		this.speedAngle -= this.speedAngle * delta * 3;

		if(Math.abs(this.speedX) < 0.1)
			this.speedX = 0;
		if(Math.abs(this.speedY) < 0.1)
			this.speedY = 0;
		if((this.speedX == 0) && (this.speedY == 0))
			this.stopInertia();
	},


	stopInertia: function() {
		if(this.inertiaClock != undefined) {
			this.inertiaClock.stop();
			this.inertiaClock = undefined;
		}
	}
	/**#@-*/
}, {
	setContent: function(content) {
		this.contentBox.setContent(content);
	}
});
