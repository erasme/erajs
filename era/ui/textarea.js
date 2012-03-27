Ui.Element.extend('Ui.TextArea', 
/**@lends Ui.TextArea#*/
{
	textareaDrawing: undefined,
	fontSize: 14,
	fontFamily: 'sans-serif',
	fontWeight: 'normal',
	color: 'black',
	value: '',
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
		this.addEvents('down', 'up', 'change', 'scroll');
		this.setSelectable(true);
		this.setFocusable(true);


		// handle mouse
		this.connect(this.getDrawing(), 'mousedown', this.onMouseDown);

		// handle touches
		this.connect(this.getDrawing(), 'fingerdown', this.onFingerDown);

		// handle keyboard
		this.connect(this.textareaDrawing, 'keyup', this.onKeyUp);

		this.connect(this.textareaDrawing, 'scroll', function() {
//			console.log('textarea scroll');
//			console.log(this+' scroll event ('+this.textareaDrawing.scrollLeft+','+this.textareaDrawing.scrollTop+')');
			if((this.getMeasureWidth() != this.textareaDrawing.scrollWidth) || (this.getMeasureHeight() != this.textareaDrawing.scrollHeight)) {
//				console.log('invalidateMeasure');
				this.invalidateMeasure();
			}
			this.fireEvent('scroll', this, this.textareaDrawing.scrollLeft, this.textareaDrawing.scrollTop);
		});
	},

	setFontSize: function(fontSize) {
		if(this.fontSize != fontSize) {
			this.fontSize = fontSize;
			this.textareaDrawing.style.fontSize = this.fontSize+'px';
			this.invalidateMeasure();
		}
	},

	getFontSize: function() {
		return this.fontSize;
	},

	setFontFamily: function(fontFamily) {
		if(this.fontFamily != fontFamily) {
			this.fontFamily = fontFamily;
			this.textareaDrawing.style.fontFamily = this.fontFamily;
			this.invalidateMeasure();
		}
	},

	getFontFamily: function() {
		return this.fontFamily;
	},

	setFontWeight: function(fontWeight) {
		if(this.fontWeight != fontWeight) {
			this.fontWeight = fontWeight;
			this.textareaDrawing.style.fontWeight = this.fontWeight;
			this.invalidateMeasure();
		}
	},

	getFontWeight: function() {
		return this.fontWeight;
	},

	setColor: function(color) {
		if(this.color != color) {
			this.color = color;
			this.textareaDrawing.style.color = this.color;
			this.invalidateMeasure();
		}
	},

	getColor: function() {
		return this.color;
	},

	getValue: function() {
		return this.textareaDrawing.value;
	},

	setValue: function(value) {
		this.textareaDrawing.value = value;
	},

	setOffset: function(offsetX, offsetY) {
//		console.log(this+'.setOffset('+offsetX+','+offsetY+')');

		this.textareaDrawing.scrollLeft = offsetX;
		this.textareaDrawing.scrollTop = offsetY;
	},

	getOffsetX: function() {
		return this.textareaDrawing.scrollLeft;
	},

	getOffsetY: function() {
		return this.textareaDrawing.scrollTop;
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
			this.getDrawing().focus();
		}
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
		this.getDrawing().focus();
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

	onKeyUp: function(event) {
//		console.log(this+'.onKeyUp');
//		console.log(this+'.onKeyUp '+this.textareaDrawing.scrollHeight+' / '+this.getLayoutHeight());

		if(this.textareaDrawing.value != this.value) {
			this.value = this.textareaDrawing.value;
			this.fireEvent('change', this, this.value);
		}
//		if(this.textareaDrawing.scrollHeight != this.getLayoutHeight())
			this.invalidateMeasure();
	}
	/**#@-*/
}, 
/**@lends Ui.TextArea#*/
{
	renderDrawing: function() {
		this.textareaDrawing = document.createElement('textarea');
		this.textareaDrawing.setAttribute('rows', 1);
		this.textareaDrawing.setAttribute('cols', 1);

		this.textareaDrawing.style.display = 'block';
		this.textareaDrawing.style.resize = 'none';
		this.textareaDrawing.style.overflow = 'hidden';
		this.textareaDrawing.style.border = '0px';
		this.textareaDrawing.style.margin = '0px';
		this.textareaDrawing.style.padding = '0px';
		this.textareaDrawing.style.outline = 'none';
		if(!navigator.isIE7 && !navigator.isIE8)
			this.textareaDrawing.style.background = 'none';
		if(navigator.isWebkit)
			this.textareaDrawing.style.webkitAppearance = 'none'
		this.textareaDrawing.style.fontSize = this.fontSize+'px';
		this.textareaDrawing.style.fontFamily = this.fontFamily;
		this.textareaDrawing.style.fontWeight = this.fontWeight;
		this.textareaDrawing.style.color = this.color;
		return this.textareaDrawing;
	},

	measureCore: function(width, height) {
		this.textareaDrawing.style.width = width+'px';
		this.textareaDrawing.style.height = '0px';
		var size = { width: this.textareaDrawing.scrollWidth, height: this.textareaDrawing.scrollHeight };
		this.textareaDrawing.style.width = this.getLayoutWidth()+'px';
		this.textareaDrawing.style.height = this.getLayoutHeight()+'px';
		return size;
	},

	arrangeCore: function(width, height) {
		this.textareaDrawing.style.width = width+'px';
		this.textareaDrawing.style.height = height+'px';
	}
}, 
/**@lends Ui.TextArea*/
{
/*	measureBox: undefined,

	constructor: function() {
		if(document.body === undefined) {
			var body = document.createElement('body');
			document.body = body;
		}
		Ui.TextArea.measureBox = document.createElement('textarea');
		Ui.TextArea.measureBox.style.display = 'block';
		Ui.TextArea.measureBox.style.width = '0px';
		Ui.TextArea.measureBox.style.height = '0px';
		Ui.TextArea.measureBox.style.visibility = 'hidden';
		document.body.appendChild(Ui.TextArea.measureBox);
	},

	measureArea: function(text, fontSize, fontFamily, fontWeight) {
		Ui.Label.measureBox.style.fontSize = fontSize+'px';
		Ui.Label.measureBox.style.fontFamily = fontFamily;
		Ui.Label.measureBox.style.fontWeight = fontWeight;
		Ui.Label.measureBox.style.fontWeight = fontWeight;
		Ui.Label.measureBox.textContent = text;
		return { width: Ui.Label.measureBox.offsetWidth, height: Ui.Label.measureBox.offsetHeight };
	},*/
});

