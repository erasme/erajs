Ui.LBox.extend('Ui.Draggable', 
{
	/**
	 * Fires when object start to be dragged
	 * @name Ui.Draggable#dragstart
	 * @event
	 * @param {Ui.Draggable} draggable The draggable itself
	 */
	/**
	 * Fires when object stop to be dragged
	 * @name Ui.Draggable#dragend
	 * @event
	 * @param {Ui.Draggable} draggable The draggable itself
	 * @param {string} dropEffect Give the operation done: [none|copy|link|move]
	 */

	icon: undefined,
	downloadUrl: undefined,
	downloadMimetype: undefined,
	downloadFilename: undefined,
	allowedMode: 'copyMove',
	mimetype: undefined,
	data: undefined,
	lastPress: undefined,
	isDown: false,
	isDrag: false,
	timer: undefined,
	dragDelta: undefined,
	clock: undefined,
	screenX: undefined,
	screenY: undefined,
	lock: false,

	/**
	 * @constructs
	 * @class
	 * @extends Ui.LBox
	 */
	constructor: function(config) {
		this.addEvents('dragstart', 'dragend', 'press', 'activate', 'menu');

		this.getDrawing().setAttribute('draggable', true);
		this.connect(this.getDrawing(), 'dragstart', this.onDragStart, true);
		this.connect(this.getDrawing(), 'dragend', this.onDragEnd, true);

		this.connect(this.getDrawing(), 'mousedown', this.onMouseDown);
		this.connect(this.getDrawing(), 'fingerdown', this.onFingerDown);
	},

	setLock: function(lock) {
    	this.lock = lock;
	},

	getLock: function() {
		return this.lock;
	},

	/**
	 * Set the mimetype of the data
	 */
	setMimetype: function(mimetype) {
		if(mimetype === undefined)
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
		if(filename === undefined) {
			// TODO
		}
		// guess the mimetype if not given
		if(mimetype === undefined) {
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
		if(!this.dragAllowed) {
			this.setTransform(new Ui.Matrix());
			if(this.clock != undefined) {
				this.clock.stop();
				this.clock = undefined;
			}
			if(this.timer != undefined) {
				this.timer.abort();
				this.timer = undefined;
			}
			event.stopPropagation();
			event.preventDefault();
			return;
		}

		if(this.clock != undefined) {
			this.clock.stop();
			this.clock = undefined;
			this.setTransform(new Ui.Matrix());
		}
		if(this.timer != undefined) {
			this.timer.abort();
			this.timer = undefined;
		}

		this.isDown = false;
		this.isDrag = true;
		this.dragDelta = this.pointFromWindow({ x: event.clientX, y: event.clientY });

		this.disconnect(window, 'mouseup', this.onMouseUp, true);

		event.stopPropagation();
		event.dataTransfer.effectAllowed = this.allowedMode;

		// use Text as data because it is the only thing
		// that works cross browser. Only Firefox support different mimetypes
		event.dataTransfer.setData('Text', this.mimetype+':'+this.dragDelta.x+':'+this.dragDelta.y+':'+this.data);

		this.fireEvent('dragstart', this);

		if(this.icon != undefined) {
			// TODO: improve this
			if(event.dataTransfer.setDragImage != undefined)
				event.dataTransfer.setDragImage(this.icon.drawing.childNodes[0], 0, 0);
		}
		return false;
	},

	onDragEnd: function(event) {
		this.isDrag = false;
		this.isDown = false;

		event.stopPropagation();
		// dropEffect give the operation done: [none|copy|link|move]
		this.fireEvent('dragend', this, event.dataTransfer.dropEffect);
	},

	onMouseDown: function(event) {
		if(this.lock || this.isDown || (event.button != 0))
			return;
		this.isDown = true;
		this.dragAllowed = false;
		this.setTransform(new Ui.Matrix());
		if(this.clock != undefined) {
			this.clock.stop();
			this.clock = undefined;
		}
		if(this.timer != undefined) {
			this.timer.abort();
			this.timer = undefined;
		}
		this.timer = new Core.DelayedTask({	delay: 0.25, scope: this, callback: this.onTimer });

		this.screenX = event.screenX;
		this.screenY = event.screenY;

		this.connect(window, 'mousemove', this.onMouseMove, true);
		this.connect(window, 'mouseup', this.onMouseUp, true);

		event.stopPropagation();
		if(!navigator.supportDrag && (event.button == 0))
			new Core.DragDataTransfer({ draggable: this.getDrawing(), x: event.clientX, y: event.clientY, event: event, mouse: true });
	},

	onMouseMove: function(event) {
		var deltaX = event.screenX - this.screenX;
		var deltaY = event.screenY - this.screenY;
		var delta = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

		event.preventDefault();
		event.stopPropagation();

		// if the user move to much, release the touch event
		if(delta > 10) {
			this.disconnect(window, 'mousemove', this.onMouseMove, true);
			this.disconnect(window, 'mouseup', this.onMouseUp, true);

			this.isDrag = false;
			this.isDown = false;
			this.dragAllowed = false;
			this.setTransform(new Ui.Matrix());
			if(this.clock != undefined) {
				this.clock.stop();
				this.clock = undefined;
			}
			if(this.timer != undefined) {
				this.timer.abort();
				this.timer = undefined;
			}

			var mouseDownEvent = document.createEvent('MouseEvents');
			mouseDownEvent.initMouseEvent('mousedown', true, true, window, 1, event.screenX, event.screenY,
				event.clientX, event.clientY,
				event.ctrlKey, event.altKey, event.shiftKey,
				event.metaKey, 0, event.target);
			this.getDrawing().offsetParent.dispatchEvent(mouseDownEvent);
		}
	},

	onMouseUp: function(event) {
		this.disconnect(window, 'mousemove', this.onMouseMove, true);
		this.disconnect(window, 'mouseup', this.onMouseUp, true);

		this.isDown = false;
		this.dragAllowed = false;
		this.setTransform(new Ui.Matrix());
		if(this.clock != undefined) {
			this.clock.stop();
			this.clock = undefined;
		}
		if(this.timer != undefined) {
			this.timer.abort();
			this.timer = undefined;
		}

		if(!this.isDrag) {
			this.isDrag = false;
			this.fireEvent('press', this);

			var currentTime = (new Date().getTime())/1000;
			if((this.lastPress != undefined) && ((currentTime - this.lastPress) < 0.25)) {
				this.fireEvent('activate', this);
			}
			this.lastPress = currentTime;
		}
	},

	onFingerDown: function(event) {
		if(this.lock || this.isDown)
			return;
		this.connect(event.finger, 'fingermove', this.onFingerMove);
		this.connect(event.finger, 'fingerup', this.onFingerUp);
		event.finger.capture(this.getDrawing());

		event.preventDefault();
		event.stopPropagation();

		this.screenX = event.finger.getX();
		this.screenY = event.finger.getY();

		this.isDown = true;
		this.dragAllowed = false;
		this.setTransform(new Ui.Matrix());
		if(this.clock != undefined) {
			this.clock.stop();
			this.clock = undefined;
		}
		if(this.timer != undefined) {
			this.timer.abort();
			this.timer = undefined;
		}
		this.timer = new Core.DelayedTask({	delay: 0.25, scope: this, callback: this.onTimer });
	},

	onFingerMove: function(event) {
		event.preventDefault();
		event.stopPropagation();

		var deltaX = event.finger.getX() - this.screenX;
		var deltaY = event.finger.getY() - this.screenY;
		var delta = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

		// if the user move to much, release the touch event
		if(delta > 10) {
			this.setTransform(new Ui.Matrix());
			if(this.clock != undefined) {
				this.clock.stop();
				this.clock = undefined;
			}
			if(this.timer != undefined) {
				this.timer.abort();
				this.timer = undefined;
			}

			this.disconnect(event.finger, 'fingermove', this.onFingerMove);
			this.disconnect(event.finger, 'fingerup', this.onFingerUp);

			if(this.dragAllowed) {
				if(navigator.supportDrag) {
//					this.disconnect(this.getDrawing(), 'fingerdown', this.onFingerDown);
					event.finger.release();
//					this.connect(this.getDrawing(), 'fingerdown', this.onFingerDown);
				}
				else
					new Core.DragDataTransfer({ draggable: this.getDrawing(), x: event.finger.getX(), y: event.finger.getY(), event: event, finger: event.finger });
			}
			else {
				event.finger.release();
			}
			this.dragAllowed = false;
			this.isDown = false;
		}
	},
	
	onFingerUp: function(event) {
		event.preventDefault();
		event.stopPropagation();

		this.disconnect(event.finger, 'fingermove', this.onFingerMove);
		this.disconnect(event.finger, 'fingerup', this.onFingerUp);

		this.dragAllowed = false;
		this.isDown = false;
		this.setTransform(new Ui.Matrix());
		if(this.clock != undefined) {
			this.clock.stop();
			this.clock = undefined;
		}
		if(this.timer != undefined) {
			this.timer.abort();
			this.timer = undefined;
		}

		if(!this.isDrag) {
			this.isDrag = false;
			this.fireEvent('press', this);

			var currentTime = (new Date().getTime())/1000;
			if((this.lastPress != undefined) && ((currentTime - this.lastPress) < 0.25)) {
				this.fireEvent('activate', this);
			}
			this.lastPress = currentTime;
		}
	},

	onTimer: function() {
		this.timer = undefined;

		this.dragAllowed = true;
		this.disconnect(window, 'mousemove', this.onMouseMove, true);

		this.clock = new Anim.Clock({ duration: 'forever' });
		this.connect(this.clock, 'timeupdate', this.onAnim);
		this.clock.begin();
	},

	onAnim: function(clock) {
		var progress = (clock.getGlobalTime() % 0.8) / 0.8;
		var ease = new Anim.ElasticEase({ mode: 'inout' });
		progress = ease.ease(progress);

		var scale = 1 + (progress/12);
		this.setTransform(Ui.Matrix.createScale(scale, scale));
	}
});

