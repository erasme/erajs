Core.Object.extend('Core.Event', {
	defaultPrevented: false,
	type: undefined,
	bubbles: true,
	cancelable: true,
	view: undefined,
	target: undefined,
	cancelBubble: false,

	constructor: function(config) {
		if(config.type != undefined)
			this.type = config.type;
	},

	preventDefault: function() {
		this.defaultPrevented = true;
	},

	stopPropagation: function() {
		this.cancelBubble = true;
	},

	stopImmediatePropagation: function() {
		// TODO
	},

	dispatchEvent: function(target) {
		this.target = target;
		var current = this.target;
		while((current != undefined) && (!this.cancelBubble)) {
			if((current.__extendEvents != undefined) && (current.__extendEvents[this.type] != undefined)) {
				var list = current.__extendEvents[this.type];
				for(var i = 0; i < list.length; i++) {
					list[i].call(current, this);
				}
			}
			current = current.offsetParent;
		}
		return this.defaultPrevented;
	},
}, {}, {
	events: {},

	types: {},

	registerEvent: function(eventName, type) {
		Core.Event.events[eventName] = type;
	},

	getEvent: function(eventName) {
		return Core.Event.events[eventName];
	},

	register: function(eventType, type) {
		Core.Event.types[eventType] = type;
	},

	getType: function(eventType) {
		return Core.Event.types[eventType];
	},
});


HTMLElement.prototype.__dispatchEvent = HTMLElement.prototype.dispatchEvent;
HTMLElement.prototype.dispatchEvent = function(event) {
	if(Core.Event.hasInstance(event))
		return event.dispatchEvent(this);
	else
		return this.__dispatchEvent(event);
};

HTMLElement.prototype.__addEventListener = HTMLElement.prototype.addEventListener;
HTMLElement.prototype.addEventListener = function(eventName, callback, capture) {
	if(Core.Event.getType(eventName) != undefined) {
		if(this.__extendEvents == undefined)
			this.__extendEvents = {};
		if(this.__extendEvents[eventName] == undefined)
			this.__extendEvents[eventName] = [];
		this.__extendEvents[eventName].push(callback);
	}
	else
		return this.__addEventListener(eventName, callback, capture);
};

HTMLElement.prototype.__removeEventListener = HTMLElement.prototype.removeEventListener;
HTMLElement.prototype.removeEventListener = function(eventName, callback, capture) {
	if(Core.Event.getType(eventName) != undefined) {
		if(this.__extendEvents != undefined) {
			for(var i = 0; i < this.__extendEvents[eventName].length; i++) {
				if(this.__extendEvents[eventName][i] == callback) {
					this.__extendEvents[eventName].splice(i, 1);
					break;
				}
			}
		}
	}
	else
		return this.__removeEventListener(eventName, callback, capture);
};

if('HTMLDocument' in window) {
	HTMLDocument.prototype.__createEvent = HTMLDocument.prototype.createEvent;
	HTMLDocument.prototype.createEvent = function(eventName) {
		var type = Core.Event.getEvent(eventName);
		if(type != undefined)
			return new type();
		else
			return this.__createEvent(eventName);
	};
}
else {
	document.__createEvent = document.createEvent;
	document.createEvent = function(eventName) {
		var type = Core.Event.getEvent(eventName);
		if(type != undefined)
			return new type();
		else
			return this.__createEvent(eventName);
	};
}
