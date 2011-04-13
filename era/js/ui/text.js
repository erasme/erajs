
Ui.SVGElement.extend('Ui.Text', {
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

	constructor: function(config) {
		if(config.text != undefined)
			this.setText(config.text);
		if(config.fontSize != undefined)
			this.setFontSize(config.fontSize);
		if(config.fontFamily != undefined)
			this.setFamilySize(config.fontFamily);
		if(config.fontWeight != undefined)
			this.setFontWeight(config.fontWeight);
		if(config.color != undefined)
			this.setColor(config.color);
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
		if(this.fontSize != fontSize) {
			this.fontSize = fontSize;
			this.invalidateRender();
			this.invalidateMeasure();
		}
	},

	getFontSize: function() {
		return this.fontSize;
	},

	setFontFamily: function(fontFamily) {
		if(this.fontFamily != fontFamily) {
			this.fontFamily = fontFamily;
			this.invalidateRender();
			this.invalidateMeasure();
		}
	},

	getFontFamily: function() {
		return this.fontFamily;
	},

	setFontWeight: function(fontWeight) {
		if(this.fontWeight != fontWeight) {
			this.fontWeight = fontWeight;
			this.invalidateRender();
			this.invalidateMeasure();
		}
	},

	getFontWeight: function() {
		return this.fontWeight;
	},

	setColor: function(color) {
		if(this.color != color) {
			this.color = color;
			this.invalidateRender();
		}
	},

	getColor: function() {
		return this.color;
	},

	//
	// Private
	//

	addWord: function(word) {
		var wordSize = this.measureText(word);
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
			var tspan = document.createElementNS(svgNS, 'tspan');
			tspan.setAttributeNS(null, 'x', 0);
			tspan.setAttributeNS(null, 'y', this.offsetY);
//			tspan.setAttributeNS(null, 'textLength', lineWidth);
//			tspan.setAttributeNS(null, 'lengthAdjust', 'spacing');
			tspan.textContent = this.line;
			this.textDrawing.appendChild(tspan);
		}
		this.offsetX = 0;
		this.offsetY += this.lineHeight;
		this.line = '';
	},

	measureText: function(text) {
		this.measureDrawing.textContent = text;
		var width;
		if(navigator.isGecko) {
			var bbox = this.measureDrawing.getBBox();
			width = bbox.width;
		}
		else {
			try {
				width = this.measureDrawing.getComputedTextLength();
			} catch(err) {
				var bbox = this.measureDrawing.getBBox();
				width = bbox.width;
			}
		}
		return width;
	},

	updateFlow: function(width, render) {
		// init flow context
		this.flowRender = render;
		this.maxWidth = width;
		this.lineHeight = this.getFontSize();
		this.offsetX = 0;
		this.offsetY = this.lineHeight;
		this.line = '';
		this.spaceWidth = undefined;
		var startPos = 0;
		var word = '';
		var i = 0;

		this.spaceWidth = this.measureText('x');

		for(i = 0; i < this.text.length; i++) {
			if((this.text[i] == ' ') || (this.text[i] == '\n')) {

				if(word != '') {
					this.addWord(word);
					word = '';
				}
				if(this.text[i] == '\n')
					this.newLine();
			}
			else
				word += this.text[i];
		}
		if(word != '')
			this.addWord(word);

		if(this.line != '') {
			this.lineHeight *= 0.33;
			this.newLine();
		}
	},

}, {
	render: function() {
		var group = document.createElementNS(svgNS, 'g');
		// create an hidden text to measure things
		this.measureDrawing = document.createElementNS(svgNS, 'text');
		this.measureDrawing.setAttributeNS(null, 'visibility', 'hidden');
		group.appendChild(this.measureDrawing);
		// create the container for all text rendering
		this.textDrawing = document.createElementNS(svgNS, 'text');
		if(navigator.isWebkit)
			this.textDrawing.style.webkitUserSelect = 'none';
		else if(navigator.isGecko)
			this.textDrawing.style.setProperty('-moz-user-select', 'none', null);
		else if(navigator.isIE)
			this.textDrawing.onselectstart = function(event) { event.preventDefault(); };
		else if(navigator.isOpera)
			this.textDrawing.onmousedown = function(event) { event.preventDefault(); };
		this.textDrawing.style.pointerEvents = 'none';
		group.appendChild(this.textDrawing);
		return group;
	},

	measureCore: function(width, height, force) {
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
	},

	updateRenderCore: function() {
//		console.log('updateRenderCore');
		this.textDrawing.setAttributeNS(null, 'font-family', this.getFontFamily());
		this.textDrawing.setAttributeNS(null, 'font-weight', this.getFontWeight());
		this.textDrawing.setAttributeNS(null, 'font-size', this.getFontSize());
		this.textDrawing.setAttributeNS(null, 'fill', this.getColor(), null);

		this.measureDrawing.setAttributeNS(null, 'font-family', this.getFontFamily());
		this.measureDrawing.setAttributeNS(null, 'font-weight', this.getFontWeight());
		this.measureDrawing.setAttributeNS(null, 'font-size', this.getFontSize());
	},
});
