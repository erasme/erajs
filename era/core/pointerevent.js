Core.Event.extend('Core.PointerEvent', 
/**@lends Core.PointerEvent#*/
{

	/**
	*	@constructs
	*	@class
	*	@extends Core.Event
	*/
	constructor: function(config) {
	},

	initPointerEvent: function(type, canBubble, cancelable, view, pointer) {
		this.type = type;
		this.bubbles = canBubble;
		this.cancelable = cancelable;
		this.view = view;
		this.pointer = pointer;
		this.clientX = pointer.getX();
		this.clientY = pointer.getY();
		this.pointerType = pointer.getType();
	}
}, {}, 
/**@lends Core.PointerEvent*/
{
	constructor: function() {
		Core.Event.registerEvent('PointerEvent', Core.PointerEvent);
		Core.Event.register('ptrdown', Core.PointerEvent);
		Core.Event.register('ptrmove', Core.PointerEvent);
		Core.Event.register('ptrup', Core.PointerEvent);
		Core.Event.register('ptrcancel', Core.PointerEvent);
	}
});

Core.Object.extend('Core.PointerWatcher', {
	drawing: undefined,
	pointer: undefined,

	constructor: function(config) {
		this.addEvents('down', 'move', 'up', 'cancel');
		this.drawing = config.drawing;
		delete(config.drawing);
		this.pointer = config.pointer;
		delete(config.pointer);
	},

	getDelta: function() {
		var initial = { x: this.pointer.getInitialX(), y: this.pointer.getInitialY() };
		var current = { x: this.pointer.getX(), y: this.pointer.getY() };
		initial = Ui.Element.pointFromWindow(this.drawing, initial, window);
		current = Ui.Element.pointFromWindow(this.drawing, current, window);
		return { x: current.x - initial.x, y: current.y - initial.y };
	},

	getPosition: function() {
		var current = { x: this.pointer.getX(), y: this.pointer.getY() };
		return Ui.Element.pointFromWindow(this.drawing, current, window);
	},

	getIsInside: function() {
		var pos = this.getPosition();
		return (pos.x >= 0) && (pos.y >= 0) && (pos.x <= this.drawing.clientWidth) &&
			(pos.y <= this.drawing.clientHeight);
	},

	getDirection: function() {
		var delta = this.getDelta();
		if(Math.abs(delta.x) > Math.abs(delta.y)) {
			if(delta.x < 0)
				return 'left';
			else
				return 'right';
		}
		else {
			if(delta.y < 0)
				return 'top';
			else
				return 'bottom';
		}
	},

	getSpeed: function() {
		if((this.pointer === undefined) || (this.pointer.history.length < 2))
			return { x: 0, y: 0 };
		else {
			var i = this.pointer.history.length;
			var now = { time: (new Date().getTime())/1000, x: this.pointer.x, y: this.pointer.y };
			do {
				var measure = this.pointer.history[--i];
			}
			while((i > 0) && ((now.time - measure.time) < 0.08));
			var deltaTime = now.time - measure.time;
			return {
				x: (now.x - measure.x) / deltaTime,
				y: (now.y - measure.y) / deltaTime
			};
		} 
	},

	getIsCaptured: function() {
		return (this.pointer !== undefined) && (this.pointer.captureWatcher === this);
	},

	/*
	 * Ask for exclusive watching on this pointer
	 */
	capture: function() {
		this.pointer.capture(this);
	},

	/*
	 * 
	 */
	release: function() {
		this.pointer.release(this);
	},
	
	cancel: function() {
		if(this.pointer !== undefined) {
			this.fireEvent('cancel', this);
			this.pointer.unwatch(this);
			// no more events must happened, ensure the watcher
			// will no more be used
			this.pointer = undefined;
		}
	},

	down: function() {
		if(this.pointer !== undefined)
			this.fireEvent('down', this);
	},

	move: function() {
		if(this.pointer !== undefined)
			this.fireEvent('move', this);
	},

	up: function() {
		if(this.pointer !== undefined)
			this.fireEvent('up', this);
	}
}, {
	/*
	 * We are no more interested in watchin this pointer
	 */
	unwatch: function() {
		if(this.pointer !== undefined)
			this.pointer.unwatch(this);
	}
})

