
Ui.Element.extend('Ui.Entry', {
	entryDrawing: undefined,
	fontSize: 14,
	fontFamily: 'Sans-serif',
	fontWeight: 'normal',
	color: 'black',
	value: '',

	constructor: function(config) {
		if(config.fontSize != undefined)
			this.setFontSize(config.fontSize);
		if(config.fontFamily != undefined)
			this.setFontFamily(config.fontFamily);
		if(config.fontWeight != undefined)
			this.setFontWeight(config.fontWeight);
		if(config.color != undefined)
			this.setColor(config.color);

		this.connect(this.entryDrawing, 'mousedown', this.onMouseDown);
		this.connect(this.entryDrawing, 'change', this.onChange);
		this.connect(this.entryDrawing, 'keyup', this.onKeyUp);

//		this.setFocusable(true);
//		this.connect(this.entryDrawing, 'focus', function(event) {
//			console.log('entry focus');
//		});
//		this.connect(this.entryDrawing, 'blur', function(event) {
//			console.log('entry blur');
//		});

		this.addEvents('change', 'validate');
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
		this.value = value;
		this.entryDrawing.value = this.value;
	},

	//
	// Private
	//

	onMouseDown: function(event) {
		this.entryDrawing.focus();
	},

	onChange: function(event) {
		event.preventDefault();
		event.stopPropagation();
		if(this.entryDrawing.value != this.value) {
			this.value = this.entryDrawing.value;
			this.fireEvent('change', this, this.value);
		}
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
	},

}, {
	render: function() {
		this.entryDrawing = document.createElementNS(htmlNS, 'input');
		this.entryDrawing.setAttributeNS(null, 'type', 'text');
		this.entryDrawing.style.border = '0px';
		this.entryDrawing.style.margin = '0px';
		this.entryDrawing.style.padding = '0px';
		this.entryDrawing.style.outline = 'none';
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
});
