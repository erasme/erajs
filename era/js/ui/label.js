
Ui.Element.extend('Ui.Label', {
	text: '',
	orientation: 'horizontal',
	fontSize: 16,
	fontFamily: 'Sans-serif',
	fontWeight: 'normal',
	color: 'black',
	labelDrawing: undefined,
	textMeasureValid: false,
	textWidth: 0,
	textHeight: 0,

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
		else
			this.setColor(this.color);
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
			this.textMeasureValid = false;
			this.invalidateMeasure();
		}
	},

	setFontSize: function(fontSize) {
		if(this.fontSize != fontSize) {
			this.fontSize = fontSize;
			this.labelDrawing.style.fontSize = this.getFontSize()+'px';
			this.textMeasureValid = false;
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
			this.textMeasureValid = false;
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
			this.textMeasureValid = false;
			this.invalidateMeasure();
		}
	},

	getFontWeight: function() {
		return this.fontWeight;
	},

	setColor: function(color) {
		if(this.color != color) {
			this.color = Ui.Color.create(color);
			this.labelDrawing.style.color = this.color.getCssRgba();
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
		if(!this.textMeasureValid) {
			this.textMeasureValid = true;
			var size = Ui.Label.measureText(this.text, this.fontSize, this.fontFamily, this.fontWeight);
			this.textWidth = size.width;
			this.textHeight = size.height;
//			console.log('label.measureCore('+width+','+height+') for \''+this.text+'\' = ('+size.width+' x '+size.height+')');
		}
		if(this.orientation == 'vertical')
			return { width: this.textHeight, height: this.textWidth };
		else
			return { width: this.textWidth, height: this.textHeight };
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
}, {
	measureBox: undefined,

	constructor: function() {
		if(document.body == undefined) {
			var body = document.createElementNS(htmlNS, 'body');
			document.body = body;
		}
		Ui.Label.measureBox = document.createElement('div');
		Ui.Label.measureBox.style.whiteSpace = 'nowrap';
		Ui.Label.measureBox.style.display = 'inline';
		Ui.Label.measureBox.style.visibility = 'hidden';
		document.body.appendChild(Ui.Label.measureBox);
	},

	measureText: function(text, fontSize, fontFamily, fontWeight) {
		Ui.Label.measureBox.style.fontSize = fontSize+'px';
		Ui.Label.measureBox.style.fontFamily = fontFamily;
		Ui.Label.measureBox.style.fontWeight = fontWeight;
		Ui.Label.measureBox.style.fontWeight = fontWeight;
		Ui.Label.measureBox.textContent = text;
		return { width: Ui.Label.measureBox.offsetWidth, height: Ui.Label.measureBox.offsetHeight };
	},
});



