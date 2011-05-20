
Ui.Element.extend('Ui.Html', {
	htmlDrawing: undefined,

	constructor: function(config) {
		if(config.html != undefined)
			this.setHtml(config.html);
	},

	getHtml: function() {
		return this.htmlDrawing.innerHTML;
	},

	setHtml: function(html) {
		this.htmlDrawing.innerHTML = html;
	},

}, {
	render: function() {
		this.htmlDrawing = document.createElementNS(htmlNS, 'div');
		this.htmlDrawing.style.display = 'block';
		if(navigator.isWebkit)
			this.htmlDrawing.style.webkitUserSelect = 'none';
		else if(navigator.isGecko)
			this.htmlDrawing.style.MozUserSelect = 'none';
		else if(navigator.isIE)
			this.htmlDrawing.onselectstart = function(event) { event.preventDefault(); };
		else if(navigator.isOpera)
			this.htmlDrawing.onmousedown = function(event) { event.preventDefault(); };
		this.htmlDrawing.style.pointerEvents = 'none';
		return this.htmlDrawing;
	},

	measureCore: function(width, height) {
		return { width: this.htmlDrawing.clientWidth, height: this.htmlDrawing.clientHeight };
	},


	arrangeCore: function(width, height) {
		this.htmlDrawing.style.width = width+'px';
		this.htmlDrawing.style.height = height+'px';
	},
});

