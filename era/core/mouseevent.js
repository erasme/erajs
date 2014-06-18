Core.Event.extend('Core.MouseEvents', 
/**@lends Core.MouseEvents#*/
{
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
	/**
	 * @constructs
	 * @class
	 * @extends Core.Event 
	 */
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

Core.Object.extend('Core.MouseManager',
/**@lends Core.MouseManager#*/
{
	captureElement: undefined,

	/**
	 * @constructs
	 * @class
	 * @extends Core.Object
	 */
	constructor: function(config) {
		Core.Event.registerEvent('MouseEvents', Core.MouseEvents);
		Core.Event.register('mousedown', Core.MouseEvents);
		Core.Event.register('mousemove', Core.MouseEvents);
		Core.Event.register('mouseup', Core.MouseEvents);
		Core.Event.register('click', Core.MouseEvents);

		var wrapperDown = function() {
			return arguments.callee.callback.apply(arguments.callee.scope, arguments);
		};
		wrapperDown.scope = this;
		wrapperDown.callback = this.onMouseDown;
		document.attachEvent('onmousedown', wrapperDown);

		var wrapperMove = function() {
			return arguments.callee.callback.apply(arguments.callee.scope, arguments);
		};
		wrapperMove.scope = this;
		wrapperMove.callback = this.onMouseMove;
		document.attachEvent('onmousemove', wrapperMove);

		var wrapperUp = function() {
			return arguments.callee.callback.apply(arguments.callee.scope, arguments);
		};
		wrapperUp.scope = this;
		wrapperUp.callback = this.onMouseUp;
		document.attachEvent('onmouseup', wrapperUp);

		var wrapperDblClick = function() {
			return arguments.callee.callback.apply(arguments.callee.scope, arguments);
		};
		wrapperDblClick.scope = this;
		wrapperDblClick.callback = this.onMouseDblClick;
		document.attachEvent('ondblclick', wrapperDblClick);

		var wrapperClick = function() {
			return arguments.callee.callback.apply(arguments.callee.scope, arguments);
		};
		wrapperClick.scope = this;
		wrapperClick.callback = this.onMouseClick;
		document.attachEvent('onclick', wrapperClick);
	},

	onMouseDblClick: function(event) {
		this.onMouseDown(event);
		this.onMouseUp(event);
		return this.onMouseClick(event);
	},

	onMouseClick: function(event) {
		var target = Core.Event.cleanTarget(event.srcElement);
		var mouseEvent = document.createEvent('MouseEvents');
		// rename button for IE
		var button = event.button;
		if(button == 1)
			button = 0;
		else if(button == 4)
			button = 1;
		mouseEvent.initMouseEvent('click', true, true, event.view, event.detail,
			event.screenX, event.screenY, event.clientX, event.clientY, event.ctrlKey,
			event.altKey, event.shiftKey, event.metaKey, button, target);
		target.dispatchEvent(mouseEvent);

		event.returnValue = !mouseEvent.defaultPrevented;
		return event.returnValue;
	},

	onMouseDown: function(event) {	
		var target = Core.Event.cleanTarget(event.srcElement);
		// capture the mouse but not for input and textarea because
		// they will no more work
		if(('tagName' in target) && (target.tagName.toUpperCase() !== 'INPUT') && (target.tagName.toUpperCase() !== 'TEXTAREA')) {
			this.captureElement = target;
			this.captureElement.setCapture();
		}

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
		return event.returnValue;
	},

	onMouseMove: function(event) {
		var mouseEvent = document.createEvent('MouseEvents');
		var target = Core.Event.cleanTarget(event.srcElement);
		if((target === null) || (target === undefined))
			return;

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
		if(this.captureElement !== undefined)
			this.captureElement.releaseCapture();

		var target = Core.Event.cleanTarget(event.srcElement);
		var mouseEvent = document.createEvent('MouseEvents');
		// rename button for IE
		var button = event.button;
		if(button === 1)
			button = 0;
		else if(button === 4)
			button = 1;
		mouseEvent.initMouseEvent('mouseup', true, true, event.view, event.detail,
			event.screenX, event.screenY, event.clientX, event.clientY, event.ctrlKey,
			event.altKey, event.shiftKey, event.metaKey, button, target);
		target.dispatchEvent(mouseEvent);
		event.returnValue = !mouseEvent.defaultPrevented;
		return event.returnValue;
	}
});

// load mouse support for old IE
if(('attachEvent' in window) && (navigator.isIE7 || navigator.isIE8))
	new Core.MouseManager();

