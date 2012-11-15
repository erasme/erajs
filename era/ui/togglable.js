Ui.LBox.extend('Ui.Togglable', 
/**@lends Ui.Togglable#*/
{
	isDown: false,
	isToggled: false,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.LBox
	 */
	constructor: function(config) {
		this.getDrawing().style.cursor = 'pointer';

		this.setFocusable(true);
		this.setRole('button');

		this.addEvents('down', 'up', 'toggle', 'untoggle');

		// handle mouse
		this.connect(this.getDrawing(), 'mousedown', this.onMouseDown);

		// handle touches
		this.connect(this.getDrawing(), 'fingerdown', this.onFingerDown);

		// handle keyboard
		this.connect(this.getDrawing(), 'keydown', this.onKeyDown);
		this.connect(this.getDrawing(), 'keyup', this.onKeyUp);
	},

	/**#@+
	 * @private
	 */

	onMouseDown: function(event) {
		if((event.button != 0) || this.getIsDisabled())
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
	/**#@-*/

	getIsDown: function() {
		return this.isDown;
	},

	getIsToggled: function() {
		return this.isToggled;
	},

	onMouseUp: function(event) {
		if(!this.isDown)
			return;

		event.preventDefault();
		event.stopPropagation();
		if(event.button == 0) {
			this.onUp();
			this.focus();
			if(!this.isToggled)
				this.onToggle();
			else
				this.onUntoggle();
		}
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
	},

	onFingerMove: function(event) {
		
		event.preventDefault();
		event.stopPropagation();

		var deltaX = event.finger.getX() - this.touchStartX;
		var deltaY = event.finger.getY() - this.touchStartY;
		var delta = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

		// if the user move to much, release the touch event
		if(delta > 10) {
			this.disconnect(event.finger, 'fingermove', this.onFingerMove);
			this.disconnect(event.finger, 'fingerup', this.onFingerUp);
			this.onUp();
			event.finger.release();
		}
	},
	
	onFingerUp: function(event) {
		this.disconnect(event.finger, 'fingermove', this.onFingerMove);
		this.disconnect(event.finger, 'fingerup', this.onFingerUp);

		event.preventDefault();
		event.stopPropagation();

		this.onUp();
		this.focus();
		if(!this.isToggled)
			this.onToggle();
		else
			this.onUntoggle();
	},

//////////

	onKeyDown: function(event) {
		var key = event.which;
		if((key == 13) && !this.getIsDisabled()) {
			event.preventDefault();
			event.stopPropagation();
			this.onDown();
		}
	},

	onKeyUp: function(event) {
		var key = event.which;
		if((key == 13) && !this.getIsDisabled()) {
			event.preventDefault();
			event.stopPropagation();
			this.onUp();
			if(!this.isToggled)
				this.onToggle();
			else
				this.onUntoggle();
		}
	},

	onDown: function() {
		this.isDown = true;
		this.fireEvent('down', this);

	},

	onUp: function() {
		this.disconnect(window, 'mousemove', this.onMouseMove);
		this.disconnect(window, 'mouseup', this.onMouseUp);
 		this.isDown = false;
		this.fireEvent('up', this);
	},

	onToggle: function() {
		if(!this.isToggled) {
			this.isToggled = true;
			this.fireEvent('toggle', this);
		}
	},

	onUntoggle: function() {
		if(this.isToggled) {
			this.isToggled = false;
			this.fireEvent('untoggle', this);
		}
	},

	toggle: function() {
		this.onToggle();
	},

	untoggle: function() {
		this.onUntoggle();
	}
});
