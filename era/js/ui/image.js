
Ui.Element.extend('Ui.Image', {
	src: undefined,
	loaddone: false,
	naturalWidth: undefined,
	naturalHeight: undefined,

	constructor: function(config) {
		if(config.src != undefined)
			this.setSrc(config.src);
		this.connect(this.imageDrawing, 'load', this.onImageLoad);
		this.addEvents('ready');
	},

	/**
	* Get the URL of the image
	*/
	getSrc: function() {
		return this.src;
	},

	/**
	* Set the URL of the image. When the image is loaded,
	* ready event is fired and getIsReady return true.
	*/
	setSrc: function(src) {
		this.loaddone = false;
		this.naturalWidth = undefined;
		this.naturalHeight = undefined;
		this.src = src;
		this.imageDrawing.setAttribute('src', src);
	},

	/**
	* Return the natural width of the image as defined
	* in the image file. Return undefined if the image is
	* not ready
	*/
	getNaturalWidth: function() {
		return this.naturalWidth;
	},

	/**
	* Return the natural height of the image as defined
	* in the image file. Return undefined if the image is
	* not ready
	*/
	getNaturalHeight: function() {
		return this.naturalHeight;
	},

	/**
	* Return true if the image is loaded
	*/
	getIsReady: function() {
		return this.loaddone;
	},

	/**#@+
	* @private
	*/

	onImageLoad: function(event) {
		this.loaddone = true;
		if((event.target != undefined) && (event.target.naturalWidth != undefined) && (event.target.naturalHeight != undefined)) {
			this.naturalWidth = event.target.naturalWidth;
			this.naturalHeight = event.target.naturalHeight;
		}
		else {
			if('removeProperty' in this.imageDrawing.style) {
				this.imageDrawing.style.removeProperty('width');
				this.imageDrawing.style.removeProperty('height');
			}
			else if('removeAttribute' in this.imageDrawing.style) {
				this.imageDrawing.style.removeAttribute('width');
				this.imageDrawing.style.removeAttribute('height');
			}
			this.naturalWidth = this.imageDrawing.width;
			this.naturalHeight = this.imageDrawing.height;
		}
		this.fireEvent('ready', this);
		this.invalidateMeasure();
	}

	/**#@-*/
}, {
	render: function() {
		this.imageDrawing = document.createElement('img');
		this.imageDrawing.style.width = '0px';
		this.imageDrawing.style.height = '0px';
		this.imageDrawing.setAttribute('draggable', false);
		if(navigator.isWebkit)
			this.imageDrawing.style.webkitUserSelect = 'none';
		else if(navigator.isGecko)
			this.imageDrawing.style.MozUserSelect = 'none';
		else if(navigator.isIE)
			this.connect(this.imageDrawing, 'selectstart', function(event) { event.preventDefault(); });
		else if(navigator.isOpera)
			this.imageDrawing.onmousedown = function(event) { event.preventDefault(); };
		return this.imageDrawing;
	},

	measureCore: function(width, height) {
		if(!this.loaddone)
			return { width: 0, height: 0 };
		var size;
		if(this.getWidth() == undefined) {
			if(this.getHeight() == undefined)
				size = { width: this.naturalWidth, height: this.naturalHeight };
			else {
				var fixedHeight = this.getHeight() - (this.getMarginTop() + this.getMarginBottom());
				size = { width: (this.naturalWidth*fixedHeight)/this.naturalHeight, height: fixedHeight };
			}
		}
		else {
			if(this.getHeight() == undefined) {
				var fixedWidth = this.getWidth() - (this.getMarginLeft() + this.getMarginRight());
				size = { width: fixedWidth, height: (this.naturalHeight*fixedWidth)/this.naturalWidth };
			}
			else
				size = { width: 0, height: 0 };
		}
		return size;
	},

	arrangeCore: function(width, height) {
		this.imageDrawing.style.width = width+'px';
		this.imageDrawing.style.height = height+'px';
	}
});
