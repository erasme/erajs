
Ui.LBox.extend('Ui.Draggable', 
/**@lends Ui.Draggable#*/
{
	icon: undefined,
	downloadUrl: undefined,
	downloadMimetype: undefined,
	downloadFilename: undefined,
	allowedMode: 'copyMove',
	mimetype: undefined,
	data: undefined,
	lock: false,
	lastTime: undefined,
	isDown: false,
	menuTimer: undefined,
	touchStartX: undefined,
	touchStartY: undefined,
	menuPosX: undefined,
	menuPosY: undefined,
	dragDelta: undefined,
	isSelected: false,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.LBox
	 */
	constructor: function(config) {
		this.addEvents('select', 'unselect', 'dragstart', 'dragend', 'activate', 'menu');

		this.getDrawing().setAttribute('draggable', true);
		this.connect(this.getDrawing(), 'dragstart', this.onDragStart, true);
		this.connect(this.getDrawing(), 'dragend', this.onDragEnd, true);

		this.connect(this.getDrawing(), 'mousedown', this.onMouseDown);
		this.connect(this.getDrawing(), 'fingerdown', this.onFingerDown);

		if(config.downloadUrl != undefined) {
			this.setDownloadUrl(config.downloadUrl, config.downloadMimetype, config.downloadFilename);
			delete(config.downloadUrl);
			delete(config.downloadMimetype);
			delete(config.downloadFilename);
		}
	},
     
	setLock: function(lock) {
    	this.lock = lock;
		this.drawing.setAttribute('draggable', !lock && !this.getIsDisabled());
	},

	getLock: function() {
		return this.lock;
	},

	/**
	 * Set the mimetype of the data
	 */
	setMimetype: function(mimetype) {
		if(mimetype == undefined)
			this.mimetype = 'application/era-framework';
		else
			this.mimetype = mimetype;
	},

	/**
	 * Set the data that we drag & drop
	 */
	setData: function(data) {
		this.data = data;
	},

	/**
	 * Set the allowed operation. Possible values are:
	 * [copy|copyLink|copyMove|link|linkMove|move|all]
	 */
	setAllowedMode: function(allowedMode) {
		this.allowedMode = allowedMode;
	},

	/**
	 * Provide an Ui.Image that will be used when
	 * dragging the element
	 * Supported by: Firefox, Chrome and Safari on Windows
	 */
	setIcon: function(icon) {
		this.icon = icon;
	},

	/**
	 * Provide an URL to download the associated file (if any)
	 * if the element is dropped on the desktop
	 * Supported by: Chrome only
	 */
	setDownloadUrl: function(url, mimetype, filename) {
		// TODO: if url is relative, make it absolute
		var uri = new Core.Uri({ uri: url });
		this.downloadUrl = uri.toString();
		// extract the fileName if not given
		if(filename == undefined) {
			// TODO
		}
		// guess the mimetype if not given
		if(mimetype == undefined) {
			// TODO
		}
	 	this.downloadMimetype = mimetype;
		this.downloadFilename = filename;
	},

	getDragDelta: function() {
		return this.dragDelta;
	},

	/**#@+
	 * @private
	 */

	onDragStart: function(event) {
		this.dragDelta = this.pointFromWindow({ x: event.clientX, y: event.clientY });

		this.disconnect(window, 'mouseup', this.onMouseUp, true);

		event.stopPropagation();
		event.dataTransfer.effectAllowed = this.allowedMode;

		// if the element if downloadable to the destkop,
		// try to provide the link
		if(this.downloadUrl != undefined) {
			try {
				event.dataTransfer.setData('DownloadURL', this.downloadMimetype+':'+this.downloadFilename+':'+this.downloadUrl);
			} catch(e) {}
		}

		// use Text as data because it is the only thing
		// that works cross browser. Only Firefox support different mimetypes
		event.dataTransfer.setData('Text', this.mimetype+':'+this.data);

		this.fireEvent('dragstart', this);

		if(this.icon != undefined) {
			// TODO: improve this
//			console.log(this.icon.drawing.childNodes[0]);

			if(event.dataTransfer.setDragImage != undefined)
				event.dataTransfer.setDragImage(this.icon.drawing.childNodes[0], 0, 0);
		}
		return false;
	},

	onDragEnd: function(event) {
		event.stopPropagation();
		// dropEffect give the operation done: [none|copy|link|move]
		this.fireEvent('dragend', this, event.dataTransfer.dropEffect);
	},

	onMouseDown: function(event) {
		if(this.getIsDisabled() || !((event.button == 0) || (event.button == 2)))
			return;
		this.connect(window, 'mouseup', this.onMouseUp, true);
		event.stopPropagation();
		if(!navigator.supportDrag)
			new Core.DragDataTransfer({ draggable: this.getDrawing(), x: event.clientX, y: event.clientY, event: event, mouse: true });
	},

	onMouseUp: function(event) {
		this.disconnect(window, 'mouseup', this.onMouseUp, true);

		if(event.button == 0) {
			var currentTime = (new Date().getTime())/1000;
			if((this.lastTime != undefined) && (currentTime - this.lastTime < 0.250))
				this.fireEvent('activate', this);
			this.lastTime = currentTime;
			this.onSelect();
		}
		else if(event.button == 2)
			this.fireEvent('menu', this, event.clientX, event.clientY);
	},

	onFingerDown: function(event) {
		if(this.getIsDisabled() || this.isDown)
			return;

//		console.log('onFingerDown');

		this.connect(event.finger, 'fingermove', this.onFingerMove);
		this.connect(event.finger, 'fingerup', this.onFingerUp);

		event.finger.capture(this.getDrawing());

		event.preventDefault();
		event.stopPropagation();

		this.touchStartX = event.finger.getX();
		this.touchStartY = event.finger.getY();

//		this.onDown();

		if(this.menuTimer != undefined)
			this.menuTimer.abort();

		this.menuTimer = new Core.DelayedTask({	delay: 0.5, scope: this, callback: this.onMenuTimer });
		this.menuPosX = event.finger.getX();
		this.menuPosY = event.finger.getY();
	},

	onFingerMove: function(event) {
		event.preventDefault();
		event.stopPropagation();

//		console.log('onFingerMove');

		var deltaX = event.finger.getX() - this.touchStartX;
		var deltaY = event.finger.getY() - this.touchStartY;
		var delta = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

		// if the user move to much, release the touch event
		if(delta > 10) {
//			this.onUp();

			if(this.menuTimer != undefined) {
				this.menuTimer.abort();
				this.menuTimer = undefined;
			}

			this.disconnect(event.finger, 'fingermove', this.onFingerMove);
			this.disconnect(event.finger, 'fingerup', this.onFingerUp);
//			this.onUp();

			if(navigator.supportDrag) {
				this.disconnect(this.getDrawing(), 'fingerdown', this.onFingerDown);
				event.finger.release();
				this.connect(this.getDrawing(), 'fingerdown', this.onFingerDown);
			}
			else
				new Core.DragDataTransfer({ draggable: this.getDrawing(), x: event.finger.getX(), y: event.finger.getY(), event: event, finger: event.finger });

		}
	},
	
	onFingerUp: function(event) {
		event.preventDefault();
		event.stopPropagation();

//		console.log('onFingerUp');

//		this.onUp();

		this.disconnect(event.finger, 'fingermove', this.onFingerMove);
		this.disconnect(event.finger, 'fingerup', this.onFingerUp);

		if(this.menuTimer != undefined) {
			this.menuTimer.abort();
			this.menuTimer = undefined;

			var currentTime = (new Date().getTime())/1000;
//			if((this.isSelected) && (this.lastTime != undefined) && (currentTime - this.lastTime < 0.250))
			if((this.lastTime != undefined) && (currentTime - this.lastTime < 0.250))
				this.fireEvent('activate', this);
			this.lastTime = currentTime;
//			this.onSelect();
		}
	},

	/**#@-*/

	getIsSelected: function() {
		return this.isSelected;
	},

	select: function() {
		this.onSelect();
	},

	unselect: function() {
		this.onUnselect();
	},

	onSelect: function() {
		if(!this.isSelected) {
			this.isSelected = true;
			this.fireEvent('select', this);
		}
	},

	onUnselect: function() {
		if(this.isSelected) {
			this.isSelected = false;
			this.fireEvent('unselect', this);
		}
	},

	onMenuTimer: function() {
		this.fireEvent('menu', this, this.menuPosX, this.menuPosY);
		this.menuTimer = undefined;
	}

}, 
/**@lends Ui.Draggable#*/
{
	onDisable: function() {
		this.drawing.setAttribute('draggable', !this.lock && !this.getIsDisabled());
	},

	onEnable: function() {
		this.drawing.setAttribute('draggable', !this.lock && !this.getIsDisabled());
	}
});
