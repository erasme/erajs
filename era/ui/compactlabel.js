Ui.Element.extend('Ui.CompactLabel', 
/**@lends Ui.CompactLabel#*/
{
	text: '',
	fontSize: undefined,
	fontFamily: undefined,
	fontWeight: undefined,
	color: undefined,
	textDrawing: undefined,
	maxLine: undefined,
	textAlign: 'left',
	isMeasureValid: false,
	isArrangeValid: false,
	lastMeasureWidth: 0,
	lastMeasureHeight: 0,
	superCompact: false,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.Element
	 */
	constructor: function(config) {
	},

	getSuperCompact: function() {
		return this.superCompact;
	},

	setSuperCompact: function(superCompact) {
		if(superCompact != this.superCompact) {
			this.superCompact = superCompact;
			this.invalidateMeasure();
		}
	},

	getMaxLine: function() {
		return this.maxLine;
	},

	setMaxLine: function(maxLine) {
		if(this.maxLine != maxLine) {
			this.maxLine = maxLine;
			this.isMeasureValid = false;
			this.invalidateMeasure();
		}
	},

	getTextAlign: function() {
		return this.textAlign;
	},

	setTextAlign: function(textAlign) {
		if(this.textAlign != textAlign) {
			this.textAlign = textAlign;
			this.isMeasureValid = false;
			this.invalidateArrange();
		}
	},

	getText: function() {
		return this.text;
	},

	setText: function(text) {
		if(this.text !== text) {
			this.text = text;
			this.isMeasureValid = false;
			this.invalidateMeasure();
		}
	},

	setFontSize: function(fontSize) {
		if(this.fontSize != fontSize) {
			this.fontSize = fontSize;
			this.isMeasureValid = false;
			this.textDrawing.style.fontSize = this.getFontSize()+'px';
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
			this.isMeasureValid = false;
			this.textDrawing.style.fontFamily = this.getFontFamily();
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
			this.isMeasureValid = false;
			this.textDrawing.style.fontWeight = this.getFontWeight();
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

	flushLine: function(y, line, width, render) {
		var size = Ui.Label.measureText(line, this.getFontSize(), this.getFontFamily(), this.getFontWeight());
		if(render) {
			var x;
			if(this.textAlign == 'left')
				x = 0;
			else if(this.textAlign == 'right')
				x = width - size.width;
			else
				x = (width - size.width) / 2;
			var tspan = document.createElement('div');
			tspan.style.whiteSpace = 'nowrap';
			tspan.style.display = 'inline';
			tspan.style.position = 'absolute';
			tspan.style.left = x+'px';
			tspan.style.top = y+'px';
			if('textContent' in tspan)
				tspan.textContent = line;
			else
				tspan.innerText = line;
			this.textDrawing.appendChild(tspan);
		}
		return size.height;
	},

	updateFlow: function(width, render) {
		if(this.text === undefined)
			return { width: 0, height: 0 };

		var fontSize = this.getFontSize();
		var fontFamily = this.getFontFamily();
		var fontWeight = this.getFontWeight();

		var dotWidth = (Ui.Label.measureText('...', fontSize, fontFamily, fontWeight)).width;
		var y = 0;
		var line = '';
		var lineCount = 0;
		var maxWidth = 0;
		for(var i = 0; i < this.text.length; i++) {
			var size = Ui.Label.measureText(line+this.text.charAt(i), fontSize, fontFamily, fontWeight);
			if((this.maxLine != undefined) && (lineCount+1 >= this.maxLine) && (size.width + dotWidth > width)) {
				y += this.flushLine(y, line+'...', width, render);
				if(x > maxWidth)
					maxWidth = x;
				return { width: maxWidth, height: y };
			}
			else if(size.width > width) {
				y += this.flushLine(y, line, width, render);
				lineCount++;
				if(x > maxWidth)
					maxWidth = x;
				line = this.text.charAt(i);
			}
			else
				line += this.text.charAt(i);
		}
		if(line != '') {
			y += this.flushLine(y, line, width, render);
			if(x > maxWidth)
				maxWidth = x;
		}
		return { width: maxWidth, height: y };
	},

	updateFlowWords: function(width, render) {
		if((this.text === undefined) || (this.text === null))
			return { width: 0, height: 0 };

		var fontSize = this.getFontSize();
		var fontFamily = this.getFontFamily();
		var fontWeight = this.getFontWeight();

		var dotWidth = (Ui.Label.measureText('...', fontSize, fontFamily, fontWeight)).width;

		var words = [];
		var wordsSize = [];

		var tmpWords = this.text.split(' ');
		for(var i = 0; i < tmpWords.length; i++) {
			var word = tmpWords[i];
			while(true) {
				var wordSize = (Ui.Label.measureText(word, fontSize, fontFamily, fontWeight)).width;
				if(wordSize < width) {
					words.push(word);
					wordsSize.push(wordSize);
					break;
				}
				else {
					// find the biggest possible word part
					var tmpWord = '';
					for(var i2 = 0; i2 < word.length; i2++) {
						if((Ui.Label.measureText(tmpWord+word.charAt(i2), fontSize, fontFamily, fontWeight)).width < width)
							tmpWord += word.charAt(i2);
						else {
							words.push(tmpWord);
							wordsSize.push((Ui.Label.measureText(tmpWord, fontSize, fontFamily, fontWeight)).width);
							word = word.substr(tmpWord.length, word.length - tmpWord.length);
							break;
						}
					}
				}
				if(word.length == 0)
					break;
			}
		}

		var spaceWidth = (Ui.Label.measureText('. .', fontSize, fontFamily, fontWeight)).width - (Ui.Label.measureText('..', fontSize, fontFamily, fontWeight)).width;

		var y = 0;
		var x = 0;
		var maxWidth = 0;
		var line = '';
		var lineCount = 0;
		for(var i = 0; i < words.length; i++) {
			if(line != '') {
				if(x + spaceWidth > width) {
					if((this.maxLine != undefined) && (lineCount+1 >= this.maxLine)) {
						var lineWidth;
						while(true) {
							lineWidth = (Ui.Label.measureText(line, fontSize, fontFamily, fontWeight)).width;
							if(lineWidth+dotWidth > width) {
								if(line.length <= 1) {
									line = '...';
									break;
								}
								line = line.substr(0, line.length-1);
							}
							else {
								line += '...';
								break;
							}
						}
						y += this.flushLine(y, line, width, render);
						if(x > maxWidth)
							maxWidth = x;
						return { width: maxWidth, height: y };
					}
					y += this.flushLine(y, line, width, render);
					if(x > maxWidth)
						maxWidth = x;
					x = 0;
					lineCount++;
					line = '';
				}
				else {
					line += ' ';
					x += spaceWidth;
				}
			}
			if(x + wordsSize[i] > width) {
				if((this.maxLine != undefined) && (lineCount+1 >= this.maxLine)) {
					var lineWidth;
					while(true) {
						lineWidth = (Ui.Label.measureText(line, fontSize, fontFamily, fontWeight)).width;
						if(lineWidth+dotWidth > width) {
							if(line.length <= 1) {
								line = '...';
								break;
							}
							line = line.substr(0, line.length-1);
						}
						else {
							line += '...';
							break;
						}
					}
					y += this.flushLine(y, line, width, render);
					if(x > maxWidth)
						maxWidth = x;
					return { width: maxWidth, height: y };
				}
				y += this.flushLine(y, line, width, render);
				lineCount++;
				if(x > maxWidth)
					maxWidth = x;
				x = wordsSize[i];
				line = words[i];
			}
			else {
				line += words[i];
				x += wordsSize[i];
			}
		}
		if(line != '') {
			y += this.flushLine(y, line, width, render);
			if(x > maxWidth)
				maxWidth = x;
		}
		return { width: maxWidth, height: y };
	}
}, 
/**@lends Ui.CompactLabel#*/
{
	render: function() {
		// create the container for all text rendering
		this.textDrawing = document.createElement('div');
		this.textDrawing.style.fontFamily = this.getFontFamily();
		this.textDrawing.style.fontWeight = this.getFontWeight();
		this.textDrawing.style.fontSize = this.getFontSize()+'px';
		if(navigator.supportRgba)
			this.textDrawing.style.color = this.getColor().getCssRgba();
		else
			this.textDrawing.style.color = this.getColor().getCssHtml();
		this.textDrawing.style.position = 'absolute';
		this.textDrawing.style.left = '0px';
		this.textDrawing.style.top = '0px';
		return this.textDrawing;
	},

	onStyleChange: function() {	
		this.textDrawing.style.fontSize = this.getFontSize()+'px';
		this.textDrawing.style.fontFamily = this.getFontFamily();
		this.textDrawing.style.fontWeight = this.getFontWeight();
		if(navigator.supportRgba)
			this.textDrawing.style.color = this.getColor().getCssRgba();
		else
			this.textDrawing.style.color = this.getColor().getCssHtml();
		this.invalidateMeasure();
	},

	measureCore: function(width, height) {	
		if(!this.isMeasureValid || (this.lastMeasureWidth != width)) {
			this.lastMeasureWidth = width;
			var size;
			if(this.superCompact)
				size = this.updateFlow(width, false);
			else
				size = this.updateFlowWords(width, false);
			this.lastMeasureHeight = size.height;
			this.lastMeasureWidth = size.width;
			this.isMeasureValid = true;
			this.isArrangeValid = false;
		}
		return { width: this.lastMeasureWidth, height: this.lastMeasureHeight };
	},

	arrangeCore: function(width, height) {
		if(!this.isArrangeValid) {
			this.isArrangeValid = true;
			while(this.textDrawing.hasChildNodes())
				this.textDrawing.removeChild(this.textDrawing.firstChild);
			if(this.superCompact)
				this.updateFlow(width, true);
			else
				this.updateFlowWords(width, true);
		}
	}
}, {
	style: {
		color: new Ui.Color({ r: 0, g: 0, b: 0 }),
		fontSize: 16,
		fontFamily: 'Sans-serif',
		fontWeight: 'normal'
	}
});

