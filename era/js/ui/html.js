
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
		this.htmlDrawing.style.setProperty('display', 'inline', null);
		if(navigator.isWebkit)
			this.htmlDrawing.style.webkitUserSelect = 'none';
		else if(navigator.isGecko)
			this.htmlDrawing.style.setProperty('-moz-user-select', 'none', null);
		else if(navigator.isIE)
			this.htmlDrawing.onselectstart = function(event) { event.preventDefault(); };
		else if(navigator.isOpera)
			this.htmlDrawing.onmousedown = function(event) { event.preventDefault(); };
		this.htmlDrawing.style.pointerEvents = 'none';
		return this.htmlDrawing;
	},

	measureCore: function(width, height) {
		if(this.measureTask == undefined) {
			this.htmlDrawing.style.setProperty('width', width+'px', null);
			this.measureTask = new Core.DelayedTask({ delay: 0, scope: this, callback: this.invalidateMeasure });
		}
		else
			this.measureTask = undefined;
		return { width: this.htmlDrawing.offsetWidth, height: this.htmlDrawing.offsetHeight };
	},

	arrangeCore: function(width, height) {
		this.htmlDrawing.style.setProperty('width', width+'px', null);
	},
});

