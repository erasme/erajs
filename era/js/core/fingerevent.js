

Core.Event.extend('Core.FingerEvent', {

	constructor: function(config) {
	},

	initFingerEvent: function(type, canBubble, cancelable, view, finger) {
		this.type = type;
		this.bubbles = canBubble;
		this.cancelable = cancelable;
		this.view = view;
		this.finger = finger;
	}
}, {}, {
	constructor: function() {
		Core.Event.registerEvent('FingerEvent', Core.FingerEvent);
		Core.Event.register('fingerdown', Core.FingerEvent);
		Core.Event.register('fingermove', Core.FingerEvent);
		Core.Event.register('fingerup', Core.FingerEvent);
	}
});

Core.Object.extend('Core.Finger', {
	id: undefined,
	x: undefined,
	y: undefined,
	captureElement: undefined,

	constructor: function(config) {
		this.addEvents('fingermove', 'fingerup');

		this.id = config.id;
		this.x = config.x;
		this.y = config.y;

		var target = document.elementFromPoint(this.x, this.y);
		if(target != undefined) {
			var fingerEvent = document.createEvent('FingerEvent');
			fingerEvent.initFingerEvent('fingerdown', true, true, event.window, this);
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
				fingerEvent.initFingerEvent('fingermove', (this.captureElement == undefined), true, event.window, this);
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
			// resend the up event
			var fingerEvent = document.createEvent('FingerEvent');
			fingerEvent.initFingerEvent('fingerdown', true, true, event.window, this);
			this.captureElement.offsetParent.dispatchEvent(fingerEvent);

			this.captureElement = undefined;
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
			fingerEvent.initFingerEvent('fingerup', (this.captureElement == undefined), true, event.window, this);

			this.fireEvent('fingerup', fingerEvent);
			if(!fingerEvent.defaultPrevented)
				target.dispatchEvent(fingerEvent);
		}
	}
});

Core.Object.extend('Core.FingerManager', {
	touches: undefined,

	constructor: function(config) {
		this.touches = {};
		this.connect(window, 'load', this.onWindowLoad);
	},

	onWindowLoad: function() {
		this.connect(document.body, 'touchstart', this.updateTouches);
		this.connect(document.body, 'touchmove', this.updateTouches);
		this.connect(document.body, 'touchend', this.updateTouches);
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
		for(var i = 0; i < event.targetTouches.length; i++) {
			if(this.touches[event.targetTouches[i].identifier] == undefined) {
				this.touches[event.targetTouches[i].identifier] = new Core.Finger({ id: event.targetTouches[i].identifier, x: event.targetTouches[i].clientX, y: event.targetTouches[i].clientY });
			}
		}
		event.preventDefault();
		event.stopPropagation();
	}
});

new Core.FingerManager();

