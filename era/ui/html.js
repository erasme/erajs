
Ui.Element.extend('Ui.Html', 
/**@lends Ui.Html#*/
{
	htmlDrawing: undefined,
	bindedOnImageLoad: undefined,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.Element
	 */
	constructor: function(config) {
		this.addEvents('link');

		this.bindedOnImageLoad = this.onImageLoad.bind(this);
		this.connect(this.getDrawing(), 'click', this.onClick);
		this.connect(this.getDrawing(), 'DOMSubtreeModified', this.onSubtreeModified);
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
		if('textContent' in this.htmlDrawing)
			this.htmlDrawing.textContent = text;
		else
			this.htmlDrawing.innerText = text;
		this.invalidateMeasure();
	},
	
	getText: function() {
		if('textContent' in this.htmlDrawing)
			return this.htmlDrawing.textContent;
		else
			return this.htmlDrawing.innerText;
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
		}
	}

}, {
	renderDrawing: function() {
		var drawing = Ui.Html.base.renderDrawing.apply(this, arguments);
		this.htmlDrawing = document.createElement('div');
		drawing.appendChild(this.htmlDrawing);
		return drawing;
	},

	measureCore: function(width, height) {
		this.htmlDrawing.style.width = ((this.getWidth() !== undefined)?Math.max(width,this.getWidth()):width)+'px';
		if(this.htmlDrawing.scrollWidth > this.htmlDrawing.clientWidth)
			this.htmlDrawing.style.width =  this.htmlDrawing.scrollWidth+'px';
		return { width: this.htmlDrawing.clientWidth, height: this.htmlDrawing.clientHeight };
	},

	arrangeCore: function(width, height) {
		this.htmlDrawing.style.width = width+'px';
	}
});
	