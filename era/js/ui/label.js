
Ui.Element.extend('Ui.Label', {
	text: '',
	orientation: 'horizontal',
	fontSize: 16,
	fontFamily: 'Sans-serif',
	fontWeight: 'normal',
	color: 'black',
	labelDrawing: undefined,

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
			this.labelDrawing.textContent = this.text;
			this.invalidateMeasure();
		}
	},

	setFontSize: function(fontSize) {
		if(this.fontSize != fontSize) {
			this.fontSize = fontSize;
			this.labelDrawing.style.fontSize = this.getFontSize()+'px';
			this.invalidateMeasure();
		}
	},

	getFontSize: function() {
		return this.fontSize;
	},

	setFontFamily: function(fontFamily) {
		if(this.fontFamily != fontFamily) {
			this.fontFamily = fontFamily;
			this.labelDrawing.style.fontFamily = this.getFontFamily();
			this.invalidateMeasure();
		}
	},

	getFontFamily: function() {
		return this.fontFamily;
	},

	setFontWeight: function(fontWeight) {
		if(this.fontWeight != fontWeight) {
			this.fontWeight = fontWeight;
			this.labelDrawing.style.fontWeight = this.getFontWeight();
			this.invalidateMeasure();
		}
	},

	getFontWeight: function() {
		return this.fontWeight;
	},

	setColor: function(color) {
		if(this.color != color) {
			this.color = color;
			var color = this.getColor();
			if(color.isSubclass('Ui.Color'))
				color = color.getCssRgba();
			this.labelDrawing.style.color = color;
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
		}
	},

}, {
	verticalAlign: 'center',
	horizontalAlign: 'center',

	render: function() {
		this.labelDrawing = document.createElementNS(htmlNS, 'div');
		this.labelDrawing.style.whiteSpace = 'nowrap';
		this.labelDrawing.style.display = 'inline';
		this.labelDrawing.style.position = 'absolute';
		this.labelDrawing.style.left = '0px';
		this.labelDrawing.style.top = '0px';
		this.labelDrawing.style.fontSize = this.fontSize+'px';
		this.labelDrawing.style.fontFamily = this.fontFamily;
		this.labelDrawing.style.fontWeight = this.fontWeight;
		this.labelDrawing.style.color = this.color;
		if(navigator.isWebkit)
			this.labelDrawing.style.webkitUserSelect = 'none';
		else if(navigator.isGecko)
			this.labelDrawing.style.MozUserSelect = 'none';
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
			this.labelDrawing.style.msTransform = matrix.toString();
			this.labelDrawing.style.msTransformOrigin = '0% 0%';
		}
		else if(navigator.isGecko) {
			this.labelDrawing.style.MozTransform = 'matrix('+matrix.svgMatrix.a.toFixed(4)+', '+matrix.svgMatrix.b.toFixed(4)+', '+matrix.svgMatrix.c.toFixed(4)+', '+matrix.svgMatrix.d.toFixed(4)+', '+matrix.svgMatrix.e.toFixed(0)+'px, '+matrix.svgMatrix.f.toFixed(0)+'px)';
			this.labelDrawing.style.MozTransformOrigin = '0% 0%';
		}
		else if(navigator.isWebkit) {
			this.labelDrawing.style.webkitTransform = matrix.toString();
			this.labelDrawing.style.webkitTransformOrigin = '0% 0%';
		}
		else if(navigator.isOpera) {
			this.labelDrawing.style.OTransform = matrix.toString();
			this.labelDrawing.style.OTransformOrigin = '0% 0%';
		}
	},
});
