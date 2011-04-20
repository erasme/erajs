
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

	//
	// Get the URL of the image
	//
	getSrc: function() {
		return this.src;
	},

	//
	// Set the URL of the image. When the image is loaded,
	// ready event is fired and getIsReady return true.
	//
	setSrc: function(src) {
		this.loaddone = false;
		this.naturalWidth = undefined;
		this.naturalHeight = undefined;
		this.src = src;
		this.imageDrawing.setAttributeNS(null, 'src', src);
	},

	//
	// Return the natural width of the image as defined
	// in the image file. Return undefined if the image is
	// not ready
	//
	getNaturalWidth: function() {
		return this.naturalWidth;
	},

	//
	// Return the natural height of the image as defined
	// in the image file. Return undefined if the image is
	// not ready
	//
	getNaturalHeight: function() {
		return this.naturalHeight;
	},

	//
	// Return true if the image is loaded
	//
	getIsReady: function() {
		return this.loaddone;
	},

	//
	// Private
	//

	onImageLoad: function(event) {
		this.loaddone = true;
		if((event.target.naturalWidth != undefined) && (event.target.naturalHeight != undefined)) {
			this.naturalWidth = event.target.naturalWidth;
			this.naturalHeight = event.target.naturalHeight;
		}
		else {
			this.imageDrawing.style.removeProperty('width');
			this.imageDrawing.style.removeProperty('height');
			this.naturalWidth = event.target.width;
			this.naturalHeight = event.target.height;
		}
		this.fireEvent('ready', this);
		this.invalidateMeasure();
	},
}, {
	render: function() {
		this.imageDrawing = document.createElementNS(htmlNS, 'img');
		this.imageDrawing.style.width = '0px';
		this.imageDrawing.style.height = '0px';
		this.imageDrawing.setAttributeNS(null, 'draggable', false);
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
	},
});
