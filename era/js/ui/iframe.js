
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
//			if(navigator.iPad) {
//				console.log('onIFrameLoad, setSize: '+this.getLayoutWidth()+' x '+this.getLayoutHeight());
//				this.iframeDrawing.style.width = this.getLayoutWidth()+'px';
//				this.iframeDrawing.style.height = this.getLayoutHeight()+'px';
//			}
			this.fireEvent('ready', this);
		}
	}
}, {
	render: function() {
		this.iframeDrawing = document.createElement('iframe');
		this.iframeDrawing.style.border = '0px';
		this.iframeDrawing.style.margin = '0px';
		this.iframeDrawing.style.padding = '0px';
		return this.iframeDrawing;
	},

	arrangeCore: function(width, height) {
//		console.log('iframe.arrangeCore('+width+','+height+')');

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
	}
});

