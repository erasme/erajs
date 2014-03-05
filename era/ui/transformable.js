Ui.LBox.extend('Ui.Transformable', 
/**@lends Ui.Transformable#*/
{
	inertia: true,
	mouseStart: undefined,
	contentBox: undefined,

	speedComputed: false,
	lastTranslateX: undefined,
	lastTranslateY: undefined,
	lastAngle: 0,
	isDown: false,
	transformDone: false,
	transformLock: false,

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

	allowScale: true,
	allowRotate: true,
	allowTranslate: true,

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


		this.connect(this.contentBox.getDrawing(), 'touchstart', this.onTouchStart);
		this.connect(this.contentBox.getDrawing(), 'touchmove', this.onTouchMove);
		this.connect(this.contentBox.getDrawing(), 'touchend', this.onTouchEnd);
		this.connect(this.contentBox.getDrawing(), 'touchcancel', this.onTouchCancel);

//		this.connect(this.contentBox.getDrawing(), 'fingerdown', this.onFingerDown);
		this.connect(this.contentBox.getDrawing(), 'mousedown', this.onMouseDown);
		this.connect(this.contentBox.getDrawing(), 'mousewheel', this.onMouseWheel);
		this.connect(this.contentBox.getDrawing(), 'DOMMouseScroll', this.onMouseWheel);
	},

	setAllowScale: function(allow) {
		this.allowScale = allow;
	},

	setAllowRotate: function(allow) {
		this.allowRotate = allow;
	},

	setAllowTranslate: function(allow) {
		this.allowTranslate = allow;
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

	buildMatrix: function(translateX, translateY, scale, angle) {
		if(translateX === undefined)
			translateX = this.translateX;
		if(translateY === undefined)
			translateY = this.translateY;
		if(scale === undefined)
			scale = this.scale;
		if(angle === undefined)
			angle = this.angle;

		var matrix = new Ui.Matrix();
		matrix.translate(this.getLayoutWidth() / 2, this.getLayoutHeight() / 2);
		matrix.translate(translateX, translateY);
		matrix.scale(scale, scale);
		matrix.rotate(angle);
		matrix.translate(-this.getLayoutWidth() / 2, -this.getLayoutHeight() / 2);
		return matrix;
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

	getBoundaryBox: function(matrix) {
		if(matrix === undefined)
			matrix = this.getMatrix();
		var p1 = (new Ui.Point({ x: 0, y: 0 })).matrixTransform(matrix);
		var p2 = (new Ui.Point({ x: this.getLayoutWidth(), y: 0 })).matrixTransform(matrix);
		var p3 = (new Ui.Point({ x: this.getLayoutWidth(), y: this.getLayoutHeight() })).matrixTransform(matrix);
		var p4 = (new Ui.Point({ x: 0, y: this.getLayoutHeight() })).matrixTransform(matrix);

		var minX = Math.min(p1.x, Math.min(p2.x, Math.min(p3.x, p4.x)));
		var minY = Math.min(p1.y, Math.min(p2.y, Math.min(p3.y, p4.y)));
		var maxX = Math.max(p1.x, Math.max(p2.x, Math.max(p3.x, p4.x)));
		var maxY = Math.max(p1.y, Math.max(p2.y, Math.max(p3.y, p4.y)));

		return { x: minX, y: minY, width: maxX-minX, height: maxY-minY };
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

		if(!this.transformLock) {
			this.transformLock = true;
			this.fireEvent('transform', this);
			this.transformLock = false;
		}
	},

	/**#@+
	 * @private
	 */

	onDown: function() {
		this.isDown = true;
//		this.transformDone = false;
		this.fireEvent('down', this);
	},

	onUp: function() {
		this.isDown = false;
		this.fireEvent('up', this);
	},

	onMouseDown: function(event) {
		console.log(this+'.onMouseDown');

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
/*		if((this.translateX == 0) && (this.translateY == 0) && (this.angle == 0) && (this.scale == 1)) {

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
			this.transformDone = true;*/
	},

	onMouseUp: function(event) {
		event.preventDefault();
		event.stopPropagation();

		if(event.button !== 0)
			return;
		
		this.disconnect(window, 'mousemove', this.onMouseMove, true);
		this.disconnect(window, 'mouseup', this.onMouseUp, true);

//		this.stopComputeInertia();
//		this.startInertia();

		this.focus();
		this.onUp();
	},

	onTouchStart: function(event) {
//		console.log(this+'.onTouchStart '+event.changedTouches.length+', id: '+event.changedTouches[0].identifier);
		if(this.lock || this.getIsDisabled() || (event.changedTouches.length > 2))
			return;
		for(var i = 0; i < event.changedTouches.length; i++)
			this.onFingerDown(event.changedTouches[i].identifier, event.changedTouches[i].clientX, event.changedTouches[i].clientY);
		
		if(((this.finger1 !== undefined) && (this.finger2 !== undefined)) ||
			((this.finger1 !== undefined) && (this.allowTranslate))) {
			event.preventDefault();
			event.stopPropagation();
		}
	},

	onTouchMove: function(event) {
		if(this.finger1 === undefined)
			return;
//		console.log(this+'.onTouchMove '+event.changedTouches.length+', id: '+event.changedTouches[0].identifier);
		for(var i = 0; i < event.changedTouches.length; i++) {
			this.onFingerMove(event.changedTouches[i].identifier, event.changedTouches[i].clientX, event.changedTouches[i].clientY);
		}
		if(((this.finger1 !== undefined) && (this.finger2 !== undefined)) ||
			((this.finger1 !== undefined) && (this.allowTranslate))) {
			event.preventDefault();
			event.stopPropagation();
		}
	},

	onTouchCancel: function(event) {
		if(this.finger1 === undefined)
			return;
//		console.log(this+'.onTouchCancel '+event.changedTouches.length+', id: '+event.changedTouches[0].identifier);
		this.onTouchEnd(event);
	},

	onTouchEnd: function(event) {
		if(this.finger1 === undefined)
			return;
//		console.log(this+'.onTouchEnd '+event.changedTouches.length+', id: '+event.changedTouches[0].identifier);
		for(var i = 0; i < event.changedTouches.length; i++) {
			this.onFingerUp(event.changedTouches[i].identifier, event.changedTouches[i].clientX, event.changedTouches[i].clientY);
		}
		if(((this.finger1 !== undefined) && (this.finger2 !== undefined)) ||
			((this.finger1 !== undefined) && (this.allowTranslate))) {
			event.preventDefault();
			event.stopPropagation();
		}
	},

	onFingerDown: function(identifier, x, y) {
		if(this.finger1 === undefined) {
			if(this.allowTranslate)
				this.onDown();

//			console.log('onFingerDown identifier: '+identifier);

			this.finger1 = { identifier: identifier, start: {x: x, y: y }, current: {x: x, y: y } };

			this.startAngle = this.angle;
			this.startScale = this.scale;
			this.startTranslateX = this.translateX;
			this.startTranslateY = this.translateY;

			this.startComputeInertia();
		}
		else if(this.finger2 === undefined) {
			if(!this.allowTranslate)
				this.onDown();

			this.finger1.start = { x: this.finger1.current.x, y: this.finger1.current.y };

			this.finger2 = { identifier: identifier, start: { x: x, y: y }, current: { x: x, y: y } };

			this.startAngle = this.angle;
			this.startScale = this.scale;
			this.startTranslateX = this.translateX;
			this.startTranslateY = this.translateY;
		}
	},

	onFingerMove: function(identifier, x, y) {
		var pos1; var pos2; var start1; var start2;
//		console.log('onFingerMove identifier: '+identifier+', finger1: '+this.finger1.identifier);
		// update the fingers positions
		if((this.finger1 !== undefined) && (this.finger1.identifier === identifier))
			this.finger1.current = { x: x, y: y };
		else if((this.finger2 !== undefined) && (this.finger2.identifier === identifier))
			this.finger2.current = { x: x, y: y };
		else
			return;
							
		// 2 fingers
		if((this.finger1 !== undefined) && (this.finger2 !== undefined)) {
//			console.log('onFingerMove 2 FINGERS INTERACT');
//			console.log('FINGER1 START: '+this.finger1.start.x+','+this.finger1.start.y+', current: '+
//				this.finger1.current.x+','+this.finger1.current.y);
			//console.log(this.finger1.current);
			//console.log(this.finger2.current);

			pos1 = this.pointFromWindow({ x: this.finger1.current.x, y: this.finger1.current.y });
			pos2 = this.pointFromWindow({ x: this.finger2.current.x, y: this.finger2.current.y });

			start1 = this.pointFromWindow({ x: this.finger1.start.x, y: this.finger1.start.y });
			start2 = this.pointFromWindow({ x: this.finger2.start.x, y: this.finger2.start.y });

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
		else if((this.finger1 !== undefined) && this.allowTranslate) {
//			console.log('onFingerMove 1 FINGER');


			pos1 = this.pointFromWindow({ x: this.finger1.current.x, y: this.finger1.current.y });
			start1 = this.pointFromWindow({ x: this.finger1.start.x, y: this.finger1.start.y });

			this.setContentTransform(this.startTranslateX + (pos1.x - start1.x), this.startTranslateY + (pos1.y - start1.y),
				this.startScale, this.startAngle);
		}

		// if the user move to much without transform success, release the finger(s)
/*		if((this.translateX == 0) && (this.translateY == 0) && (this.angle == 0) && (this.scale == 1)) {
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
			this.transformDone = true;*/
	},

	onFingerUp: function(identifier, x, y) {
//		console.log('onFingerUp');

		if((this.finger1 !== undefined) && (this.finger1.identifier === identifier)) {
			this.finger1 = undefined;
			if(this.finger2 !== undefined) {
				this.finger1 = this.finger2;
				this.finger2 = undefined;
				this.finger1.start = { x: this.finger1.current.x, y: this.finger1.current.y };
				this.startAngle = this.angle;
				this.startScale = this.scale;
				this.startTranslateX = this.translateX;
				this.startTranslateY = this.translateY;
				if(!this.allowTranslate)
					this.onUp();
			}
			else {
				if(this.allowTranslate)
					this.onUp();
				this.stopComputeInertia();
				this.startInertia();
			}
		}
		if((this.finger2 !== undefined) && (this.finger2.identifier === identifier)) {
			this.finger2 = undefined;
			this.finger1.start = { x: this.finger1.current.x, y: this.finger1.current.y };
			this.startAngle = this.angle;
			this.startScale = this.scale;
			this.startTranslateX = this.translateX;
			this.startTranslateY = this.translateY;
			if(!this.allowTranslate)
					this.onUp();
		}
	},

	onMouseWheel: function(event) {
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
		else if(event.shiftKey)
			this.setScale(Math.max(0.1, this.scale - delta/120));
		else
			return;		

		event.preventDefault();
		event.stopPropagation();
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

		if(this.measureSpeedTimer !== undefined)
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
		if(this.measureSpeedTimer !== undefined) {
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
		if(delta === 0)
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
		if((this.speedX === 0) && (this.speedY === 0))
			this.stopInertia();
	},
	
	stopInertia: function() {
		if(this.inertiaClock !== undefined) {
			this.inertiaClock.stop();
			this.inertiaClock = undefined;
		}
	}
	/**#@-*/
}, {
	setContent: function(content) {
		this.contentBox.setContent(content);
	},

	arrangeCore: function(width, height) {
		Ui.Transformable.base.arrangeCore.apply(this, arguments);
		this.contentBox.setTransformOrigin(0, 0);
		this.contentBox.setTransform(this.getMatrix());
	}
});
