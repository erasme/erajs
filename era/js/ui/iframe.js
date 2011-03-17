
Ui.Element.extend('Ui.IFrame', {
	iframeDrawing: undefined,
	isReady: false,

	constructor: function(config) {
		this.connect(this.iframeDrawing, 'load', this.onIFrameLoad);
		if(config.src != undefined)
			this.setSrc(config.src);
		this.addEvents('ready');
	},

	getSrc: function() {
		return this.iframeDrawing.getAttributeNS(null, 'src');
	},

	setSrc: function(src) {
		this.iframeDrawing.setAttributeNS(null, 'src', src);
	},

	getIFrame: function() {
		return this.iframeDrawing;
	},

	onIFrameLoad: function() {
		if(!this.isReady) {
			this.isReady = true;
			if(navigator.iPad) {
				console.log('onIFrameLoad, setSize: '+this.getLayoutWidth()+' x '+this.getLayoutHeight());
				this.iframeDrawing.style.setProperty('width', this.getLayoutWidth()+'px', null);
				this.iframeDrawing.style.setProperty('height', this.getLayoutHeight()+'px', null);
			}
			this.fireEvent('ready', this);
		}
	},

}, {
	render: function() {
		this.iframeDrawing = document.createElementNS(htmlNS, 'iframe');
		this.iframeDrawing.style.setProperty('border', '0px', null);
		return this.iframeDrawing;
	},

	arrangeCore: function(width, height) {
		// correct a bug in Chrome
		if(navigator.isChrome) {
			var matrix = this.transformFromPage();
			this.iframeDrawing.style.setProperty('width', (width*matrix.getA())+'px', null);
			this.iframeDrawing.style.setProperty('height', (height*matrix.getD())+'px', null);
		}
		else {
			this.iframeDrawing.style.setProperty('width', width+'px', null);
			this.iframeDrawing.style.setProperty('height', height+'px', null);
		}
	},
});

