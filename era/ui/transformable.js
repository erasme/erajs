Ui.LBox.extend('Ui.Transformable', 
/**@lends Ui.Transformable#*/
{
	inertia: false,
	inertiaClock: undefined,
	contentBox: undefined,

	isDown: false,
	transformLock: false,

	watcher1: undefined,
	watcher2: undefined,

	angle: 0,
	scale: 1,
	translateX: 0,
	translateY: 0,

	startAngle: 0,
	startScale: 0,
	startTranslateX: 0,
	startTranslateY: 0,

	allowScale: true,
	minScale: 0.1,
	maxScale: 10,
	allowRotate: true,
	allowTranslate: true,

	speedX: 0,
	speedY: 0,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.LBox
	 */
	constructor: function(config) {
		this.addEvents('down', 'up', 'transform', 'inertiastart', 'inertiaend');
		this.setFocusable(true);

		this.contentBox = new Ui.LBox();
		this.contentBox.setTransformOrigin(0, 0, true);
		this.appendChild(this.contentBox);

		this.connect(this, 'ptrdown', this.onPointerDown);

		this.connect(this, 'wheel', this.onWheel);
	},

	setAllowScale: function(allow) {
		this.allowScale = allow;
	},

	setMinScale: function(minScale)  {
		this.minScale = minScale;
	},

	setMaxScale: function(maxScale) {
		this.maxScale = maxScale;
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

	getIsInertia: function() {
		return this.inertiaClock !== undefined;
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

		return Ui.Matrix.createTranslate(this.getLayoutWidth() * this.transformOriginX, this.getLayoutHeight()  * this.transformOriginX).
			translate(translateX, translateY).
			scale(scale, scale).
			rotate(angle).
			translate(-this.getLayoutWidth() * this.transformOriginX, -this.getLayoutHeight()  * this.transformOriginX);
	},

	getMatrix: function() {
		return Ui.Matrix.createTranslate(this.getLayoutWidth() * this.transformOriginX, this.getLayoutHeight()  * this.transformOriginX).
			translate(this.translateX, this.translateY).
			scale(this.scale, this.scale).
			rotate(this.angle).
			translate(-this.getLayoutWidth() * this.transformOriginX, -this.getLayoutHeight()  * this.transformOriginX);
	},

	getBoundaryBox: function(matrix) {
		if(matrix === undefined)
			matrix = this.getMatrix();
		var p1 = (new Ui.Point({ x: 0, y: 0 })).multiply(matrix);
		var p2 = (new Ui.Point({ x: this.getLayoutWidth(), y: 0 })).multiply(matrix);
		var p3 = (new Ui.Point({ x: this.getLayoutWidth(), y: this.getLayoutHeight() })).multiply(matrix);
		var p4 = (new Ui.Point({ x: 0, y: this.getLayoutHeight() })).multiply(matrix);

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

		if(!this.transformLock) {
			this.transformLock = true;
			this.fireEvent('transform', this);

			var testOnly = !(((this.watcher1 === undefined) || this.watcher1.getIsCaptured()) &&
				((this.watcher2 === undefined) || this.watcher2.getIsCaptured()));

			this.onContentTransform(testOnly);
			this.transformLock = false;
		}
	},

	/**#@+
	 * @private
	 */

	 onContentTransform: function(testOnly) {
	 	if(testOnly !== true)
			this.contentBox.setTransform(this.getMatrix());
	 },

	onDown: function() {
		this.isDown = true;
		this.fireEvent('down', this);
	},

	onUp: function() {
		this.isDown = false;
		this.fireEvent('up', this);
	},
	
	onPointerDown: function(event) {
		this.stopInertia();

		if(this.watcher1 === undefined) {
			if(this.allowTranslate)
				this.onDown();
			
			var watcher = event.pointer.watch(this);
			this.watcher1 = watcher;
			this.connect(watcher, 'move', this.onPointerMove);
			this.connect(watcher, 'up', this.onPointerUp);
			this.connect(watcher, 'cancel', this.onPointerCancel);

			this.startAngle = this.angle;
			this.startScale = this.scale;
			this.startTranslateX = this.translateX;
			this.startTranslateY = this.translateY;
		}
		else if(this.watcher2 === undefined) {
			if(!this.allowTranslate)
				this.onDown();
			
			this.watcher1.pointer.setInitialPosition(this.watcher1.pointer.getX(), this.watcher1.pointer.getY());

			var watcher = event.pointer.watch(this);
			this.watcher2 = watcher;
			this.connect(watcher, 'move', this.onPointerMove);
			this.connect(watcher, 'up', this.onPointerUp);
			this.connect(watcher, 'cancel', this.onPointerUp);

			this.startAngle = this.angle;
			this.startScale = this.scale;
			this.startTranslateX = this.translateX;
			this.startTranslateY = this.translateY;
		}
	},

	onPointerMove: function(watcher) {
		var pos1; var pos2; var start1; var start2;
							
		// 2 fingers
		if((this.watcher1 !== undefined) && (this.watcher2 !== undefined)) {

			if(!this.watcher1.getIsCaptured() && this.watcher1.pointer.getIsMove())
				this.watcher1.capture();
			if(!this.watcher2.getIsCaptured() && this.watcher2.pointer.getIsMove())
				this.watcher2.capture();
			
			pos1 = this.pointFromWindow({ x: this.watcher1.pointer.getX(), y: this.watcher1.pointer.getY() });
			pos2 = this.pointFromWindow({ x: this.watcher2.pointer.getX(), y: this.watcher2.pointer.getY() });

			start1 = this.pointFromWindow({ x: this.watcher1.pointer.getInitialX(), y: this.watcher1.pointer.getInitialY() });
			start2 = this.pointFromWindow({ x: this.watcher2.pointer.getInitialX(), y: this.watcher2.pointer.getInitialY() });

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

			var deltaMatrix = Ui.Matrix.createTranslate(pos1.x - start1.x, pos1.y - start1.y).translate(start1.x, start1.y);
			if(this.allowScale) {
				if((this.minScale !== undefined) || (this.maxScale !== undefined)) {
					var totalScale = this.startScale * scale;
					if((this.minScale !== undefined) && (totalScale < this.minScale))
						totalScale = this.minScale;
					if((this.maxScale !== undefined) && (totalScale > this.maxScale))
						totalScale = this.maxScale;
					scale = totalScale / this.startScale;
				}
				deltaMatrix = deltaMatrix.scale(scale, scale);
			}
			else
				scale = 1;
			if(this.allowRotate)
				deltaMatrix = deltaMatrix.rotate(angle);
			else
				angle = 0;
			deltaMatrix = deltaMatrix.translate(-start1.x, -start1.y);

			var origin = new Ui.Point({ x: this.getLayoutWidth() * this.transformOriginX, y: this.getLayoutHeight()  * this.transformOriginX });
			deltaMatrix = deltaMatrix.translate(origin.x, origin.y).
				translate(this.startTranslateX, this.startTranslateY).
				scale(this.startScale, this.startScale).
				rotate(this.startAngle).
				translate(-origin.x, -origin.y);
			
			origin = origin.multiply(deltaMatrix);

			this.setContentTransform(origin.x - this.getLayoutWidth() * this.transformOriginX,
				origin.y - this.getLayoutHeight() * this.transformOriginY,
				this.startScale * scale, this.startAngle + angle);
		}
		// 1 finger
		else if((this.watcher1 !== undefined) && this.allowTranslate) {

			pos1 = this.pointFromWindow({ x: this.watcher1.pointer.getX(), y: this.watcher1.pointer.getY() });
			start1 = this.pointFromWindow({ x: this.watcher1.pointer.getInitialX(), y: this.watcher1.pointer.getInitialY() });

			var deltaX = pos1.x - start1.x;
			var deltaY = pos1.y - start1.y;
			var delta = Math.sqrt(deltaX*deltaX + deltaY*deltaY);

			this.setContentTransform(this.startTranslateX + (pos1.x - start1.x), this.startTranslateY + (pos1.y - start1.y),
				this.startScale, this.startAngle);
			
			var takenDeltaX = (this.translateX - this.startTranslateX);
			var takenDeltaY = (this.translateY - this.startTranslateY);
			var takenDelta = Math.sqrt(takenDeltaX*takenDeltaX + takenDeltaY*takenDeltaY);

			var test = 0;
			if(delta > 0)
				test = (takenDelta/delta);

			if(!this.watcher1.getIsCaptured() && this.watcher1.pointer.getIsMove() && (test > 0.7))
				this.watcher1.capture();
			
		}
	},

	onPointerCancel: function(watcher) {
		this.onPointerUp(watcher);
		this.stopInertia();

		// revert the changes
		this.angle = this.startAngle;
		this.scale = this.startScale;
		this.translateX = this.startTranslateX;
		this.translateY = this.startTranslateY;
	},

	onPointerUp: function(watcher) {
		if((this.watcher1 !== undefined) && (this.watcher1 === watcher)) {
			if(this.watcher2 !== undefined) {
				this.watcher1 = this.watcher2;
				this.watcher2 = undefined;
				this.watcher1.pointer.setInitialPosition(this.watcher1.pointer.getX(), this.watcher1.pointer.getY());
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
				
				var speed = this.watcher1.getSpeed();
				this.speedX = speed.x;
				this.speedY = speed.y;
				this.watcher1 = undefined;
				this.startInertia();
			}
		}
		if((this.watcher2 !== undefined) && (this.watcher2 === watcher)) {
			this.watcher2 = undefined;
			this.watcher1.pointer.setInitialPosition(this.watcher1.pointer.getX(), this.watcher1.pointer.getY());
			this.startAngle = this.angle;
			this.startScale = this.scale;
			this.startTranslateX = this.translateX;
			this.startTranslateY = this.translateY;
			if(!this.allowTranslate)
					this.onUp();
		}
	},

	onWheel: function(event) {
		var delta = 0;

		delta = event.deltaX + event.deltaY;

		if(event.altKey) {
			if(this.allowRotate) {
				var angle = delta/5;

				var pos = this.pointFromWindow({ x: event.clientX, y: event.clientY });
				var origin = new Ui.Point({ x: this.getLayoutWidth() * this.transformOriginX, y: this.getLayoutHeight()  * this.transformOriginX });

				var deltaMatrix = Ui.Matrix.createTranslate(pos.x, pos.y).
					rotate(angle, angle).
					translate(-pos.x, -pos.y).
					translate(origin.x, origin.y).
					translate(this.translateX, this.translateY).
					scale(this.scale, this.scale).
					rotate(this.angle).
					translate(-origin.x, -origin.y);

				origin = origin.multiply(deltaMatrix);

				this.setContentTransform(origin.x - this.getLayoutWidth() * this.transformOriginX,
					origin.y - this.getLayoutHeight() * this.transformOriginY,
					this.scale, this.angle + angle);
			}
		}
		else if(event.ctrlKey) {
			if(this.allowScale) {
				var scale = Math.pow(2, (Math.log(this.scale) / Math.log(2)) - delta/60);
				if((this.minScale !== undefined) && (scale < this.minScale))
					scale = this.minScale;
				if((this.maxScale !== undefined) && (scale > this.maxScale))
					scale = this.maxScale;
				
				var deltaScale = scale / this.scale;

				var pos = this.pointFromWindow({ x: event.clientX, y: event.clientY });
				var origin = new Ui.Point({ x: this.getLayoutWidth() * this.transformOriginX, y: this.getLayoutHeight()  * this.transformOriginX });

				var deltaMatrix = Ui.Matrix.createTranslate(pos.x, pos.y).
					scale(deltaScale, deltaScale).
					translate(-pos.x, -pos.y).
					translate(origin.x, origin.y).
					translate(this.translateX, this.translateY).
					scale(this.scale, this.scale).
					rotate(this.angle).
					translate(-origin.x, -origin.y);
				
				origin = origin.multiply(deltaMatrix);

				this.setContentTransform(origin.x - this.getLayoutWidth() * this.transformOriginX,
					origin.y - this.getLayoutHeight() * this.transformOriginY,
					scale, this.angle);
			}
		}
		else
			return;		

		event.stopPropagation();
	},

	getInertia: function() {
		return this.inertia;
	},

	setInertia: function(inertiaActive) {
		this.inertia = inertiaActive;
	},

	startInertia: function() {
		if((this.inertiaClock === undefined) && this.inertia) {
			this.inertiaClock = new Anim.Clock({
				duration: 'forever', target: this
			});
			this.connect(this.inertiaClock, 'timeupdate', this.onTimeupdate);
			this.inertiaClock.begin();
			this.fireEvent('inertiastart', this);
		}
	},

	onTimeupdate: function(clock, progress, delta) {
		if(delta === 0)
			return;
		
		var oldTranslateX = this.translateX;
		var oldTranslateY = this.translateY;

		var translateX = this.translateX + (this.speedX * delta);
		var translateY = this.translateY + (this.speedY * delta);

		this.setContentTransform(translateX, translateY, undefined, undefined);

		if((this.translateX === oldTranslateX) && (this.translateY === oldTranslateY)) {
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
	},
	
	stopInertia: function() {
		if(this.inertiaClock !== undefined) {
			this.inertiaClock.stop();
			this.inertiaClock = undefined;
			this.fireEvent('inertiaend', this);
		}
	}
	/**#@-*/
}, {
	getContent: function(content) {
		return this.contentBox.getFirstChild();
	},

	setContent: function(content) {
		this.contentBox.setContent(content);
	},

	arrangeCore: function(width, height) {
		Ui.Transformable.base.arrangeCore.apply(this, arguments);
		this.onContentTransform();
	}
});
