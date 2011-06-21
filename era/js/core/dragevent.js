

Core.Event.extend('Core.DragEvent', {
	dataTransfer: undefined,

	constructor: function(config) {
	},

	initDragEvent: function(type, canBubble, cancelable, view, dataTransfer, screenX, screenY, clientX, clientY, ctrlKey, altKey, shiftKey, metaKey) {
		this.type = type;
		this.bubbles = canBubble;
		this.cancelable = cancelable;
		this.view = view;
		this.dataTransfer = dataTransfer;
		this.screenX = screenX;
		this.screenY = screenY;
		this.clientX = clientX;
		this.clientY = clientY;
		this.ctrlKey = ctrlKey;
		this.altKey = altKey;
		this.shiftKey = shiftKey;
		this.metaKey = metaKey
	},
});

Core.Object.extend('Core.DragDataTransfer', {
	draggable: undefined,
	image: undefined,
	startX: 0,
	startY: 0,
	startImagePoint: undefined,
	overElement: undefined,
	hasStarted: false,

	dropEffect: 'none',
	type: undefined,
	data: undefined,
	finger: undefined,
	mouse: false,

	constructor: function(config) {
		this.draggable = config.draggable;
		this.startX = config.x;
		this.startY = config.y;
		this.data = {};
		if(config.mouse != undefined) {
			this.mouse = config.mouse;
			config.event.preventDefault();
			config.event.stopPropagation();
			this.connect(window, 'mouseup', this.onMouseUp, true);
			this.connect(window, 'mousemove', this.onMouseMove, true);
		}
		if(config.finger != undefined) {
			this.finger = config.finger;

			var dragEvent = document.createEvent('DragEvent');
			dragEvent.initDragEvent('dragstart', false, true, event.window, this, this.startX, this.startY, this.startX, this.startY, event.ctrlKey, event.altKey, event.shiftKey, event.metaKey);
			this.draggable.dispatchEvent(dragEvent);

			if(this.hasData()) {
				this.hasStarted = true;

				this.image = this.draggable.cloneNode(true);
				document.body.appendChild(this.image);

				this.startImagePoint = Ui.Element.pointToWindow(this.draggable, { x: 0, y: 0});
				this.image.style.left = this.startImagePoint.x+'px';
				this.image.style.top = this.startImagePoint.y+'px';

				event.preventDefault();
				event.stopPropagation();

				this.connect(config.event.finger, 'fingermove', this.onFingerMove);
				this.connect(config.event.finger, 'fingerup', this.onFingerUp);
			}
		}
	},

	setData: function(type, data) {
		this.data[type] = data;
	},

	getData: function(type) {
		return this.data[type];
	},

	hasData: function() {
		var check = false;
		for(var i in this.data)
			check = true;
		return check;
	},

	//
	// Private
	//
	onMouseMove: function(event) {
		var deltaX = event.clientX - this.startX;
		var deltaY = event.clientY - this.startY;

		var delta = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

		if(!this.hasStarted && (delta > 10)) {
			var dragEvent = document.createEvent('DragEvent');
			dragEvent.initDragEvent('dragstart', false, true, event.window, this, this.startX, this.startY, this.startX, this.startY, event.ctrlKey, event.altKey, event.shiftKey, event.metaKey);
			this.draggable.dispatchEvent(dragEvent);

			if(this.hasData()) {
				this.hasStarted = true;

				this.image = this.draggable.cloneNode(true);
				document.body.appendChild(this.image);

				this.startImagePoint = Ui.Element.pointToWindow(this.draggable, { x: 0, y: 0});
				this.image.style.left = this.startImagePoint.x+'px';
				this.image.style.top = this.startImagePoint.y+'px';

				event.preventDefault();
				event.stopPropagation();
			}
		}
		else if(this.hasStarted) {
			event.preventDefault();
			event.stopPropagation();

			document.body.removeChild(this.image);
			var overElement = document.elementFromPoint(event.clientX, event.clientY);
			document.body.appendChild(this.image);

			this.image.style.left = (this.startImagePoint.x + deltaX)+'px';
			this.image.style.top = (this.startImagePoint.y + deltaY)+'px';

			if(overElement != undefined) {
				var dragEvent = document.createEvent('DragEvent');
				if(this.overElement != overElement)
					dragEvent.initDragEvent('dragenter', true, true, event.window, this, event.screenX, event.screenY, event.clientX, event.clientY, event.ctrlKey, event.altKey, event.shiftKey, event.metaKey);
				else
					dragEvent.initDragEvent('dragover', true, true, event.window, this, event.screenX, event.screenY, event.clientX, event.clientY, event.ctrlKey, event.altKey, event.shiftKey, event.metaKey);
				overElement.dispatchEvent(dragEvent);
			}
			this.overElement = overElement;
		}
	},

	onMouseUp: function(event) {
		if(event.button != 0)
			return;

		if(this.hasStarted) {
			event.preventDefault();
			event.stopPropagation();

			document.body.removeChild(this.image);

			if(this.overElement != undefined) {
				var dragEvent = document.createEvent('DragEvent');
				dragEvent.initDragEvent('drop', false, true, event.window, this, event.screenX, event.screenY, event.clientX, event.clientY, event.ctrlKey, event.altKey, event.shiftKey, event.metaKey);
				this.overElement.dispatchEvent(dragEvent);
			}

			var dragEvent = document.createEvent('DragEvent');
			dragEvent.initDragEvent('dragend', false, true, event.window, this, event.screenX, event.screenY, event.clientX, event.clientY, event.ctrlKey, event.altKey, event.shiftKey, event.metaKey);
			this.draggable.dispatchEvent(dragEvent);
		}
		this.disconnect(window, 'mouseup', this.onMouseUp, true);
		this.disconnect(window, 'mousemove', this.onMouseMove, true);
	},

	onFingerMove: function(event) {
		event.preventDefault();
		event.stopPropagation();

		document.body.removeChild(this.image);
		var overElement = document.elementFromPoint(event.finger.getX(), event.finger.getY());
		document.body.appendChild(this.image);

		var deltaX = event.finger.getX() - this.startX;
		var deltaY = event.finger.getY() - this.startY;

		this.image.style.left = (this.startImagePoint.x + deltaX)+'px';
		this.image.style.top = (this.startImagePoint.y + deltaY)+'px';

		if(overElement != undefined) {
			var dragEvent = document.createEvent('DragEvent');
			if(this.overElement != overElement)
				dragEvent.initDragEvent('dragenter', true, true, event.window, this, event.finger.getX(), event.finger.getY(), event.finger.getX(), event.finger.getY(), event.ctrlKey, event.altKey, event.shiftKey, event.metaKey);
			else
				dragEvent.initDragEvent('dragover', true, true, event.window, this, event.finger.getX(), event.finger.getY(), event.finger.getX(), event.finger.getY(), event.ctrlKey, event.altKey, event.shiftKey, event.metaKey);
			overElement.dispatchEvent(dragEvent);
		}
		this.overElement = overElement;
	},

	onFingerUp: function(event) {
		event.preventDefault();
		event.stopPropagation();

		this.disconnect(event.finger, 'fingerup', this.onFingerUp);
		this.disconnect(event.finger, 'fingermove', this.onFingerMove);

		document.body.removeChild(this.image);

		if(this.overElement != undefined) {
			var dragEvent = document.createEvent('DragEvent');
			dragEvent.initDragEvent('drop', false, true, event.window, this, event.finger.getX(), event.finger.getY(), event.finger.getX(), event.finger.getY(), event.ctrlKey, event.altKey, event.shiftKey, event.metaKey);
			this.overElement.dispatchEvent(dragEvent);
		}

		var dragEvent = document.createEvent('DragEvent');
		dragEvent.initDragEvent('dragend', false, true, event.window, this, event.finger.getX(), event.finger.getY(), event.finger.getX(), event.finger.getY(), event.ctrlKey, event.altKey, event.shiftKey, event.metaKey);
		this.draggable.dispatchEvent(dragEvent);
	}
});


