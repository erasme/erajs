//
// Define the Transformable class.
//
Ui.LBox.extend('Ui.Transformable', {
	mouseStart: undefined,
	contentBox: undefined,
	content: undefined,
	posX: 0,
	posY: 0,
	isMoving: false,
	hasMoved: false,
	lastPosX: undefined,
	lastPosY: undefined,
	touchId: undefined,
	touchStart: undefined,
	isDown: false,

	touches: undefined,
	touch1: undefined,
	touch2: undefined,

	angle: 0,
	scale: 1,
	translateX: 0,
	translateY: 0,

	startAngle: 0,
	startScale: 0,
	startTranslateX: 0,
	startTranslateY: 0,

	constructor: function(config) {
		this.addEvents('down', 'up', 'transform');
		this.setFocusable(true);

		this.contentBox = new Ui.LBox();
		this.appendChild(this.contentBox);

		this.contentBox.getDrawing().style.cursor = 'move';

		this.touches = {};

//		this.connect(this.contentBox.getDrawing(), 'mousedown', this.onMouseDown);
		this.connect(this.contentBox.getDrawing(), 'touchstart', this.onNativeTouchStart);
		this.connect(this.contentBox.getDrawing(), 'touchmove', this.onNativeTouchMove);
		this.connect(this.contentBox.getDrawing(), 'touchend', this.onNativeTouchEnd);
	},

	getIsDown: function() {
		return this.isDown;
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

	setContentTransform: function(translateX, translateY, scale, angle) {
		if(translateX == undefined)
			translateX = this.translateX;
		if(translateY == undefined)
			translateY = this.translateY;
		if(scale == undefined)
			scale = this.scale;
		if(angle == undefined)
			angle = this.angle;
		this.translateX = translateX;
		this.translateY = translateY;
		this.scale = scale;
		this.angle = angle;

		var matrix = new Ui.Matrix();
		matrix.translate(this.getLayoutWidth() / 2, this.getLayoutHeight() / 2);
		matrix.translate(this.translateX, this.translateY);
		matrix.scale(this.scale, this.scale);
		matrix.rotate(this.angle);
		matrix.translate(-this.getLayoutWidth() / 2, -this.getLayoutHeight() / 2);

		this.contentBox.setTransformOrigin(0, 0);
		this.contentBox.setTransform(matrix);

		this.fireEvent('transform', this);
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

/*	onMouseDown: function(event) {
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
	},*/

	updateTouches: function(event) {
		for(var id in this.touches) {
			var found = false;
			for(var i = 0; (i < event.touches.length) && !found; i++) {
				if(id == event.touches[i].identifier) {
					found = true;
					if((this.touches[id].x != event.touches[i].clientX) || (this.touches[id].y != event.touches[i].clientY)) {
						this.touches[id].x = event.touches[i].clientX;
						this.touches[id].y = event.touches[i].clientY;
						this.onTouchMove(this.touches[id]);
					}
				}
			}
			if(!found) {
				this.onTouchLeave(this.touches[id]);
				delete(this.touches[id]);
			}
		}
		for(var i = 0; i < event.targetTouches.length; i++) {
			if(this.touches[event.targetTouches[i].identifier] == undefined) {
				this.touches[event.targetTouches[i].identifier] = { id: event.targetTouches[i].identifier, x: event.targetTouches[i].clientX, y: event.targetTouches[i].clientY };
				this.onTouchEnter(this.touches[event.targetTouches[i].identifier]);
			}
		}
	},

	onNativeTouchStart: function(event) {
		if(this.getIsDisabled())
			return;

		this.updateTouches(event);

/*		console.log('onTouchStart '+Object.keys(this.touches).length);

		for(var id in this.touches)
			console.log('touch id: '+id+', pos: '+this.touches[id].x+','+this.touches[id].y);

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
		this.startPosY = this.posY;*/
	},

	onNativeTouchMove: function(event) {
		this.updateTouches(event);
/*
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
		posY = this.startPosY + deltaY;*/
	},

	onNativeTouchEnd: function(event) {

		this.updateTouches(event);

/*		console.log('onTouchEnd '+Object.keys(this.touches).length);

		for(var id in this.touches)
			console.log('touch id: '+id);


		if(!this.isMoving)
			return;

		event.preventDefault();
		event.stopPropagation();

		this.isMoving = false;

		this.onUp();*/
	},

	onTouchEnter: function(touch) {
//		console.log('touch enter id: '+touch.id);

		if(this.touch1 == undefined) {
//			var start = this.pointFromWindow({ x: touch.x, y: touch.y });
			var start = new Ui.Point({ x: touch.x, y: touch.y });
			this.touch1 = { touch: touch, start: start };
		}
		else if(this.touch2 == undefined) {
//			var start = this.pointFromWindow({ x: touch.x, y: touch.y });
			var start = new Ui.Point({ x: touch.x, y: touch.y });
			this.touch2 = { touch: touch, start: start };

			this.startAngle = this.angle;
			this.startScale = this.scale;
			this.startTranslateX = this.translateX;
			this.startTranslateY = this.translateY;
		}
		else {
			console.log('too many touches');
		}
	},

	onTouchLeave: function(touch) {
//		console.log('touch leave id: '+touch.id);
		if((this.touch1 != undefined) && (this.touch1.touch == touch))
			this.touch1 = undefined;
		if((this.touch2 != undefined) && (this.touch2.touch == touch))
			this.touch2 = undefined;
	},

	onTouchMove: function(touch) {
//		console.log('touch move id: '+touch.id+' ('+touch.x+','+touch.y+')');

		if((this.touch1 != undefined) && (this.touch2 != undefined)) {
			var pos1 = this.pointFromWindow({ x: this.touch1.touch.x, y: this.touch1.touch.y });
			var pos2 = this.pointFromWindow({ x: this.touch2.touch.x, y: this.touch2.touch.y });

			var start1 = this.pointFromWindow({ x: this.touch1.start.x, y: this.touch1.start.y });
			var start2 = this.pointFromWindow({ x: this.touch2.start.x, y: this.touch2.start.y });

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

/*			this.angle = this.startAngle + angle;
			this.scale = this.startScale * scale;
			this.translateX = center.x - this.getLayoutWidth() / 2;
			this.translateY = center.y - this.getLayoutHeight() / 2;

			var transmatrix = new Ui.Matrix();
			transmatrix.translate(this.getLayoutWidth() / 2, this.getLayoutHeight() / 2);
			transmatrix.translate(this.translateX, this.translateY);
			transmatrix.scale(this.scale, this.scale);
			transmatrix.rotate(this.angle);
			transmatrix.translate(-this.getLayoutWidth() / 2, -this.getLayoutHeight() / 2);

			this.contentBox.setTransformOrigin(0, 0);
			this.contentBox.setTransform(transmatrix);

			this.fireEvent('transform', this);*/
		}
	},
}, {
});
