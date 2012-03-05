Ui.Element.extend('Ui.Text', 
/**@lends Ui.Text#*/
{
	text: '',
	fontSize: undefined,
	fontFamily: undefined,
	fontWeight: undefined,
	color: undefined,
	textAlign: undefined,

	measureDrawing: undefined,
	textDrawing: undefined,
	// var needed to update the layout
	line: undefined,
	word: undefined,
	words: undefined,
	flowRender: false,
	offsetX: 0,
	offsetY: 0,
	spaceWidth: undefined,
	maxWidth: undefined,
	lineHeight: undefined,
	textMeasureValid: false,

    /**
     * @constructs
	 * @class      
     * @extends Ui.Element
     * @param {String} [config.text]
     * @param {Number} [config.fontSize]
     * @param {String} [config.fontFamily]
     * @param {String} [config.fontWeight]
     * @param {String} [config.color]
	 * @param {mixed} [config] see {@link Ui.Element} constructor for more options.  
     */ 
	constructor: function(config) {
		this.setSelectable(false);
		this.words = [];
	},

	getText: function() {
		return this.text;
	},

	setText: function(text) {
		if(this.text != text) {
			this.text = text;
			this.splitText();
			this.textMeasureValid = false;
			this.invalidateMeasure();
		}
	},

	getTextAlign: function() {
		if(this.textAlign !== undefined)
			return this.textAlign;
		else
			return this.getStyleProperty('textAlign');
	},

	setTextAlign: function(textAlign) {
		if(this.textAlign != textAlign) {
			this.textAlign = textAlign;
			this.invalidateMeasure();
		}
	},

	setFontSize: function(fontSize) {
		if(this.fontSize != fontSize) {
			this.fontSize = fontSize;
			this.textDrawing.style.fontSize = this.getFontSize()+'px';
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
		if(this.fontFamily != fontFamily) {
			this.fontFamily = fontFamily;
			this.textDrawing.style.fontFamily = this.getFontFamily();
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
		if(this.fontWeight != fontWeight) {
			this.fontWeight = fontWeight;
			this.textDrawing.style.fontWeight = this.getFontWeight();
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
		if(this.color != color) {
			this.color = Ui.Color.create(color);
			if(navigator.supportRgba)
				this.textDrawing.style.color = this.color.getCssRgba();
			else
				this.textDrawing.style.color = this.color.getCssHtml();
		}
	},

	getColor: function() {
		if(this.color !== undefined)
			return this.color;
		else
			return Ui.Color.create(this.getStyleProperty('color'));
	},

	/**#@+ 
	 * @private 
	 */

	addWord: function(word) {
		if(word.size > this.maxWidth)
			this.maxWidth = word.size;
		var newOffsetX = this.offsetX + word.size;

		if(this.line != '')
			newOffsetX += this.spaceWidth;
		if(newOffsetX > this.maxWidth)
			this.flushLine(this.offsetX);
		if(this.line != '') {
			this.line += ' ';
			this.offsetX += this.spaceWidth;
		}
		this.line += word.word;
		this.offsetX += word.size;
	},

	newLine: function() {
		this.flushLine(this.offsetX);
	},

	flushLine: function(lineWidth) {
		if(this.flowRender && (this.line != '')) {
			var tspan = document.createElement('div');
			tspan.style.whiteSpace = 'nowrap';
			tspan.style.display = 'inline';
			tspan.style.position = 'absolute';
			var align = this.getTextAlign();
			if(align == 'left')
				tspan.style.left = '0px';
			else if(align == 'right')
				tspan.style.left = (this.maxWidth - lineWidth)+'px';
			else
				tspan.style.left = ((this.maxWidth - lineWidth)/2)+'px';
			tspan.style.top = this.offsetY+'px';
			if('textContent' in tspan)
				tspan.textContent = this.line;
			else
				tspan.innerText = this.line;
			this.textDrawing.appendChild(tspan);
		}
		this.offsetX = 0;
		this.offsetY += this.lineHeight;
		this.line = '';
	},

	updateFlow: function(width, render) {
		// init flow context
		this.flowRender = render;
		this.maxWidth = width;
		this.lineHeight = this.getFontSize();
		this.offsetX = 0;
		this.offsetY = 0;
		this.line = '';
		var startPos = 0;
		var word = '';
		var i = 0;
		for(i = 0; i < this.words.length; i++) {
			var word = this.words[i];
			if(word.type == 'word')
				this.addWord(word);
			else if(word.type == 'newline')
				this.newLine();
		}
	},

	splitText: function() {
		var word = '';
		var words = [];
		for(i = 0; i < this.text.length; i++) {
			if((this.text.charAt(i) == ' ') || (this.text.charAt(i) == '\n')) {
				if(word != '') {
					words.push({ type: 'word', word: word });
					word = '';
				}
				if(this.text.charAt(i) == '\n')
					words.push({ type: 'newline' });
			}
			else
				word += this.text.charAt(i);
		}
		if(word != '')
			words.push({ type: 'word', word: word });
		words.push({ type: 'newline' });
		this.words = words;
	},

	updateMeasure: function() {
		if(!this.textMeasureValid) {
			this.spaceWidth = Ui.Label.measureText('. .', this.getFontSize(), this.getFontFamily(), this.getFontWeight()).width;
			this.spaceWidth -= Ui.Label.measureText('..', this.getFontSize(), this.getFontFamily(), this.getFontWeight()).width;
			for(var i = 0; i < this.words.length; i++) {
				var word = this.words[i];
				if(word.type == 'word')
					word.size = Ui.Label.measureText(word.word, this.getFontSize(), this.getFontFamily(), this.getFontWeight()).width;
			}
			this.textMeasureValid = true;
		}
	}

	/**#@-*/
}, 
/**@lends Ui.Text#*/
{
	onStyleChange: function() {
		this.textDrawing.style.fontSize = this.getFontSize()+'px';
		this.textDrawing.style.fontFamily = this.getFontFamily();
		this.textDrawing.style.fontWeight = this.getFontWeight();
		if(navigator.supportRgba)
			this.textDrawing.style.color = this.getColor().getCssRgba();
		else
			this.textDrawing.style.color = this.getColor().getCssHtml();
		this.textMeasureValid = false;
		this.invalidateMeasure();
	},

	render: function() {
		// create the container for all text rendering
		this.textDrawing = document.createElement('div');
		this.textDrawing.style.position = 'absolute';
		this.textDrawing.style.left = '0px';
		this.textDrawing.style.top = '0px';
		return this.textDrawing;
	},

	measureCore: function(width, height) {
		if(this.getWidth() != undefined)
			width = this.getWidth();
		this.updateMeasure();
		this.updateFlow(width, false);
		return { width: this.maxWidth, height: this.offsetY };
	},

	arrangeCore: function(width, height) {
		// trash the previous layout
		while(this.textDrawing.hasChildNodes())
			this.textDrawing.removeChild(this.textDrawing.firstChild);
		this.updateFlow(width, true);
	}
},
/**@lends Ui.Text#*/
{
	style: {
		color: new Ui.Color({ r: 0, g: 0, b: 0 }),
		fontSize: 16,
		fontFamily: 'Sans-serif',
		fontWeight: 'normal',
		textAlign: 'left'
	}
});
