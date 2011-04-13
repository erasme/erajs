
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
			this.invalidateRender();
			this.invalidateMeasure();
		}
	},

	getFontSize: function() {
		return this.fontSize;
	},

	setFontFamily: function(fontFamily) {
		if(this.fontFamily != fontFamily) {
			this.fontFamily = fontFamily;
			this.invalidateRender();
			this.invalidateMeasure();
		}
	},

	getFontFamily: function() {
		return this.fontFamily;
	},

	setFontWeight: function(fontWeight) {
		if(this.fontWeight != fontWeight) {
			this.fontWeight = fontWeight;
			this.invalidateRender();
			this.invalidateMeasure();
		}
	},

	getFontWeight: function() {
		return this.fontWeight;
	},

	setColor: function(color) {
		if(this.color != color) {
			this.color = color;
			this.invalidateRender();
			this.invalidateMeasure();
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
		this.entryDrawing.style.setProperty('border', '0px', null);
		this.entryDrawing.style.setProperty('margin', '0px', null);
		this.entryDrawing.style.setProperty('padding', '0px', null);
		this.entryDrawing.style.setProperty('outline', 'none', null);
		this.entryDrawing.style.setProperty('background', 'none', null);
		if(navigator.isWebkit)
			this.entryDrawing.style.setProperty('-webkit-appearance', 'none', null);
		this.updateRenderCore();
		return this.entryDrawing;
	},

	measureCore: function(width, height) {
		console.log(this+'.measureCore('+width+','+height+')');
		return { width: 8, height: (this.fontSize * 3/2) };
	},

	arrangeCore: function(width, height) {
		this.entryDrawing.style.setProperty('width', width+'px', null);
		this.entryDrawing.style.setProperty('height', height+'px', null);
	},

	updateRenderCore: function() {
		this.entryDrawing.style.setProperty('font-size', this.getFontSize()+'px', null);
		this.entryDrawing.style.setProperty('font-family', this.getFontFamily(), null);
		this.entryDrawing.style.setProperty('font-weight', this.getFontWeight(), null);
		this.entryDrawing.style.setProperty('color', this.getColor(), null);
	},
});
