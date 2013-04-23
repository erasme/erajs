
Ui.Element.extend('Ui.Entry', 
/**@lends Ui.Entry#*/
{
	fontSize: undefined,
	fontFamily: undefined,
	fontWeight: undefined,
	color: undefined,
	value: '',
	passwordMode: false,
	isDown: false,
	screenX: undefined,
	screenY: undefined,
	startTime: undefined,
	allowSelect: false,
	timer: undefined,

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
		this.connect(this.getDrawing(), 'touchstart', this.onTouchStart);

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
					this.getDrawing().setAttribute('type', 'password');
				else
					this.getDrawing().setAttribute('type', 'text');
			} catch(exception) {
				// IE < 9 dont support to change type after insert in the DOM
				var clone = this.getDrawing().cloneNode(false);
				if(this.passwordMode)
					clone.setAttribute('type', 'password');
				else
					clone.setAttribute('type', 'text');
				this.getDrawing().parentNode.replaceChild(clone, this.getDrawing());
				this.getDrawing() = clone;
				this.drawing = this.getDrawing();
				this.invalidateArrange();
			}
		}
	},

	setFontSize: function(fontSize) {
		if(this.fontSize != fontSize) {
			this.fontSize = fontSize;
			this.getDrawing().style.fontSize = this.getFontSize()+'px';
			this.invalidateMeasure();
		}
	},

	getFontSize: function() {
		if(this.fontSize != undefined)
			return this.fontSize;
		else
			return this.getStyleProperty('fontSize');
	},

	setFontFamily: function(fontFamily) {
		if(this.fontFamily != fontFamily) {
			this.fontFamily = fontFamily;
			this.getDrawing().style.fontFamily = this.getFontFamily();
			this.invalidateMeasure();
		}
	},

	getFontFamily: function() {
		if(this.fontFamily != undefined)
			return this.fontFamily;
		else
			return this.getStyleProperty('fontFamily');
	},

	setFontWeight: function(fontWeight) {
		if(this.fontWeight != fontWeight) {
			this.fontWeight = fontWeight;
			this.getDrawing().style.fontWeight = this.getFontWeight();
			this.invalidateMeasure();
		}
	},

	getFontWeight: function() {
		if(this.fontWeight != undefined)
			return this.fontWeight;
		else
			return this.getStyleProperty('fontWeight');
	},

	setColor: function(color) {
		if(this.color != color) {
			this.color = Ui.Color.create(color);
			if(navigator.supportRgba)
				this.getDrawing().style.color = this.getColor().getCssRgba();
			else
				this.getDrawing().style.color = this.getColor().getCssHtml();
		}
	},

	getColor: function() {
		if(this.color != undefined)
			return this.color;
		else
			return Ui.Color.create(this.getStyleProperty('color'));
	},

	getValue: function() {
		return this.value;
	},

	setValue: function(value) {	
		if((value === null) || (value === undefined))
			value = '';
		this.value = value;
		this.getDrawing().value = this.value;
	},

	getIsDown: function() {
		return this.isDown;
	},

	/**#@+
	 * @private
	 */

	onMouseDown: function(event) {
		this.setSelectable(true);
		event.stopPropagation();

		if(this.timer != undefined) {
			this.timer.abort();
			this.timer = undefined;
		}
		this.allowSelect = false;
		this.timer = new Core.DelayedTask({	delay: 0.50, scope: this, callback: this.onTimer });

		this.screenX = event.screenX;
		this.screenY = event.screenY;

		var currentTime = (new Date().getTime())/1000;
		this.startTime = currentTime;

		this.connect(window, 'mousemove', this.onMouseMove, true);
		this.connect(window, 'mouseup', this.onMouseUp, true);
		
		this.onDown();
	},

	onMouseMove: function(event) {
		if(!this.allowSelect) {
			var deltaX = event.screenX - this.screenX;
			var deltaY = event.screenY - this.screenY;
			var delta = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

			event.stopPropagation();
			event.preventDefault();

			// if the user move to much, release the touch event
			if(delta > 10) {
				if(this.timer != undefined) {
					this.timer.abort();
					this.timer = undefined;
				}

				var selection = window.getSelection();
				selection.removeAllRanges();
				this.setSelectable(false);

				this.disconnect(window, 'mousemove', this.onMouseMove, true);
				this.disconnect(window, 'mouseup', this.onMouseUp, true);
	
				var mouseDownEvent = document.createEvent('MouseEvents');
				mouseDownEvent.initMouseEvent('mousedown', true, true, window, 1, event.screenX, event.screenY,
					event.clientX, event.clientY,
					event.ctrlKey, event.altKey, event.shiftKey,
					event.metaKey, 0, event.target);
				this.getDrawing().offsetParent.dispatchEvent(mouseDownEvent);
				
				this.onUp();
			}
		}
		else
			event.stopPropagation();
	},

	onMouseUp: function(event) {
		if(this.timer != undefined) {
			this.timer.abort();
			this.timer = undefined;
		}
		this.disconnect(window, 'mousemove', this.onMouseMove, true);
		this.disconnect(window, 'mouseup', this.onMouseUp, true);
		this.onUp();
	},

	onTouchStart: function(event) {
		if(event.targetTouches.length == 1) {
			event.stopPropagation();

			this.connect(this.getDrawing(), 'touchmove', this.onTouchMove, true);
			this.connect(this.getDrawing(), 'touchend', this.onTouchEnd, true);

			if(this.timer != undefined) {
				this.timer.abort();
				this.timer = undefined;
			}
			this.timer = new Core.DelayedTask({	delay: 0.5, scope: this, callback: this.onTimer });
			this.onDown();
		}
	},

	onTouchMove: function(event) {
		if(!this.allowSelect) {
			if(this.timer != undefined) {
				this.timer.abort();
				this.timer = undefined;
			}
			this.disconnect(this.getDrawing(), 'touchmove', this.onTouchMove, true);
			this.disconnect(this.getDrawing(), 'touchend', this.onTouchEnd, true);
			this.onUp();
		}
	},

	onTouchEnd: function(event) {
		event.stopPropagation();

		if(this.timer != undefined) {
			this.timer.abort();
			this.timer = undefined;
		}

		this.disconnect(this.getDrawing(), 'touchmove', this.onTouchMove, true);
		this.disconnect(this.getDrawing(), 'touchend', this.onTouchEnd, true);
		this.allowSelect = false;
		this.onUp();
	},

	onTimer: function(timer) {
		this.allowSelect = true;
		this.timer = undefined;
	},

	onDown: function() {
		this.isDown = true;
		this.fireEvent('down', this);
	},

	onUp: function() {
 		this.isDown = false;
		this.fireEvent('up', this);
	},

	onPaste: function(event) {
		event.stopPropagation();
		new Core.DelayedTask({ delay: 0, scope: this, callback: this.onAfterPaste });
	},

	onAfterPaste: function() {
		if(this.getDrawing().value != this.value) {
			this.value = this.getDrawing().value;
			this.fireEvent('change', this, this.value);
		}
	},

	onChange: function(event) {
		event.preventDefault();
		event.stopPropagation();
		if(this.getDrawing().value != this.value) {
			this.value = this.getDrawing().value;
			this.fireEvent('change', this, this.value);
		}
	},

	onKeyDown: function(event) {
		if(this.getHasFocus())
			event.stopPropagation();
	},

	onKeyUp: function(event) {
		if(this.getDrawing().value != this.value) {
			this.value = this.getDrawing().value;
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
		var drawing = document.createElement('input');
		drawing.setAttribute('type', 'text');
		drawing.style.border = '0px';
		drawing.style.margin = '0px';
		drawing.style.padding = '0px';
		drawing.style.outline = 'none';
		if(navigator.isIE) {
			if(!navigator.isIE7 && !navigator.isIE8)
				drawing.style.backgroundColor = 'rgba(255,255,255,0.01)';
		}
		else
			drawing.style.background = 'none';
		if(navigator.isWebkit)
			drawing.style.webkitAppearance = 'none';
		drawing.style.fontSize = this.getFontSize()+'px';
		drawing.style.fontFamily = this.getFontFamily();
		drawing.style.fontWeight = this.getFontWeight();
		drawing.style.color = this.getColor();
		return drawing;
	},

	measureCore: function(width, height) {
		return { width: 8, height: (this.getFontSize() * 3/2) };
	},

	arrangeCore: function(width, height) {
		this.getDrawing().style.width = width+'px';
		this.getDrawing().style.height = height+'px';
	},

	onDisable: function() {
		Ui.Entry.base.onDisable.call(this);
		this.getDrawing().blur();
	},

	onEnable: function() {
		Ui.Entry.base.onEnable.call(this);
	},

	onStyleChange: function() {
		this.getDrawing().style.fontSize = this.getFontSize()+'px';
		this.getDrawing().style.fontFamily = this.getFontFamily();
		this.getDrawing().style.fontWeight = this.getFontWeight();
		if(navigator.supportRgba)
			this.getDrawing().style.color = this.getColor().getCssRgba();
		else
			this.getDrawing().style.color = this.getColor().getCssHtml();
		this.invalidateMeasure();
	}
}, {
	style: {
		color: new Ui.Color({ r: 0, g: 0, b: 0 }),
		fontSize: 14,
		fontFamily: 'Sans-serif',
		fontWeight: 'normal'
	}
});
