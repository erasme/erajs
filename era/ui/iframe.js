Ui.Element.extend('Ui.IFrame', 
/**@lends Ui.IFrame#*/
{
	iframeDrawing: undefined,
	isReady: false,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.Element
	 */
	constructor: function(config) {
		this.connect(this.iframeDrawing, 'load', this.onIFrameLoad);
		this.addEvents('ready');
	},

	getSrc: function() {
		return this.iframeDrawing.getAttribute('src');
	},

	setSrc: function(src) {
		this.iframeDrawing.setAttribute('src', src);
	},

	getIFrame: function() {
		return this.iframeDrawing;
	},

	onIFrameLoad: function() {
		if(!this.isReady) {
			this.isReady = true;
			this.fireEvent('ready', this);
		}
	}
}, 
/**@lends Ui.IFrame#*/
{
	renderDrawing: function() {
		if(navigator.iOs) {
			var drawing = Ui.IFrame.base.renderDrawing.apply(this, arguments);
			drawing.style.overflow = 'scroll';
			drawing.style.webkitOverflowScrolling = 'touch';

			this.iframeDrawing = document.createElement('iframe');
			this.iframeDrawing.scrolling = 'no';
			this.iframeDrawing.style.border = '0px';
			this.iframeDrawing.style.margin = '0px';
			this.iframeDrawing.style.padding = '0px';
			this.iframeDrawing.style.width = '100%';
			this.iframeDrawing.style.height = '100%';
			drawing.appendChild(this.iframeDrawing);

			return drawing;
		}
		else {
			this.iframeDrawing = document.createElement('iframe');
			this.iframeDrawing.style.border = '0px';
			this.iframeDrawing.style.margin = '0px';
			this.iframeDrawing.style.padding = '0px';
			this.iframeDrawing.style.width = '100%';
			this.iframeDrawing.style.height = '100%';
			if(navigator.isIE)
				this.iframeDrawing.frameBorder = '0';
			return this.iframeDrawing;
		}
	},

	arrangeCore: function(w, h) {
		this.iframeDrawing.style.width = w+'px';
	},
	
	onVisible: function() {
		// IE < 9 dont fire resize event when display: none some where
		// when visible, reading clientWidth and clientHeight force
		// to fire the resize event
		if(navigator.isIE7 || navigator.isIE8) {
			var cWin = this.iframeDrawing.contentWindow;
			if(cWin.document.body !== undefined) {
				cWin.document.body.clientWidth;
				cWin.document.body.clientHeight;
			}
		}
	}
});

