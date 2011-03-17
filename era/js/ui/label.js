
Ui.Element.extend('Ui.Label', {
	text: '',
	orientation: 'horizontal',

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
		this.setStyleProperty('font-size', fontSize+'px');
		this.invalidateRender();
		this.invalidateMeasure();
	},

	getFontSize: function() {
		return new Number(this.getComputedStyleProperty('font-size').replace(/px$/, ''));
	},

	setFontFamily: function(fontFamily) {
		this.setStyleProperty('font-family', fontFamily);
		this.invalidateRender();
		this.invalidateMeasure();
	},

	getFontFamily: function() {
		return this.getComputedStyleProperty('font-family');
	},

	setFontWeight: function(fontWeight) {
		this.setStyleProperty('font-weight', fontWeight);
		this.invalidateRender();
		this.invalidateMeasure();
	},

	getFontWeight: function() {
		return this.getComputedStyleProperty('font-weight');
	},

	setColor: function(color) {
		this.setStyleProperty('color', color);
		this.labelDrawing.style.setProperty('color', color, null);
	},

	getColor: function() {
		return this.getComputedStyleProperty('color');
	},

	getOrientation: function() {
		return this.orientation;
	},

	setOrientation: function(orientation) {
		this.orientation = orientation;
		this.invalidateMeasure();
		this.invalidateRender();
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

	measureCore: function(width, height, force) {
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

		if(navigator.isIE)
			this.labelDrawing.style.msTransform = matrix.toString();
		else if(navigator.isGecko)
			this.labelDrawing.style.setProperty('-moz-transform', 'matrix('+matrix.svgMatrix.a.toFixed(4)+', '+matrix.svgMatrix.b.toFixed(4)+', '+matrix.svgMatrix.c.toFixed(4)+', '+matrix.svgMatrix.d.toFixed(4)+', '+matrix.svgMatrix.e.toFixed(0)+'px, '+matrix.svgMatrix.f.toFixed(0)+'px)', 'important');
		else if(navigator.isWebkit)
			this.labelDrawing.style.webkitTransform = matrix.toString();
		else if(navigator.isOpera)
			this.labelDrawing.style.setProperty('-o-transform', matrix.toString());
	},

	updateRenderCore: function() {
		this.labelDrawing.style.setProperty('font-family', this.getFontFamily(), null);
		this.labelDrawing.style.setProperty('font-weight', this.getFontWeight(), null);
		this.labelDrawing.style.setProperty('font-size', this.getFontSize()+'px', null);
		this.labelDrawing.textContent = this.text;
	},
});
