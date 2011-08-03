Ui.Element.extend('Ui.Text', 
/**@lends Ui.Text#*/
{
	text: '',
	measureDrawing: undefined,
	textDrawing: undefined,
	// var needed to update the layout
	line: undefined,
	word: undefined,
	flowRender: false,
	offsetX: 0,
	offsetY: 0,
	spaceWidth: undefined,
	maxWidth: undefined,
	lineHeight: undefined,
	fontSize: 16,
	fontFamily: 'Sans-serif',
	fontWeight: 'normal',
	color: 'black',
	selectable: false,

    /**
     * @constructs
	 * @class      
     * @extends Ui.Element
     * @param {String} [config.text]
     * @param {Number} [config.fontSize]
     * @param {String} [config.fontFamily]
     * @param {String} [config.fontWeight]
     * @param {String} [config.color]
     * @param {Boolean} [config.selectable] Whether or not the text can be selected
	 * @param {mixed} [config] see {@link Ui.Element} constructor for more options.  
     */ 
	constructor: function(config) {
		if('text' in config)
			this.setText(config.text);
		if('fontSize' in config)
			this.setFontSize(config.fontSize);
		if('fontFamily' in config)
			this.setFamilySize(config.fontFamily);
		if('fontWeight' in config)
			this.setFontWeight(config.fontWeight);
		if('color' in config)
			this.setColor(config.color);
		if('selectable' in config)
			this.setSelectable(config.selectable);
		else
			this.setSelectable(this.selectable);
	},

	getText: function() {
		return this.text;
	},

	setText: function(text) {
		if(this.text != text) {
			this.text = text;
			this.invalidateMeasure();
		}
	},

	setFontSize: function(fontSize) {
		if(this.fontSize != fontSize) {
			this.fontSize = fontSize;
			this.textDrawing.style.fontSize = this.fontSize+'px';
			this.invalidateMeasure();
		}
	},

	getFontSize: function() {
		return this.fontSize;
	},

	setFontFamily: function(fontFamily) {
		if(this.fontFamily != fontFamily) {
			this.fontFamily = fontFamily;
			this.textDrawing.style.fontFamily = this.fontFamily;
			this.invalidateMeasure();
		}
	},

	getFontFamily: function() {
		return this.fontFamily;
	},

	setFontWeight: function(fontWeight) {
		if(this.fontWeight != fontWeight) {
			this.fontWeight = fontWeight;
			this.textDrawing.style.fontWeight = this.fontWeight;
			this.invalidateMeasure();
		}
	},

	getFontWeight: function() {
		return this.fontWeight;
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
		return this.color;
	},

	getSelectable: function() {
		return this.selectable;
	},

	setSelectable: function(selectable) {
		this.selectable = selectable;

		if(selectable) {
			this.textDrawing.style.cursor = 'text';
			if(navigator.isWebkit)
				this.textDrawing.style.removeProperty('-webkit-user-select');
			else if(navigator.isGecko)
				this.textDrawing.style.removeProperty('-moz-user-select');
			else if(navigator.isIE)
				this.disconnect(this.textDrawing, 'selectstart', this.onSelectStart);
			else if(navigator.isOpera)
				this.textDrawing.onmousedown = undefined;
		}
		else {
			this.textDrawing.style.cursor = 'inherit';
			if(navigator.isWebkit)
				this.textDrawing.style.webkitUserSelect = 'none';
			else if(navigator.isGecko)
				this.textDrawing.style.MozUserSelect = 'none';
			else if(navigator.isIE)
				this.connect(this.textDrawing, 'selectstart', this.onSelectStart);
			else if(navigator.isOpera)
				this.textDrawing.onmousedown = function(event) { event.preventDefault(); };
		}
	},

	/**#@+ 
	 * @private 
	 */

	onSelectStart: function(event) {
		event.preventDefault();
	},

	addWord: function(word) {
		var wordSize = Ui.Label.measureText(word, this.fontSize, this.fontFamily, this.fontWeight).width;

		if(wordSize > this.maxWidth)
			this.maxWidth = wordSize;
		var newOffsetX = this.offsetX + wordSize;

		if(this.line != '')
			newOffsetX += this.spaceWidth;
		if(newOffsetX > this.maxWidth)
			this.flushLine(this.offsetX);
		if(this.line != '') {
			this.line += ' ';
			this.offsetX += this.spaceWidth;
		}
		this.line += word;
		this.offsetX += wordSize;
		word = '';
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
			tspan.style.left = '0px';
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
		this.spaceWidth = undefined;
		var startPos = 0;
		var word = '';
		var i = 0;

		this.spaceWidth = Ui.Label.measureText('x', this.fontSize, this.fontFamily, this.fontWeight).width;

		for(i = 0; i < this.text.length; i++) {
			if((this.text.charAt(i) == ' ') || (this.text.charAt(i) == '\n')) {

				if(word != '') {
					this.addWord(word);
					word = '';
				}
				if(this.text.charAt(i) == '\n')
					this.newLine();
			}
			else
				word += this.text.charAt(i);
		}
		if(word != '')
			this.addWord(word);

		if(this.line != '')
			this.newLine();
	}

	/**#@-*/
}, 
/**@lends Ui.Text#*/
{
	render: function() {
		// create the container for all text rendering
		this.textDrawing = document.createElement('div');
		this.textDrawing.style.fontFamily = this.fontFamily;
		this.textDrawing.style.fontWeight = this.fontWeight;
		this.textDrawing.style.fontSize = this.fontSize+'px';
		this.textDrawing.style.color = this.color;
		this.textDrawing.style.position = 'absolute';
		this.textDrawing.style.left = '0px';
		this.textDrawing.style.top = '0px';
		return this.textDrawing;
	},

	measureCore: function(width, height) {
//		console.log(this+'.measureCore('+width+', '+height+')');

		if(this.getWidth() != undefined)
			width = this.getWidth();
		this.updateFlow(width, false);
//		console.log(this+'.measureCore('+width+', '+height+') = ('+this.maxWidth+'x'+this.offsetY+')');
		return { width: this.maxWidth, height: this.offsetY };
	},

	arrangeCore: function(width, height) {
//		console.log(this+'.arrangeCore('+width+', '+height+')');
		// trash the previous layout
		while(this.textDrawing.hasChildNodes())
			this.textDrawing.removeChild(this.textDrawing.firstChild);
		this.updateFlow(width, true);
	}
});
