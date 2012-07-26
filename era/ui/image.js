
Ui.Element.extend('Ui.Image', 
/**@lends Ui.Image#*/
{
	src: undefined,
	loaddone: false,
	naturalWidth: undefined,
	naturalHeight: undefined,
	imageDrawing: undefined,
	setSrcLock: false,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.Element
	 */
	constructor: function(config) {
		this.addEvents('ready');
		this.connect(this.imageDrawing, 'load', this.onImageLoad);
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
		if(src == undefined)
			throw('Image src cant be undefined');
	
		this.setSrcLock = true;
		this.loaddone = false;
		this.naturalWidth = undefined;
		this.naturalHeight = undefined;
		this.src = src;
		this.imageDrawing.setAttribute('src', src);
		this.setSrcLock = false;
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
		if((event.target != undefined) && (event.target.naturalWidth != undefined) && (event.target.naturalHeight != undefined)) {
			this.loaddone = true;
			this.naturalWidth = event.target.naturalWidth;
			this.naturalHeight = event.target.naturalHeight;
			this.fireEvent('ready', this);
			this.invalidateMeasure();
		}
		else {
			if(this.setSrcLock)
				new Core.DelayedTask({ delay: 0, scope: this, callback: this.onImageDelayReady });
			else
				this.onImageDelayReady();
		}
	},

	onAppReady: function() {
		this.disconnect(Ui.AppUtil.current, 'ready', this.onAppReady);
		this.onImageDelayReady();
	},

	onImageDelayReady: function() {
		if(!Ui.AppUtil.current.getIsReady())
			this.connect(Ui.AppUtil.current, 'ready', this.onAppReady);
		else {
			this.loaddone = true;
			if(document.body === undefined) {
				var body = document.createElement('body');
				document.body = body;
			}
			var imgClone = document.createElement('img');
			imgClone.setAttribute('src', this.src);
			document.body.appendChild(imgClone);
			this.naturalWidth = imgClone.width;
			this.naturalHeight = imgClone.height;
			document.body.removeChild(imgClone);
			this.fireEvent('ready', this);
			this.invalidateMeasure();
		}
	}

	/**#@-*/
}, 
/**@lends Ui.Image#*/
{
	render: function() {
		/**#nocode+ Avoid Jsdoc warnings...*/
		this.imageDrawing = document.createElement('img');
		this.imageDrawing.style.position = 'absolute';
		this.imageDrawing.style.top = '0px';
		this.imageDrawing.style.left = '0px';
		this.imageDrawing.style.width = '0px';
		this.imageDrawing.style.height = '0px';
		this.imageDrawing.setAttribute('draggable', false);
		if(navigator.isWebkit)
			this.imageDrawing.style.webkitUserSelect = 'none';
		else if(navigator.isGecko)
			this.imageDrawing.style.MozUserSelect = 'none';
		else if(navigator.isIE) {
			this.connect(this.imageDrawing, 'selectstart', function(event) { event.preventDefault(); });
			// disable drag & drop for IE < 9
			if('attachEvent' in this.imageDrawing) {
				this.imageDrawing.attachEvent('ondragstart', function(event) {
					event.defaultPrevented = true;
					event.returnValue = false;
				 	return false;
				});
			}
		}
		else if(navigator.isOpera)
			this.imageDrawing.onmousedown = function(event) { event.preventDefault(); };
		return this.imageDrawing;
		/**#nocode-*/
	},

	measureCore: function(width, height) {
		if(!this.loaddone)
			return { width: 0, height: 0 };
		var size;
		if(this.getWidth() === undefined) {
			if(this.getHeight() === undefined)
				size = { width: this.naturalWidth, height: this.naturalHeight };
			else {
				var fixedHeight = this.getHeight() - (this.getMarginTop() + this.getMarginBottom());
				size = { width: (this.naturalWidth*fixedHeight)/this.naturalHeight, height: fixedHeight };
			}
		}
		else {
			if(this.getHeight() === undefined) {
				var fixedWidth = this.getWidth() - (this.getMarginLeft() + this.getMarginRight());
				size = { width: fixedWidth, height: (this.naturalHeight*fixedWidth)/this.naturalWidth };
			}
			else
				size = { width: 0, height: 0 };
		}
		return size;
	},

	arrangeCore: function(width, height) {
		if(this.imageDrawing != undefined) {
			this.imageDrawing.style.width = width+'px';
			this.imageDrawing.style.height = height+'px';
		}
	}
});
