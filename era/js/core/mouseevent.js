

Core.Event.extend('Core.MouseEvents', {
	detail: 0,
	screenX: 0,
	screenY: 0,
	clientX: 0,
	clientY: 0,
	ctrlKey: false,
	altKey: false,
	shiftKey: false,
	metaKey: false,
	button: 0,

	constructor: function(config) {
	},

	initMouseEvent: function(type, canBubble, cancelable, view, detail,
		screenX, screenY, clientX, clientY, ctrlKey, altKey, shiftKey,
		metaKey, button, relatedTarget) {
		this.type = type;
		this.bubbles = canBubble;
		this.cancelable = cancelable;
		this.view = view;
		this.detail = detail;
		this.screenX = screenX;
		this.screenY = screenY;
		this.clientX = clientX;
		this.clientY = clientY;
		this.ctrlKey = ctrlKey;
		this.altKey = altKey;
		this.shiftKey = shiftKey;
		this.metaKey = metaKey;
		this.button = button;
	}
});

Core.Object.extend('Core.MouseManager', {

	constructor: function(config) {
		console.log('new Core.MouseManager');

		Core.Event.registerEvent('MouseEvents', Core.MouseEvents);
		Core.Event.register('mousedown', Core.MouseEvents);
		Core.Event.register('mousemove', Core.MouseEvents);
		Core.Event.register('mouseup', Core.MouseEvents);

		document.attachEvent('onmousedown', this.onMouseDown);
		document.attachEvent('onmousemove', this.onMouseMove);
		document.attachEvent('onmouseup', this.onMouseUp);
	},

	onMouseDown: function(event) {
		var target = Core.Event.cleanTarget(event.srcElement);
		var mouseEvent = document.createEvent('MouseEvents');
		// rename button for IE
		var button = event.button;
		if(button == 1)
			button = 0;
		else if(button == 4)
			button = 1;
		mouseEvent.initMouseEvent('mousedown', true, true, event.view, event.detail,
			event.screenX, event.screenY, event.clientX, event.clientY, event.ctrlKey,
			event.altKey, event.shiftKey, event.metaKey, button, target);
		target.dispatchEvent(mouseEvent);
		event.returnValue = !mouseEvent.defaultPrevented;
		console.log('onMouseDown return: '+event.returnValue);
		return event.returnValue;
	},

	onMouseMove: function(event) {
		var mouseEvent = document.createEvent('MouseEvents');
		var target = Core.Event.cleanTarget(event.srcElement);
		// rename button for IE
		var button = event.button;
		if(button == 1)
			button = 0;
		else if(button == 4)
			button = 1;
		mouseEvent.initMouseEvent('mousemove', true, true, event.view, event.detail,
			event.screenX, event.screenY, event.clientX, event.clientY, event.ctrlKey,
			event.altKey, event.shiftKey, event.metaKey, button, target);
		target.dispatchEvent(mouseEvent);
		event.returnValue = !mouseEvent.defaultPrevented;
		return event.returnValue;
	},

	onMouseUp: function(event) {
		var target = Core.Event.cleanTarget(event.srcElement);
		var mouseEvent = document.createEvent('MouseEvents');
		// rename button for IE
		var button = event.button;
		if(button == 1)
			button = 0;
		else if(button == 4)
			button = 1;
		mouseEvent.initMouseEvent('mouseup', true, true, event.view, event.detail,
			event.screenX, event.screenY, event.clientX, event.clientY, event.ctrlKey,
			event.altKey, event.shiftKey, event.metaKey, button, target);
		target.dispatchEvent(mouseEvent);
		event.returnValue = !mouseEvent.defaultPrevented;
		console.log('onMouseUp return: '+event.returnValue);
		return event.returnValue;
	}
});

// load mouse support for old IE
if(('attachEvent' in window) && ((navigator.userAgent.match(/MSIE 7.0/i) != null) || (navigator.userAgent.match(/MSIE 8.0/i))))
	new Core.MouseManager();

