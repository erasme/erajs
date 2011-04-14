//
// Define the Selectable class.
//
Ui.LBox.extend('Ui.Selectable', {
	isDown: false,
	isSelected: false,
	lastIsSelected: false,
	lastTime: undefined,
	button: undefined,
	menuTimer: undefined,
	menuPosX: undefined,
	menuPosY: undefined,

	constructor: function(config) {
		this.setFocusable(true);

		this.addEvents('down', 'up', 'select', 'unselect', 'activate', 'menu');

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
		if((event.button != 0) && (event.button != 2))
			return;

		this.button = event.button;

		event.preventDefault();
		event.stopPropagation();

		this.mouseStartX = event.screenX;
		this.mouseStartY = event.screenY;

		this.connect(window, 'mousemove', this.onMouseMove, true);
		this.connect(window, 'mouseup', this.onMouseUp, true);

		this.isDown = true;

		this.lastIsSelected = this.isSelected;

		if(this.button == 0) {
			this.fireEvent('down', this);
		}


//		if((this.button == 0) && (!this.isSelected)) {
//			this.isSelected = true;
//			this.onSelect();
//			this.fireEvent('select', this);
//		}
	},

	onMouseMove: function(event) {
		var deltaX = event.screenX - this.mouseStartX;
		var deltaY = event.screenY - this.mouseStartY;
		var delta = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

		// if the user move to much, release the touch event
		if(delta > 10) {
			this.disconnect(window, 'mousemove', this.onMouseMove);
			this.disconnect(window, 'mouseup', this.onMouseUp);

			this.isDown = false;

			this.fireEvent('up', this);

//			if(!this.lastIsSelected && this.isSelected) {
//				this.isSelected = false;
//				this.onUnSelect();
//				this.fireEvent('unselect', this);
//			}

			this.disconnect(this.getDrawing(), 'mousedown', this.onMouseDown);

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

		if(this.button != event.button)
			return;

		this.disconnect(window, 'mousemove', this.onMouseMove);
		this.disconnect(window, 'mouseup', this.onMouseUp);

		if(event.button == 0) {
			this.isDown = false;
			this.fireEvent('up', this);

			if(!this.isSelected) {
				this.onSelect();
			}

			var currentTime = (new Date().getTime())/1000;
			if((this.isSelected) && (this.lastTime != undefined) && (currentTime - this.lastTime < 0.250)) {
				this.fireEvent('activate', this);
			}
			this.lastTime = currentTime;
		}
		else if(event.button == 2) {
			this.fireEvent('menu', this, event.pageX, event.pageY);
		}
	},

	onTouchStart: function(event) {
		console.log('touchstart '+this.isDown);

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

//		console.log('touchstart ok');

		event.preventDefault();
		event.stopPropagation();

		this.touchStartX = event.targetTouches[0].screenX;
		this.touchStartY = event.targetTouches[0].screenY;
//		this.onDown();

		this.isDown = true;

		this.lastIsSelected = this.isSelected;

		if(!this.isSelected) {
			this.isSelected = true;
			this.onSelect();
			this.fireEvent('select', this);
		}

		if(this.menuTimer != undefined)
			this.menuTimer.abort();

		this.menuTimer = new Core.DelayedTask({	delay: 0.5, scope: this, callback: this.onMenuTimer });
		this.menuPosX = event.targetTouches[0].pageX;
		this.menuPosY = event.targetTouches[0].pageY;
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

			if(this.menuTimer != undefined) {
				this.menuTimer.abort();
				this.menuTimer = undefined;
			}

			this.isDown = false;

			if(!this.lastIsSelected && this.isSelected) {
				this.isSelected = false;
				this.onUnSelect();
				this.fireEvent('unselect', this);
			}

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
		console.log('touchend');

		if(!this.isDown)
			return;

		this.isDown = false;

		event.preventDefault();
		event.stopPropagation();
//		this.onUp();
//		this.fireEvent('press', this);

		var currentTime = (new Date().getTime())/1000;
		if((this.isSelected) && (this.lastTime != undefined) && (currentTime - this.lastTime < 0.250)) {
			this.fireEvent('activate', this);
		}
		this.lastTime = currentTime;

		if(this.menuTimer != undefined) {
			this.menuTimer.abort();
			this.menuTimer = undefined;
		}
	},

	onMenuTimer: function() {
		console.log('onMenuTimer');

		this.fireEvent('menu', this, this.menuPosX, this.menuPosY);
		this.menuTimer = undefined;
	},

	getIsSelected: function() {
		return this.isSelected;
	},

	select: function() {
		this.onSelect();
	},

	unselect: function() {
		this.onUnselect();
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
		if(!this.isSelected) {
			this.isSelected = true;
			this.fireEvent('select', this);
		}
	},

	onUnselect: function() {
		if(this.isSelected) {
			this.isSelected = false;
			this.fireEvent('unselect', this);
		}
	},

}, {
});
