
Ui.Element.extend('Ui.TextArea', {
	textareaDrawing: undefined,
	fontSize: 14,
	fontFamily: 'sans-serif',
	fontWeight: 'normal',
	color: 'black',

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
			console.log('textarea focus');
		});
		this.connect(this.textareaDrawing, 'blur', function(event) {
			console.log('textarea blur');
		});
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
		return this.entryDrawing.value;
	},

	setValue: function(value) {
		this.entryDrawing.value = value;
	},

	//
	// Private
	//

	onMouseDown: function(event) {
	},

}, {
	render: function() {
		this.textareaDrawing = document.createElementNS(htmlNS, 'textarea');
		this.textareaDrawing.style.setProperty('display', 'block', null);
		this.textareaDrawing.style.setProperty('resize', 'none', null);
		this.textareaDrawing.style.setProperty('overflow', 'hidden', null);
		this.textareaDrawing.style.setProperty('border', '0px', null);
		this.textareaDrawing.style.setProperty('margin', '0px', null);
		this.textareaDrawing.style.setProperty('padding', '0px', null);
		this.textareaDrawing.style.setProperty('outline', 'none', null);
		this.textareaDrawing.style.setProperty('background', 'none', null);
		if(navigator.isWebkit)
			this.textareaDrawing.style.setProperty('-webkit-appearance', 'none', null);
		this.updateRenderCore();
		return this.textareaDrawing;
	},

	measureCore: function(width, height, force) {
		return { width: 8, height: (this.fontSize * 3/2) };
	},

	arrangeCore: function(width, height) {
		this.textareaDrawing.style.setProperty('width', width+'px', null);
		this.textareaDrawing.style.setProperty('height', height+'px', null);
	},

	updateRenderCore: function() {
		this.textareaDrawing.style.setProperty('font-size', this.getFontSize()+'px', null);
		this.textareaDrawing.style.setProperty('font-family', this.getFontFamily(), null);
		this.textareaDrawing.style.setProperty('font-weight', this.getFontWeight(), null);
		this.textareaDrawing.style.setProperty('color', this.getColor(), null);
	},
});
