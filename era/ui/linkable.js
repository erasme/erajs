
Ui.LBox.extend('Ui.Linkable', 
/**@lends Ui.Linkable#*/
{
	content: undefined,
	link: undefined,
	isDown: false,
	mouseStartX: undefined,
	mouseStartY: undefined,
	openWindow: true,
	target: undefined,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.LBox
	 */
	constructor: function(config) {
		this.addEvents('down', 'up', 'link');

		this.getDrawing().style.cursor = 'pointer';
		this.setFocusable(true);
		this.setRole('button');

		// handle mouse
		this.connect(this.getDrawing(), 'mousedown', this.onMouseDown);

		// handle touches
		this.connect(this.getDrawing(), 'fingerdown', this.onFingerDown);

		// handle keyboard
		this.connect(this.getDrawing(), 'keydown', this.onKeyDown);
		this.connect(this.getDrawing(), 'keyup', this.onKeyUp);

		this.autoConfig(config, 'src', 'openWindow', 'target');
	},

	setSrc: function(src) {
		this.link = src;
	},

	setContent: function(content) {
		if(this.content != content) {
			if(this.content != undefined)
				this.remove(this.content);
			if(content != undefined)
				this.append(content);
			this.content = content;
		}
	},

	setOpenWindow: function(openWindow) {
		this.openWindow = openWindow;
	},

	setTarget: function(target) {
		this.target = target;
	},

	getIsDown: function() {
		return this.isDown;
	},

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
			this.disconnect(window, 'mousemove', this.onMouseMove, true);
			this.disconnect(window, 'mouseup', this.onMouseUp, true);

			this.onUp();

			if('createEvent' in document) {
				this.disconnect(this.getDrawing(), 'mousedown', this.onMouseDown);

				var mouseDownEvent = document.createEvent('MouseEvents');
				mouseDownEvent.initMouseEvent('mousedown', true, true, window, 1, event.screenX, event.screenY,
					event.clientX, event.clientY,
					event.ctrlKey, event.altKey, event.shiftKey,
					event.metaKey, 0, event.target);
				event.target.dispatchEvent(mouseDownEvent);

				this.connect(this.getDrawing(), 'mousedown', this.onMouseDown);
			}
		}
	},

	onMouseUp: function(event) {
		if(!this.isDown)
			return;

		event.preventDefault();
		event.stopPropagation();

		if(event.button == 0) {
			this.disconnect(window, 'mousemove', this.onMouseMove, true);
			this.disconnect(window, 'mouseup', this.onMouseUp, true);

			this.onUp();
			this.fireEvent('link', this);
			this.focus();

			if(this.openWindow)
				window.open(this.link, this.target);
			else
				window.location = this.link;
		}
	},

	onFingerDown: function(event) {
		if(this.getIsDisabled() || this.isDown)
			return;

		this.getDrawing().setAttribute('href', this.link);

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

			this.disconnect(this.getDrawing(), 'fingerdown', this.onFingerDown);
			event.finger.release();
			this.connect(this.getDrawing(), 'fingerdown', this.onFingerDown);
		}
	},
	
	onFingerUp: function(event) {
		this.disconnect(event.finger, 'fingermove', this.onFingerMove);
		this.disconnect(event.finger, 'fingerup', this.onFingerUp);

		event.preventDefault();
		event.stopPropagation();

		this.onUp();
		this.fireEvent('link', this);
		this.focus();

		if(this.openWindow)
			window.open(this.link, this.target);
		else
			window.location = this.link;
	},

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
			this.fireEvent('link', this);
			if(this.openWindow)
				window.open(this.link, this.target);
			else
				window.location = this.link;
		}
	},

	onDown: function() {
		this.isDown = true;
		this.focus();
		this.fireEvent('down', this);
	},

	onUp: function() {
		this.disconnect(window, 'mousemove', this.onMouseMove, true);
		this.disconnect(window, 'mouseup', this.onMouseUp, true);
 		this.isDown = false;
		this.fireEvent('up', this);
	}
});

