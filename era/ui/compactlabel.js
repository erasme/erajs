Core.Object.extend('Ui.CompactLabelContext', 
{
	text: '',
	fontSize: 16,
	fontFamily: 'Sans-Serif',
	fontWeight: 'normal',
	maxLine: Number.MAX_VALUE,
	interLine: 1,
	textAlign: 'left',
	width: Number.MAX_VALUE,
	drawLine: undefined,
	whiteSpace: 'pre-line', // [pre-line|nowrap]
	wordWrap: 'normal', // [normal|break-word]
	textTransform: 'none', // [none|lowercase|uppercase]

	constructor: function(config) {
	},

	setDrawLine: function(func) {
		this.drawLine = func;
	},

	getWhiteSpace: function() {
		return this.whiteSpace;
	},

	setWhiteSpace: function(whiteSpace) {
		this.whiteSpace = whiteSpace;
	},

	getWordWrap: function() {
		return this.wordWrap;
	},

	setWordWrap: function(wordWrap) {
		this.wordWrap = wordWrap;
	},

	getMaxLine: function() {
		return this.maxLine;
	},

	setMaxLine: function(maxLine) {
		if(this.maxLine !== maxLine)
			this.maxLine = maxLine;
	},

	getTextAlign: function() {
		return this.textAlign;
	},

	setTextAlign: function(textAlign) {
		if(this.textAlign !== textAlign)
			this.textAlign = textAlign;
	},

	setInterLine: function(interLine) {
		if(this.interLine !== interLine)
			this.interLine = interLine;
	},

	getInterLine: function() {
		return this.interLine;
	},

	getText: function() {
		return this.text;
	},

	setText: function(text) {
		if(this.text !== text) {
			this.text = text;
		}
	},

	setFontSize: function(fontSize) {
		if(this.fontSize !== fontSize) {
			this.fontSize = fontSize;
		}
	},

	getFontSize: function() {
		return this.fontSize;
	},

	setFontFamily: function(fontFamily) {
		if(this.fontFamily !== fontFamily) {
			this.fontFamily = fontFamily;
		}
	},

	getFontFamily: function() {
		return this.fontFamily;
	},

	setFontWeight: function(fontWeight) {
		if(this.fontWeight !== fontWeight) {
			this.fontWeight = fontWeight;
		}
	},

	getFontWeight: function() {
		return this.fontWeight;
	},

	getTextTransform: function() {
		return this.textTransform;
	},

	setTextTransform: function(textTransform) {
		this.textTransform = textTransform;
	},

	getTransformedText: function() {
		if(this.textTransform === 'lowercase')
			return this.text.toLowerCase();
		else if(this.textTransform === 'uppercase')
			return this.text.toUpperCase();
		else
			return this.text;
	},

	flushLine: function(y, line, width, render, lastLine) {
		var size = Ui.Label.measureText(line, this.getFontSize(), this.getFontFamily(), this.getFontWeight());
		if(render) {
			var x;
			if(this.textAlign == 'left')
				x = 0;
			else if(this.textAlign == 'right')
				x = width - size.width;
			else
				x = (width - size.width) / 2;
			
			if(render)
				this.drawLine(x, y, line);
		}
		return size.height * ((lastLine === true)?1:this.getInterLine());
	},

	updateFlow: function(width, render) {
		if(this.text === undefined)
			return { width: 0, height: 0 };

		var text = this.getTransformedText();
		var fontSize = this.getFontSize();
		var fontFamily = this.getFontFamily();
		var fontWeight = this.getFontWeight();

		var dotWidth = (Ui.Label.measureText('...', fontSize, fontFamily, fontWeight)).width;
		var y = 0;
		var x = 0;
		var line = '';
		var lineCount = 0;
		var maxWidth = 0;
		for(var i = 0; i < text.length; i++) {
			var size = Ui.Label.measureText(line+text.charAt(i), fontSize, fontFamily, fontWeight);
			if((this.maxLine !== undefined) && (lineCount+1 >= this.maxLine) && (size.width + dotWidth > width)) {
				y += this.flushLine(y, line+'...', width, render);
				if(x+dotWidth > maxWidth)
					maxWidth = x+dotWidth;
				return { width: maxWidth, height: y };
			}
			else if(size.width > width) {
				y += this.flushLine(y, line, width, render);
				lineCount++;
				if(x > maxWidth)
					maxWidth = x;
				line = text.charAt(i);
			}
			else
				line += text.charAt(i);
			x = size.width;
		}
		if(line !== '') {
			y += this.flushLine(y, line, width, render, true);
			if(x > maxWidth)
				maxWidth = x;
		}
		return { width: maxWidth, height: y };
	},

	updateFlowWords: function(width, render) {
		if((this.text === undefined) || (this.text === null))
			return { width: 0, height: 0 };
		
		var i; var lineWidth;
		var text = this.getTransformedText();
		var fontSize = this.getFontSize();
		var fontFamily = this.getFontFamily();
		var fontWeight = this.getFontWeight();

		var dotWidth = (Ui.Label.measureText('...', fontSize, fontFamily, fontWeight)).width;

		var words = [];
		var wordsSize = [];

		var tmpWords = text.split(' ');
		for(i = 0; i < tmpWords.length; i++) {
			var word = tmpWords[i];
			while(true) {
				var wordSize = (Ui.Label.measureText(word, fontSize, fontFamily, fontWeight)).width;
				if(wordSize < width) {
					words.push(word);
					wordsSize.push(wordSize);
					break;
				}
				else {
					// find the biggest possible word part but a least take 1 char
					var tmpWord = '';
					for(var i2 = 0; i2 < word.length; i2++) {
						if((Ui.Label.measureText(tmpWord+word.charAt(i2), fontSize, fontFamily, fontWeight)).width < width)
							tmpWord += word.charAt(i2);
						else {
							// take a least 1 char to avoid infinite loops
							if(tmpWord === '')
								tmpWord = word.charAt(0);
							words.push(tmpWord);
							wordsSize.push((Ui.Label.measureText(tmpWord, fontSize, fontFamily, fontWeight)).width);
							word = word.substr(tmpWord.length, word.length - tmpWord.length);
							break;
						}
					}
				}
				if(word.length === 0)
					break;
			}
		}

		var spaceWidth = (Ui.Label.measureText('. .', fontSize, fontFamily, fontWeight)).width - (Ui.Label.measureText('..', fontSize, fontFamily, fontWeight)).width;

		var y = 0;
		var x = 0;
		var maxWidth = 0;
		var line = '';
		var lineCount = 0;
		for(i = 0; i < words.length; i++) {
			if(line !== '') {
				if(x + spaceWidth > width) {
					if(lineCount+1 >= this.maxLine) {
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
				if(lineCount+1 >= this.maxLine) {
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
		if(line !== '') {
			y += this.flushLine(y, line, width, render, true);
			if(x > maxWidth)
				maxWidth = x;
		}
		return { width: maxWidth, height: y };
	},

	drawText: function(width, render) {
		if(this.whiteSpace === 'nowrap') {
			var text = this.getTransformedText();
			var size = Ui.Label.measureText(text, this.fontSize, this.fontFamily, this.fontWeight);
			if(render)
				this.flushLine(0, text, width, true, true);
			return size;
		}
		else if(this.wordWrap === 'normal')
			return this.updateFlowWords(width, render);
		else
			return this.updateFlow(width, render);
	}
});

Ui.Element.extend('Ui.CompactLabel', 
/**@lends Ui.CompactLabel#*/
{
	fontSize: undefined,
	fontFamily: undefined,
	fontWeight: undefined,
	color: undefined,
	textDrawing: undefined,
	maxLine: undefined,
	interLine: undefined,
	textAlign: undefined,
	isMeasureValid: false,
	isArrangeValid: false,
	lastMeasureWidth: 0,
	lastMeasureHeight: 0,
	lastAvailableWidth: 0,
	maxLine: undefined,
	textContext: undefined,
	whiteSpace: undefined,
	wordWrap: undefined,
	textTransform: undefined,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.Element
	 */
	constructor: function(config) {
		this.setSelectable(false);
		this.textContext = new Ui.CompactLabelContext();
	},

	getMaxLine: function() {
		if(this.maxLine !== undefined)
			return this.maxLine;
		else
			return this.getStyleProperty('maxLine');
	},

	setMaxLine: function(maxLine) {
		this.maxLine = maxLine;
		this.textContext.setMaxLine(this.getMaxLine());
		this.invalidateMeasure();
	},

	getText: function() {
		return this.textContext.getText();
	},

	setText: function(text) {
		this.textContext.setText(text);
		this.isMeasureValid = false;
		this.invalidateMeasure();
	},
	
	getTextAlign: function() {
		if(this.textAlign !== undefined)
			return this.textAlign;
		else
			return this.getStyleProperty('textAlign');
	},

	setTextAlign: function(textAlign) {
		this.textAlign = textAlign;
		this.textContext.setTextAlign(this.getTextAlign());
		this.invalidateArrange();
	},

	setInterLine: function(interLine) {
		this.interLine = interLine;
		this.textContext.setInterLine(this.getInterLine());
		this.isMeasureValid = false;
		this.invalidateMeasure();
	},

	getInterLine: function() {
		if(this.interLine !== undefined)
			return this.interLine;
		else
			return this.getStyleProperty('interLine');
	},
	
	setFontSize: function(fontSize) {
		this.fontSize = fontSize;
		this.isMeasureValid = false;
		this.textContext.setFontSize(this.getFontSize());
		this.textDrawing.style.fontSize = this.getFontSize()+'px';
		this.invalidateMeasure();
	},

	getFontSize: function() {
		if(this.fontSize !== undefined)
			return this.fontSize;
		else
			return this.getStyleProperty('fontSize');
	},

	setFontFamily: function(fontFamily) {
		this.fontFamily = fontFamily;
		this.isMeasureValid = false;
		this.textContext.setFontFamily(this.getFontFamily());
		this.textDrawing.style.fontFamily = this.getFontFamily();
		this.invalidateMeasure();
	},

	getFontFamily: function() {
		if(this.fontFamily !== undefined)
			return this.fontFamily;
		else
			return this.getStyleProperty('fontFamily');
	},

	setFontWeight: function(fontWeight) {
		this.fontWeight = fontWeight;
		this.isMeasureValid = false;
		this.textContext.setFontWeight(fontWeight);
		this.textDrawing.style.fontWeight = this.getFontWeight();
		this.invalidateMeasure();
	},

	getFontWeight: function() {
		if(this.fontWeight !== undefined)
			return this.fontWeight;
		else
			return this.getStyleProperty('fontWeight');
	},

	getWhiteSpace: function() {
		if(this.whiteSpace !== undefined)
			return this.whiteSpace;
		else
			return this.getStyleProperty('whiteSpace');
	},

	setWhiteSpace: function(whiteSpace) {
		if(this.whiteSpace !== whiteSpace) {
			this.isMeasureValid = false;
			this.whiteSpace = whiteSpace;
			this.textContext.setWhiteSpace(this.getWhiteSpace());
			this.invalidateMeasure();
		}
	},

	getWordWrap: function() {
		if(this.wordWrap !== undefined)
			return this.wordWrap;
		else
			return this.getStyleProperty('wordWrap');
	},

	setWordWrap: function(wordWrap) {
		if(this.wordWrap !== wordWrap) {
			this.isMeasureValid = false;
			this.wordWrap = wordWrap;
			this.textContext.setWordWrap(this.getWordWrap());
			this.invalidateMeasure();
		}
	},

	getTextTransform: function() {
		if(this.textTransform !== undefined)
			return this.textTransform;
		else
			return this.getStyleProperty('textTransform');
	},

	setTextTransform: function(textTransform) {
		if(this.textTransform !== textTransform) {
			this.isMeasureValid = false;
			this.textTransform = textTransform;
			this.textContext.setTextTransform(this.getTextTransform());
			this.invalidateMeasure();
		}
	},

	setColor: function(color) {
		if(this.color !== color) {
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
	}
}, 
/**@lends Ui.CompactLabel#*/
{
	renderDrawing: function() {
		var drawing = Ui.CompactLabel.base.renderDrawing.apply(this, arguments);
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
		drawing.appendChild(this.textDrawing);
		return drawing;
	},

	onStyleChange: function() {	
		this.textDrawing.style.fontSize = this.getFontSize()+'px';
		this.textDrawing.style.fontFamily = this.getFontFamily();
		this.textDrawing.style.fontWeight = this.getFontWeight();
		if(navigator.supportRgba)
			this.textDrawing.style.color = this.getColor().getCssRgba();
		else
			this.textDrawing.style.color = this.getColor().getCssHtml();

		this.textContext.setMaxLine(this.getMaxLine());
		this.textContext.setTextAlign(this.getTextAlign());
		this.textContext.setFontSize(this.getFontSize());
		this.textContext.setFontFamily(this.getFontFamily());
		this.textContext.setFontWeight(this.getFontWeight());
		this.textContext.setInterLine(this.getInterLine());
		this.textContext.setWhiteSpace(this.getWhiteSpace());
		this.textContext.setWordWrap(this.getWordWrap());
		this.textContext.setTextTransform(this.getTextTransform());
		this.invalidateMeasure();
	},

	measureCore: function(width, height) {
		//console.log(this+'.measureCore('+width+','+height+') isMeasureValid: '+this.isMeasureValid+', lastMeasureWidth: '+this.lastMeasureWidth+', '+this.getText());

		if(!this.isMeasureValid || (this.lastAvailableWidth !== width)) {
			//console.log(this+'.measureCore('+width+','+height+') isMeasureValid: '+this.isMeasureValid+', lastMeasureWidth: '+this.lastMeasureWidth);
			this.lastAvailableWidth = width;
			var size = this.textContext.drawText(width, false);
			this.lastMeasureHeight = size.height;
			this.lastMeasureWidth = size.width;
			this.isMeasureValid = true;
			this.isArrangeValid = false;
		}
		//console.log(this+'.measureCore '+this.getText()+', need: '+this.lastMeasureWidth+','+this.lastMeasureHeight);
		return { width: this.lastMeasureWidth, height: this.lastMeasureHeight };
	},

	arrangeCore: function(width, height) {
		//console.log(this+'.arrangeCore('+width+','+height+') '+this.getText()+' arrangeValid: '+this.isArrangeValid);

//		if(!this.isArrangeValid) {
//			this.isArrangeValid = true;
			while(this.textDrawing.hasChildNodes())
				this.textDrawing.removeChild(this.textDrawing.firstChild);
			var textDrawing = this.textDrawing;
			this.textContext.setDrawLine(function(x, y, line) {
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
				textDrawing.appendChild(tspan);
			});
			this.textContext.drawText(width, true);
//		}
	}
}, {
	style: {
		maxLine: Number.MAX_VALUE,
		color: new Ui.Color({ r: 0, g: 0, b: 0 }),
		fontSize: 16,
		fontFamily: 'sans-serif',
		fontWeight: 'normal',
		interLine: 1,
		textAlign: 'left',
		whiteSpace: 'pre-line',
		wordWrap: 'normal',
		textTransform: 'none'
	}
});
	