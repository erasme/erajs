Ui.LBox.extend('Ui.Togglable', 
/**@lends Ui.Togglable#*/
{
	isDown: false,
	isToggled: false,
	mouseStartClientX: undefined,
	mouseStartClientY: undefined,
	mouseStartScreenX: undefined,
	mouseStartScreenY: undefined,
	touchStartX: undefined,
	touchStartY: undefined,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.LBox
	 */
	constructor: function(config) {
		this.getDrawing().style.cursor = 'pointer';

		this.setFocusable(true);
		this.setRole('checkbox');
		this.getDrawing().setAttribute('aria-checked', 'false');

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

		this.mouseStartClientX = event.clientX;
		this.mouseStartClientY = event.clientY;
		this.mouseStartScreenX = event.screenX;
		this.mouseStartScreenY = event.screenY;

		this.connect(window, 'mousemove', this.onMouseMove, true);
		this.connect(window, 'mouseup', this.onMouseUp, true);
		this.onDown();
	},

	onMouseMove: function(event) {
		var deltaX = event.clientX - this.mouseStartClientX;
		var deltaY = event.clientY - this.mouseStartClientY;
		var delta = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

		event.preventDefault();
		event.stopPropagation();

		// if the user move to much, release the touch event
		if(delta > 10) {
			this.onUp();

			this.disconnect(this.getDrawing(), 'mousedown', this.onMouseDown);

			var mouseDownEvent = document.createEvent('MouseEvents');
			mouseDownEvent.initMouseEvent('mousedown', true, true, window, 1, this.mouseStartScreenX, this.mouseStartScreenY,
				this.mouseStartClientX, this.mouseStartClientY,
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
			this.focus();
			if(!this.isToggled)
				this.onToggle();
			else
				this.onUntoggle();
			this.onUp();
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

		this.focus();
		if(!this.isToggled)
			this.onToggle();
		else
			this.onUntoggle();
		this.onUp();
	},

	onKeyDown: function(event) {
		var key = event.which;
		// toggle with enter or space keys
		if(((key == 13) || (key == 32)) && !this.getIsDisabled()) {
			event.preventDefault();
			event.stopPropagation();
			this.onDown();
		}
	},

	onKeyUp: function(event) {
		var key = event.which;
		// toggle with enter or space keys
		if(((key == 13) || (key == 32)) && !this.getIsDisabled()) {
			event.preventDefault();
			event.stopPropagation();
			if(!this.isToggled)
				this.onToggle();
			else
				this.onUntoggle();
			this.onUp();
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
			this.getDrawing().setAttribute('aria-checked', 'true');
			this.fireEvent('toggle', this);
		}
	},

	onUntoggle: function() {
		if(this.isToggled) {
			this.isToggled = false;
			this.getDrawing().setAttribute('aria-checked', 'false');
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
