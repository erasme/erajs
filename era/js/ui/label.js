
Ui.Element.extend('Ui.Label', {
	text: '',
	orientation: 'horizontal',
	fontSize: 16,
	fontFamily: 'Sans-serif',
	fontWeight: 'normal',
	color: 'black',

	constructor: function(config) {
		if(config.text != undefined)
			this.setText(config.text);
		if(config.fontSize != undefined)
			this.setFontSize(config.fontSize);
		if(config.fontFamily != undefined)
			this.setFontFamily(config.fontFamily);
		if(config.fontWeight != undefined)
			this.setFontWeight(config.fontWeight);
		if(config.color != undefined)
			this.setColor(config.color);
		if(config.orientation != undefined)
			this.setOrientation(config.orientation);
	},

	getText: function() {
		return this.text;
	},

	setText: function(text) {
		if(this.text != text) {
			this.text = text;
			this.invalidateMeasure();
			this.invalidateRender();
		}
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
		}
	},

	getColor: function() {
		return this.color;
	},

	getOrientation: function() {
		return this.orientation;
	},

	setOrientation: function(orientation) {
		if(this.orientation != orientation) {
			this.orientation = orientation;
			this.invalidateMeasure();
			this.invalidateRender();
		}
	},

}, {
	verticalAlign: 'center',
	horizontalAlign: 'center',

	render: function() {
		this.labelDrawing = document.createElementNS(htmlNS, 'div');
		this.labelDrawing.style.setProperty('white-space', 'nowrap', null);
		this.labelDrawing.style.setProperty('display', 'inline', null);
		this.labelDrawing.style.setProperty('position', 'absolute', null);
		this.labelDrawing.style.setProperty('left', '0px', null);
		this.labelDrawing.style.setProperty('top', '0px', null);
		if(navigator.isWebkit)
			this.labelDrawing.style.webkitUserSelect = 'none';
		else if(navigator.isGecko)
			this.labelDrawing.style.setProperty('-moz-user-select', 'none', null);
		else if(navigator.isIE)
			this.labelDrawing.onselectstart = function(event) { event.preventDefault(); };
		else if(navigator.isOpera)
			this.labelDrawing.onmousedown = function(event) { event.preventDefault(); };
		this.labelDrawing.style.pointerEvents = 'none';
		return this.labelDrawing;
	},

	measureCore: function(width, height) {
		if(this.orientation == 'vertical')
			return { width: this.labelDrawing.offsetHeight, height: this.labelDrawing.offsetWidth };
		else
			return { width: this.labelDrawing.offsetWidth, height: this.labelDrawing.offsetHeight };
	},

	arrangeCore: function(width, height) {
		var matrix;
		if(this.orientation == 'vertical') {
			matrix = Ui.Matrix.createTranslate(this.labelDrawing.offsetHeight, 0);
			matrix.rotate(90);
		}
		else
			matrix = new Ui.Matrix();

		if(navigator.isIE) {
			this.drawing.style.msTransform = matrix.toString();
			this.drawing.style.msTransformOrigin = '0% 0%';
		}
		else if(navigator.isGecko) {
			this.drawing.style.setProperty('-moz-transform', 'matrix('+matrix.svgMatrix.a.toFixed(4)+', '+matrix.svgMatrix.b.toFixed(4)+', '+matrix.svgMatrix.c.toFixed(4)+', '+matrix.svgMatrix.d.toFixed(4)+', '+matrix.svgMatrix.e.toFixed(0)+'px, '+matrix.svgMatrix.f.toFixed(0)+'px)', null);
			this.drawing.style.setProperty('-moz-transform-origin', '0% 0%', null);
		}
		else if(navigator.isWebkit) {
			this.drawing.style.webkitTransform = matrix.toString();
			this.drawing.style.webkitTransformOrigin = '0% 0%';
		}
		else if(navigator.isOpera) {
			this.drawing.style.setProperty('-o-transform', matrix.toString(), null);
			this.drawing.style.setProperty('-o-transform-origin', '0% 0%', null);
		}
	},

	updateRenderCore: function() {
		this.labelDrawing.style.setProperty('font-family', this.getFontFamily(), null);
		this.labelDrawing.style.setProperty('font-weight', this.getFontWeight(), null);
		this.labelDrawing.style.setProperty('font-size', this.getFontSize()+'px', null);
		this.labelDrawing.textContent = this.text;

		var color = this.getColor();
		if(color.isSubclass('Ui.Color'))
			color = color.getCssRgba();
		this.labelDrawing.style.setProperty('color', color, null);
	},
});
