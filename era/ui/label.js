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
		this.setSelectable(false);
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
		if(this.fontSize !== fontSize) {
			this.fontSize = fontSize;
			this.labelDrawing.style.fontSize = this.getFontSize()+'px';
			this.textMeasureValid = false;
			this.invalidateMeasure();
		}
	},

	getFontSize: function() {
		if(this.fontSize !== undefined)
			return this.fontSize;
		else
			return this.getStyleProperty('fontSize');
	},

	setFontFamily: function(fontFamily) {
		if(this.fontFamily !== fontFamily) {
			this.fontFamily = fontFamily;
			this.labelDrawing.style.fontFamily = this.getFontFamily();
			this.textMeasureValid = false;
			this.invalidateMeasure();
		}
	},

	getFontFamily: function() {
		if(this.fontFamily !== undefined)
			return this.fontFamily;
		else
			return this.getStyleProperty('fontFamily');
	},

	setFontWeight: function(fontWeight) {
		if(this.fontWeight !== fontWeight) {
			this.fontWeight = fontWeight;
			this.labelDrawing.style.fontWeight = this.getFontWeight();
			this.textMeasureValid = false;
			this.invalidateMeasure();
		}
	},

	getFontWeight: function() {
		if(this.fontWeight !== undefined)
			return this.fontWeight;
		else
			return this.getStyleProperty('fontWeight');
	},

	setColor: function(color) {
		if(this.color !== color) {
			this.color = Ui.Color.create(color);
			if(navigator.supportRgba)
				this.labelDrawing.style.color = this.getColor().getCssRgba();
			else
				this.labelDrawing.style.color = this.getColor().getCssHtml();
		}
	},

	getColor: function() {
		if(this.color !== undefined)
			return this.color;
		else
			return Ui.Color.create(this.getStyleProperty('color'));
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

	renderDrawing: function() {
		/**#nocode+ Avoid Jsdoc warnings...*/
		this.labelDrawing = document.createElement('div');
		this.labelDrawing.style.whiteSpace = 'nowrap';
		this.labelDrawing.style.display = 'inline';
		this.labelDrawing.style.position = 'absolute';
		this.labelDrawing.style.left = '0px';
		this.labelDrawing.style.top = '0px';
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
		if(this.orientation === 'vertical')
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
	}
}, 
/**@lends Ui.Label*/
{
	measureBox: undefined,
	measureContext: undefined,

	measureTextCanvas: function(text, fontSize, fontFamily, fontWeight) {
		if(Ui.Label.measureBox === undefined)
			this.createMeasureCanvas();
		Ui.Label.measureContext.font = 'normal '+fontWeight+' '+fontSize+'px '+fontFamily;
		var res = Ui.Label.measureContext.measureText(text);
		res.height = fontSize;
		return res;
	},

	createMeasureCanvas: function() {
		var measureWindow = window;
		if(navigator.isIE || navigator.isGecko)
			measureWindow = Ui.App.getRootWindow();

		if(measureWindow.document.body === undefined) {
			var body = measureWindow.document.createElement('body');
			measureWindow.document.body = body;
		}
		Ui.Label.measureBox = measureWindow.document.createElement('canvas');
		Ui.Label.measureBox.style.visibility = 'hidden';
		Ui.Label.measureBox.style.position = 'absolute';
		Ui.Label.measureBox.style.left = '0px';
		Ui.Label.measureBox.style.top = '0px';
		Ui.Label.measureBox.style.outline = 'none';
		Ui.Label.measureBox.setAttribute('width', 10, null);
		Ui.Label.measureBox.setAttribute('height', 10, null);
		measureWindow.document.body.appendChild(Ui.Label.measureBox);
		Ui.Label.measureContext = Ui.Label.measureBox.getContext('2d');
	},
	
	isFontAvailable: function(fontFamily, fontWeight) {
		var i;
		if(!navigator.supportCanvas)
			return true;
		if(Ui.Label.measureBox === undefined)
			Ui.Label.createMeasureCanvas();	
		var ctx = Ui.Label.measureContext;
		ctx.fillStyle = 'rgba(0,0,0,0)';
		ctx.clearRect(0, 0, 10, 10);
		ctx.textBaseline = 'top';
		//console.log('isFontAvailable('+fontFamily+','+fontWeight+')');
		// draw with the wanted font
		ctx.font = 'normal '+fontWeight+' 10px '+fontFamily;
		ctx.fillStyle = 'rgba(255,255,255,1)';
		ctx.fillText('@', 0, 0);
		var wantedImageData = ctx.getImageData(0,0,10,10);
		var empty = true;
		for(i = 0; empty && (i < wantedImageData.data.length); i += 4) {
			if(wantedImageData.data[i+3] !== 0)
				empty = false;
		}
		if(empty)
			return false;
		// draw with a local font
		ctx.fillStyle = 'rgba(0,0,0,0)';
		ctx.clearRect(0, 0, 10, 10);
		ctx.fillStyle = 'rgba(255,255,255,1)';
		ctx.font = 'normal '+fontWeight+' 10px Sans-Serif';
		ctx.fillText('@', 0, 0);
		var refImageData = ctx.getImageData(0,0,10,10);
		// draw with wanted font fallback local font
		ctx.fillStyle = 'rgba(0,0,0,0)';
		ctx.clearRect(0, 0, 10, 10);
		ctx.fillStyle = 'rgba(255,255,255,1)';
		ctx.font = 'normal '+fontWeight+' 10px '+fontFamily+',Sans-Serif';
		ctx.fillText('@', 0, 0);
		// test if images are differents
		var imageData = ctx.getImageData(0,0,10,10);
		for(i = 0; i < imageData.data.length; i += 4) {
			if(imageData.data[i+3] !== refImageData.data[i+3])
				return true;
		}
		return false;
	},

	measureTextHtml: function(text, fontSize, fontFamily, fontWeight) {
		if(Ui.Label.measureBox === undefined)
			this.createMeasureHtml();
		Ui.Label.measureBox.style.fontSize = fontSize+'px';
		Ui.Label.measureBox.style.fontFamily = fontFamily;
		Ui.Label.measureBox.style.fontWeight = fontWeight;
		if('textContent' in Ui.Label.measureBox)
			Ui.Label.measureBox.textContent = text;
		else
			Ui.Label.measureBox.innerText = text;
		return { width: Ui.Label.measureBox.offsetWidth, height: Ui.Label.measureBox.offsetHeight };
	},

	createMeasureHtml: function() {
		var measureWindow = window;
		if(navigator.isIE || navigator.isGecko)
			measureWindow = Ui.App.getRootWindow();

		if(measureWindow.document.body === undefined) {
			var body = measureWindow.document.createElement('body');
			measureWindow.document.body = body;
		}
		Ui.Label.measureBox = measureWindow.document.createElement('div');
		Ui.Label.measureBox.style.whiteSpace = 'nowrap';
		Ui.Label.measureBox.style.position = 'absolute';
		Ui.Label.measureBox.style.left = '0px';
		Ui.Label.measureBox.style.top = '0px';
		Ui.Label.measureBox.style.position = 'absolute';
		Ui.Label.measureBox.style.display = 'inline';
		Ui.Label.measureBox.style.visibility = 'hidden';
		measureWindow.document.body.appendChild(Ui.Label.measureBox);
	},

	measureText: function(text, fontSize, fontFamily, fontWeight) {
		if((text === '') || (text === undefined))
			return { width: 0, height: 0 };
		if(navigator.supportCanvas)
			return Ui.Label.measureTextCanvas(text, fontSize, fontFamily, fontWeight);
		else
			return Ui.Label.measureTextHtml(text, fontSize, fontFamily, fontWeight);
	},

	style: {
		color: '#444444',
		fontSize: 16,
		fontFamily: 'Sans-serif',
		fontWeight: 'normal'
	}
});

