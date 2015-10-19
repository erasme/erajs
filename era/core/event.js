Core.Object.extend('Core.Event', 
/** @lends Core.Event#*/
{
	defaultPrevented: false,
	type: undefined,
	bubbles: true,
	cancelable: true,
	view: undefined,
	target: undefined,
	cancelBubble: false,

	/**
    *   @constructs
	*	@class
    *   @extends Core.Object
	*/
	constructor: function(config) {
		if(config.type !== undefined)
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
		var i; var i2; var list;
		this.target = target;

		if(this.bubbles) {
			var stack = [];

			var current = this.target;
			while((current !== undefined) && (current !== null)) {
				if('dispatchEvent' in current)
					stack.push(current);
				current = current.parentNode;
			}
			stack.push(window);

			// mode capture
			for(i = stack.length - 1; (i >= 0) && (!this.cancelBubble); i--) {
				current = stack[i];
				if((current.__extendCaptureEvents !== undefined) && (current.__extendCaptureEvents[this.type] !== undefined)) {
					list = [];
					for(i2 = 0; i2 < current.__extendCaptureEvents[this.type].length; i2++)
						list.push(current.__extendCaptureEvents[this.type][i2]);
					for(i2 = 0; i2 < list.length; i2++)
						list[i2].call(current, this);
				}
			}

			// bubble mode
			for(i = 0; (i < stack.length) && (!this.cancelBubble); i++) {
				current = stack[i];
				if((current.__extendEvents !== undefined) && (current.__extendEvents[this.type] !== undefined)) {
					list = [];
					for(i2 = 0; i2 < current.__extendEvents[this.type].length; i2++)
						list.push(current.__extendEvents[this.type][i2]);
					for(i2 = 0; i2 < list.length; i2++)
						list[i2].call(current, this);
				}
			}
		}
		else {
			if((target.__extendCaptureEvents !== undefined) && (target.__extendCaptureEvents[this.type] !== undefined)) {
				list = [];
				for(i2 = 0; i2 < target.__extendCaptureEvents[this.type].length; i2++)
					list.push(target.__extendCaptureEvents[this.type][i2]);
				for(i = 0; i < list.length; i++)
					list[i].call(target, this);
			}
			if((target.__extendEvents !== undefined) && (target.__extendEvents[this.type] !== undefined)) {
				list = [];
				for(i2 = 0; i2 < target.__extendEvents[this.type].length; i2++)
					list.push(target.__extendEvents[this.type][i2]);
				for(i = 0; i < list.length; i++)
					list[i].call(target, this);
			}
		}
		return this.defaultPrevented;
	}
}, 
{},
/** @lends Core.Event*/
{
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

	dispatchEvent: function(event) {
		if(Core.Event.hasInstance(event)) {
			return event.dispatchEvent(this);
		}
		else if(this.__dispatchEvent !== undefined)
			return this.__dispatchEvent(event);
	},

	addEventListener: function(eventName, callback, capture) {	
		if(Core.Event.getType(eventName) !== undefined) {
			if(capture) {
				if(this.__extendCaptureEvents === undefined)
					this.__extendCaptureEvents = {};
				if(this.__extendCaptureEvents[eventName] === undefined)
					this.__extendCaptureEvents[eventName] = [];
				this.__extendCaptureEvents[eventName].push(callback);
			}
			else {
				if(this.__extendEvents === undefined)
					this.__extendEvents = {};
				if(this.__extendEvents[eventName] === undefined)
					this.__extendEvents[eventName] = [];
				this.__extendEvents[eventName].push(callback);
			}
		}
		else if(this.__addEventListener !== undefined)
			return this.__addEventListener(eventName, callback, capture);
	},

	removeEventListener: function(eventName, callback, capture) {
		var i;
		if(Core.Event.getType(eventName) !== undefined) {
			if(capture) {
				if(this.__extendCaptureEvents !== undefined) {
					for(i = 0; i < this.__extendCaptureEvents[eventName].length; i++) {
						if(this.__extendCaptureEvents[eventName][i] === callback) {
							this.__extendCaptureEvents[eventName].splice(i, 1);
							break;
						}
					}
				}
			}
			else {
				if(this.__extendEvents !== undefined) {
					for(i = 0; i < this.__extendEvents[eventName].length; i++) {
						if(this.__extendEvents[eventName][i] === callback) {
							this.__extendEvents[eventName].splice(i, 1);
							break;
						}
					}
				}
			}
		}
		else if(this.__removeEventListener !== undefined)
			return this.__removeEventListener(eventName, callback, capture);
	},

	createEvent: function(eventName) {
		var type = Core.Event.getEvent(eventName);
		if(type !== undefined)
			return new type();
		else if(document.__createEvent !== undefined)
			return document.__createEvent.call(document, eventName);
	},

	createElement: function(elementName) {
		var element = document.__createElement.call(document, elementName);
		if(element.dispatchEvent !== Core.Event.dispatchEvent) {
			element.__dispatchEvent = element.dispatchEvent;
			element.dispatchEvent = Core.Event.dispatchEvent;
		}
		if(element.addEventListener !== Core.Event.addEventListener) {
			element.__addEventListener = element.addEventListener;
			element.addEventListener = Core.Event.addEventListener;
		}
		if(element.removeEventListener !== Core.Event.removeEventListener) {
			element.__removeEventListener = element.removeEventListener;
			element.removeEventListener = Core.Event.removeEventListener;
		}
		return element;
	},

	cleanTarget: function(target) {
		var current = target;
		while((current !== null) && (current !== undefined)) {
			if(('dispatchEvent' in current) && ('innerHTML' in current) &&
				(current.dispatchEvent === Core.Event.dispatchEvent))
				return current;
			if('offsetParent' in current)
				current = current.offsetParent;
			else if('parentNode' in current)
				current = current.parentNode;
			else
				current = undefined;
		}
		return window;
	}
});

