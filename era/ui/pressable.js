Ui.LBox.extend('Ui.Pressable', 
/** @lends Ui.Pressable# */
{
	isDown: false,
	lock: false,

    /**
     * @constructs   
     * @class A pressable is a container which can be pressed   
     * @extends Ui.LBox
	 * @param {mixed} [config] see {@link Ui.LBox} constructor for more options.  
     */
	constructor: function(config) {
		this.getDrawing().style.cursor = 'pointer';

		this.setFocusable(true);
		this.setRole('button');

		this.addEvents('press', 'down', 'up');

		// handle mouse
		this.connect(this.getDrawing(), 'mousedown', this.onMouseDown);

		// handle touches
		this.connect(this.getDrawing(), 'fingerdown', this.onFingerDown);

		// handle keyboard
		this.connect(this.getDrawing(), 'keydown', this.onKeyDown);
		this.connect(this.getDrawing(), 'keyup', this.onKeyUp);
	},

	getIsDown: function() {
		return this.isDown;
	},

	setLock: function(lock) {
		this.lock = lock;
		if(lock)
			this.getDrawing().style.cursor = '';
		else
			this.getDrawing().style.cursor = 'pointer';
	},

	getLock: function() {
		return this.lock;
	},

	/**#@+
	 * @private
	 */
	onMouseDown: function(event) {
		if((event.button != 0) || this.getIsDisabled() || this.lock)
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

			if('createEvent' in document) {
				var mouseDownEvent = document.createEvent('MouseEvents');
				mouseDownEvent.initMouseEvent('mousedown', true, true, window, 1, event.screenX, event.screenY,
					event.clientX, event.clientY,
					event.ctrlKey, event.altKey, event.shiftKey,
					event.metaKey, 0, event.target);
				this.getDrawing().offsetParent.dispatchEvent(mouseDownEvent);
			}
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
			this.focus();
		}
	},

	onFingerDown: function(event) {
		if(this.getIsDisabled() || this.isDown || this.lock)
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
		this.fireEvent('press', this);
		this.focus();
	},

	onKeyDown: function(event) {
		var key = event.which;
		if((key == 13) && !this.getIsDisabled() && !this.lock) {
			event.preventDefault();
			event.stopPropagation();
			this.onDown();
		}
	},

	onKeyUp: function(event) {
		var key = event.which;
		if((key == 13) && !this.getIsDisabled() && !this.lock) {
			event.preventDefault();
			event.stopPropagation();
			this.onUp();
			this.fireEvent('press', this);
		}
	},

	onDown: function() {
		this.isDown = true;
		this.fireEvent('down', this);
	},

	onUp: function() {
		this.disconnect(window, 'mousemove', this.onMouseMove, true);
		this.disconnect(window, 'mouseup', this.onMouseUp, true);

 		this.isDown = false;
		this.fireEvent('up', this);
	}
	/**#@-*/
}, {
	onDisable: function() {
		Ui.Pressable.base.onDisable.call(this);
		this.getDrawing().style.cursor = '';
	},

	onEnable: function() {
		Ui.Pressable.base.onEnable.call(this);
		if(this.lock)
			this.getDrawing().style.cursor = '';
		else
			this.getDrawing().style.cursor = 'pointer';
	}
});
