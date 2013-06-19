Core.Event.extend('Core.DragEvent', 
/**@lends Core.DragEvent#*/
{
	dataTransfer: undefined,
	/**
    *   @constructs
	*	@class
    *   @extends Core.Event
	*/
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
	}
});

Core.Object.extend('Core.DragDataTransfer', 
/**@lends Core.DragDataTransfer#*/
{
	draggable: undefined,
	image: undefined,
	startX: 0,
	startY: 0,
	startImagePoint: undefined,
	overElement: undefined,
	hasStarted: false,
	rootWindow: undefined,
	types: undefined,

	dropEffect: 'none',
	type: undefined,
	data: undefined,
	finger: undefined,
	mouse: false,
	
	local: false,

	/**
    *   @constructs
	*	@class
    *   @extends Core.Object
	*/
	constructor: function(config) {	
		this.draggable = config.draggable;
		delete(config.draggable);
		this.startX = config.x;
		this.startY = config.y;
		delete(config.x);
		delete(config.y);
		
		if('local' in config) {
			this.local = config.local;
			delete(config.local);
		}
		
		this.data = {};
		if(config.mouse != undefined) {
			this.mouse = config.mouse;
			delete(config.mouse);
			config.event.preventDefault();
			config.event.stopPropagation();
			delete(config.event);
			this.rootWindow = window;
			this.connect(window, 'mouseup', this.onMouseUp, true);
			this.connect(window, 'mousemove', this.onMouseMove, true);
		}
		if(config.finger != undefined) {
			this.finger = config.finger;
			delete(config.finger);

			var dragEvent = document.createEvent('DragEvent');
			dragEvent.initDragEvent((this.local?'local':'')+'dragstart', false, true, config.event.window, this, this.startX, this.startY, this.startX, this.startY, config.event.ctrlKey, config.event.altKey, config.event.shiftKey, config.event.metaKey);
			this.draggable.dispatchEvent(dragEvent);

			if(this.hasData()) {
				this.hasStarted = true;

				this.image = this.generateImage(this.draggable);
				this.image.style.zIndex = 100000;
											
				document.body.appendChild(this.image);

				this.startImagePoint = Ui.Element.pointToWindow(this.draggable, { x: 0, y: 0});
				this.image.style.left = this.startImagePoint.x+'px';
				this.image.style.top = this.startImagePoint.y+'px';

				config.event.preventDefault();
				config.event.stopPropagation();

				this.connect(config.event.finger, 'fingermove', this.onFingerMove);
				this.connect(config.event.finger, 'fingerup', this.onFingerUp);
			}
			delete(config.event);
		}
	},

	setData: function(type, data) {
		this.data[type] = data;
		this.updateTypes();
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

	/**#@+
	* @private
	*/
	generateImage: function(element) {
		var res;
		if(navigator.isIE7 || navigator.isIE8) {
			var div = document.createElement('div');
			div.style.position = 'absolute';
			div.style.left = '-10000px';
			div.style.top = '-10000px';
			div.style.outline = '0px';
			div.innerHTML = element.outerHTML;
			res = div.childNodes[0];
		}
		else {
			if(('tagName' in element) && (element.tagName.toUpperCase() == 'CANVAS')) {
				res = document.createElement('img');
				// copy styles (position)
				for(var key in element.style)
					res.style[key] = element.style[key];
				res.setAttribute('src', element.toDataURL('image/png'));
			}
			else {
				res = element.cloneNode(false);
				for(var i = 0; i < element.childNodes.length; i++) {
					var child = element.childNodes[i];
					res.appendChild(this.generateImage(child));
				}
			}
		}
		return res;
	},
		
	updateTypes: function() {
		this.types = [];
		for(var type in this.data)
			this.types.push(type);
	},
	
	onMouseMove: function(event) {
		var deltaX = event.clientX - this.startX;
		var deltaY = event.clientY - this.startY;

		var delta = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

		if(!this.hasStarted && (delta > 10)) {
			var dragEvent = document.createEvent('DragEvent');
			dragEvent.initDragEvent((this.local?'local':'')+'dragstart', false, true, event.window, this, this.startX, this.startY, this.startX, this.startY, event.ctrlKey, event.altKey, event.shiftKey, event.metaKey);
			this.draggable.dispatchEvent(dragEvent);

			if(this.hasData()) {
				this.hasStarted = true;

//				this.rootWindow = window;
//				while(this.rootWindow.parent != this.rootWindow) {
//					console.log('step');
//					this.rootWindow = this.rootWindow.parent;
//				}

				this.rootWindow = window;
//				var iframe = Ui.App.getWindowIFrame();
//				console.log(iframe.ownerDocument.defaultView);

				var matrix = Ui.Element.transformToWindow(this.draggable);

//				var iframe;
//				while((iframe = Ui.App.getWindowIFrame(this.rootWindow)) != undefined) {
//					this.rootWindow = iframe.ownerDocument.defaultView;
//					matrix.multiply(Ui.Element.transformToWindow(iframe));
//				}
				this.image = this.generateImage(this.draggable);
				this.image.style.zIndex = 100000;
//				if(navigator.isIE7 || navigator.isIE8)
//					this.image.innerHTML = this.draggable.innerHTML;

//				document.body.appendChild(this.image);
				this.rootWindow.document.body.appendChild(this.image);

				this.startImagePoint = new Ui.Point({ x: 0, y: 0 });
				this.startImagePoint.matrixTransform(matrix);

//				this.startImagePoint = Ui.Element.pointToWindow(this.draggable, { x: 0, y: 0});
				this.image.style.left = this.startImagePoint.x+'px';
				this.image.style.top = this.startImagePoint.y+'px';

				event.preventDefault();
				event.stopPropagation();

				if(this.rootWindow != window) {
					this.disconnect(window, 'mouseup', this.onMouseUp, true);
					this.disconnect(window, 'mousemove', this.onMouseMove, true);

					this.catcher = document.createElement('div');
					this.catcher.style.position = 'absolute';
					this.catcher.style.left = '0px';
					this.catcher.style.right = '0px';
					this.catcher.style.top = '0px';
					this.catcher.style.bottom = '0px';
					this.catcher.zIndex = 1000;
					this.rootWindow.document.body.appendChild(this.catcher);

					this.connect(this.rootWindow, 'mouseup', this.onMouseUp, true);
					this.connect(this.rootWindow, 'mousemove', this.onMouseMove, true);
				}
			}
		}
		else if(this.hasStarted) {
			event.preventDefault();
			event.stopPropagation();

			this.rootWindow.document.body.removeChild(this.image);
			var overElement = this.rootWindow.document.elementFromPoint(event.clientX, event.clientY);
			this.rootWindow.document.body.appendChild(this.image);

			// if SVG, find the first HTML element to avoid
			// SVG browser bugs. Also avoid VML canvas elements
			while((overElement != undefined) && ('parentNode' in overElement) &&
				  (('ownerSVGElement' in overElement) || !('dispatchEvent' in overElement))) {
				overElement = overElement.parentNode;
			}

			//console.log('dragover: '+overElement+' ('+event.clientX+','+event.clientY+')');

			this.image.style.left = (this.startImagePoint.x + deltaX)+'px';
			this.image.style.top = (this.startImagePoint.y + deltaY)+'px';

			if((overElement != undefined) && ('dispatchEvent' in overElement)) {
				var dragEvent = document.createEvent('DragEvent');
				if(this.overElement != overElement)
					dragEvent.initDragEvent((this.local?'local':'')+'dragenter', true, true, event.window, this, event.screenX, event.screenY, event.clientX, event.clientY, event.ctrlKey, event.altKey, event.shiftKey, event.metaKey);
				else
					dragEvent.initDragEvent((this.local?'local':'')+'dragover', true, true, event.window, this, event.screenX, event.screenY, event.clientX, event.clientY, event.ctrlKey, event.altKey, event.shiftKey, event.metaKey);
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

			if(this.rootWindow != window)
				this.rootWindow.document.body.removeChild(this.catcher);

			this.rootWindow.document.body.removeChild(this.image);
//			document.body.removeChild(this.image);

			if((this.overElement != undefined) && ('dispatchEvent' in this.overElement)) {
//				console.log('drag mouseup over: '+this.overElement.className);
				var dragEvent = document.createEvent('DragEvent');
				dragEvent.initDragEvent((this.local?'local':'')+'drop', true, true, event.window, this, event.screenX, event.screenY, event.clientX, event.clientY, event.ctrlKey, event.altKey, event.shiftKey, event.metaKey);
				this.overElement.dispatchEvent(dragEvent);
			}

			var dragEvent = document.createEvent('DragEvent');
			dragEvent.initDragEvent((this.local?'local':'')+'dragend', false, true, event.window, this, event.screenX, event.screenY, event.clientX, event.clientY, event.ctrlKey, event.altKey, event.shiftKey, event.metaKey);
			this.draggable.dispatchEvent(dragEvent);
		}
		this.disconnect(this.rootWindow, 'mouseup', this.onMouseUp, true);
		this.disconnect(this.rootWindow, 'mousemove', this.onMouseMove, true);
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
				dragEvent.initDragEvent((this.local?'local':'')+'dragenter', true, true, event.window, this, event.finger.getX(), event.finger.getY(), event.finger.getX(), event.finger.getY(), event.ctrlKey, event.altKey, event.shiftKey, event.metaKey);
			else
				dragEvent.initDragEvent((this.local?'local':'')+'dragover', true, true, event.window, this, event.finger.getX(), event.finger.getY(), event.finger.getX(), event.finger.getY(), event.ctrlKey, event.altKey, event.shiftKey, event.metaKey);
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
			dragEvent.initDragEvent((this.local?'local':'')+'drop', true, true, event.window, this, event.finger.getX(), event.finger.getY(), event.finger.getX(), event.finger.getY(), event.ctrlKey, event.altKey, event.shiftKey, event.metaKey);
			this.overElement.dispatchEvent(dragEvent);
		}

		var dragEvent = document.createEvent('DragEvent');
		dragEvent.initDragEvent((this.local?'local':'')+'dragend', false, true, event.window, this, event.finger.getX(), event.finger.getY(), event.finger.getX(), event.finger.getY(), event.ctrlKey, event.altKey, event.shiftKey, event.metaKey);
		this.draggable.dispatchEvent(dragEvent);
	}
	/**#@-*/
});


Core.Object.extend('Core.DragManager', 
/**@lends Core.DragManager#*/
{

	/**
    *   @constructs
	*	@class
    *   @extends Core.Object
	*/	
	constructor: function(config) {
		Core.Event.registerEvent('DragEvent', Core.DragEvent);
		Core.Event.register('dragstart', Core.DragEvent);
		Core.Event.register('dragend', Core.DragEvent);
		Core.Event.register('dragenter', Core.DragEvent);
		Core.Event.register('dragover', Core.DragEvent);
		Core.Event.register('drop', Core.DragEvent);
	}
});

Core.Object.extend('Core.LocalDragManager', 
/**@lends Core.LocalDragManager#*/
{

	/**
    *   @constructs
	*	@class
    *   @extends Core.Object
	*/	
	constructor: function(config) {
		Core.Event.registerEvent('DragEvent', Core.DragEvent);
		Core.Event.register('localdragstart', Core.DragEvent);
		Core.Event.register('localdragend', Core.DragEvent);
		Core.Event.register('localdragenter', Core.DragEvent);
		Core.Event.register('localdragover', Core.DragEvent);
		Core.Event.register('localdrop', Core.DragEvent);
	}
});

navigator.supportDrag = (('ondragstart' in window) || navigator.isGecko) &&
  !navigator.isIE && !navigator.iPad && !navigator.iPhone && !navigator.Android;


if(!navigator.supportDrag)
	Core.DragManager.current = new Core.DragManager();

// create a drag manager for everybody for
// in browser object drag & drop
Core.LocalDragManager.current = new Core.LocalDragManager();