Core.Object.extend('Core.DragManager', {

	constructor: function(config) {
		this.connect(window, 'mousedown', this.onMouseDown);

		this.connect(window, 'load', this.onWindowLoad);

		Core.Event.registerEvent('DragEvent', Core.DragEvent);
		Core.Event.register('dragstart', Core.DragEvent);
		Core.Event.register('dragend', Core.DragEvent);
		Core.Event.register('dragenter', Core.DragEvent);
		Core.Event.register('dragover', Core.DragEvent);
		Core.Event.register('drop', Core.DragEvent);
	},

	onWindowLoad: function() {
		this.connect(document.body, 'fingerdown', this.onFingerDown);
	},

	onDragDown: function(target, x, y, event, mouse, finger) {
		var current = target;
		while((current != undefined) && ('getAttribute' in current) && !current.getAttribute('draggable'))
			current = current.parentNode;
		if((current != undefined) && ('getAttribute' in current))
			new Core.DragDataTransfer({ draggable: current, x: x, y: y, event: event, mouse: mouse, finger: finger });
	},

	onMouseDown: function(event) {
		if(event.button != 0)
			return;
		this.onDragDown(event.target, event.clientX, event.clientY, event, true, undefined);
	},

	onFingerDown: function(event) {
		this.onDragDown(event.target, event.finger.getX(), event.finger.getY(), event, false, event.finger);
	}
});

navigator.supportDrag = (('ondragstart' in window) || navigator.isGecko) &&
  !navigator.isIE && !navigator.iPad && !navigator.iPhone && !navigator.Android;

if(!navigator.supportDrag)
	new Core.DragManager();

