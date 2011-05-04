
Ui.Element.extend('Ui.TextArea', {
	textareaDrawing: undefined,
	fontSize: 14,
	fontFamily: 'sans-serif',
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

		this.connect(this.textareaDrawing, 'mousedown', function(event) {
//			console.log('entry mousedown');
			this.textareaDrawing.focus();
		});

//		this.setFocusable(true);

		this.connect(this.textareaDrawing, 'focus', function(event) {
//			console.log('textarea focus');
		});
		this.connect(this.textareaDrawing, 'blur', function(event) {
//			console.log('textarea blur');
		});

		this.connect(this.textareaDrawing, 'keyup', this.onKeyUp);

		this.addEvents('change');
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

	//
	// Private
	//

	onMouseDown: function(event) {
	},

	onKeyUp: function(event) {
//		console.log(this+'.onKeyUp '+this.textareaDrawing.scrollHeight+' / '+this.getLayoutHeight());

		if(this.textareaDrawing.value != this.value) {
			this.value = this.textareaDrawing.value;
			this.fireEvent('change', this, this.value);
		}


//		if(this.textareaDrawing.scrollHeight != this.getLayoutHeight())
			this.invalidateMeasure();
	},

}, {
	render: function() {
		this.textareaDrawing = document.createElementNS(htmlNS, 'textarea');
		this.textareaDrawing.setAttributeNS(null, 'rows', 1);
		this.textareaDrawing.setAttributeNS(null, 'cols', 1);

		this.textareaDrawing.style.display = 'block';
		this.textareaDrawing.style.resize = 'none';
		this.textareaDrawing.style.overflow = 'hidden';
		this.textareaDrawing.style.border = '0px';
		this.textareaDrawing.style.margin = '0px';
		this.textareaDrawing.style.padding = '0px';
		this.textareaDrawing.style.outline = 'none';
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
		this.textareaDrawing.style.width = '0px';
		this.textareaDrawing.style.height = '0px';

		console.log(this+'.measureCore('+width+','+height+') = '+this.textareaDrawing.scrollWidth+' x '+this.textareaDrawing.scrollHeight);
		return { width: this.textareaDrawing.scrollWidth, height: this.textareaDrawing.scrollHeight };
//		return { width: 8, height: (this.fontSize * 3/2) };
	},

	arrangeCore: function(width, height) {
		console.log(this+'.arrangeCore('+width+','+height+')');

		this.textareaDrawing.style.width = width+'px';
		this.textareaDrawing.style.height = height+'px';
	},
});
