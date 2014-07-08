
Ui.Element.extend('Ui.Entry', 
/**@lends Ui.Entry#*/
{
	fontSize: undefined,
	fontFamily: undefined,
	fontWeight: undefined,
	color: undefined,
	value: '',
	passwordMode: false,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.Element
	 */
	constructor: function(config) {
		this.addEvents('change', 'validate');
		this.setSelectable(true);
		this.setFocusable(true);

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
				this.drawing = clone;
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

	/**#@+
	 * @private
	 */

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
		if(this.getDrawing().value != this.value) {
			this.value = this.getDrawing().value;
			this.fireEvent('change', this, this.value);
		}
	},

	onKeyDown: function(event) {
		var key = event.which;
		// keep arrows + Del + Backspace for us only
		if((key == 37) || (key == 39) || (key == 38) || (key == 40) || (key == 46) || (key == 8))
			event.stopPropagation();
	},

	onKeyUp: function(event) {
		var key = event.which;
		// keep arrows + Del + Backspace for us only
		if((key == 37) || (key == 39) || (key == 38) || (key == 40) || (key == 46) || (key == 8))
			event.stopPropagation();
		// check if value changed
		if(this.getDrawing().value !== this.value) {
			this.value = this.getDrawing().value;
			this.fireEvent('change', this, this.value);
		}
	}
	/**#@-*/
}, {
	renderDrawing: function() {
		var drawing = document.createElement('input');
		drawing.setAttribute('type', 'text');
		drawing.style.opacity = 1;
		drawing.style.border = '0px';
		drawing.style.margin = '0px';
		drawing.style.padding = '0px';
		drawing.style.outline = 'none';
		if(navigator.isIE) {
			if(navigator.isIE7 || navigator.isIE8)
				drawing.style.background = 'transparent';
			else
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
		this.getDrawing().style.lineHeight = height+'px';
	},

	onDisable: function() {
		Ui.Entry.base.onDisable.call(this);
		this.getDrawing().blur();
		this.getDrawing().style.cursor = 'default';
		this.getDrawing().disabled = true;
	},

	onEnable: function() {
		Ui.Entry.base.onEnable.call(this);
		this.getDrawing().style.cursor = 'auto';
		this.getDrawing().disabled = false;
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
