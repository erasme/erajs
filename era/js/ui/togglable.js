//
// Define the Togglable class.
//
Ui.LBox.extend('Ui.Togglable', {
	isEnable: true,
	isDown: false,

//
// TODO
//

	constructor: function(config) {
		this.getDrawing().style.cursor = 'pointer';

		this.setFocusable(true);
		this.setRole('button');

		this.addEvents('press', 'down', 'up', 'disable', 'enable');

		// handle mouse
		this.connect(this.getDrawing(), 'mousedown', this.onMouseDown);

		// handle touches
		this.connect(this.getDrawing(), 'touchstart', this.onTouchStart);
		this.connect(this.getDrawing(), 'touchmove', this.onTouchMove);
		this.connect(this.getDrawing(), 'touchend', this.onTouchEnd);

		// handle keyboard
		this.connect(this, 'keydown', this.onKeyDown);
	},

	disable: function() {
		if(this.isEnable) {
			this.isEnable = false;
			this.fireEvent('disable', this);
		}
	},
	
	enable: function() {
		if(!this.isEnable) {
			this.isEnable = true;
			this.fireEvent('enable', this);
		}
	},

	//
	// Private
	//

	onMouseDown: function(event) {
		if((event.button != 0) || (!this.isEnable))
			return;

		event.preventDefault();
		event.stopPropagation();

		this.mouseStartX = event.screenX;
		this.mouseStartY = event.screenY;

		this.connect(window, 'mousemove', this.onMouseMove, true);
		this.connect(window, 'mouseup', this.onMouseUp, true);
		this.onDown();
	},

	onMouseMove: function(event) {
		var deltaX = event.screenX - this.mouseStartX;
		var deltaY = event.screenY - this.mouseStartY;
		var delta = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

		event.preventDefault();
		event.stopPropagation();

		// if the user move to much, release the touch event
		if(delta > 10) {
			this.onUp();

			this.disconnect(this.getDrawing(), 'mousedown', this.onMouseDown);

			var mouseDownEvent = document.createEvent('MouseEvents');
			mouseDownEvent.initMouseEvent('mousedown', true, true, window, 1, event.screenX, event.screenY,
				event.clientX, event.clientY,
				event.ctrlKey, event.altKey, event.shiftKey,
				event.metaKey, 0, event.target);
			event.target.dispatchEvent(mouseDownEvent);

			this.connect(this.getDrawing(), 'mousedown', this.onMouseDown);
		}
	},

	onMouseUp: function(event) {
		if(!this.isDown)
			return;

		event.preventDefault();
		event.stopPropagation();
		if(event.button == 0) {
			this.onUp();
			this.fireEvent('press', this);
		}
	},

	onTouchStart: function(event) {
		if(!this.isEnable)
			return;
		if(this.isDown) {
			this.onUp();
			return;
		}
		if(event.targetTouches.length != 1)
			return;

		event.preventDefault();
		event.stopPropagation();

		this.touchStartX = event.targetTouches[0].screenX;
		this.touchStartY = event.targetTouches[0].screenY;
		this.onDown();
	},

	onTouchMove: function(event) {
		if(!this.isDown)
			return;
		
		var deltaX = event.targetTouches[0].screenX - this.touchStartX;
		var deltaY = event.targetTouches[0].screenY - this.touchStartY;
		var delta = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

		// if the user move to much, release the touch event
		if(delta > 10) {
			this.onUp();

			this.disconnect(this.getDrawing(), 'touchstart', this.onTouchStart);

			var touchStartEvent = document.createEvent('TouchEvent');
			touchStartEvent.initTouchEvent('touchstart', true, true, window, 0, 0, 0, 0, 0,
				event.ctrlKey, event.altKey, event.shiftKey,
				event.metaKey, event.touches,
				event.targetTouches, event.changedTouches, event.scale, event.rotation);
			event.target.dispatchEvent(touchStartEvent);

			this.connect(this.getDrawing(), 'touchstart', this.onTouchStart);
		}

		event.preventDefault();
		event.stopPropagation();
	},
	
	onTouchEnd: function(event) {
		if(!this.isDown)
			return;

		event.preventDefault();
		event.stopPropagation();
		this.onUp();
		this.fireEvent('press', this);
	},

	onKeyDown: function(keyboard, key) {
		if((key == 13) && this.isEnable)
			this.fireEvent('press', this);
	},

	onDown: function() {
		this.isDown = true;
		this.focus();
		this.fireEvent('down', this);

	},

	onUp: function() {
		this.disconnect(window, 'mousemove', this.onMouseMove);
		this.disconnect(window, 'mouseup', this.onMouseUp);
 		this.isDown = false;
		this.fireEvent('up', this);
	},

});
