Ui.Element.extend('Ui.Label', 
/**@lends Ui.Label#*/
{
	text: '',
	orientation: 'horizontal',
	fontSize: undefined,
	fontFamily: undefined,
	fontWeight: undefined,
	color: undefined,
	labelDrawing: undefined,
	textMeasureValid: false,
	textWidth: 0,
	textHeight: 0,

    /**
     * @constructs
	 * @class A label is a graphical element that display a Text and which will take all the place it could to display it on one row.        
     * @extends Ui.Element
     * @param {String} [config.text] Label's text
     * @param {Number} [config.fontSize]
     * @param {String} [config.fontFamily]
     * @param {String} [config.fontWeight] CSS fontWeight property ['normal', 'bold', Number]
     * @param {String} [config.color]
     * @param {String} [config.orientation]
	 * @param {mixed} [config] see {@link Ui.Element} constructor for more options.  
     */ 
	constructor: function(config) {
		this.autoConfig(config, 'text', 'fontSize', 'fontFamily', 'fontWeight',
			'color', 'orientation');
	},

	getText: function() {
		return this.text;
	},

	setText: function(text) {
		if(this.text != text) {
			this.text = text;
			if('textContent' in this.labelDrawing)
				this.labelDrawing.textContent = this.text;
			else
				this.labelDrawing.innerText = this.text;
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
		if(this.fontSize != undefined)
			return this.fontSize;
		else
			return this.getStyleProperty('fontSize');
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
		if(this.fontFamily != undefined)
			return this.fontFamily;
		else
			return this.getStyleProperty('fontFamily');
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
		if(this.fontWeight != undefined)
			return this.fontWeight;
		else
			return this.getStyleProperty('fontWeight');
	},

	setColor: function(color) {
		if(this.color != color) {
			this.color = Ui.Color.create(color);
			if(navigator.supportRgba)
				this.labelDrawing.style.color = this.getColor().getCssRgba();
			else
				this.labelDrawing.style.color = this.getColor().getCssHtml();
		}
	},

	getColor: function() {
		if(this.color != undefined)
			return this.color;
		else
			return this.getStyleProperty('color');
	},

	getOrientation: function() {
		return this.orientation;
	},

	setOrientation: function(orientation) {
		if(this.orientation != orientation) {
			this.orientation = orientation;
			this.invalidateMeasure();
		}
	}
}, 
/**@lends Ui.Label#*/
{
	verticalAlign: 'center',
	horizontalAlign: 'center',

	onStyleChange: function() {
//		console.log(this+'.onStyleChange color: '+this.getColor()+' ('+this.getStyleProperty('color')+')');

		this.labelDrawing.style.fontSize = this.getFontSize()+'px';
		this.labelDrawing.style.fontFamily = this.getFontFamily();
		this.labelDrawing.style.fontWeight = this.getFontWeight();
		if(navigator.supportRgba)
			this.labelDrawing.style.color = this.getColor().getCssRgba();
		else
			this.labelDrawing.style.color = this.getColor().getCssHtml();
		this.textMeasureValid = false;
		this.invalidateMeasure();
	},

	render: function() {
		/**#nocode+ Avoid Jsdoc warnings...*/
		this.labelDrawing = document.createElement('div');
		this.labelDrawing.style.whiteSpace = 'nowrap';
		this.labelDrawing.style.display = 'inline';
		this.labelDrawing.style.position = 'absolute';
		this.labelDrawing.style.left = '0px';
		this.labelDrawing.style.top = '0px';
		if(navigator.isWebkit)
			this.labelDrawing.style.webkitUserSelect = 'none';
		else if(navigator.isGecko)
			this.labelDrawing.style.MozUserSelect = 'none';
		else if(navigator.isIE)
			this.connect(this.labelDrawing, 'selectstart', function(event) { event.preventDefault(); });
		else if(navigator.isOpera)
			this.labelDrawing.onmousedown = function(event) { event.preventDefault(); };
		return this.labelDrawing;
		/**#nocode- Avoid Jsdoc warnings...*/
	},

	measureCore: function(width, height) {
		if(!this.textMeasureValid) {
			this.textMeasureValid = true;
			var size = Ui.Label.measureText(this.text, this.getFontSize(), this.getFontFamily(), this.getFontWeight());
			this.textWidth = size.width;
			this.textHeight = size.height;
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
		}
		else {
			if(navigator.isIE && ('removeProperty' in this.labelDrawing))
				this.labelDrawing.style.removeProperty('-ms-transform');
			else if(navigator.isGecko)
				this.labelDrawing.style.removeProperty('-moz-transform');
			else if(navigator.isWebkit)
				this.labelDrawing.style.removeProperty('-webkit-transform');
			else if(navigator.isOpera)
				this.labelDrawing.style.removeProperty('-o-transform');
		}
	},

	onCumulOpacityChange: function(cumulOpacity) {
		if(navigator.isIE) {
			if(cumulOpacity < 1)
				this.labelDrawing.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(Opacity='+(Math.round(cumulOpacity * 100))+')';
			else
				this.labelDrawing.style.filter = '';
		}
	}
}, 
/**@lends Ui.Label*/
{
	measureBox: undefined,

	measureText: function(text, fontSize, fontFamily, fontWeight) {
		if(Ui.Label.measureBox == undefined)
			this.createMeasure();
		Ui.Label.measureBox.style.fontSize = fontSize+'px';
		Ui.Label.measureBox.style.fontFamily = fontFamily;
		Ui.Label.measureBox.style.fontWeight = fontWeight;
		Ui.Label.measureBox.style.fontWeight = fontWeight;
		if('textContent' in Ui.Label.measureBox)
			Ui.Label.measureBox.textContent = text;
		else
			Ui.Label.measureBox.innerText = text;
		return { width: Ui.Label.measureBox.offsetWidth, height: Ui.Label.measureBox.offsetHeight };
	},

	createMeasure: function() {
		if(document.body == undefined) {
			var body = document.createElement('body');
			document.body = body;
		}
		Ui.Label.measureBox = document.createElement('div');
		Ui.Label.measureBox.style.whiteSpace = 'nowrap';
		Ui.Label.measureBox.style.display = 'inline';
		Ui.Label.measureBox.style.visibility = 'hidden';
		document.body.appendChild(Ui.Label.measureBox);
	},

	style: {
		color: new Ui.Color({ r: 0, g: 0, b: 0 }),
		fontSize: 16,
		fontFamily: 'Sans-serif',
		fontWeight: 'normal'
	}
});

