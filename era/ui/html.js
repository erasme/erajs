Ui.Element.extend('Ui.Html', 
/**@lends Ui.Html#*/
{
	htmlDrawing: undefined,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.Element
	 */
	constructor: function(config) {
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