if('HTMLElement' in window) {
	HTMLElement.prototype.__dispatchEvent = HTMLElement.prototype.dispatchEvent;
	HTMLElement.prototype.dispatchEvent = Core.Event.dispatchEvent;
	HTMLElement.prototype.__addEventListener = HTMLElement.prototype.addEventListener;
	HTMLElement.prototype.addEventListener = Core.Event.addEventListener;
	HTMLElement.prototype.__removeEventListener = HTMLElement.prototype.removeEventListener;
	HTMLElement.prototype.removeEventListener = Core.Event.removeEventListener;
}
if('SVGElement' in window) {
	SVGElement.prototype.__dispatchEvent = SVGElement.prototype.dispatchEvent;
	SVGElement.prototype.dispatchEvent = Core.Event.dispatchEvent;
	SVGElement.prototype.__addEventListener = SVGElement.prototype.addEventListener;
	SVGElement.prototype.addEventListener = Core.Event.addEventListener;
	SVGElement.prototype.__removeEventListener = SVGElement.prototype.removeEventListener;
	SVGElement.prototype.removeEventListener = Core.Event.removeEventListener;
}

window.__dispatchEvent = window.dispatchEvent;
window.dispatchEvent = Core.Event.dispatchEvent;
window.__addEventListener = window.addEventListener;
window.addEventListener = Core.Event.addEventListener;
window.__removeEventListener = window.removeEventListener;
window.removeEventListener = Core.Event.removeEventListener;

if('HTMLDocument' in window) {
	HTMLDocument.prototype.__createEvent = HTMLDocument.prototype.createEvent;
	HTMLDocument.prototype.createEvent = Core.Event.createEvent;
	HTMLDocument.prototype.__createElement = HTMLDocument.prototype.createElement;
	HTMLDocument.prototype.createElement = Core.Event.createElement;
}
else {
	document.__createEvent = document.createEvent;
	document.createEvent = Core.Event.createEvent;
	document.__createElement = document.createElement;
	document.createElement = Core.Event.createElement;
}
