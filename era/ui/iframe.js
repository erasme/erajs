
Ui.Element.extend('Ui.IFrame', {
	iframeDrawing: undefined,
	isReady: false,

	constructor: function(config) {
		this.connect(this.iframeDrawing, 'load', this.onIFrameLoad);
		this.addEvents('ready');
		this.autoConfig(config, 'src');
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
}, {
	render: function() {
		this.iframeDrawing = document.createElement('iframe');
		this.iframeDrawing.style.position = 'absolute';
		this.iframeDrawing.style.border = '0px';
		this.iframeDrawing.style.margin = '0px';
		this.iframeDrawing.style.padding = '0px';
		this.iframeDrawing.style.left = '0px';
		this.iframeDrawing.style.top = '0px';
		if(navigator.isIE)
			this.iframeDrawing.frameBorder = '0';
		return this.iframeDrawing;
	},

	arrangeCore: function(width, height) {
//		console.log('iframe.arrangeCore('+width+','+height+') '+this.iframeDrawing.getAttribute('src'));
		var tmpWidth = width;
		var tmpHeight = height;
		// correct a bug in Chrome
		if(navigator.isChrome) {
			var matrix = this.transformFromWindow();
			tmpWidth = (width*matrix.getA());
			tmpHeight = (height*matrix.getD());
		}
		// correct a bug in Safari iOS if possible
		try {
			this.iframeDrawing.contentWindow.innerWidth = tmpWidth;
			this.iframeDrawing.contentWindow.innerHeight = tmpHeight;
		} catch(e) {}
		this.iframeDrawing.style.width = tmpWidth+'px';
		this.iframeDrawing.style.height = tmpHeight+'px';
	},

	onVisible: function() {
		// IE < 9 dont fire resize event when display: none some where
		// when visible, reading clientWidth and clientHeight force
		// to fire the resize event
		if(navigator.isIE7 || navigator.isIE8) {
			var cWin = this.iframeDrawing.contentWindow;
			if(cWin.document.body != undefined) {
				cWin.document.body.clientWidth;
				cWin.document.body.clientHeight;
			}
		}
	}
});

