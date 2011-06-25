
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
		this.invalidateMeasure();
	}
}, {
	render: function() {
		this.htmlDrawing = document.createElement('div');
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
		var div = document.createElement('div');
		div.style.display = 'block';
		div.style.visibility = 'hidden';
		div.style.position = 'absolute';
		div.style.left = '0px';
		div.style.top = '0px';
		div.innerHTML = this.htmlDrawing.innerHTML;
		document.body.appendChild(div);
		var needWidth = div.clientWidth;
		var needHeight = div.clientHeight;
		document.body.removeChild(div);

		return { width: needWidth, height: needHeight };
	},


	arrangeCore: function(width, height) {
		this.htmlDrawing.style.width = width+'px';
		this.htmlDrawing.style.height = height+'px';
	}
});

