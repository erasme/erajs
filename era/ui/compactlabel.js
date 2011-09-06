Ui.Element.extend('Ui.CompactLabel', 
/**@lends Ui.CompactLabel#*/
{
	text: '',
	fontSize: 16,
	fontFamily: 'Sans-serif',
	fontWeight: 'normal',
	color: 'black',
	textDrawing: undefined,
	maxLine: undefined,
	textAlign: 'left',
	isMeasureValid: false,
	isArrangeValid: false,
	lastMeasureWidth: 0,
	lastMeasureHeight: 0,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.Element
	 */
	constructor: function(config) {
		if('text' in config)
			this.setText(config.text);
		if('fontSize' in config)
			this.setFontSize(config.fontSize);
		if('fontFamily' in config)
			this.setFontFamily(config.fontFamily);
		if('fontWeight' in config)
			this.setFontWeight(config.fontWeight);
		if('color' in config)
			this.setColor(config.color);
		else
			this.setColor(this.color);
		if('maxLine' in config)
			this.setMaxLine(config.maxLine);
		if('textAlign' in config)
			this.setTextAlign(config.textAlign);
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
		if(this.text != text) {
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
		return this.fontSize;
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
		return this.fontFamily;
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

	flushLine: function(y, line, width, render) {
		var size = Ui.Label.measureText(line, this.fontSize, this.fontFamily, this.fontWeight);
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
		var dotWidth = (Ui.Label.measureText('...', this.fontSize, this.fontFamily, this.fontWeight)).width;
		var y = 0;
		var line = '';
		var lineCount = 0;
		for(var i = 0; i < this.text.length; i++) {
			var size = Ui.Label.measureText(line+this.text.charAt(i), this.fontSize, this.fontFamily, this.fontWeight);
			if((this.maxLine != undefined) && (lineCount+1 >= this.maxLine) && (size.width + dotWidth > width)) {
				y += this.flushLine(y, line+'...', width, render);
				return y;
			}
			else if(size.width > width) {
				y += this.flushLine(y, line, width, render);
				lineCount++;
				line = this.text.charAt(i);
			}
			else
				line += this.text.charAt(i);
		}
		if(line != '')
			y += this.flushLine(y, line, width, render);
		return y;
	}
}, 
/**@lends Ui.CompactLabel#*/
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
		if(this.getWidth() != undefined)
			width = this.getWidth();

		if(!this.isMeasureValid || (this.lastMeasureWidth != width)) {
			this.lastMeasureWidth = width;
			var flowHeight = this.updateFlow(width, false);
			this.lastMeasureHeight = flowHeight;
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
			this.updateFlow(width, true);
		}
	}
});

