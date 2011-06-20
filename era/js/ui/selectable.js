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
		this.connect(this.getDrawing(), 'fingerdown', this.onFingerDown);

		// handle keyboard
		this.connect(this.getDrawing(), 'keydown', this.onKeyDown);
		this.connect(this.getDrawing(), 'keyup', this.onKeyUp);
	},

	//
	// Private
	//

	onKeyDown: function(event) {
		console.log(this+'.onKeyDown key: '+event.which);
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
		if(this.getIsDisabled())
			return;
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

	onFingerDown: function(event) {
		if(this.getIsDisabled() || this.isDown)
			return;

		this.connect(event.finger, 'fingermove', this.onFingerMove);
		this.connect(event.finger, 'fingerup', this.onFingerUp);

		event.finger.capture(this.getDrawing());

		event.preventDefault();
		event.stopPropagation();

		this.touchStartX = event.finger.getX();
		this.touchStartY = event.finger.getY();

		this.onDown();

		if(this.menuTimer != undefined)
			this.menuTimer.abort();

		this.menuTimer = new Core.DelayedTask({	delay: 0.5, scope: this, callback: this.onMenuTimer });
		this.menuPosX = event.finger.getX();
		this.menuPosY = event.finger.getY();
	},

	onFingerMove: function(event) {
		event.preventDefault();
		event.stopPropagation();

		var deltaX = event.finger.getX() - this.touchStartX;
		var deltaY = event.finger.getY() - this.touchStartY;
		var delta = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

		// if the user move to much, release the touch event
		if(delta > 10) {
			this.onUp();

			if(this.menuTimer != undefined) {
				this.menuTimer.abort();
				this.menuTimer = undefined;
			}

			this.disconnect(event.finger, 'fingermove', this.onFingerMove);
			this.disconnect(event.finger, 'fingerup', this.onFingerUp);
			this.onUp();
			event.finger.release();
		}
	},
	
	onFingerUp: function(event) {
		event.preventDefault();
		event.stopPropagation();

		this.onUp();

		this.disconnect(event.finger, 'fingermove', this.onFingerMove);
		this.disconnect(event.finger, 'fingerup', this.onFingerUp);

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
	}
}, {
});
