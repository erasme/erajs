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
	types: undefined,

	pointerId: 0,
	dropEffect: 'none',
	data: undefined,
	type: undefined,
	timer: undefined,
	delayed: false,

	/**
    *   @constructs
	*	@class
    *   @extends Core.Object
	*/
	constructor: function(config) {	
		this.draggable = config.draggable;
		delete(config.draggable);
		this.startX = config.x;
		delete(config.x);
		this.startY = config.y;
		delete(config.y);
		this.type = config.type;
		delete(config.type);
		this.delayed = config.delayed;
		delete(config.delayed);
		if('pointerId' in config) {
			this.pointerId = config.pointerId;
			delete(config.pointerId);
		}

		// prevent native drag and drop if supported
		if('ondragstart' in this.draggable) {
			this.draggable.ondragstart = function(e) {
				if(e !== undefined) {
					if('preventDefault' in e)
						e.preventDefault();
					if('stopImmediatePropagation' in e)
						e.stopImmediatePropagation();
				}
				return false;
			};
		}

		this.data = {};

		if(this.type === 'mouse') {
			this.connect(window, 'mouseup', this.onMouseUp, true);
			this.connect(window, 'mousemove', this.onMouseMove, true);
		}
		else if(this.type === 'touch') {
			this.connect(this.draggable, 'touchmove', this.onTouchMove);
			this.connect(this.draggable, 'touchend', this.onTouchEnd);
			this.connect(this.draggable, 'touchcancel', this.onTouchCancel);
		}
		else if(this.type === 'pointer') {
			this.connect(window, 'pointermove', this.onPointerMove);
			this.connect(window, 'pointerup', this.onPointerUp);
			this.connect(window, 'pointercancel', this.onPointerCancel);
		}
		
		if(this.delayed)
			this.timer = new Core.DelayedTask({ scope: this, delay: 0.5, callback: this.onTimer });
	},

	setData: function(type, data) {
		this.data[type.toLowerCase()] = data;
		this.updateTypes();
	},

	getData: function(type) {
		return this.data[type.toLowerCase()];
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
			if(('tagName' in element) && (element.tagName.toUpperCase() == 'IMG')) {
				res = element.cloneNode(false);
				res.oncontextmenu = function(e) { e.preventDefault(); };
			}
			else if(('tagName' in element) && (element.tagName.toUpperCase() == 'CANVAS')) {
				res = document.createElement('img');
				res.oncontextmenu = function(e) { e.preventDefault(); };
				// copy styles (position)
				for(var key in element.style)
					res.style[key] = element.style[key];
				res.setAttribute('src', element.toDataURL('image/png'));
			}
			else if(!navigator.isFirefox && (element.toDataURL !== undefined)) {
				res = document.createElement('img');
				res.oncontextmenu = function(e) { e.preventDefault(); };
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
			if('setAttribute' in res)
				res.setAttribute('draggable', false);
		}
		return res;
	},
		
	updateTypes: function() {
		this.types = [];
		for(var type in this.data)
			this.types.push(type);
	},

	onTimer: function() {
		this.timer = undefined;

		var dragEvent = document.createEvent('DragEvent');
		dragEvent.initDragEvent('dragstart', false, true, window, this, this.startX, this.startY, this.startX, this.startY, false, false, false, false);
		this.draggable.dispatchEvent(dragEvent);

		if(this.hasData()) {
			this.hasStarted = true;

			this.image = this.generateImage(this.draggable);
			this.image.style.touchAction = 'none';
			this.image.style.zIndex = 100000;
			this.image.style.position = 'absolute';

			if(navigator.supportOpacity)
				this.image.style.opacity = 0.8;

			var ofs = this.delayed ? -10 : 0;

			this.startImagePoint = Ui.Element.pointToWindow(this.draggable, { x: 0, y: 0});
			this.image.style.left = (this.startImagePoint.x+ofs)+'px';
			this.image.style.top = (this.startImagePoint.y+ofs)+'px';

			document.body.appendChild(this.image);
		}
		else {
			if(this.type === 'touch')
				this.onTouchCancel();
			else if(this.type === 'pointer')
				this.onPointerCancel();
			else if(this.type === 'mouse')
				this.onMouseCancel();
		}
	},

	onMove: function(clientX, clientY) {
		if(this.timer !== undefined) {
			var deltaX = clientX - this.startX;
			var deltaY = clientY - this.startY;
			var delta = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
			// if we move too much, cancel
			if(delta > 20)
				return false;
		}
		else if(!this.hasStarted) {
			var deltaX = clientX - this.startX;
			var deltaY = clientY - this.startY;
			var delta = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
			// if we move enough start drag and drop
			if(delta > 5) {
				this.onTimer();
				return this.hasStarted;
			}
			else
				return true;
		}
		else {
			document.body.removeChild(this.image);
			var overElement = document.elementFromPoint(clientX, clientY);
			overElement = Core.Event.cleanTarget(overElement);
			document.body.appendChild(this.image);

			var deltaX = clientX - this.startX;
			var deltaY = clientY - this.startY;
			var ofs = this.delayed ? -10 : 0;

			this.image.style.left = (this.startImagePoint.x + deltaX + ofs)+'px';
			this.image.style.top = (this.startImagePoint.y + deltaY + ofs)+'px';

			if((overElement !== undefined) && (overElement !== null) && (overElement !== document.documentElement)) {
				var dragEvent = document.createEvent('DragEvent');
				if(this.overElement != overElement)
					dragEvent.initDragEvent('dragenter', true, true, window, this,
						clientX, clientY, clientX, clientY,
						false, false, false, false);
				else
					dragEvent.initDragEvent('dragover', true, true, window, this,
						clientX, clientY, clientX, clientY,
						false, false, false, false);
				overElement.dispatchEvent(dragEvent);
			}
			this.overElement = overElement;
		}
		return true;
	},
	
	onUp: function(clientX, clientY) {
		if(!this.hasStarted)
			return false;
		else {
			document.body.removeChild(this.image);

			if(this.overElement != undefined) {
				var dragEvent = document.createEvent('DragEvent');
				dragEvent.initDragEvent('drop', true, true, window, this,
					clientX, clientY, clientX, clientY,
					false, false, false, false);
				this.overElement.dispatchEvent(dragEvent);
			}

			var dragEvent = document.createEvent('DragEvent');
			dragEvent.initDragEvent('dragend', false, true, window, this,
				clientX, clientY, clientX, clientY,
				false, false, false, false);
			this.draggable.dispatchEvent(dragEvent);
			return true;
		}
	},

	onMouseMove: function(event) {
		//console.log('dragevent onMouseMove');
		if(this.onMove(event.clientX, event.clientY) === true) {
			event.preventDefault();
			event.stopPropagation();
		}
		else
			this.onMouseCancel(event);
	},

	onMouseUp: function(event) {
		//console.log('dragevent onMouseUp');
		if(event.button != 0)
			return;
		
		if(!this.onUp(event.clientX, event.clientY))
			this.onMouseCancel(event);
		else {
			event.preventDefault();
			event.stopPropagation();

			this.disconnect(window, 'mouseup', this.onMouseUp, true);
			this.disconnect(window, 'mousemove', this.onMouseMove, true);
		}
	},

	onMouseCancel: function() {
		console.log('dragevent onMouseCancel');

		this.disconnect(window, 'mouseup', this.onMouseUp, true);
		this.disconnect(window, 'mousemove', this.onMouseMove, true);
	},
	
	onTouchMove: function(event) {
		console.log(this+'.onTouchMove');
		if(this.onMove(event.changedTouches[0].clientX, event.changedTouches[0].clientY) === true) {
			// preventDefault (like scrolling) if the drag has started
			if(this.timer === undefined) {
				event.preventDefault();
				event.stopPropagation();
			}
		}
		else {
			this.onTouchCancel(event);
		}
	},

	onTouchEnd: function(event) {
		if(this.onUp(event.changedTouches[0].clientX, event.changedTouches[0].clientY) === true) {
			event.preventDefault();
			event.stopPropagation();
			this.disconnect(this.draggable, 'touchmove', this.onTouchMove);
			this.disconnect(this.draggable, 'touchend', this.onTouchEnd);
			this.disconnect(this.draggable, 'touchcancel', this.onTouchCancel);
		}
		else
			this.onTouchCancel(event);
	},

	onTouchCancel: function() {
		this.disconnect(this.draggable, 'touchmove', this.onTouchMove);
		this.disconnect(this.draggable, 'touchend', this.onTouchEnd);
		this.disconnect(this.draggable, 'touchcancel', this.onTouchCancel);

		if(this.timer !== undefined) {
			this.timer.abort();
			this.timer = undefined;
		}
	},

	onPointerMove: function(event) {
		if(event.pointerId !== this.pointerId)
			return;
		if(this.onMove(event.clientX, event.clientY) === true) {
			event.preventDefault();
			event.stopPropagation();
		}
		else {
			this.onPointerCancel(event);
		}
	},

	onPointerUp: function(event) {
		if(event.pointerId !== this.pointerId)
			return;

		if(this.onUp(event.clientX, event.clientY) === true) {
			event.preventDefault();
			event.stopPropagation();

			this.disconnect(window, 'pointermove', this.onPointerMove);
			this.disconnect(window, 'pointerup', this.onPointerUp);
			this.disconnect(window, 'pointercancel', this.onPointerCancel);
		}
		else {
			this.onPointerCancel(event);
		}
	},

	onPointerCancel: function(event) {
		if((event !== undefined) && (event.pointerId !== this.pointerId))
			return;
		this.disconnect(window, 'pointermove', this.onPointerMove);
		this.disconnect(window, 'pointerup', this.onPointerUp);
		this.disconnect(window, 'pointercancel', this.onPointerCancel);

		if(this.timer !== undefined) {
			this.timer.abort();
			this.timer = undefined;
		}
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

		this.connect(window, 'load', function() {
			if((document.body === undefined) || (document.body === null)) {
				var body = document.createElement('body');
				document.body = body;
			}
			// use PointerEvent (IE)
			if(window.PointerEvent)
				this.connect(window, 'pointerdown', this.onPointerDown);
			// Android, iOS
			else if('ontouchstart' in document.body)
				this.connect(document.body, 'touchstart', this.onTouchStart);
			else
				this.connect(window, 'mousedown', this.onMouseDown, true);
		});
	},

	findDraggable: function(element) {
		// try to find a draggable element
		var found = undefined;
		var current = element;
		while((found === undefined) && (current !== undefined) && (current !== window) && (current !== null)) {
			var draggable = current.getAttribute('draggable');
			if((draggable === 'true') || (draggable === true))
				found = current;
			current = current.offsetParent;
		}
		return found;
	},

	onPointerDown: function(event) {
		var delayed = (event.pointerType === 'touch');
		// try to find a draggable element
		var found = this.findDraggable(event.target);
		if(found !== undefined) {
			event.stopPropagation();
			new Core.DragDataTransfer({ type: 'pointer', draggable: found, x: event.clientX, y: event.clientY, delayed: delayed, pointerId: event.pointerId });
		}
	},

	onTouchStart: function(event) {
		if(event.changedTouches.length !== 1)
			return;
		// try to find a draggable element
		var found = this.findDraggable(event.target);
		if(found !== undefined) {
			event.stopPropagation();
			new Core.DragDataTransfer({ type: 'touch', draggable: found, x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY, delayed: true });
		}
	},

	onMouseDown: function(event) {
		if(event.button !== 0)
			return;
		var found = this.findDraggable(event.target);
		if(found !== undefined) {
			new Core.DragDataTransfer({ type: 'mouse', draggable: found, x: event.clientX, y: event.clientY, delayed: false });
		}
	}
});

// a full drag and drop support is needed. This mean drag and drop
// with user defined mimetypes and not only Text. This also means
// a bubbling drag and drop
navigator.supportDrag = (('ondragstart' in window) || navigator.isGecko) &&
  !navigator.isIE7 && !navigator.isIE8 && !navigator.iPad && !navigator.iPhone && !navigator.Android;
 
navigator.supportMimetypeDrag = navigator.supportDrag && !navigator.isIE;

if(!navigator.supportDrag)
	Core.DragManager.current = new Core.DragManager();
