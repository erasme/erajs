
Ui.Html.extend('Ui.Text', {
	fontSize: undefined,
	fontFamily: undefined,
	fontWeight: undefined,
	color: undefined,
	textAlign: undefined,
	interLine: undefined,
	wordWrap: undefined,

	constructor: function(config) {
		this.getDrawing().style.whiteSpace = 'pre-line';
		this.setSelectable(false);
	},

	getTextAlign: function() {
		if(this.textAlign !== undefined)
			return this.textAlign;
		else
			return this.getStyleProperty('textAlign');
	},

	setTextAlign: function(textAlign) {
		if(this.textAlign !== textAlign) {
			this.textAlign = textAlign;
			this.getDrawing().style.textAlign = this.getTextAlign();
		}
	},

	getFontSize: function() {
		if(this.fontSize !== undefined)
			return this.fontSize;
		else
			return this.getStyleProperty('fontSize');
	},
	
	setFontSize: function(fontSize) {
		if(this.fontSize !== fontSize) {
			this.fontSize = fontSize;
			this.getDrawing().style.fontSize = this.getFontSize()+'px';
			this.invalidateMeasure();
		}
	},
	
	getFontFamily: function() {
		if(this.fontFamily !== undefined)
			return this.fontFamily;
		else
			return this.getStyleProperty('fontFamily');
	},
	
	setFontFamily: function(fontFamily) {
		if(this.fontFamily !== fontFamily) {
			this.fontFamily = fontFamily;
			this.getDrawing().style.fontFamily = this.getFontFamily();
			this.invalidateMeasure();
		}
	},
	
	getFontWeight: function() {
		if(this.fontWeight !== undefined)
			return this.fontWeight;
		else
			return this.getStyleProperty('fontWeight');
	},
	
	setFontWeight: function(fontWeight) {
		if(this.fontWeight !== fontWeight) {
			this.fontWeight = fontWeight;
			this.getDrawing().style.fontWeight = this.getFontWeight();
			this.invalidateMeasure();
		}
	},
	
	getInterLine: function() {
		if(this.interLine !== undefined)
			return this.interLine;
		else
			return this.getStyleProperty('interLine');
	},

	setInterLine: function(interLine) {
		if(this.interLine !== interLine) {
			this.interLine = interLine;
			this.getDrawing().style.lineHeight = this.getInterLine();
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
			this.wordWrap = wordWrap;
			this.getDrawing().style.wordWrap = this.getWordWrap();
			this.invalidateMeasure();
		}
	},

	getWhiteSpace: function() {
		if(this.whiteSpace !== undefined)
			return this.whiteSpace;
		else
			return this.getStyleProperty('whiteSpace');
	},

	setWhiteSpace: function(whiteSpace) {
		if(this.whiteSpace !== whiteSpace) {
			this.whiteSpace = whiteSpace;
			this.getDrawing().style.whiteSpace = this.getWhiteSpace();
			this.invalidateMeasure();
		}
	},
	
	setColor: function(color) {
		if(this.color !== color) {
			this.color = Ui.Color.create(color);
			if(navigator.supportRgba)
				this.getDrawing().style.color = this.color.getCssRgba();
			else
				this.getDrawing().style.color = this.color.getCssHtml();
		}
	},

	getColor: function() {
		if(this.color !== undefined)
			return this.color;
		else
			return Ui.Color.create(this.getStyleProperty('color'));
	}

}, {
	onStyleChange: function() {
		this.getDrawing().style.textAlign = this.getTextAlign();
		this.getDrawing().style.fontSize = this.getFontSize()+'px';
		this.getDrawing().style.fontFamily = this.getFontFamily();
		this.getDrawing().style.fontWeight = this.getFontWeight();
		if(navigator.supportRgba)
			this.getDrawing().style.color = this.getColor().getCssRgba();
		else
			this.getDrawing().style.color = this.getColor().getCssHtml();
		this.getDrawing().style.lineHeight = this.getInterLine();
		this.getDrawing().style.wordWrap = this.getWordWrap();
	}

}, {
	style: {
		color: 'black',
		fontSize: 16,
		fontFamily: 'Sans-serif',
		fontWeight: 'normal',
		textAlign: 'left',
		wordWrap: 'normal',
		whiteSpace: 'normal',
		interLine: 1
	}
});
