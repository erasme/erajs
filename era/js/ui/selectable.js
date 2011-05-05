//
// Define the Selectable class.
//
Ui.LBox.extend('Ui.Selectable', {
	isDown: false,
	isSelected: false,
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

		// handle keyboard
		this.connect(this.getDrawing(), 'keydown', this.onKeyDown);
		this.connect(this.getDrawing(), 'keyup', this.onKeyUp);
	},

	//
	// Private
	//

	onKeyDown: function(event) {
		if(((event.which == 13) || (event.which == 32)) && !this.getIsDisabled()) {
			event.preventDefault();
			event.stopPropagation();
			this.onDown();
		}
	},

	onKeyUp: function(event) {
		if(((event.which == 13) || (event.which == 32))&& !this.getIsDisabled()) {
			event.preventDefault();
			event.stopPropagation();
			this.onUp();
			this.onSelect();
			if(event.which == 13)	
				this.fireEvent('activate', this);
		}
	},

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

		this.onDown();
	},

	onMouseMove: function(event) {
		var deltaX = event.screenX - this.mouseStartX;
		var deltaY = event.screenY - this.mouseStartY;
		var delta = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

		// if the user move to much, release the touch event
		if(delta > 10) {
			this.disconnect(window, 'mousemove', this.onMouseMove);
			this.disconnect(window, 'mouseup', this.onMouseUp);
			this.disconnect(this.getDrawing(), 'mousedown', this.onMouseDown);

			this.onUp();

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

		this.onUp();

		if(event.button == 0) {
			var currentTime = (new Date().getTime())/1000;
			if((this.isSelected) && (this.lastTime != undefined) && (currentTime - this.lastTime < 0.250))
				this.fireEvent('activate', this);

			this.lastTime = currentTime;
			this.onSelect();
		}
		else if(event.button == 2)
			this.fireEvent('menu', this, event.clientX, event.clientY);
	},

	onTouchStart: function(event) {
		if(this.isDown)
			return;

		if(event.targetTouches.length != 1)
			return;

		event.preventDefault();
		event.stopPropagation();

		this.touchStartX = event.targetTouches[0].screenX;
		this.touchStartY = event.targetTouches[0].screenY;

		this.onDown();

		if(this.menuTimer != undefined)
			this.menuTimer.abort();

		this.menuTimer = new Core.DelayedTask({	delay: 0.5, scope: this, callback: this.onMenuTimer });
		this.menuPosX = event.targetTouches[0].clientX;
		this.menuPosY = event.targetTouches[0].clientY;
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

			if(this.menuTimer != undefined) {
				this.menuTimer.abort();
				this.menuTimer = undefined;
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
		if(!this.isDown)
			return;

		this.onUp();

		event.preventDefault();
		event.stopPropagation();

		if(this.menuTimer != undefined) {
			this.menuTimer.abort();
			this.menuTimer = undefined;

			var currentTime = (new Date().getTime())/1000;
			if((this.isSelected) && (this.lastTime != undefined) && (currentTime - this.lastTime < 0.250))
				this.fireEvent('activate', this);
			this.lastTime = currentTime;
			this.onSelect();
		}
	},

	onMenuTimer: function() {
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

	onDown: function() {
		if(!this.isDown) {
			this.focus();
			this.isDown = true;
			this.fireEvent('down', this);
		}
	},

	onUp: function() {
		if(this.isDown) {
			this.isDown = false;
			this.fireEvent('up', this);
		}
	},

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