Core.Object.extend('Core.Pointer', 
/**@lends Core.Pointer#*/
{
	id: undefined,
	x: 0,
	y: 0,
	initialX: 0,
	initialY: 0,
	captureElement: undefined,
	type: undefined,
	start: undefined,
	cumulMove: 0,
	chainLevel: 0,
	watchers: undefined,
	captureWatcher: undefined,
	history: undefined,
	buttons: 0,

	/**
	*	@constructs
	*	@class
	*	@extends Core.Object
	*/
	constructor: function(config) {
		this.addEvents('ptrmove', 'ptrup', 'ptrcancel');

		this.type = config.type;
		delete(config.type);
		this.id = config.id;
		delete(config.id);

		this.start = (new Date().getTime())/1000;
		this.watchers = [];
		this.history = [];

/*		var target = Core.Event.cleanTarget(document.elementFromPoint(this.x, this.y));
		if(target !== undefined) {
			var pointerEvent = document.createEvent('PointerEvent');
			pointerEvent.initPointerEvent('ptrdown', true, true, window, this);
			target.dispatchEvent(pointerEvent);
		}*/
	},
	
	capture: function(watcher) {
		var watchers = this.watchers.slice();
		for(var i = 0; i < watchers.length; i++) {
			if(watchers[i] !== watcher)
				watchers[i].cancel();
		}
		this.captureWatcher = watcher;
	},

	release: function(watcher) {
		this.captureWatcher = undefined;
	},

	getType: function() {
		return this.type;
	},

	getIsDown: function() {
		return this.buttons !== 0;
	},

	getX: function() {
		return this.x;
	},

	getY: function() {
		return this.y;
	},

	getInitialX: function() {
		return this.initialX;
	},

	getInitialY: function() {
		return this.initialY;
	},

	setInitialPosition: function(x, y) {
		this.initialX = x;
		this.initialY = y;
	},

	getButtons: function() {
		return this.buttons;
	},

	setButtons: function(buttons) {
		this.buttons = buttons;
	},
	
	getChainLevel: function() {
		return this.chainLevel;
	},

	move: function(x, y) {
		if(x == undefined)
			x = this.x;
		if(y == undefined)
			y = this.y;
		
		if((this.x !== x) || (this.y !== y)) {
			// update the cumulated move
			var deltaX = this.x - x;
			var deltaY = this.y - y;
			this.cumulMove += Math.sqrt(deltaX * deltaX + deltaY * deltaY);

			this.x = x;
			this.y = y;

			var time = (new Date().getTime())/1000;
			this.history.push({ time: time, x: this.x, y: this.y });
			while((this.history.length > 2) && (time - this.history[0].time > Core.Pointer.HISTORY_TIMELAPS)) {
				this.history.shift();
			}

			var watchers = this.watchers.slice();
			for(var i = 0; i < watchers.length; i++)
				watchers[i].move();

			var target;
			if(this.captureElement != undefined)
				target = this.captureElement;
			else
				target = document.elementFromPoint(this.x, this.y);
			if(target != undefined) {
				var pointerEvent = document.createEvent('PointerEvent');
				pointerEvent.initPointerEvent('ptrmove', (this.captureElement == undefined), true, window, this);
				this.fireEvent('ptrmove', pointerEvent);
				if(!pointerEvent.defaultPrevented)
					target.dispatchEvent(pointerEvent);
			}
		}
	},

	getIsHold: function() {
		return (((new Date().getTime())/1000) - this.start) >= Core.Pointer.HOLD_DELAY;
	},

	getDelta: function() {
		var deltaX = this.x - this.initialX;
		var deltaY = this.y - this.initialY;
		return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
	},

	getCumulMove: function() {
		return this.cumulMove;
	},

	getIsMove: function() {
		return this.cumulMove >= Core.Pointer.MOVE_DELTA;
	},

/*	capture: function(element) {
		this.captureElement = element;

		var pointerEvent = document.createEvent('PointerEvent');
		pointerEvent.initPointerEvent('ptrmove', false, true, window, this);
		this.fireEvent('ptrcancel', pointerEvent);
	},*/

	getCaptureElement: function() {
		return this.captureElement;
	},

/*	release: function() {
		if(this.captureElement != undefined) {
			this.x = this.initialX;
			this.y = this.initialY;

			var parent = this.captureElement.offsetParent;
			this.captureElement = undefined;
			if(parent != undefined) {
				// resend the up event
				var pointerEvent = document.createEvent('PointerEvent');
				pointerEvent.initPointerEvent('ptrdown', true, true, window, this);
				parent.dispatchEvent(pointerEvent);
			}
		}
	},*/

	down: function(x, y, buttons) {
		this.start = (new Date().getTime())/1000;

		this.x = x;
		this.initialX = x;

		this.y = y;
		this.initialY = y;

		this.history = [];
		this.history.push({ time: this.start, x: this.initialX, y: this.initialY });

		this.buttons = buttons;
		this.cumulMove = 0;

		var watchers = this.watchers.slice();
		for(var i = 0; i < watchers.length; i++)
			watchers[i].down();

		var target = Core.Event.cleanTarget(document.elementFromPoint(this.x, this.y));
		if(target !== undefined) {
			var pointerEvent = document.createEvent('PointerEvent');
			pointerEvent.initPointerEvent('ptrdown', true, true, window, this);
			target.dispatchEvent(pointerEvent);
		}
	},

	up: function() {
		var watchers = this.watchers.slice();
		for(var i = 0; i < watchers.length; i++)
			watchers[i].up();
		this.watchers = [];
		this.captureWatcher = undefined;
		this.buttons = 0;

		var target;
		if(this.captureElement !== undefined)
			target = this.captureElement;
		else
			target = document.elementFromPoint(this.x, this.y);
		if(target != undefined) {
			var pointerEvent = document.createEvent('PointerEvent');
			pointerEvent.initPointerEvent('ptrup', (this.captureElement === undefined), true, window, this);
			this.fireEvent('ptrup', pointerEvent);
			if(!pointerEvent.defaultPrevented)
				target.dispatchEvent(pointerEvent);
		}
	}
}, {
	watch: function(drawing) {
		var watcher = new Core.PointerWatcher({ drawing: drawing, pointer: this });
		this.watchers.push(watcher);
		return watcher;
	},

	unwatch: function(watcher) {
		for(var i = 0; i < this.watchers.length; i++) {
			if(this.watchers[i] === watcher) {
				this.watchers.splice(i, 1);
				break;
			}
		}
	}
}, {
	HOLD_DELAY: 0.75,
	MOVE_DELTA: 15,
	HISTORY_TIMELAPS: 0.5
});

