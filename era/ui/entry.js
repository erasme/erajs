
Ui.Element.extend('Ui.Entry', 
/**@lends Ui.Entry#*/
{
//	entryDrawing: undefined,
	fontSize: 14,
	fontFamily: 'Sans-serif',
	fontWeight: 'normal',
	color: 'black',
	value: '',
	passwordMode: false,
	isDown: false,
	mouseStartX: undefined,
	mouseStartY: undefined,
	touchStartX: undefined,
	touchStartY: undefined,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.Element
	 */
	constructor: function(config) {
		this.addEvents('press', 'down', 'up', 'change', 'validate');
		this.setSelectable(true);
		this.setFocusable(true);

		// handle mouse
		this.connect(this.getDrawing(), 'mousedown', this.onMouseDown);

		// handle touches
		this.connect(this.getDrawing(), 'fingerdown', this.onFingerDown);

		// handle touches
		this.connect(this.getDrawing(), 'touchstart', this.onTouchStart);
		this.connect(this.getDrawing(), 'touchmove', this.onTouchMove);
		this.connect(this.getDrawing(), 'touchend', this.onTouchEnd);

		// handle change
		this.connect(this.getDrawing(), 'change', this.onChange);

		// handle paste
		this.connect(this.getDrawing(), 'paste', this.onPaste);

		// handle keyboard
		this.connect(this.getDrawing(), 'keyup', this.onKeyUp);
		this.connect(this.getDrawing(), 'keydown', this.onKeyDown);
	},

	setPasswordMode: function(passwordMode) {
		if(this.passwordMode != passwordMode) {
			this.passwordMode = passwordMode;
			try {
				if(this.passwordMode)
					this.entryDrawing.setAttribute('type', 'password');
				else
					this.entryDrawing.setAttribute('type', 'text');
			} catch(exception) {
				var clone = this.entryDrawing.cloneNode(false);
				if(this.passwordMode)
					clone.setAttribute('type', 'password');
				else
					clone.setAttribute('type', 'text');
				this.entryDrawing.parentNode.replaceChild(clone, this.entryDrawing);
				this.entryDrawing = clone;
			}
		}
	},

	setFontSize: function(fontSize) {
		if(this.fontSize != fontSize) {
			this.fontSize = fontSize;
			this.entryDrawing.style.fontSize = this.fontSize+'px';
			this.invalidateMeasure();
		}
	},

	getFontSize: function() {
		return this.fontSize;
	},

	setFontFamily: function(fontFamily) {
		if(this.fontFamily != fontFamily) {
			this.fontFamily = fontFamily;
			this.entryDrawing.style.fontFamily = this.fontFamily;
			this.invalidateMeasure();
		}
	},

	getFontFamily: function() {
		return this.fontFamily;
	},

	setFontWeight: function(fontWeight) {
		if(this.fontWeight != fontWeight) {
			this.fontWeight = fontWeight;
			this.entryDrawing.style.fontWeight = this.fontWeight;
			this.invalidateMeasure();
		}
	},

	getFontWeight: function() {
		return this.fontWeight;
	},

	setColor: function(color) {
		if(this.color != color) {
			this.color = color;
			this.entryDrawing.style.color = this.color;
		}
	},

	getColor: function() {
		return this.color;
	},

	getValue: function() {
		return this.value;
	},

	setValue: function(value) {
		if(value === undefined)
			value = '';
		this.value = value;
		this.entryDrawing.value = this.value;
	},

	getIsDown: function() {
		return this.isDown;
	},

	/**#@+
	 * @private
	 */

	onMouseDown: function(event) {
		if(this.getHasFocus()) {
			event.stopPropagation();
			return;
		}

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
			this.onUp();
			this.fireEvent('press', this);
			this.entryDrawing.focus();
		}
	},

	onTouchStart: function(event) {
		if(this.getHasFocus())
			event.stopPropagation();
	},

	onTouchMove: function(event) {
		if(this.getHasFocus())
			event.stopPropagation();
	},

	onTouchEnd: function(event) {
		if(this.getHasFocus())
			event.stopPropagation();
	},

	onFingerDown: function(event) {
		if(this.getHasFocus()) {
			event.stopPropagation();
			return;
		}

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
		this.fireEvent('press', this);
		this.entryDrawing.focus();
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
	},

	onPaste: function(event) {
		event.stopPropagation();
		new Core.DelayedTask({ delay: 0, scope: this, callback: this.onAfterPaste });
	},

	onAfterPaste: function() {
		if(this.entryDrawing.value != this.value) {
			this.value = this.entryDrawing.value;
			this.fireEvent('change', this, this.value);
		}
	},

	onChange: function(event) {
		event.preventDefault();
		event.stopPropagation();
		if(this.entryDrawing.value != this.value) {
			this.value = this.entryDrawing.value;
			this.fireEvent('change', this, this.value);
		}
	},

	onKeyDown: function(event) {
		if(this.getHasFocus())
			event.stopPropagation();
	},

	onKeyUp: function(event) {
		if(this.entryDrawing.value != this.value) {
			this.value = this.entryDrawing.value;
			this.fireEvent('change', this, this.value);
		}
		if(event.which == 13) {
			event.preventDefault();
			event.stopPropagation();
			this.fireEvent('validate', this);
		}
		else if(this.getHasFocus())
			event.stopPropagation();
	}
	/**#@-*/
}, {
	renderDrawing: function() {
		this.entryDrawing = document.createElement('input');
		this.entryDrawing.setAttribute('type', 'text');
		this.entryDrawing.style.border = '0px';
		this.entryDrawing.style.margin = '0px';
		this.entryDrawing.style.padding = '0px';
		this.entryDrawing.style.outline = 'none';
		if(!navigator.isIE7 && !navigator.isIE8)
			this.entryDrawing.style.background = 'none';
		if(navigator.isWebkit)
			this.entryDrawing.style.webkitAppearance = 'none';
		this.entryDrawing.style.fontSize = this.fontSize+'px';
		this.entryDrawing.style.fontFamily = this.fontFamily;
		this.entryDrawing.style.fontWeight = this.fontWeight;
		this.entryDrawing.style.color = this.color;
		return this.entryDrawing;
	},

	measureCore: function(width, height) {
		return { width: 8, height: (this.fontSize * 3/2) };
	},

	arrangeCore: function(width, height) {
		this.entryDrawing.style.width = width+'px';
		this.entryDrawing.style.height = height+'px';
	},

	onDisable: function() {
		Ui.Entry.base.onDisable.call(this);
		this.entryDrawing.blur();
	},

	onEnable: function() {
		Ui.Entry.base.onEnable.call(this);
	}
});
