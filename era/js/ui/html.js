
Ui.Element.extend('Ui.Html', {
	htmlDrawing: undefined,
	selectable: false,

	constructor: function(config) {
		if('html' in config)
			this.setHtml(config.html);
		if('selectable' in config)
			this.setSelectable(config.selectable);
		else
			this.setSelectable(this.selectable);
	},

	getHtml: function() {
		return this.htmlDrawing.innerHTML;
	},

	setHtml: function(html) {
		this.htmlDrawing.innerHTML = html;
		this.invalidateMeasure();
	},

	getSelectable: function() {
		return this.selectable;
	},

	setSelectable: function(selectable) {
		this.selectable = selectable;

		if(selectable) {
			if(navigator.isWebkit)
				this.htmlDrawing.style.removeProperty('-webkit-user-select');
			else if(navigator.isGecko)
				this.htmlDrawing.style.removeProperty('-moz-user-select');
			else if(navigator.isIE)
				this.disconnect(this.htmlDrawing, 'selectstart', this.onSelectStart);
			else if(navigator.isOpera)
				this.htmlDrawing.onmousedown = undefined;
			if('removeProperty' in this.htmlDrawing)
				this.htmlDrawing.style.removeProperty('pointerEvents');
			else
				this.htmlDrawing.style.pointerEvents = '';
		}
		else {
			if(navigator.isWebkit)
				this.htmlDrawing.style.webkitUserSelect = 'none';
			else if(navigator.isGecko)
				this.htmlDrawing.style.MozUserSelect = 'none';
			else if(navigator.isIE)
				this.connect(this.htmlDrawing, 'selectstart', this.onSelectStart);
			else if(navigator.isOpera)
				this.htmlDrawing.onmousedown = function(event) { event.preventDefault(); };
			this.htmlDrawing.style.pointerEvents = 'none';
		}
	},

	onSelectStart: function(event) {
		event.preventDefault();
	}

}, {
	render: function() {
		this.htmlDrawing = document.createElement('div');
		this.htmlDrawing.style.display = 'block';
		this.htmlDrawing.style.position = 'absolute';
		this.htmlDrawing.style.left = '0px';
		this.htmlDrawing.style.top = '0px';
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