Core.Object.extend('Core.PointerManager', 
/**@lends Core.PointerManager#*/
{
	touches: undefined,
	lastUpdate: undefined,
	mouse: undefined,

	/**
	*	@constructs
	*	@class
	*	@extends Core.Object
	*/
	constructor: function(config) {
		this.pointers = {};
		this.connect(window, 'load', this.onWindowLoad);
	},
	
	onMouseDown: function(event) {
		var buttons = 0;
		if(event.button === 0)
			buttons |= 1;
		else if(event.button === 1)
			buttons |= 2;
		else if(event.button === 2)
			buttons |= 4;

		var oldButtons = this.mouse.getButtons();
		if(oldButtons === 0)
			this.mouse.down(event.clientX, event.clientY, buttons);
		else
			this.mouse.setButtons(oldButtons | buttons);
		
//		console.log('onmousedown');
//		if(event.button === 0)
//			this.mouse0 = new Core.Pointer({ type: 'mouse', id: 0, x: event.clientX, y: event.clientY });
//		else if(event.button === 1)
//			this.mouse1 = new Core.Pointer({ type: 'mouse', id: 1, x: event.clientX, y: event.clientY });
//		else if(event.button === 2)
//			this.mouse2 = new Core.Pointer({ type: 'mouse', id: 2, x: event.clientX, y: event.clientY });
	},

	onMouseMove: function(event) {
		this.mouse.move(event.clientX, event.clientY);
	},

	onMouseUp: function(event) {
		this.mouse.move(event.clientX, event.clientY);

		var buttons = 0;
		if(event.button === 0)
			buttons |= 1;
		else if(event.button === 1)
			buttons |= 2;
		else if(event.button === 2)
			buttons |= 4;

		var oldButtons = this.mouse.getButtons();
	
		if((oldButtons & ~buttons) === 0)
			this.mouse.up();
		else
			this.mouse.setButtons(oldButtons & ~buttons);
//		console.log('onmouseup');

//		if((event.button === 0)&& (this.mouse0 !== undefined))
//			this.mouse0.end();
//		else if((event.button === 1) && (this.mouse1 !== undefined))
//			this.mouse1.end();
//		else if((event.button === 2) && (this.mouse2 !== undefined))
//			this.mouse2.end();
	},

	onWindowLoad: function() {
		try {
			if(document.body === undefined) {
				var htmlBody = document.createElement('body');
				document.body = htmlBody;
			}
		} catch(e) {}

		if(window.PointerEvent) {
			this.connect(window, 'pointerdown', this.onPointerDown);
			this.connect(window, 'pointermove', this.onPointerMove);
			this.connect(window, 'pointerup', this.onPointerUp);
			this.connect(window, 'pointercancel', this.onPointerCancel);
		}
		else {
			/*this.connect(window, 'mousedown', this.onMouseDown);
			this.connect(window, 'mousemove', this.onMouseMove);
			this.connect(window, 'mouseup', this.onMouseUp);*/

			if(!navigator.iOs && !navigator.Android) {
				this.mouse = new Core.Pointer({ type: 'mouse', id: 0 });

				this.connect(window, 'mousedown', this.onMouseDown);
				this.connect(window, 'mousemove', this.onMouseMove);
				this.connect(window, 'mouseup', this.onMouseUp);
				this.connect(document, 'selectstart', function(event) {
//					console.log('selectstart '+event.target+' START');
					var selectable = false;
					var current = event.target;
					while((current !== null) && (current !== undefined)) {
//						console.log('selectstart current '+current+' '+current.selectable);
						if(current.selectable === true) {
							selectable = true;
							break;
						}
						current = current.parentNode;
					}
					if(!selectable)
						event.preventDefault();
					else if(this.mouse !== undefined)
						this.mouse.capture(undefined);
//					console.log('selectstart '+event.target+' END, selectable: '+selectable);
				});
//				this.connect(document, 'dragstart', function(event) {
//					console.log('ondragstart');
//					if(this.mouse !== undefined)
//						this.mouse.capture(undefined);
//				}, true);
			}
			this.connect(document.body, 'touchstart', this.updateTouches);
			this.connect(document.body, 'touchmove', this.updateTouches);
			this.connect(document.body, 'touchend', this.updateTouches);
			this.connect(document.body, 'touchcancel', this.updateTouches);

//			this.connect(document.body, 'touchcancel', function() {	console.log('touchcancel');	});
		}
	},

	onPointerDown: function(event) {
//		event.preventDefault();
//		event.stopPropagation();

		var type;
		if(event.pointerType === 'pen')
			type = 'pen';
		else if(event.pointerType === 'mouse')
			type = 'mouse';
		else
			type = 'touch';
		
		var pointer = new Core.Pointer({
			type: type, id: event.pointerId
		});
		this.pointers[event.pointerId] = pointer;
		pointer.down(event.clientX, event.clientY, 1);
	},

	onPointerMove: function(event) {
		if(this.pointers[event.pointerId] !== undefined)
			this.pointers[event.pointerId].move(event.clientX, event.clientY);
	},

	onPointerUp: function(event) {
		if(this.pointers[event.pointerId] !== undefined) {
			this.pointers[event.pointerId].up();
			delete(this.pointers[event.pointerId]);
		}
	},

	onPointerCancel: function(event) {
		// TODO
//		console.log('onPointerCancel');
	},

	updateTouches: function(event) {
		this.lastUpdate = (new Date().getTime())/1000;
		for(var id in this.pointers) {
			var found = false;
			for(var i = 0; (i < event.touches.length) && !found; i++) {
				if(id == event.touches[i].identifier) {
					found = true;
					this.pointers[id].move(event.touches[i].clientX, event.touches[i].clientY);
				}
			}
			if(!found) {
				this.pointers[id].up();
				delete(this.pointers[id]);
			}
		}
		for(var i = 0; i < event.touches.length; i++) {
			if(this.pointers[event.touches[i].identifier] == undefined) {
				var pointer = new Core.Pointer({
					type: 'touch', id: event.touches[i].identifier
				});
				this.pointers[event.touches[i].identifier] = pointer;
				pointer.down(event.touches[i].clientX, event.touches[i].clientY, 1);
			}
		}
		if(event.type === 'touchmove')
			event.preventDefault();
	}
}, {}, {
	current: undefined,

	constructor: function() {
		this.current = new Core.PointerManager(); 
	}
});

