
Ui.DualIcon.extend('Ui.DragEffectIcon', {}, {}, {
	style: {
		fill: 'green',
		stroke: 'white',
		strokeWidth: 4
	}
});

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
		this.metaKey = metaKey;
	}
});

Core.Object.extend('Core.DragDataTransfer', 
/**@lends Core.DragDataTransfer#*/
{
	draggable: undefined,
	image: undefined,
	imageEffect: undefined,
	catcher: undefined,
	startX: 0,
	startY: 0,
	startImagePoint: undefined,
	overElement: undefined,
	hasStarted: false,
	types: undefined,

	watcher: undefined,
	pointer: undefined,
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
		this.pointer = config.pointer;
		delete(config.pointer);
		this.watcher = this.pointer.watch(window);
//		this.pointer.capture(this.draggable);

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

		this.connect(this.watcher, 'move', this.onPointerMove);
		this.connect(this.watcher, 'up', this.onPointerUp);
		this.connect(this.watcher, 'cancel', this.onPointerCancel);

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
		var res; var key; var child; var i;
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
				for(key in element.style)
					res.style[key] = element.style[key];
				res.setAttribute('src', element.toDataURL('image/png'));
			}
			else if(!navigator.isFirefox && (element.toDataURL !== undefined)) {
				res = document.createElement('img');
				res.oncontextmenu = function(e) { e.preventDefault(); };
				// copy styles (position)
				for(key in element.style)
					res.style[key] = element.style[key];
				res.setAttribute('src', element.toDataURL('image/png'));
			}
			else {
				res = element.cloneNode(false);
				if('style' in res)
					res.style.webkitUserSelect = 'none';
				for(i = 0; i < element.childNodes.length; i++) {
					child = element.childNodes[i];
					res.appendChild(this.generateImage(child));
				}
			}
			if('setAttribute' in res)
				res.setAttribute('draggable', false);
		}
		res.onselectstart = function(e) {
			e.preventDefault();
			return false;
		};
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
		dragEvent.initDragEvent('localdragstart', false, true, window, this, this.startX, this.startY, this.startX, this.startY, false, false, false, false);
		this.draggable.dispatchEvent(dragEvent);

		if(this.hasData()) {
			this.hasStarted = true;

			this.image = this.generateImage(this.draggable);
			this.image.style.touchAction = 'none';
			this.image.style.zIndex = 100000;
			this.image.style.position = 'absolute';
						
			//console.log(this.image.outerHTML);

			if(navigator.supportOpacity) {
				this.image.style.opacity = 1;
				this.image.firstChild.style.opacity = 0.8;
			}

			var ofs = this.delayed ? -10 : 0;

			this.startImagePoint = Ui.Element.pointToWindow(this.draggable, { x: 0, y: 0});

			this.image.style.left = (this.startImagePoint.x+ofs)+'px';
			this.image.style.top = (this.startImagePoint.y+ofs)+'px';

			// avoid IFrame problems for mouse
			if(this.watcher.pointer.getType() === 'mouse') {
				this.catcher = document.createElement('div');
				this.catcher.style.position = 'absolute';
				this.catcher.style.left = '0px';
				this.catcher.style.right = '0px';
				this.catcher.style.top = '0px';
				this.catcher.style.bottom = '0px';
				this.catcher.zIndex = 1000;
				document.body.appendChild(this.catcher);
			}

			document.body.appendChild(this.image);

//			console.log(this+'.onTimer CAPTURE');

			this.watcher.capture();
		}
		else {
			this.watcher.cancel();
		}
	},
	/*
	onMove: function(clientX, clientY) {
		var deltaX; var deltaY; var delta; var dragEvent; var ofs;

		if(this.timer !== undefined) {
//			console.log('onMove timer');

			deltaX = clientX - this.startX;
			deltaY = clientY - this.startY;
			delta = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
			// if we move too much, cancel
			if(delta > 20)
				return false;
		}
		else if(!this.hasStarted) {
//			console.log('onMove !hasStarted');

			deltaX = clientX - this.startX;
			deltaY = clientY - this.startY;
			delta = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
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

			deltaX = clientX - this.startX;
			deltaY = clientY - this.startY;
			ofs = this.delayed ? -10 : 0;

//			console.log('onMove move delta: '+clientX+','+clientY);

			this.image.style.left = (this.startImagePoint.x + deltaX + ofs)+'px';
			this.image.style.top = (this.startImagePoint.y + deltaY + ofs)+'px';

			if((overElement !== undefined) && (overElement !== null) && (overElement !== document.documentElement)) {
				dragEvent = document.createEvent('DragEvent');
				if(this.overElement != overElement)
					dragEvent.initDragEvent('dragenter', true, true, window, this,
						clientX, clientY, clientX, clientY,
						false, false, false, false);
				else
					dragEvent.initDragEvent('dragover', true, true, window, this,
						clientX, clientY, clientX, clientY,
						false, false, false, false);
				overElement.dispatchEvent(dragEvent);
				this.overElement = overElement;
			}
			else
				this.overElement = undefined;
		}
		return true;
	},
	
	onUp: function(clientX, clientY) {
		var dragEvent;
		if(!this.hasStarted)
			return false;
		else {
			document.body.removeChild(this.image);

			if(this.overElement !== undefined) {
				dragEvent = document.createEvent('DragEvent');
				dragEvent.initDragEvent('drop', true, true, window, this,
					clientX, clientY, clientX, clientY,
					false, false, false, false);
				this.overElement.dispatchEvent(dragEvent);
			}

			dragEvent = document.createEvent('DragEvent');
			dragEvent.initDragEvent('dragend', false, true, window, this,
				clientX, clientY, clientX, clientY,
				false, false, false, false);
			this.draggable.dispatchEvent(dragEvent);
			return true;
		}
	},*/

	onPointerMove: function(watcher) {
		var deltaX; var deltaY; var delta; var dragEvent; var ofs;
//		console.log('onPointerMove captured: '+watcher.getIsCaptured()+', move: '+watcher.pointer.getIsMove());

		if(watcher.getIsCaptured()) {
			var clientX = watcher.pointer.getX();
			var clientY = watcher.pointer.getY();

			document.body.removeChild(this.image);
			if(this.catcher !== undefined)
				document.body.removeChild(this.catcher);

			var overElement = document.elementFromPoint(clientX, clientY);
			overElement = Core.Event.cleanTarget(overElement);

			if(this.catcher !== undefined)
				document.body.appendChild(this.catcher);
			document.body.appendChild(this.image);

			deltaX = clientX - this.startX;
			deltaY = clientY - this.startY;
			ofs = this.delayed ? -10 : 0;

//			console.log('onMove move delta: '+clientX+','+clientY);

			this.image.style.left = (this.startImagePoint.x + deltaX + ofs)+'px';
			this.image.style.top = (this.startImagePoint.y + deltaY + ofs)+'px';
//			this.image.stype.webkitTransform = 'translate3d('+(this.startImagePoint.x + deltaX + ofs)+'px,'+(this.startImagePoint.y + deltaY + ofs)+'px'+',0px)';

			if((overElement !== undefined) && (overElement !== null) && (overElement !== document.documentElement)) {
				dragEvent = document.createEvent('DragEvent');
				var oldDropEffect = this.dropEffect;
				if(this.overElement !== overElement)
					dragEvent.initDragEvent('localdragenter', true, true, window, this,
						clientX, clientY, clientX, clientY,
						false, false, false, false);
				else {
					this.dropEffect = 'none';
					dragEvent.initDragEvent('localdragover', true, true, window, this,
						clientX, clientY, clientX, clientY,
						false, false, false, false);
				}
				overElement.dispatchEvent(dragEvent);

				// handle the drop effect icon feedback
				if(this.dropEffect !== oldDropEffect) {
					if(this.imageEffect !== undefined) {
						this.imageEffect.setIsLoaded(false);
						this.image.removeChild(this.imageEffect.getDrawing());
						this.imageEffect = undefined;
					}
					if(this.dropEffect !== 'none') {
						this.imageEffect = new Ui.DragEffectIcon({
							icon: 'drag'+this.dropEffect//, stroke: 'white'
						});
						this.imageEffect.parent = Ui.App.current;
						this.imageEffect.setIsLoaded(true);
						this.imageEffect.setParentVisible(true);
						this.imageEffect.setParentDisabled(false);

						this.imageEffect.measure(32, 32);
						this.imageEffect.arrange(
							-48 + (this.startX-this.startImagePoint.x-ofs),
							-48 + (this.startY-this.startImagePoint.y-ofs), 32, 32);
						this.image.appendChild(this.imageEffect.getDrawing());
					}
				}
				this.overElement = overElement;
			}
			else
				this.overElement = undefined;

		}
		else {
			if(watcher.pointer.getIsMove())
				watcher.cancel();
		}
	},

	onPointerUp: function(watcher) {
//		console.log('onPointerUp');
		var dragEvent;

		if(!watcher.getIsCaptured())
			watcher.cancel();
		else {
			var clientX = watcher.pointer.getX();
			var clientY = watcher.pointer.getY();

			document.body.removeChild(this.image);

			if(this.catcher !== undefined) {
            	document.body.removeChild(this.catcher);
            	this.catcher = undefined;
            }

			if(this.overElement !== undefined) {
				dragEvent = document.createEvent('DragEvent');
				dragEvent.initDragEvent('localdrop', true, true, window, this,
					clientX, clientY, clientX, clientY,
					false, false, false, false);
				this.overElement.dispatchEvent(dragEvent);
			}

			dragEvent = document.createEvent('DragEvent');
			dragEvent.initDragEvent('localdragend', false, true, window, this,
				clientX, clientY, clientX, clientY,
				false, false, false, false);
			this.draggable.dispatchEvent(dragEvent);
		}
	},

	onPointerCancel: function(watcher) {
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
		Core.Event.register('localdragstart', Core.DragEvent);
		Core.Event.register('localdragend', Core.DragEvent);
		Core.Event.register('localdragenter', Core.DragEvent);
		Core.Event.register('localdragover', Core.DragEvent);
		Core.Event.register('localdrop', Core.DragEvent);

		this.connect(window, 'load', function() {
			this.connect(window, 'ptrdown', this.onPointerDown, true);
		});
	},

	findDraggable: function(element) {
		// try to find a draggable element
		var found;
		var current = element;
		while((found === undefined) && (current !== undefined) && (current !== window) && (current !== null)) {
			var draggable = current.getAttribute('draggable') || current.getAttribute('localdraggable');
			if((draggable === 'true') || (draggable === true))
				found = current;
			current = current.offsetParent;
		}
		return found;
	},

	onPointerDown: function(event) {
		//var delayed = (event.pointer.getType() === 'touch');
		var delayed = true;

		// try to find a draggable element
		var found = this.findDraggable(event.target);

		if(found !== undefined) {
			new Core.DragDataTransfer({ type: 'pointer', draggable: found, x: event.clientX, y: event.clientY, delayed: delayed, pointer: event.pointer });
		}
	}
});

// a full drag and drop support is needed. This mean drag and drop
// with user defined mimetypes and not only Text. This also means
// a bubbling drag and drop
//navigator.supportDrag = (('ondragstart' in window) || navigator.isGecko) &&
//  !navigator.isIE7 && !navigator.isIE8 && !navigator.iPad && !navigator.iPhone && !navigator.Android;

navigator.supportDrag = false;
   
navigator.supportMimetypeDrag = navigator.supportDrag && !navigator.isIE;

if(!navigator.supportDrag)
	Core.DragManager.current = new Core.DragManager();

navigator.localDrag = (Core.DragManager.current !== undefined);

