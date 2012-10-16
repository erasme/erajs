Core.Event.extend('Core.FingerEvent', 
/**@lends Core.FingerEvent#*/
{

	/**
	*	@constructs
	*	@class
	*	@extends Core.Event
	*/
	constructor: function(config) {
	},

	initFingerEvent: function(type, canBubble, cancelable, view, finger) {
		this.type = type;
		this.bubbles = canBubble;
		this.cancelable = cancelable;
		this.view = view;
		this.finger = finger;
	}
}, {}, 
/**@lends Core.FingerEvent*/
{
	constructor: function() {
		Core.Event.registerEvent('FingerEvent', Core.FingerEvent);
		Core.Event.register('fingerdown', Core.FingerEvent);
		Core.Event.register('fingermove', Core.FingerEvent);
		Core.Event.register('fingerup', Core.FingerEvent);
	}
});

Core.Object.extend('Core.Finger', 
/**@lends Core.Finger#*/
{
	id: undefined,
	x: undefined,
	y: undefined,
	initialX: undefined,
	initialY: undefined,
	captureElement: undefined,

	/**
	*	@constructs
	*	@class
	*	@extends Core.Object
	*/
	constructor: function(config) {
		this.addEvents('fingermove', 'fingerup');

		this.id = config.id;
		delete(config.id);
		this.x = config.x;
		this.y = config.y;
		this.initialX = config.x;
		this.initialY = config.y;
		delete(config.x);
		delete(config.y);

		var target = Core.Event.cleanTarget(document.elementFromPoint(this.x, this.y));
		if(target != undefined) {
			var fingerEvent = document.createEvent('FingerEvent');
			fingerEvent.initFingerEvent('fingerdown', true, true, window, this);
			target.dispatchEvent(fingerEvent);
		}
	},

	getX: function() {
		return this.x;
	},

	getY: function() {
		return this.y;
	},

	setPosition: function(x, y) {
		if(x == undefined)
			x = this.x;
		if(y == undefined)
			y = this.y;

		if((this.x != x) || (this.y != y)) {
			this.x = x;
			this.y = y;

			var target;
			if(this.captureElement != undefined)
				target = this.captureElement;
			else
				target = document.elementFromPoint(this.x, this.y);
			if(target != undefined) {
				var fingerEvent = document.createEvent('FingerEvent');
				fingerEvent.initFingerEvent('fingermove', (this.captureElement == undefined), true, window, this);
				this.fireEvent('fingermove', fingerEvent);
				if(!fingerEvent.defaultPrevented)
					target.dispatchEvent(fingerEvent);
			}
		}
	},

	capture: function(element) {
		this.captureElement = element;
	},

	release: function() {
		if(this.captureElement != undefined) {
			this.x = this.initialX;
			this.y = this.initialY;

			var parent = this.captureElement.offsetParent;
			this.captureElement = undefined;
			if(parent != undefined) {
				// resend the up event
				var fingerEvent = document.createEvent('FingerEvent');
				fingerEvent.initFingerEvent('fingerdown', true, true, window, this);
				parent.dispatchEvent(fingerEvent);
			}
		}
	},

	end: function() {
		var target;
		if(this.captureElement != undefined)
			target = this.captureElement;
		else
			target = document.elementFromPoint(this.x, this.y);
		if(target != undefined) {
			var fingerEvent = document.createEvent('FingerEvent');
			fingerEvent.initFingerEvent('fingerup', (this.captureElement == undefined), true, window, this);

			this.fireEvent('fingerup', fingerEvent);
			if(!fingerEvent.defaultPrevented)
				target.dispatchEvent(fingerEvent);
		}
	}
});

Core.Object.extend('Core.FingerManager', 
/**@lends Core.FingerManager#*/
{
	touches: undefined,

	/**
	*	@constructs
	*	@class
	*	@extends Core.Object
	*/
	constructor: function(config) {
		this.touches = {};
		this.connect(window, 'load', this.onWindowLoad);
	},

	onWindowLoad: function() {
		try {
			if(document.body === undefined) {
				var htmlBody = document.createElement('body');
				document.body = htmlBody;
			}
			this.connect(document.body, 'touchstart', this.updateTouches);
			this.connect(document.body, 'touchmove', this.updateTouches);
			this.connect(document.body, 'touchend', this.updateTouches);
		} catch(e) {}
	},

	updateTouches: function(event) {
		for(var id in this.touches) {
			var found = false;
			for(var i = 0; (i < event.touches.length) && !found; i++) {
				if(id == event.touches[i].identifier) {
					found = true;
					this.touches[id].setPosition(event.touches[i].clientX, event.touches[i].clientY);
				}
			}
			if(!found) {
				this.touches[id].end();
				delete(this.touches[id]);
			}
		}
		for(var i = 0; i < event.touches.length; i++) {
			if(this.touches[event.touches[i].identifier] == undefined) {
				var finger = new Core.Finger({ id: event.touches[i].identifier, x: event.touches[i].clientX, y: event.touches[i].clientY });
				this.touches[event.touches[i].identifier] = finger;
			}
		}

		event.preventDefault();
		event.stopPropagation();

		// like the iOS event thread create a famine in the main thread
		// call the update here if needed
//		if(navigator.iPad || navigator.iPhone) {
//			if(Ui.App.current.updateTask != undefined) {
//				Ui.App.current.updateTask.abort();
//				Ui.App.current.update();
//			}
//		}
	}
}, {}, {
	current: undefined,

	constructor: function() {
		this.current = new Core.FingerManager(); 
	}
});

