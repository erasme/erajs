
Ui.Element.extend('Ui.Html', 
/**@lends Ui.Html#*/
{
	htmlDrawing: undefined,
	bindedOnImageLoad: undefined,
	fontSize: undefined,
	fontFamily: undefined,
	fontWeight: undefined,
	color: undefined,
	textAlign: undefined,
	interLine: undefined,
	wordWrap: undefined,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.Element
	 */
	constructor: function(config) {
		this.addEvents('link');

		this.bindedOnImageLoad = this.onImageLoad.bind(this);
		this.connect(this.getDrawing(), 'click', this.onClick);
//		this.connect(this.getDrawing(), 'DOMSubtreeModified', this.onSubtreeModified);
		this.connect(this.getDrawing(), 'keypress', this.onKeyPress);
	},

	getHtml: function() {
		return this.htmlDrawing.innerHTML;
	},
	
	getElements: function(tagName) {
		var res = [];
		this.searchElements(tagName.toUpperCase(), this.htmlDrawing, res);
		return res;
	},
	
	searchElements: function(tagName, element, res) {
		for(var i = 0; i < element.childNodes.length; i++) {
			var child = element.childNodes[i];
			if(('tagName' in child) && (child.tagName.toUpperCase() == tagName))
				res.push(child);
			this.searchElements(tagName, child, res);
		}
	},
	
	getParentElement: function(tagName, element) {
		do {
			if(('tagName' in element) && (element.tagName.toUpperCase() == tagName))
				return element;
			if((element.parentNode === undefined) || (element.parentNode === null))
				return undefined;
			if(element.parentNode === this.getDrawing())
				return undefined;
			element = element.parentNode;
		} while(true);
	},

	setHtml: function(html) {
		// update HTML content
		this.htmlDrawing.innerHTML = html;
		// watch for load events
		var tab = this.getElements('IMG');
		for(var i = 0; i < tab.length; i++)
			tab[i].onload = this.bindedOnImageLoad;
		this.invalidateMeasure();
	},
	
	setText: function(text) {
		if('innerText' in this.htmlDrawing)
			this.htmlDrawing.innerText = text;
		else {
			// convert text to HTML to support newline like innerText
			var div = document.createElement('div');
			var content;
			div.textContent = text;
			content = div.textContent;
			var lines = content.split('\n');
			var content2 = '';
			for(var i = 0; i < lines.length; i++) {
				if(lines[i] !== '') {
					if(content2 !== '')
						content2 += "<br>";
					content2 += lines[i];
				}
			}
			this.setHtml(content2);
		}
		this.invalidateMeasure();
	},

	getTextContent: function(el) {
		var text = '';		
		if(el.nodeType === 3)
			text += el.textContent;
		else if((el.nodeType === 1) && ((el.nodeName == "BR") || (el.nodeName == "P")))
			text += '\n';
		if('childNodes' in el) {
			for(var i = 0; i < el.childNodes.length; i++)
				text += this.getTextContent(el.childNodes[i]);
		}
		return text;
	},
	
	getText: function() {
		if('innerText' in this.htmlDrawing)
			return this.htmlDrawing.innerText;
		else
			return this.getTextContent(this.htmlDrawing);
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
	},

	onSubtreeModified: function(event) {
		this.invalidateMeasure();
	},

	onKeyPress: function(event) {
		this.invalidateMeasure();
	},

	onImageLoad: function(event) {
		this.invalidateMeasure();
	},

	onClick: function(event) {
		var target = this.getParentElement('A', event.target);
		if(target !== undefined) {
			event.preventDefault();
			event.stopPropagation();
			this.fireEvent('link', this, target.href);
		}
	}

}, {
	onVisible: function() {
		// HTML size might change when really visible in the DOM
		this.invalidateMeasure();
	},

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
	},

	renderDrawing: function() {
		var drawing = Ui.Html.base.renderDrawing.apply(this, arguments);
		this.htmlDrawing = document.createElement('div');
		this.htmlDrawing.style.outline = 'none';
		this.htmlDrawing.style.padding = '0px';
		this.htmlDrawing.style.margin = '0px';
		this.htmlDrawing.style.display = 'inline-block';
		this.htmlDrawing.style.width = '';
		drawing.appendChild(this.htmlDrawing);
		return drawing;
	},

	measureCore: function(width, height) {
		width = (this.getWidth() !== undefined)?Math.max(width,this.getWidth()):width;

		this.getDrawing().style.width = width+'px';
		//console.log(this+'.measureCore('+width+','+height+') clientWidth: '+this.htmlDrawing.clientWidth+' '+this.drawing.innerHTML);
		this.htmlDrawing.style.width = '';
		this.htmlDrawing.style.height = '';
		// if client width if bigger than the constraint width, set the htmlDrawing
		// width and test again. This will allow (for ex) word wrap to try to reduce the width
		if(this.htmlDrawing.clientWidth > width) {
//			this.htmlDrawing.style.width = '100%';
			this.htmlDrawing.style.width = width+'px';
		}
		//console.log(this+'.measureCore('+width+','+height+') client: '+
		//	this.htmlDrawing.clientWidth+','+this.htmlDrawing.clientHeight+
		//	' scroll: '+this.htmlDrawing.scrollWidth+','+this.htmlDrawing.scrollHeight
		//	);
		return {
			width: Math.max(this.htmlDrawing.clientWidth, this.htmlDrawing.scrollWidth),
			height: this.htmlDrawing.clientHeight
		};
	},

	arrangeCore: function(width, height) {
//		console.log(this+'.arrangeCore('+width+','+height+')');
//		this.htmlDrawing.style.width = width+'px';// '100%';
		this.htmlDrawing.style.width = width+'px';
		this.htmlDrawing.style.height = height+'px';
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
	