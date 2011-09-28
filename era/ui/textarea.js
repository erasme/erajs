Ui.Element.extend('Ui.TextArea', 
/**@lends Ui.TextArea#*/
{
	textareaDrawing: undefined,
	fontSize: 14,
	fontFamily: 'sans-serif',
	fontWeight: 'normal',
	color: 'black',
	value: '',

	/**
	 * @constructs
	 * @class
	 * @extends Ui.Element
	 */
	constructor: function(config) {
		this.addEvents('change', 'scroll');

		this.getDrawing().selectable = true;

		this.connect(this.textareaDrawing, 'mousedown', function(event) {
			this.textareaDrawing.focus();
		});
		this.connect(this.textareaDrawing, 'keyup', this.onKeyUp);

		this.connect(this.textareaDrawing, 'scroll', function() {
//			console.log(this+' scroll event ('+this.textareaDrawing.scrollLeft+','+this.textareaDrawing.scrollTop+')');
			if((this.getMeasureWidth() != this.textareaDrawing.scrollWidth) || (this.getMeasureHeight() != this.textareaDrawing.scrollHeight)) {
//				console.log('invalidateMeasure');
				this.invalidateMeasure();
			}
			this.fireEvent('scroll', this, this.textareaDrawing.scrollLeft, this.textareaDrawing.scrollTop);
		});

		this.autoConfig(config, 'fontSize', 'fontFamily', 'fontWeight', 'color');
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

	setOffset: function(offsetX, offsetY) {
//		console.log(this+'.setOffset('+offsetX+','+offsetY+')');

		this.textareaDrawing.scrollLeft = offsetX;
		this.textareaDrawing.scrollTop = offsetY;
	},

	getOffsetX: function() {
		return this.textareaDrawing.scrollLeft;
	},

	getOffsetY: function() {
		return this.textareaDrawing.scrollTop;
	},

	//
	// Private
	//

	onMouseDown: function(event) {
	},

	onKeyUp: function(event) {
//		console.log(this+'.onKeyUp');
//		console.log(this+'.onKeyUp '+this.textareaDrawing.scrollHeight+' / '+this.getLayoutHeight());

		if(this.textareaDrawing.value != this.value) {
			this.value = this.textareaDrawing.value;
			this.fireEvent('change', this, this.value);
		}


//		if(this.textareaDrawing.scrollHeight != this.getLayoutHeight())
			this.invalidateMeasure();
	}
}, 
/**@lends Ui.TextArea#*/
{
	render: function() {
		this.textareaDrawing = document.createElement('textarea');
		this.textareaDrawing.setAttribute('rows', 1);
		this.textareaDrawing.setAttribute('cols', 1);

		this.textareaDrawing.style.display = 'block';
		this.textareaDrawing.style.resize = 'none';
		this.textareaDrawing.style.overflow = 'hidden';
		this.textareaDrawing.style.border = '0px';
		this.textareaDrawing.style.margin = '0px';
		this.textareaDrawing.style.padding = '0px';
		this.textareaDrawing.style.outline = 'none';
		if(!navigator.isIE7 && !navigator.isIE8)
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
		this.textareaDrawing.style.width = width+'px';
		this.textareaDrawing.style.height = '0px';

//		console.log(this+'.measureCore('+width+','+height+') = '+this.textareaDrawing.scrollWidth+' x '+this.textareaDrawing.scrollHeight);
		return { width: this.textareaDrawing.scrollWidth, height: this.textareaDrawing.scrollHeight };
//		return { width: 8, height: (this.fontSize * 3/2) };
	},

	arrangeCore: function(width, height) {
//		console.log(this+'.arrangeCore('+width+','+height+')');

		this.textareaDrawing.style.width = width+'px';
		this.textareaDrawing.style.height = height+'px';
	}
}, 
/**@lends Ui.TextArea*/
{
/*	measureBox: undefined,

	constructor: function() {
		if(document.body == undefined) {
			var body = document.createElement('body');
			document.body = body;
		}
		Ui.TextArea.measureBox = document.createElement('textarea');
		Ui.TextArea.measureBox.style.display = 'block';
		Ui.TextArea.measureBox.style.width = '0px';
		Ui.TextArea.measureBox.style.height = '0px';
		Ui.TextArea.measureBox.style.visibility = 'hidden';
		document.body.appendChild(Ui.TextArea.measureBox);
	},

	measureArea: function(text, fontSize, fontFamily, fontWeight) {
		Ui.Label.measureBox.style.fontSize = fontSize+'px';
		Ui.Label.measureBox.style.fontFamily = fontFamily;
		Ui.Label.measureBox.style.fontWeight = fontWeight;
		Ui.Label.measureBox.style.fontWeight = fontWeight;
		Ui.Label.measureBox.textContent = text;
		return { width: Ui.Label.measureBox.offsetWidth, height: Ui.Label.measureBox.offsetHeight };
	},*/
});

