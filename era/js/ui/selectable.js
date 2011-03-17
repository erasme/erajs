//
// Define the Selectable class.
//
Ui.LBox.extend('Ui.Selectable', {
	isDown: false,
	isSelected: false,
	lastTime: undefined,

	constructor: function(config) {
		this.setFocusable(true);

		this.addEvents('select', 'unselect', 'activate');

		// handle mouse
		this.connect(this.getDrawing(), 'mousedown', this.onMouseDown);

		// handle touches
		this.connect(this.getDrawing(), 'touchstart', this.onTouchStart);
		this.connect(this.getDrawing(), 'touchmove', this.onTouchMove);
		this.connect(this.getDrawing(), 'touchend', this.onTouchEnd);
	},

	//
	// Private
	//

	onMouseDown: function(event) {
		if(event.button != 0)
			return;

		event.preventDefault();
		event.stopPropagation();

		this.mouseStartX = event.screenX;
		this.mouseStartY = event.screenY;

		this.connect(window, 'mousemove', this.onMouseMove, true);
		this.connect(window, 'mouseup', this.onMouseUp, true);

		this.isDown = true;

		if(!this.isSelected) {
			this.isSelected = true;
			this.onSelect();
			this.fireEvent('select', this);
		}
//		this.onDown();
	},

	onMouseMove: function(event) {
		var deltaX = event.screenX - this.mouseStartX;
		var deltaY = event.screenY - this.mouseStartY;
		var delta = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

		// if the user move to much, release the touch event
		if(delta > 10) {
//			this.onUp();

			this.disconnect(window, 'mousemove');
			this.disconnect(window, 'mouseup');

			this.isDown = false;

			if(this.isSelected) {
				this.isSelected = false;
				this.onUnSelect();
				this.fireEvent('unselect', this);
			}

			this.disconnect(this.getDrawing(), 'mousedown');

			var mouseDownEvent = document.createEvent('MouseEvents');
			mouseDownEvent.initMouseEvent('mousedown', true, true, window, 1, event.screenX, event.screenY,
				event.clientX, event.clientY,
				event.ctrlKey, event.altKey, event.shiftKey,
				event.metaKey, 0, event.target);
			event.target.dispatchEvent(mouseDownEvent);

			this.connect(this.getDrawing(), 'mousedown', this.onMouseDown);
		}
		event.preventDefault();
		event.stopPropagation();
	},

	onMouseUp: function(event) {
		if(!this.isDown)
			return;

		event.preventDefault();
		event.stopPropagation();
		if(event.button == 0) {
			this.disconnect(window, 'mousemove');
			this.disconnect(window, 'mouseup');
//			this.onUp();
//			this.fireEvent('press', this);


			var currentTime = (new Date().getTime())/1000;
			if((this.isSelected) && (this.lastTime != undefined) && (currentTime - this.lastTime < 0.250)) {
				this.fireEvent('activate', this);
			}
			this.lastTime = currentTime;
		}
	},

	onTouchStart: function(event) {
		console.log('touchstart');

//		if(!this.isEnable)
//			return;
		if(this.isDown) {

//			var currentTime = (new Date().getTime())/1000;
//			if((this.isSelected) && (this.lastTime != undefined) && (currentTime - this.lastTime < 0.250)) {
//				this.fireEvent('activate', this);
//			}
//			this.lastTime = currentTime;
//			this.onUp();
			return;
		}
		if(event.targetTouches.length != 1)
			return;

		console.log('touchstart ok');

		event.preventDefault();
		event.stopPropagation();

		this.touchStartX = event.targetTouches[0].screenX;
		this.touchStartY = event.targetTouches[0].screenY;
//		this.onDown();

		this.isDown = true;

		if(!this.isSelected) {
			this.isSelected = true;
			this.onSelect();
			this.fireEvent('select', this);
		}
	},

	onTouchMove: function(event) {
		if(!this.isDown)
			return;
		
		var deltaX = event.targetTouches[0].screenX - this.touchStartX;
		var deltaY = event.targetTouches[0].screenY - this.touchStartY;
		var delta = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

		// if the user move to much, release the touch event
		if(delta > 10) {
//			this.onUp();

			this.isDown = false;

			if(this.isSelected) {
				this.isSelected = false;
				this.onUnSelect();
				this.fireEvent('unselect', this);
			}

			this.disconnect(this.getDrawing(), 'touchstart');

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
		console.log('touchend');

		if(!this.isDown)
			return;

		event.preventDefault();
		event.stopPropagation();
//		this.onUp();
//		this.fireEvent('press', this);

		var currentTime = (new Date().getTime())/1000;
		if((this.isSelected) && (this.lastTime != undefined) && (currentTime - this.lastTime < 0.250)) {
			this.fireEvent('activate', this);
		}
		this.lastTime = currentTime;

	},

/*	onDown: function() {
		this.isDown = true;
		if(!this.isSelected) {
			this.isSelected = true;
			this.fireEvent('select', this);
		}
	},

	onUp: function() {
		this.disconnect(window, 'mousemove');
		this.disconnect(window, 'mouseup');
 		this.isDown = false;
		this.removeClass('ui-button-down');
		this.fireEvent('up', this);
	},*/

	onSelect: function() {
	},

	onUnSelect: function() {
	},

}, {
});
