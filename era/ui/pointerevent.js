
Ui.Event.extend('Ui.PointerEvent', 
/**@lends Ui.PointerEvent#*/
{
	pointer: undefined,
	clientX: 0,
	clientY: 0,
	pointerType: 'mouse',

	/**
	*	@constructs
	*	@class
	*	@extends Ui.Event
	*/
	constructor: function(config) {
		this.pointer = config.pointer;
		delete(config.pointer);
		this.clientX = this.pointer.getX();
		this.clientY = this.pointer.getY();
		this.pointerType = this.pointer.getType();
	}
});

Core.Object.extend('Ui.PointerWatcher', {
	element: undefined,
	pointer: undefined,

	constructor: function(config) {
		this.addEvents('down', 'move', 'up', 'cancel');
		this.element = config.element;
		delete(config.element);
		this.pointer = config.pointer;
		delete(config.pointer);
	},

	getAbsoluteDelta: function() {
		var initial = { x: this.pointer.getInitialX(), y: this.pointer.getInitialY() };
		var current = { x: this.pointer.getX(), y: this.pointer.getY() };
		return { x: current.x - initial.x, y: current.y - initial.y };
	},

	getDelta: function() {
		var initial = { x: this.pointer.getInitialX(), y: this.pointer.getInitialY() };
		var current = { x: this.pointer.getX(), y: this.pointer.getY() };
		initial = this.element.pointFromWindow(initial);
		current = this.element.pointFromWindow(current);
		return { x: current.x - initial.x, y: current.y - initial.y };
	},

	getPosition: function() {
		var current = { x: this.pointer.getX(), y: this.pointer.getY() };
		return this.element.pointFromWindow(current);
	},

	getIsInside: function() {
		var pos = this.getPosition();
		if((pos.x >= 0) && (pos.x <= this.element.getLayoutWidth()) &&
		   (pos.y >= 0) && (pos.y <= this.element.getLayoutHeight()))
			return true;
		return false;
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

Core.Object.extend('Ui.Pointer', 
/**@lends Ui.Pointer#*/
{
	id: undefined,
	x: 0,
	y: 0,
	initialX: 0,
	initialY: 0,
	altKey: false,
	ctrlKey: false,
	shiftKey: false,
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

	getIsCaptured: function() {
		return (this.captureWatcher !== undefined);
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

	getAltKey: function() {
		return this.altKey;
	},

	setAltKey: function(altKey) {
		this.altKey = altKey;
	},

	getCtrlKey: function() {
		return this.ctrlKey;
	},

	setCtrlKey: function(ctrlKey) {
		this.ctrlKey = ctrlKey;
	},

	getShiftKey: function() {
		return this.shiftKey;
	},

	setShiftKey: function(shiftKey) {
		this.shiftKey = shiftKey;
	},

	setControls: function(altKey, ctrlKey, shiftKey) {
		this.altKey = altKey;
		this.ctrlKey = ctrlKey;
		this.shiftKey = shiftKey;
	},

	move: function(x, y) {
		if(x === undefined)
			x = this.x;
		if(y === undefined)
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
			while((this.history.length > 2) && (time - this.history[0].time > Ui.Pointer.HISTORY_TIMELAPS)) {
				this.history.shift();
			}
		}

		var watchers = this.watchers.slice();
		for(var i = 0; i < watchers.length; i++)
			watchers[i].move();
			
		if(this.captureWatcher === undefined) {
			var target = Ui.App.current.elementFromPoint(this.x, this.y);
			if(target !== undefined) {
				var pointerEvent = new Ui.PointerEvent({ type: 'ptrmove', pointer: this });
				this.fireEvent('ptrmove', pointerEvent);
				pointerEvent.dispatchEvent(target);
			}
		}
	},

	getIsHold: function() {
		return (((new Date().getTime())/1000) - this.start) >= Ui.Pointer.HOLD_DELAY;
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
		return this.cumulMove >= Ui.Pointer.MOVE_DELTA;
	},

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

		var target = Ui.App.current.elementFromPoint(this.x, this.y);
		if(target !== undefined) {
			var pointerEvent = new Ui.PointerEvent({ type: 'ptrdown', pointer: this });
			pointerEvent.dispatchEvent(target);
		}
	},

	up: function() {
		var watchers = this.watchers.slice();
		for(var i = 0; i < watchers.length; i++)
			watchers[i].up();
		this.watchers = [];
		this.buttons = 0;

		if(this.captureWatcher === undefined) {
			var target = Ui.App.current.elementFromPoint(this.x, this.y);
			if(target !== undefined) {
				var pointerEvent = new Ui.PointerEvent({ type: 'ptrup', pointer: this });
				this.fireEvent('ptrup', pointerEvent);
				pointerEvent.dispatchEvent(target);
			}
		}
		this.captureWatcher = undefined;
	}
}, {
	watch: function(element) {
		var watcher = new Ui.PointerWatcher({ element: element, pointer: this });
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

Core.Object.extend('Ui.PointerManager', 
/**@lends Ui.PointerManager#*/
{
	touches: undefined,
	lastUpdate: undefined,
	lastTouchX: -1,
	lastTouchY: -1,
	lastDownTouchX: -1,
	lastDownTouchY: -1,
	mouse: undefined,
	app: undefined,

	/**
	*	@constructs
	*	@class
	*	@extends Core.Object
	*/
	constructor: function(config) {
		this.app = config.app;
		delete(config.app);
		this.pointers = {};

		if(window.PointerEvent) {
			this.connect(window, 'pointerdown', this.onPointerDown);
			this.connect(window, 'pointermove', this.onPointerMove);
			this.connect(window, 'pointerup', this.onPointerUp);
			this.connect(window, 'pointercancel', this.onPointerCancel);
		}
		else {
			this.mouse = new Ui.Pointer({ type: 'mouse', id: 0 });

			this.connect(window, 'mousedown', this.onMouseDown);
			this.connect(window, 'mousemove', this.onMouseMove);
			this.connect(window, 'mouseup', this.onMouseUp);
//			this.connect(document, 'select', function(event) {
//				console.log('select '+event.target+' START '+this.mouse.getIsCaptured());
//			});
			this.connect(document, 'selectstart', this.onSelectStart);
//			this.connect(document, 'dragstart', function(event) {
//				console.log('ondragstart');
//				if(this.mouse !== undefined)
//					this.mouse.capture(undefined);
//			}, true);

			this.connect(window, 'keydown', function(event) {
				// if Ctrl, Alt or Shift change signal to the mouse
				if((event.which === 16) || (event.which === 17) || (event.which === 18)) {
					this.mouse.setControls(event.altKey, event.ctrlKey, event.shiftKey);
					this.mouse.move();
				}
			});
			this.connect(window, 'keyup', function(event) {
				// if Ctrl, Alt or Shift change signal to the mouse
				if((event.which === 16) || (event.which === 17) || (event.which === 18)) {
					this.mouse.setControls(event.altKey, event.ctrlKey, event.shiftKey);
					this.mouse.move();
				}
			});

			this.connect(document, 'contextmenu', function(event) {
				if(this.mouse !== undefined) {
					this.mouse.capture(undefined);
					this.mouse.up();
				}
			});

			this.connect(document.body, 'touchstart', this.updateTouches, true);
			this.connect(document.body, 'touchmove', this.updateTouches, true);
			this.connect(document.body, 'touchend', this.updateTouches, true);
			this.connect(document.body, 'touchcancel', this.updateTouches, true);

//			this.connect(document.body, 'touchcancel', function() {	console.log('touchcancel');	});
		}
	},

	onSelectStart: function(event) {
		//console.log('selectstart '+event.target+' START '+this.mouse.getIsCaptured());
		if(this.mouse.getIsCaptured()) {
			event.preventDefault();
			return;
		}

		var selectable = false;
		var current = event.target;
		while((current !== null) && (current !== undefined)) {
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
	},

	onMouseDown: function(event) {
		// avoid emulated mouse event after touch events
		var deltaTime = (((new Date().getTime())/1000) - this.lastUpdate);
		var deltaX = (this.lastTouchX - event.clientX);
		var deltaY = (this.lastTouchY - event.clientY);
		var deltaPos =  Math.sqrt(deltaX * deltaX + deltaY * deltaY);
		// check the delta position with the lastest touchstart event
		// because iOS8 generate mouse event using the start coordinates
		// and generate mouse event even after a long move
		var downDeltaX = this.lastDownTouchX - event.clientX;
		var downDeltaY = this.lastDownTouchY - event.clientY;
		var downDeltaPos =  Math.sqrt(downDeltaX * downDeltaX + downDeltaY * downDeltaY);

		if((deltaTime < 1) || ((deltaTime < 10) && ((deltaPos < 20) || (downDeltaPos < 20))))
			return;
		var buttons = 0;
		if(event.button === 0)
			buttons |= 1;
		else if(event.button === 1)
			buttons |= 2;
		else if(event.button === 2)
			buttons |= 4;

		this.mouse.setControls(event.altKey, event.ctrlKey, event.shiftKey);

		var oldButtons = this.mouse.getButtons();
		if(oldButtons === 0)
			this.mouse.down(event.clientX, event.clientY, buttons);
		else
			this.mouse.setButtons(oldButtons | buttons);		
	},

	onMouseMove: function(event) {
		this.mouse.setControls(event.altKey, event.ctrlKey, event.shiftKey);
		// avoid emulated mouse event after touch events
		var deltaTime = (((new Date().getTime())/1000) - this.lastUpdate);
		var deltaX = (this.lastTouchX - event.clientX);
		var deltaY = (this.lastTouchY - event.clientY);
		var deltaPos =  Math.sqrt(deltaX * deltaX + deltaY * deltaY);
		// check the delta position with the lastest touchstart event
		// because iOS8 generate mouse event using the start coordinates
		// and generate mouse event even after a long move
		var downDeltaX = this.lastDownTouchX - event.clientX;
		var downDeltaY = this.lastDownTouchY - event.clientY;
		var downDeltaPos =  Math.sqrt(downDeltaX * downDeltaX + downDeltaY * downDeltaY);

		if((deltaTime < 1) || ((deltaTime < 10) && ((deltaPos < 20) || (downDeltaPos < 20))))
			return;
		this.mouse.move(event.clientX, event.clientY);
	},

	onMouseUp: function(event) {
		this.mouse.setControls(event.altKey, event.ctrlKey, event.shiftKey);
		// avoid emulated mouse event after touch events
		var deltaTime = (((new Date().getTime())/1000) - this.lastUpdate);
		var deltaX = (this.lastTouchX - event.clientX);
		var deltaY = (this.lastTouchY - event.clientY);
		var deltaPos =  Math.sqrt(deltaX * deltaX + deltaY * deltaY);
		// check the delta position with the lastest touchstart event
		// because iOS8 generate mouse event using the start coordinates
		// and generate mouse event even after a long move
		var downDeltaX = this.lastDownTouchX - event.clientX;
		var downDeltaY = this.lastDownTouchY - event.clientY;
		var downDeltaPos =  Math.sqrt(downDeltaX * downDeltaX + downDeltaY * downDeltaY);

		if((deltaTime < 1) || ((deltaTime < 10) && ((deltaPos < 20) || (downDeltaPos < 20))))
			return;
		this.mouse.move(event.clientX, event.clientY);
		this.mouse.up();
	},

	onWindowLoad: function() {
		try {
			if(document.body === undefined) {
				var htmlBody = document.createElement('body');
				document.body = htmlBody;
			}
		} catch(e) {}

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
		
		var pointer = new Ui.Pointer({
			type: type, id: event.pointerId
		});
		this.pointers[event.pointerId] = pointer;
		pointer.setControls(event.altKey, event.ctrlKey, event.shiftKey);
		pointer.down(event.clientX, event.clientY, 1);
	},

	onPointerMove: function(event) {
		if(this.pointers[event.pointerId] !== undefined) {
			this.pointers[event.pointerId].setControls(event.altKey, event.ctrlKey, event.shiftKey);
			this.pointers[event.pointerId].move(event.clientX, event.clientY);
		}
	},

	onPointerUp: function(event) {
		if(this.pointers[event.pointerId] !== undefined) {
			this.pointers[event.pointerId].setControls(event.altKey, event.ctrlKey, event.shiftKey);
			this.pointers[event.pointerId].up();
			delete(this.pointers[event.pointerId]);
		}
	},

	onPointerCancel: function(event) {
		// TODO
//		console.log('onPointerCancel');
	},

	updateTouches: function(event) {
		//console.log('updateTouch '+event.type);

		this.lastUpdate = (new Date().getTime())/1000;
		for(var id in this.pointers) {
			var found = false;
			for(var i = 0; (i < event.touches.length) && !found; i++) {
				if(id == event.touches[i].identifier) {
					found = true;
					this.pointers[id].setControls(event.altKey, event.ctrlKey, event.shiftKey);
					this.pointers[id].move(event.touches[i].clientX, event.touches[i].clientY);
				}
			}
			if(!found) {
				this.pointers[id].setControls(event.altKey, event.ctrlKey, event.shiftKey);
				this.pointers[id].up();
				delete(this.pointers[id]);
			}
		}
		for(var i = 0; i < event.touches.length; i++) {
			this.lastTouchX = event.touches[i].clientX;
			this.lastTouchY = event.touches[i].clientY;

			if(this.pointers[event.touches[i].identifier] == undefined) {
				var pointer = new Ui.Pointer({
					type: 'touch', id: event.touches[i].identifier
				});
				this.pointers[event.touches[i].identifier] = pointer;
				pointer.setControls(event.altKey, event.ctrlKey, event.shiftKey);
				pointer.down(event.touches[i].clientX, event.touches[i].clientY, 1);
			}
		}
		if(event.type === 'touchstart') {
			for(var i = 0; i < event.changedTouches.length; i++) {
				this.lastDownTouchX = event.changedTouches[i].clientX;
				this.lastDownTouchY = event.changedTouches[i].clientY;
			}
		}
		// we dont prevent default for all events because we need
		// default behavious like focus handling, text selection,
		// virtual keyboard... so we will also need to detect
		// emulated mouse event to avoid them
		if(event.type === 'touchmove')
			event.preventDefault();
	}
});
