
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
		this.addEvents('ready', 'error');
		// no context menu
		this.connect(this.imageDrawing, 'contextmenu', function(event) {
			event.preventDefault();
		});

		this.connect(this.imageDrawing, 'load', this.onImageLoad);
		this.connect(this.imageDrawing, 'error', this.onImageError);
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
		if(src === undefined)
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

	onImageError: function(event) {
		this.fireEvent('error', this);
	},

	onImageLoad: function(event) {
		if((event.target !== undefined) && (event.target !== null) && (event.target.naturalWidth !== undefined) && (event.target.naturalHeight !== undefined)) {
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
		this.disconnect(Ui.App.current, 'ready', this.onAppReady);
		this.onImageDelayReady();
	},
	
	onIEDragStart: function(event) {
		event.defaultPrevented = true;
		event.returnValue = false;
		return false;
	},

	onImageDelayReady: function() {	
		if(!Ui.App.current.getIsReady())
			this.connect(Ui.App.current, 'ready', this.onAppReady);
		else {
			this.loaddone = true;
			if((document.body === undefined) || (document.body === null)) {
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
	renderDrawing: function() {
		this.imageDrawing = document.createElement('img');
		this.imageDrawing.style.position = 'absolute';
		this.imageDrawing.style.top = '0px';
		this.imageDrawing.style.left = '0px';
		this.imageDrawing.style.width = '0px';
		this.imageDrawing.style.height = '0px';
		this.imageDrawing.setAttribute('draggable', false);
		if(navigator.isWebkit) {
			// no text selection
			this.imageDrawing.style.webkitUserSelect = 'none';
			// no context menu
			this.imageDrawing.style.webkitTouchCallout = 'none';
		}
		else if(navigator.isGecko)
			this.imageDrawing.style.MozUserSelect = 'none';
		else if(navigator.isIE) {
			this.connect(this.imageDrawing, 'selectstart', function(event) { event.preventDefault(); });
			// disable drag & drop for IE < 9
			if('attachEvent' in this.imageDrawing)
				this.imageDrawing.attachEvent('ondragstart', this.onIEDragStart);
		}
		return this.imageDrawing;
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
		if(this.imageDrawing !== undefined) {
			this.imageDrawing.style.width = width+'px';
			this.imageDrawing.style.height = height+'px';
		}
	}
});
